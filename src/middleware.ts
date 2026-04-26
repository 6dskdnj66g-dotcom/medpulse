import { NextRequest, NextResponse } from 'next/server';

// ── In-memory rate limiter (Edge-compatible, no external service needed) ──────
// Each entry: [windowStartMs, hitCount]
const rlStore = new Map<string, [number, number]>();

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

function rateLimit(ip: string, maxPerMinute: number): RateLimitResult {
  const now    = Date.now();
  const window = 60_000;
  const entry  = rlStore.get(ip);

  if (!entry || now - entry[0] > window) {
    rlStore.set(ip, [now, 1]);
    return { success: true, limit: maxPerMinute, remaining: maxPerMinute - 1, reset: now + window };
  }
  
  const [start, count] = entry;
  if (count >= maxPerMinute) {
    return { success: false, limit: maxPerMinute, remaining: 0, reset: start + window };
  }
  
  entry[1]++;
  return { success: true, limit: maxPerMinute, remaining: maxPerMinute - entry[1], reset: start + window };
}

// Clean up stale entries periodically (runs in the same process, not worker-safe
// but fine for single-instance deployments and Vercel Edge functions per-region).
// We do a lazy sweep on each request instead of setInterval (Edge has no timers).
let lastClean = Date.now();
function maybeSweep() {
  const now = Date.now();
  if (now - lastClean < 120_000) return;
  lastClean = now;
  for (const [key, [start]] of rlStore) {
    if (now - start > 60_000) rlStore.delete(key);
  }
}

function appendRateLimitHeaders(res: NextResponse, rl: RateLimitResult) {
  res.headers.set('X-RateLimit-Limit', rl.limit.toString());
  res.headers.set('X-RateLimit-Remaining', rl.remaining.toString());
  res.headers.set('X-RateLimit-Reset', rl.reset.toString());
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

  maybeSweep();

  // ── Rate limit AI endpoints ─────────────────────────────────────────────────
  // Stricter limit for AI routes (20 req/min per IP)
  const isAIRoute = pathname.startsWith('/api/ai/') ||
                    pathname.startsWith('/api/medical-query') ||
                    pathname.startsWith('/api/mdt') ||
                    pathname.startsWith('/api/osce') ||
                    pathname.startsWith('/api/usmle/explain') ||
                    pathname.startsWith('/api/ddx') ||
                    pathname.startsWith('/api/drug-interaction') ||
                    pathname.startsWith('/api/ecg-analysis') ||
                    pathname.startsWith('/api/vision');

                    if (isAIRoute) {
                      const rl = rateLimit(ip, 20);
                      if (!rl.success) {
                        const res = NextResponse.json(
                          { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
                          { status: 429, headers: { 'Retry-After': '60' } }
                        );
                        return appendRateLimitHeaders(res, rl);
                      }
                      // If success, we just proceed, but we can't easily append headers to NextResponse.next() 
                      // without cloning or setting them on a new response. 
                      // For simplicity, we only append them when rejected, or we can use the pattern:
                      // const response = NextResponse.next(); appendRateLimitHeaders(response, rl); return response;
                      // However, auth guard is below. We will handle auth first.
                    }
                  
                    // Library NCBI proxy: slightly more permissive (30 req/min)
                    if (pathname.startsWith('/api/library/')) {
                      const rl = rateLimit(`lib_${ip}`, 30);
                      if (!rl.success) {
                         const res = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
                         return appendRateLimitHeaders(res, rl);
                      }
                    }

  // ── Admin / Profile auth guard ───────────────────────────────────────────────
  if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT_ID')) {
      return NextResponse.next();
    }
    const sessionCookie =
      req.cookies.get('sb-access-token')?.value ??
      req.cookies.getAll().find(c => c.name.includes('auth-token'))?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/api/ai/:path*',
    '/api/medical-query',
    '/api/mdt/:path*',
    '/api/osce/:path*',
    '/api/usmle/explain',
    '/api/ddx',
    '/api/drug-interaction',
    '/api/ecg-analysis',
    '/api/vision',
    '/api/library/:path*',
  ],
};
