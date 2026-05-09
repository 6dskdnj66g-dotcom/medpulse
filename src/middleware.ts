import { NextRequest, NextResponse } from "next/server";
import { checkLimit } from "@/core/ratelimit/limiter";

function appendRateLimitHeaders(
  res: NextResponse,
  rl: { limit: number; remaining: number; reset: number }
) {
  res.headers.set("X-RateLimit-Limit", rl.limit.toString());
  res.headers.set("X-RateLimit-Remaining", rl.remaining.toString());
  res.headers.set("X-RateLimit-Reset", rl.reset.toString());
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const isAIRoute =
    pathname.startsWith("/api/ai/") ||
    pathname.startsWith("/api/medical-query") ||
    pathname.startsWith("/api/mdt") ||
    pathname.startsWith("/api/osce") ||
    pathname.startsWith("/api/usmle/explain") ||
    pathname.startsWith("/api/ddx") ||
    pathname.startsWith("/api/drug-interaction") ||
    pathname.startsWith("/api/ecg-analysis") ||
    pathname.startsWith("/api/vision");

  if (isAIRoute) {
    const rl = await checkLimit(`ai:${ip}`, 20);
    if (!rl.success) {
      const res = NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before trying again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
      return appendRateLimitHeaders(res, rl);
    }
  }

  if (pathname.startsWith("/api/library/")) {
    const rl = await checkLimit(`lib:${ip}`, 30);
    if (!rl.success) {
      const res = NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
      return appendRateLimitHeaders(res, rl);
    }
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/profile")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes("YOUR_PROJECT_ID")) {
      return NextResponse.next();
    }
    const sessionCookie =
      req.cookies.get("sb-access-token")?.value ??
      req.cookies.getAll().find(c => c.name.includes("auth-token"))?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/api/ai/:path*",
    "/api/medical-query",
    "/api/mdt/:path*",
    "/api/osce/:path*",
    "/api/usmle/explain",
    "/api/ddx",
    "/api/drug-interaction",
    "/api/ecg-analysis",
    "/api/vision",
    "/api/library/:path*",
  ],
};
