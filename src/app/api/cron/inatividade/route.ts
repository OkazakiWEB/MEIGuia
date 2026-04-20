import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendInactivityEmail } from "@/lib/emails";

/**
 * GET /api/cron/inatividade
 * Roda diariamente. Envia e-mail para usuários que não registram nenhuma nota
 * há exatamente 15 dias. Envia no máximo 1 vez a cada 30 dias por usuário.
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
  // Usuários cuja última nota foi há 15 dias (janela ±1h)
  const de15  = new Date(agora.getTime() - 15 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000).toISOString();
  const ate15 = new Date(agora.getTime() - 15 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString();
  // Não enviar se já enviou este e-mail nos últimos 30 dias
  const limite30 = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Buscar todos os perfis que podem receber
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, inactivity_email_sent_at")
    .not("email", "is", null)
    .or(`inactivity_email_sent_at.is.null,inactivity_email_sent_at.lt.${limite30}`);

  if (!profiles?.length) return NextResponse.json({ ok: true, enviados: 0 });

  // Para cada perfil, checar se a última nota está na janela de 15 dias
  let enviados = 0;
  const erros: string[] = [];

  for (const p of profiles) {
    try {
      const { data: ultimaNota } = await supabase
        .from("notas_fiscais")
        .select("created_at")
        .eq("user_id", p.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const ultima = ultimaNota?.created_at ?? null;

      // Sem nenhuma nota: também reativa se onboarding foi há 15 dias
      // Com nota: última nota dentro da janela de 15 dias
      const dentroJanela = ultima
        ? ultima >= de15 && ultima <= ate15
        : false;

      if (!dentroJanela) continue;

      await sendInactivityEmail({ to: p.email!, nome: p.full_name ?? "MEI" });
      await supabase
        .from("profiles")
        .update({ inactivity_email_sent_at: agora.toISOString() })
        .eq("id", p.id);

      enviados++;
    } catch (err) {
      erros.push(`user=${p.id}: ${String(err)}`);
      console.error("[Cron/Inatividade]", err);
    }
  }

  return NextResponse.json({ ok: true, enviados, erros: erros.length ? erros : undefined });
}
