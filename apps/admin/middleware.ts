import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets and Next runtime
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Always allow auth routes and admin public pages (no token checks)
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/' ||
    pathname === '/inloggen' ||
    pathname === '/admin-verificatie' ||
    pathname === '/admin-registratie' ||
    pathname.startsWith('/api/admin/set-password') ||
    pathname.startsWith('/api/admin/is-allowed-email')
  ) {
    return NextResponse.next();
  }

  // For all other routes (protected), check authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Not authenticated → send to /inloggen
  if (!token) {
    return NextResponse.redirect(new URL('/inloggen', req.url));
  }

  // If user needs to set a password, send to /admin-registratie first
  if ((token as any).needsPassword) {
    return NextResponse.redirect(new URL('/admin-registratie', req.url));
  }

  // Enforce ADMIN role on protected routes
  if ((token as any).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/inloggen', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
