import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PRO_PRICE_ID } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout
 * Cria uma sessão Stripe Checkout para assinar o plano Pro.
 */
export async function POST(request: NextRequest) {
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
      payment_method_types: ["card"],
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
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar checkout" },
      { status: 500 }
    );
  }
}
