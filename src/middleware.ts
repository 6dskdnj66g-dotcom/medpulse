import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // If Supabase not configured, allow for now
    if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT_ID')) {
      return NextResponse.next();
    }
    // Check session cookie
    const sessionCookie = req.cookies.get('sb-access-token')?.value
      || req.cookies.getAll().find(c => c.name.includes('auth-token'))?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
