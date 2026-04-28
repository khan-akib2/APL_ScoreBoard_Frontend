import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Landing page — redirect admins to admin panel
  if (pathname === '/') {
    if (token && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Admin login page — redirect already-logged-in admins
  if (pathname === '/admin/login') {
    if (token && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Admin routes — only admin can access
  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // All other routes are fully public
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/dashboard/:path*', '/matches/:path*', '/standings/:path*'],
};
