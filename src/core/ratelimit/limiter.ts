/**
 * Distributed rate limiter for Edge runtime.
 *
 * Production: Upstash Redis sliding-window via @upstash/ratelimit
 * (works across all Vercel serverless instances/regions).
 *
 * Development / no Upstash creds: in-memory fallback that is per-instance only
 * (good enough for local dev; NOT a security control in production).
 *
 * Required env vars to enable distributed mode:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitDecision {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const upstashEnabled = Boolean(url && token);

const redis = upstashEnabled
  ? new Redis({ url: url!, token: token! })
  : null;

const limiterCache = new Map<number, Ratelimit>();

function getUpstashLimiter(maxPerMinute: number): Ratelimit {
  let inst = limiterCache.get(maxPerMinute);
  if (!inst) {
    inst = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(maxPerMinute, "60 s"),
      analytics: false,
      prefix: "medpulse:rl",
    });
    limiterCache.set(maxPerMinute, inst);
  }
  return inst;
}

const memoryStore = new Map<string, number[]>();
let lastSweep = Date.now();

function memoryCheck(identifier: string, maxPerMinute: number): RateLimitDecision {
  const now = Date.now();

  if (now - lastSweep > 120_000) {
    lastSweep = now;
    for (const [k, arr] of memoryStore) {
      const fresh = arr.filter(t => now - t < 60_000);
      if (fresh.length === 0) memoryStore.delete(k);
      else memoryStore.set(k, fresh);
    }
  }

  const calls = (memoryStore.get(identifier) ?? []).filter(t => now - t < 60_000);
  if (calls.length >= maxPerMinute) {
    return {
      success: false,
      limit: maxPerMinute,
      remaining: 0,
      reset: (calls[0] ?? now) + 60_000,
    };
  }
  calls.push(now);
  memoryStore.set(identifier, calls);
  return {
    success: true,
    limit: maxPerMinute,
    remaining: maxPerMinute - calls.length,
    reset: now + 60_000,
  };
}

export async function checkLimit(
  identifier: string,
  maxPerMinute: number
): Promise<RateLimitDecision> {
  if (upstashEnabled) {
    const limiter = getUpstashLimiter(maxPerMinute);
    const r = await limiter.limit(identifier);
    return {
      success: r.success,
      limit: r.limit,
      remaining: r.remaining,
      reset: r.reset,
    };
  }
  return memoryCheck(identifier, maxPerMinute);
}

export function isDistributedRateLimiterEnabled(): boolean {
  return upstashEnabled;
}
