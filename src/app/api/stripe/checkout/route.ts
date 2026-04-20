import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRO_PRICE_ID } from "@/lib/stripe";

const STRIPE_PRO_ANNUAL_PRICE_ID = process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * POST /api/stripe/checkout
 * Cria uma sessão Stripe Checkout para assinar o plano Pro.
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 5 tentativas por minuto por IP
  const rl = checkRateLimit(getClientIp(request), { limit: 5, windowMs: 60_000, prefix: "checkout" });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um momento e tente novamente." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  // Validação de configuração — falha rápida com mensagem clara
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("PLACEHOLDER")) {
    console.error("[Checkout] STRIPE_SECRET_KEY não configurada");
    return NextResponse.json({ error: "Pagamentos temporariamente indisponíveis. Tente novamente em breve." }, { status: 503 });
  }
  if (!process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID.includes("PLACEHOLDER")) {
    console.error("[Checkout] STRIPE_PRO_PRICE_ID não configurado");
    return NextResponse.json({ error: "Pagamentos temporariamente indisponíveis. Tente novamente em breve." }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const interval: "monthly" | "annual" = body?.interval === "annual" ? "annual" : "monthly";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar perfil do usuário para verificar se já tem customer no Stripe
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, plano")
      .eq("id", user.id)
      .single();

    if (profile?.plano === "pro") {
      return NextResponse.json({ error: "Você já tem o plano Pro" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Reusar customer existente ou criar um novo
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      // Salvar customer ID no perfil
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Selecionar price ID conforme o intervalo
    const priceId = interval === "annual" && STRIPE_PRO_ANNUAL_PRICE_ID
      ? STRIPE_PRO_ANNUAL_PRICE_ID
      : STRIPE_PRO_PRICE_ID;

    // Criar sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/assinatura?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/assinatura?canceled=true`,
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
      locale: "pt-BR",
      allow_promotion_codes: true,
      // Pré-preenche o e-mail do usuário no checkout
      customer_email: profile?.stripe_customer_id ? undefined : user.email!,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Log detalhado para facilitar diagnóstico
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Checkout] Erro ao criar checkout:", msg);
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento. Verifique sua conexão e tente novamente." },
      { status: 500 }
    );
  }
}
