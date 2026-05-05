import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/emails";

/**
 * POST /api/emails/boas-vindas
 * Envia o e-mail de boas-vindas imediatamente após o cadastro.
 * Chamado pelo cliente logo após signUp bem-sucedido.
 * Idempotente: não reenvía se welcome_email_sent já for true.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email, welcome_email_sent, plano")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  if (profile.welcome_email_sent) return NextResponse.json({ ok: true, skipped: true });

  const email = profile.email || user.email;
  if (!email) return NextResponse.json({ error: "E-mail não encontrado" }, { status: 400 });

  try {
    await sendWelcomeEmail({
      to: email,
      nome: profile.full_name ?? "MEI",
      plano: profile.plano ?? "free",
    });

    await admin
      .from("profiles")
      .update({ welcome_email_sent: true })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Email/BoasVindas]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
