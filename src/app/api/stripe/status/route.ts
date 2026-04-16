import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/stripe/status
 * Diagnóstico de configuração do Stripe — apenas para admins autenticados.
 * Nunca expõe valores reais das chaves.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const check = (key: string | undefined, name: string) => ({
    name,
    configured: !!key && !key.includes("PLACEHOLDER") && !key.includes("COLE_AQUI"),
    prefix: key ? key.slice(0, 7) + "..." : "(vazio)",
  });

  return NextResponse.json({
    stripe_secret_key:      check(process.env.STRIPE_SECRET_KEY,             "STRIPE_SECRET_KEY"),
    stripe_publishable_key: check(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, "STRIPE_PUBLISHABLE_KEY"),
    stripe_price_id:        check(process.env.STRIPE_PRO_PRICE_ID,            "STRIPE_PRO_PRICE_ID"),
    stripe_webhook_secret:  check(process.env.STRIPE_WEBHOOK_SECRET,          "STRIPE_WEBHOOK_SECRET"),
    app_url:                process.env.NEXT_PUBLIC_APP_URL,
  });
}
