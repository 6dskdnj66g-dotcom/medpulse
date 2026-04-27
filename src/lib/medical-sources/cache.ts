import { SynthesizedAnswer } from './types';

interface CacheEntry {
  data: SynthesizedAnswer;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

const cache = new Map<string, CacheEntry>();

export function getCached(key: string): SynthesizedAnswer | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return { ...entry.data, cached: true };
}

export function setCached(key: string, data: SynthesizedAnswer, ttlMs = DEFAULT_TTL_MS): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function buildCacheKey(question: string): string {
  return question.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function clearExpired(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}

export function getCacheStats(): { size: number; keys: string[] } {
  clearExpired();
  return { size: cache.size, keys: Array.from(cache.keys()) };
}
