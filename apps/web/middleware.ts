import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that are always public
const PUBLIC_PATHS = new Set([
  '/',
  '/even-voorstellen',
  '/aanmelden',
  '/inloggen',
  '/verificatie',
  '/in-behandeling',
  '/post-auth',
  '/clips',
]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets and Next runtime
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

  // Allow any direct file requests from public root (e.g. /logo.svg, /robots.txt)
  if (pathname.includes('.') && !pathname.endsWith('.html')) {
    return NextResponse.next();
  }

  // Always allow NextAuth auth routes and onboarding API
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/onboarding/company')) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Instellingen: laat alle ingelogde gebruikers door; API-routes binnen instellingen handhaven toegang (ACTIVE/CLIPS)
  if (pathname.startsWith('/instellingen')) {
    if (!token) {
      return NextResponse.redirect(new URL('/inloggen', req.url));
    }
    return NextResponse.next();
  }

  // Onboarding page access rules
  if (pathname.startsWith('/onboarding/bedrijf')) {
    // Not logged in -> to login
    if (!token) {
      return NextResponse.redirect(new URL('/inloggen', req.url));
    }
    // Already ACTIVE -> home
    if ((token as any).status === 'ACTIVE') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Non-active logged-in users may proceed to onboarding
    return NextResponse.next();
  }

  // Note: do not redirect '/' automatically to '/post-auth' to avoid loops and allow ACTIVE users to land on home.

  // If already authenticated and visiting /inloggen -> send to home
  if (token && pathname === '/inloggen') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is authenticated but not ACTIVE, gate to allowed pages only
  if (token && (token as any).status && (token as any).status !== 'ACTIVE') {
    const isPublicDynamic = pathname.startsWith('/p/');
    if (!PUBLIC_PATHS.has(pathname) && !isPublicDynamic) {
      // Only allow the limited set; redirect to pending page
      return NextResponse.redirect(new URL('/in-behandeling', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
