import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendD3SemNotaEmail } from "@/lib/emails";

/**
 * GET /api/cron/d3-sem-nota
 * Roda diariamente. Envia e-mail para usuários que:
 * - Criaram conta há 3 dias (janela 71h-73h)
 * - Nunca registraram nenhuma nota real
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const agora = new Date();
  const de  = new Date(agora.getTime() - 73 * 60 * 60 * 1000).toISOString();
  const ate = new Date(agora.getTime() - 71 * 60 * 60 * 1000).toISOString();

  // Busca usuários cadastrados há ~3 dias com onboarding completo
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .gte("created_at", de)
    .lte("created_at", ate)
    .eq("onboarding_completed", true)
    .not("email", "is", null);

  if (error) {
    console.error("[Cron/D3SemNota] Erro ao buscar perfis:", error);
    return NextResponse.json({ error: error.message ?? JSON.stringify(error) }, { status: 500 });
  }

  let enviados = 0;
  const erros: string[] = [];

  for (const p of profiles ?? []) {
    try {
      // Verifica se tem alguma nota real (não estimativa)
      const { count } = await supabase
        .from("notas_fiscais")
        .select("id", { count: "exact", head: true })
        .eq("user_id", p.id)
        .neq("descricao", "Faturamento acumulado antes do cadastro");

      if ((count ?? 0) > 0) continue; // já tem notas, pula

      await sendD3SemNotaEmail({ to: p.email!, nome: p.full_name ?? "MEI" });
      enviados++;
    } catch (err) {
      erros.push(`user=${p.id}: ${String(err)}`);
      console.error("[Cron/D3SemNota]", err);
    }
  }

  return NextResponse.json({ ok: true, enviados, erros: erros.length ? erros : undefined });
}
