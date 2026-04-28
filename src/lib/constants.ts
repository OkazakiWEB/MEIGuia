/**
 * Constantes globais do MEIguia.
 * Para atualizar o limite MEI: altere NEXT_PUBLIC_LIMITE_MEI no Vercel (sem deploy).
 */

export const LIMITE_MEI = Number(process.env.NEXT_PUBLIC_LIMITE_MEI ?? 81_000);

/** Limite de notas fiscais por mês conforme plano */
export const NOTAS_LIMITE: Record<string, number> = {
  free:    5,
  pro:     30,
  premium: Infinity,
};

/** Retorna o limite de notas do plano (fallback: 5) */
export function notasLimitePorPlano(plano: string): number {
  return NOTAS_LIMITE[plano] ?? 5;
}
