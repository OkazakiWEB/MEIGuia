import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRO_PRICE_ID } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Cria uma sessão Stripe Checkout para assinar o plano Pro.
 */
export async function POST(request: NextRequest) {
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

    // Criar sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      // automatic_payment_methods exibe todos os métodos habilitados no Stripe Dashboard
      // para o país do cliente: cartão, PIX, Boleto (quando ativados)
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always",
      },
      line_items: [
        {
          price: STRIPE_PRO_PRICE_ID,
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
