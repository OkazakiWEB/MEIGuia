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

/** ID do preço Pro no Stripe (configurado via env) */
export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;
