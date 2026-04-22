import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { RelatorioAnualPDF, type RelatorioData } from "@/lib/relatorioAnualPDF";
import React from "react";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { LIMITE_MEI } from "@/lib/constants";

function formatarDataHora(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).replace(",", " às");
}

/**
 * GET /api/relatorio?ano=2025
 * Gera e retorna o Resumo Anual MEI em PDF.
 * Disponível apenas para usuários Pro.
 */
export async function GET(request: NextRequest) {
  // Rate limiting: 10 gerações por hora por IP
  const rl = await checkRateLimit(getClientIp(request), { limit: 10, windowMs: 60 * 60 * 1000, prefix: "relatorio" });
  if (!rl.success) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Verificar plano Pro
  const { data: profile } = await supabase
    .from("profiles")
    .select("plano, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.plano !== "pro") {
    return NextResponse.json(
      { error: "O Relatório Anual está disponível apenas no plano Pro." },
      { status: 403 }
    );
  }

  const anoParam = request.nextUrl.searchParams.get("ano");
  const ano = anoParam ? parseInt(anoParam) : new Date().getFullYear();

  // Buscar notas do ano
  const { data: notas, error } = await supabase
    .from("notas_fiscais")
    .select("data, descricao, cliente, numero_nf, valor")
    .eq("user_id", user.id)
    .gte("data", `${ano}-01-01`)
    .lte("data", `${ano}-12-31`)
    .order("data", { ascending: true });

  if (error) {
    console.error("[Relatorio] Erro ao buscar notas:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório." }, { status: 500 });
  }

  const totalAno = (notas || []).reduce((sum, n) => sum + Number(n.valor), 0);
  const percentualUsado = (totalAno / LIMITE_MEI) * 100;

  const data: RelatorioData = {
    nomeUsuario: profile?.full_name || user.email?.split("@")[0] || "Usuário",
    email: user.email || "",
    ano,
    geradoEm: formatarDataHora(new Date()),
    totalAno,
    limiteAnual: LIMITE_MEI,
    percentualUsado,
    notas: (notas || []).map(n => ({
      data: n.data,
      descricao: n.descricao,
      cliente: n.cliente,
      numero_nf: n.numero_nf,
      valor: Number(n.valor),
    })),
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(
      React.createElement(RelatorioAnualPDF, { d: data }) as any
    );

    const nomeArquivo = `resumo-mei-${ano}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[Relatorio] Erro ao renderizar PDF:", msg);
    return NextResponse.json({ error: "Erro ao gerar PDF. Tente novamente.", detail: msg }, { status: 500 });
  }
}
