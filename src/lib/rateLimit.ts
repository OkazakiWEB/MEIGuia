/**
 * Rate limiter simples em memória por IP.
 * Adequado para Vercel (serverless functions com isolamento por instância).
 * Uso: await rateLimit(request, { limit: 10, windowMs: 60_000 })
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpar entradas expiradas a cada 5 minutos para não vazar memória
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  /** Máximo de requisições permitidas na janela */
  limit: number;
  /** Tamanho da janela em milissegundos (padrão: 60 000 = 1 minuto) */
  windowMs?: number;
  /** Prefixo para distinguir limites diferentes no mesmo IP */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  ip: string,
  { limit, windowMs = 60_000, prefix = "rl" }: RateLimitOptions
): RateLimitResult {
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { success: true, remaining: limit - 1, resetAt: entry.resetAt };
  }

  entry.count++;
  const remaining = Math.max(limit - entry.count, 0);
  return { success: entry.count <= limit, remaining, resetAt: entry.resetAt };
}

/**
 * Extrai o IP real da requisição (considera Vercel / proxies).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
