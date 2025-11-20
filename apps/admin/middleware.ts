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
    pathname.startsWith('/api/admin/set-password') ||
    pathname.startsWith('/api/admin/is-allowed-email')
  ) {
    return NextResponse.next();
  }

  // For all other routes (protected), check authentication
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  
  // Not authenticated → send to /inloggen
  if (!token) {
    return NextResponse.redirect(new URL('/inloggen', req.url));
  }

  // Determine if this user is an allowed admin email
  const allowedAdminEmail = (() => {
    const email = (token as any).email as string | null | undefined;
    if (!email) return false;
    const list = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return list.includes(email.toLowerCase());
  })();

  // If user must set a password, always send them to /admin-registratie,
  // and allow access to that page even if role is not yet ADMIN.
  if ((token as any).needsPassword) {
    if (pathname !== '/admin-registratie') {
      return NextResponse.redirect(new URL('/admin-registratie', req.url));
    }
    // On the registration page itself: only allow if this is an allowed admin email
    if (pathname === '/admin-registratie') {
      if (!allowedAdminEmail) {
        return NextResponse.redirect(new URL('/inloggen', req.url));
      }
      return NextResponse.next();
    }
  } else {
    // If password already set, block direct access to /admin-registratie
    if (pathname === '/admin-registratie') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Enforce ADMIN role on protected routes
  if ((token as any).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/inloggen', req.url));
  }

  // If ADMIN needs to set a password, send to /admin-registratie first
  // (Handled above before role check)

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
