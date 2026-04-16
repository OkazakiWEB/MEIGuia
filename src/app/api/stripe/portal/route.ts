import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/portal
 * Redireciona para o Portal do Cliente Stripe para gerenciar/cancelar assinatura.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/assinatura`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Erro ao criar portal:", error);
    return NextResponse.json(
      { error: "Erro interno ao abrir portal" },
      { status: 500 }
    );
  }
}
