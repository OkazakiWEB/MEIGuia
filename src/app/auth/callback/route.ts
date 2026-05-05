import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/emails";

/**
 * GET /auth/callback
 * Trata o retorno do OAuth (Google) e magic links do Supabase.
 * Para novos usuários (welcome_email_sent = false), dispara o e-mail de boas-vindas.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code    = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next    = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verificar se é novo usuário e disparar boas-vindas
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const admin = createAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          const { data: profile } = await admin
            .from("profiles")
            .select("full_name, email, welcome_email_sent, plano")
            .eq("id", user.id)
            .single();

          if (profile && !profile.welcome_email_sent) {
            const email = profile.email || user.email;
            if (email) {
              await sendWelcomeEmail({
                to: email,
                nome: profile.full_name ?? "MEI",
                plano: profile.plano ?? "free",
              });
              await admin
                .from("profiles")
                .update({ welcome_email_sent: true })
                .eq("id", user.id);
            }
          }
        }
      } catch (err) {
        // Não bloqueia o redirect por falha no e-mail
        console.error("[Auth/Callback] Erro ao enviar boas-vindas:", err);
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv    = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
