/**
 * Constantes globais do MEIguia.
 * Para atualizar o limite MEI: altere NEXT_PUBLIC_LIMITE_MEI no Vercel (sem deploy).
 */

export const LIMITE_MEI = Number(process.env.NEXT_PUBLIC_LIMITE_MEI ?? 81_000);
