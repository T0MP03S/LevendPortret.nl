import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow static assets and Next runtime
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // always allow auth routes and inloggen page
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/inloggen' ||
    pathname === '/wachtwoord-instellen' ||
    pathname.startsWith('/api/admin/set-password')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/inloggen', req.url));
  }

  if ((token as any).needsPassword && pathname !== '/wachtwoord-instellen') {
    return NextResponse.redirect(new URL('/wachtwoord-instellen', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
