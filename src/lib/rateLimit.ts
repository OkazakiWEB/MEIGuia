/**
 * Rate limiter via Upstash Redis (funciona em serverless/Vercel).
 * Usa sliding window — persiste entre todas as instâncias.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache de instâncias por configuração (evita recriar a cada request)
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number, prefix: string): Ratelimit {
  const key = `${prefix}:${limit}:${windowMs}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
        prefix: `rl:${prefix}`,
      })
    );
  }
  return limiters.get(key)!;
}

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

export async function checkRateLimit(
  ip: string,
  { limit, windowMs = 60_000, prefix = "rl" }: RateLimitOptions
): Promise<RateLimitResult> {
  const limiter = getLimiter(limit, windowMs, prefix);
  const result = await limiter.limit(ip);
  return {
    success: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

/**
 * Extrai o IP real da requisição (considera Vercel / proxies).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
