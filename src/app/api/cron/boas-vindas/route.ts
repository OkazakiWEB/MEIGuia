import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/emails";

/**
 * GET /api/cron/boas-vindas
 * Roda diariamente. Envia e-mail de boas-vindas para usuários que se cadastraram
 * há 1 dia e ainda não receberam o e-mail de boas-vindas.
 */
export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Janela: cadastros de ontem (entre 23h e 25h atrás para não perder ninguém)
  const agora = new Date();
  const de = new Date(agora.getTime() - 25 * 60 * 60 * 1000).toISOString();
  const ate = new Date(agora.getTime() - 23 * 60 * 60 * 1000).toISOString();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, welcome_email_sent")
    .gte("created_at", de)
    .lte("created_at", ate)
    .eq("welcome_email_sent", false)
    .not("email", "is", null);

  if (error) {
    console.error("[Cron/BoasVindas] Erro ao buscar perfis:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }

  let enviados = 0;
  const erros: string[] = [];

  for (const p of profiles ?? []) {
    try {
      await sendWelcomeEmail({ to: p.email!, nome: p.full_name ?? "MEI" });
      await supabase.from("profiles").update({ welcome_email_sent: true }).eq("id", p.id);
      enviados++;
    } catch (err) {
      erros.push(`user=${p.id}: ${String(err)}`);
      console.error("[Cron/BoasVindas]", err);
    }
  }

  return NextResponse.json({ ok: true, enviados, erros: erros.length ? erros : undefined });
}
