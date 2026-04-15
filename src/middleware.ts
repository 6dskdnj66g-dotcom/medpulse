import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware: Route-level access control.
 * NOTE: The Professors page uses client-side UI lock overlays for
 * feature-level access control — middleware only protects truly
 * server-restricted admin routes.
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  // Only run on API admin routes if needed in the future
  matcher: [],
};
