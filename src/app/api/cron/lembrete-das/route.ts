import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendDasLembreteEmail } from "@/lib/emails";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

/**
 * GET /api/cron/lembrete-das
 * Roda no dia 15 de cada mês às 10h.
 * Envia lembrete de DAS para usuários com CNPJ cadastrado que ainda não
 * marcaram o mês atual como pago.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const agora    = new Date();
  const ano      = agora.getFullYear();
  const mes      = agora.getMonth() + 1;
  const mesNome  = MESES[agora.getMonth()];
  const competencia = `${ano}-${String(mes).padStart(2, "0")}-01`;

  // Busca todos os usuários com CNPJ cadastrado
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, cnpj")
    .not("cnpj", "is", null)
    .not("email", "is", null);

  if (!profiles?.length) return NextResponse.json({ ok: true, enviados: 0 });

  // Busca quem já marcou como pago no mês atual
  const { data: pagos } = await supabase
    .from("das_pagamentos")
    .select("user_id")
    .eq("competencia", competencia)
    .eq("status", "pago");

  const userIdsPagos = new Set((pagos ?? []).map((p) => p.user_id));

  let enviados = 0;
  const erros: string[] = [];

  for (const p of profiles) {
    if (!p.cnpj || !p.email) continue;

    const jaFoiPago = userIdsPagos.has(p.id);
    if (jaFoiPago) continue; // Já pagou, não envia

    try {
      await sendDasLembreteEmail({
        to: p.email,
        nome: p.full_name ?? "MEI",
        mes: mesNome,
        ano,
        cnpj: p.cnpj,
        jaFoiPago: false,
      });
      enviados++;
    } catch (err) {
      erros.push(`user=${p.id}: ${String(err)}`);
      console.error("[Cron/LembreteDas]", err);
    }
  }

  return NextResponse.json({ ok: true, enviados, erros: erros.length ? erros : undefined });
}
