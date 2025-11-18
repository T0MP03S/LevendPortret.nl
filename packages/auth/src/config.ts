import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from '@levendportret/db';
import { compare } from 'bcryptjs';
import fs from 'fs';
import path from 'path';

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
        secure: process.env.EMAIL_SERVER_SECURE === 'true' ? true : undefined,
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
        if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_SEND_IN_DEV !== 'true') {
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
        const navy = '#191970';
        const coral = '#ff546b';
        const preheader = 'Log in met één klik via je e-mail';
        const cwd = process.cwd();
        const candidates = [
          path.join(cwd, 'public', 'logo-email.png'),
          path.join(cwd, 'public', 'Logo Wit.png'),
          path.join(cwd, 'public', 'logo.svg'),
        ];
        let logoPath: string | undefined = undefined;
        for (const p of candidates) { if (fs.existsSync(p)) { logoPath = p; break; } }
        const logoCid = logoPath ? 'lp-logo' : undefined;
        const isPng = logoPath ? logoPath.toLowerCase().endsWith('.png') : false;
        const subject = 'Verifieer je e-mailadres';
        const html = `<!doctype html>
<html lang="nl">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" content="yes" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <meta charSet="utf-8" />
    <title>Inloggen</title>
  </head>
  <body bgcolor="#f7f7fb" style="margin:0;padding:0;background:#f7f7fb;font-family:Montserrat,Segoe UI,Arial,sans-serif;color:#111;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f7f7fb" style="background:#f7f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td bgcolor="${navy}" style="background:${navy};padding:16px 20px;color:#fff;">
                <table width="100%">
                  <tr>
                    <td style="vertical-align:middle"><img src="${logoCid ? `cid:${logoCid}` : 'https://levendportret.nl/logo.svg'}" alt="Levend Portret" height="28" style="display:block;border:0;outline:none;text-decoration:none;"></td>
                    <td align="right" style="font-weight:700">Inloggen</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="background:#ffffff;padding:24px 24px 8px 24px;">
                <p style="margin:0 0 12px 0;color:#334155;">Klik op de knop hieronder om in te loggen.</p>
                <div style="color:#111827;line-height:1.55;font-size:15px"><p>Deze link is tijdelijk geldig. Als je deze e-mail niet hebt aangevraagd, kun je deze negeren.</p></div>
                <div style="margin-top:20px"><a href="${url}" style="display:inline-block;background:${coral};color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">Log in</a></div>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="background:#ffffff;padding:16px 24px;color:#64748b;font-size:12px;border-top:1px solid #e5e7eb;">
                © ${new Date().getFullYear()} Levend Portret · <a href="https://levendportret.nl" style="color:#64748b;text-decoration:underline">levendportret.nl</a>
                <div style="margin-top:4px">Contact: <a href="mailto:info@levendportret.nl" style="color:#64748b;text-decoration:underline">info@levendportret.nl</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
        const text = `Inloggen\n\nKlik om in te loggen: ${url}\n\nDeze link is tijdelijk geldig. Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.`;
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          replyTo: process.env.EMAIL_REPLY_TO || 'Levend Portret <info@levendportret.nl>',
          subject,
          text,
          html: logoCid ? html.replace('https://levendportret.nl/logo.svg', `cid:${logoCid}`) : html,
          ...(logoPath ? { attachments: [{ filename: path.basename(logoPath), path: logoPath, cid: logoCid, contentType: isPng ? 'image/png' : 'image/svg+xml' }] } : {}),
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
