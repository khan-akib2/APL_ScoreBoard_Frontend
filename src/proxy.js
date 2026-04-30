import { NextResponse } from 'next/server';

// Auth is handled entirely client-side via sessionStorage (tab-specific).
// The middleware does NOT check cookies — each tab manages its own session.
// Page-level useAuth() hooks handle redirects to /admin/login when not authenticated.
export function proxy(request) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/dashboard/:path*', '/matches/:path*', '/standings/:path*'],
};
