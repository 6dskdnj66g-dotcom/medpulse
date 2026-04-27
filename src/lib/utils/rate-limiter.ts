import { supabase } from '@/core/database/supabase';
import { RateLimitError } from './errors';

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '20');

/**
 * Simple IP-based rate limiter using Supabase.
 * For production scale, replace with Upstash Redis.
 */
export async function checkRateLimit(identifier: string): Promise<void> {
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  // Count requests in current window
  const { count, error: countError } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('identifier', identifier)
    .gte('window_start', windowStart);

  if (countError) {
    console.error('[rate-limiter] Count error:', countError);
    return; // Fail-open on rate limiter error (educational platform)
  }

  if ((count || 0) >= MAX_REQUESTS) {
    throw new RateLimitError();
  }

  // Record this request
  await supabase.from('rate_limits').insert({
    identifier,
    window_start: new Date().toISOString(),
  });

  // Cleanup old entries (best-effort, fire-and-forget)
  void supabase
    .from('rate_limits')
    .delete()
    .lt('window_start', new Date(Date.now() - WINDOW_MS * 5).toISOString());
}