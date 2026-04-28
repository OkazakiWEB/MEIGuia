import Stripe from "stripe";

/**
 * Instância do Stripe SDK para uso no servidor.
 * Nunca importe este arquivo em componentes client-side.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

/** Limite anual MEI em reais */
export const MEI_LIMITE_ANUAL = 81_000;

/** IDs de preço no Stripe */
export const STRIPE_PRO_PRICE_ID            = process.env.STRIPE_PRO_PRICE_ID!;
export const STRIPE_PRO_ANNUAL_PRICE_ID     = process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "";
export const STRIPE_PREMIUM_PRICE_ID        = process.env.STRIPE_PREMIUM_PRICE_ID!;
export const STRIPE_PREMIUM_ANNUAL_PRICE_ID = process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID ?? "";

/** Set com todos os price IDs Premium para lookup rápido */
export const PREMIUM_PRICE_IDS = new Set(
  [process.env.STRIPE_PREMIUM_PRICE_ID, process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID].filter(Boolean)
);

/** Resolve o plano a partir do price ID da assinatura Stripe */
export function planFromPriceId(priceId: string): "pro" | "premium" {
  return PREMIUM_PRICE_IDS.has(priceId) ? "premium" : "pro";
}
