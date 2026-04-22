import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendD7InativoEmail } from "@/lib/emails";

/**
 * GET /api/cron/d7-inativo
 * Roda diariamente. Envia e-mail para usuários que:
 * - Têm pelo menos 1 nota real registrada
 * - Não acessam (não atualizaram perfil) há 7 dias
 * - Ainda não receberam este e-mail nos últimos 30 dias
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
  const seteAtras   = new Date(agora.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString();
  const trintaAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Usuários com updated_at há mais de 7 dias e que não receberam este e-mail nos últimos 30 dias
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, inactivity_email_sent_at")
    .lt("updated_at", seteAtras)
    .eq("onboarding_completed", true)
    .not("email", "is", null)
    .or(`inactivity_email_sent_at.is.null,inactivity_email_sent_at.lt.${trintaAtras}`);

  if (error) {
    console.error("[Cron/D7Inativo] Erro ao buscar perfis:", error);
    return NextResponse.json({ error: error.message ?? JSON.stringify(error) }, { status: 500 });
  }

  let enviados = 0;
  const erros: string[] = [];

  for (const p of profiles ?? []) {
    try {
      // Verifica se tem pelo menos 1 nota real
      const { count } = await supabase
        .from("notas_fiscais")
        .select("id", { count: "exact", head: true })
        .eq("user_id", p.id)
        .neq("descricao", "Faturamento acumulado antes do cadastro");

      if ((count ?? 0) === 0) continue; // sem notas reais, pula

      // Busca total anual
      const { data: totalRpc } = await supabase
        .rpc("get_faturamento_anual", { p_user_id: p.id });

      await sendD7InativoEmail({
        to: p.email!,
        nome: p.full_name ?? "MEI",
        totalAno: Number(totalRpc ?? 0),
      });

      await supabase
        .from("profiles")
        .update({ inactivity_email_sent_at: agora.toISOString() })
        .eq("id", p.id);

      enviados++;
    } catch (err) {
      erros.push(`user=${p.id}: ${String(err)}`);
      console.error("[Cron/D7Inativo]", err);
    }
  }

  return NextResponse.json({ ok: true, enviados, erros: erros.length ? erros : undefined });
}
