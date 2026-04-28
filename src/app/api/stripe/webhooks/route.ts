import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhooks
 * Recebe e processa eventos do Stripe.
 * Configure a URL no Dashboard Stripe: https://seusite.vercel.app/api/stripe/webhooks
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature inválida:", err);
    return NextResponse.json({ error: "Signature inválida" }, { status: 400 });
  }

  // Cliente Supabase com service_role (ignora RLS) para atualizações via webhook
  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Helper: atualiza profile e garante que pelo menos 1 linha foi afetada
  async function updateProfile(
    customerId: string,
    patch: Record<string, unknown>,
    context: string
  ) {
    const { error, data } = await supabase
      .from("profiles")
      .update(patch)
      .eq("stripe_customer_id", customerId)
      .select("id");

    const count = data?.length ?? 0;

    if (error) {
      console.error(`[Webhook][${context}] Supabase error: customer=${customerId}`, error);
      return false;
    }
    if (count === 0) {
      console.error(`[Webhook][${context}] ORPHAN EVENT — no profile found for customer=${customerId}. Event=${event.id}`);
      // Retornar true para não causar retry infinito do Stripe (evento legítimo, mas sem perfil)
      return true;
    }
    console.log(`[Webhook][${context}] OK customer=${customerId} rows=${count}`);
    return true;
  }

  try {
    switch (event.type) {
      // ── Assinatura criada / atualizada ───────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isActive = subscription.status === "active" || subscription.status === "trialing";

        await updateProfile(
          customerId,
          {
            plano: isActive ? "pro" : "free",
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            pro_expires_at: isActive
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
          },
          event.type
        );
        break;
      }

      // ── Assinatura cancelada/deletada ────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await updateProfile(
          customerId,
          {
            plano: "free",
            stripe_subscription_id: null,
            subscription_status: "canceled",
          },
          "subscription.deleted"
        );
        break;
      }

      // ── Fatura paga com sucesso ──────────────────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await updateProfile(
          customerId,
          { plano: "pro", subscription_status: "active" },
          "invoice.paid"
        );
        break;
      }

      // ── Falha no pagamento ───────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await updateProfile(
          customerId,
          { subscription_status: "past_due" },
          "invoice.payment_failed"
        );
        console.warn(`[Webhook] Payment failed — customer=${customerId} event=${event.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar evento" },
      { status: 500 }
    );
  }
}
