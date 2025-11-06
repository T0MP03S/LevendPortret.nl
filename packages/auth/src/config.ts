import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from '@levendportret/db';
import { compare } from 'bcryptjs';

// Simple in-memory rate limiter (per process)
const __rlStore = new Map<string, number[]>();
function rlCheck(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const arr = __rlStore.get(key) || [];
  const recent = arr.filter((t) => now - t < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  __rlStore.set(key, recent);
  return true;
}

const ADMIN_MODE = (() => {
  if ((process.env.AUTH_MODE || '').toLowerCase() === 'admin') return true;
  const u = process.env.NEXTAUTH_URL || '';
  return (
    u.includes('://admin.') ||
    u.includes('localhost:3003') ||
    u.endsWith(':3003')
  );
})();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  // Determine if we're running inside the admin app based on NEXTAUTH_URL
  // Admin mode when URL contains admin subdomain or localhost:3003
  ...(process.env.NEXTAUTH_URL && { } as any),
  ...(process.env.AUTH_COOKIE_DOMAIN
    ? {
        cookies: {
          sessionToken: {
            name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
            options: {
              domain: process.env.AUTH_COOKIE_DOMAIN,
              path: '/',
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            },
          },
        },
      }
    : {}),
  providers: [
    // Email magic-link provider (logs link to terminal in development)
    EmailProvider({
      normalizeIdentifier(identifier) {
        return identifier.trim().toLowerCase();
      },
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : undefined,
        auth: process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD ? {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        } : undefined
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        const adminMode = !!process.env.NEXTAUTH_URL && (
          process.env.NEXTAUTH_URL.includes('://admin.') ||
          process.env.NEXTAUTH_URL.includes('localhost:3003') ||
          process.env.NEXTAUTH_URL.endsWith(':3003')
        );
        if (adminMode) {
          const list = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          if (!list.includes(identifier.toLowerCase())) {
            if (process.env.NODE_ENV !== 'production') {
              const msg = [
                '',
                '┌───────────────────────────────────────────',
                '│  Magic link geblokkeerd (ADMIN ONLY)',
                `│  Aan:  ${identifier}`,
                '│  Reden: e-mailadres staat niet in ADMIN_EMAILS',
                '└───────────────────────────────────────────',
                ''
              ].join('\n');
              console.warn(msg);
              return;
            }
            throw new Error('Not allowed');
          }
        }
        // Rate limit magic link requests per email (5/hour)
        if (!rlCheck(`email-send:${identifier}`, 5, 60 * 60 * 1000)) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Rate limited magic link for', identifier);
            return;
          }
          throw new Error('Too many requests');
        }
        if (process.env.NODE_ENV !== 'production') {
          const msg = [
            '',
            '┌───────────────────────────────────────────',
            '│  Magic link verstuurd (DEV)',
            `│  Aan:  ${identifier}`,
            `│  Link: ${url}`,
            '│',
            '│  Let op: deze link wordt alleen gelogd in development.',
            '└───────────────────────────────────────────',
            ''
          ].join('\n');
          console.log(msg);
          return;
        }
        const { createTransport } = require('nodemailer');
        const transport = createTransport(provider.server);
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: 'Verifieer je e-mailadres',
          text: `Klik op de link om in te loggen: ${url}`,
          html: `<p>Klik op de link om in te loggen: <a href="${url}">${url}</a></p>`
        });
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        if (!rlCheck(`cred:${credentials.email.toLowerCase()}`, 10, 10 * 60 * 1000)) {
          return null;
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        // Allow credentials login only if email is verified
        if (!user.emailVerified) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name ?? undefined, email: user.email, image: user.image ?? undefined };
      }
    }),
    ...((process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && !ADMIN_MODE)
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : [])
  ],
  pages: ADMIN_MODE
    ? {
        signIn: '/inloggen',
        verifyRequest: '/admin-verificatie',
        error: '/auth/error'
      }
    : {
        signIn: '/inloggen',
        verifyRequest: '/verificatie',
        error: '/auth/error'
      },
  callbacks: {
    async signIn({ user, account }) {
      const adminMode = !!process.env.NEXTAUTH_URL && (
        process.env.NEXTAUTH_URL.includes('://admin.') ||
        process.env.NEXTAUTH_URL.includes('localhost:3003') ||
        process.env.NEXTAUTH_URL.endsWith(':3003')
      );
      if (adminMode) {
        if (account?.provider === 'google') return false;
        if (account?.provider === 'email' && user?.email) {
          const u = await prisma.user.findUnique({ where: { email: user.email }, select: { passwordHash: true } });
          if (u?.passwordHash) return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        token.email = user.email;
        // Always fetch latest role and status from DB to reflect promotions done during signIn
        if (user.email) {
          const u = await prisma.user.findUnique({ where: { email: user.email }, select: { role: true, status: true, passwordHash: true } });
          (token as any).role = u?.role;
          (token as any).status = u?.status;
          (token as any).needsPassword = !u?.passwordHash;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = (token as any).id;
        session.user.email = token.email as string | null;
        (session.user as any).role = (token as any).role;
        (session.user as any).status = (token as any).status;
        (session.user as any).needsPassword = (token as any).needsPassword;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative redirects like '/dashboard'
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {
        // ignore
      }
      return baseUrl;
    }
  },
  events: {
    async signIn({ user, account }) {
      if (!user?.email) return;
      const email = user.email.toLowerCase();
      const isAdminEmail = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .includes(email);

      // Email provider verification result
      if (account?.provider === 'email') {
        const current = await prisma.user.findUnique({ where: { email: user.email }, select: { status: true, role: true } });
        if (current && (current as any).status === 'PENDING_VERIFICATION') {
          if (isAdminEmail) {
            // Admins worden direct ACTIVE en krijgen ADMIN rol
            await prisma.user.update({ where: { email: user.email }, data: { status: 'ACTIVE', role: 'ADMIN' } });
          } else {
            await prisma.user.update({ where: { email: user.email }, data: { status: 'PENDING_APPROVAL' } });
          }
        }
      }

      // On Google login outside admin, only transition from PENDING_VERIFICATION -> PENDING_APPROVAL.
      // Do NOT override REJECTED or other statuses.
      if (account?.provider === 'google') {
        const current = await prisma.user.findUnique({ where: { email: user.email }, select: { status: true } });
        if (!current) return;
        if ((current as any).status === 'PENDING_VERIFICATION') {
          await prisma.user.update({ where: { email: user.email }, data: { status: 'PENDING_APPROVAL' } });
        }
      }
    }
  },
  debug: process.env.NODE_ENV !== 'production'
};

export type { NextAuthOptions } from 'next-auth';
