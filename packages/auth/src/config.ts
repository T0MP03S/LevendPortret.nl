import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from '@levendportret/db';
import { compare } from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const WEB_BASE = (process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');

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

function resolveLogoAsset() {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, 'public', 'logo-email.png'),
    path.join(cwd, 'public', 'Logo Wit.png'),
    path.join(cwd, 'public', 'logo.svg'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const isPng = p.toLowerCase().endsWith('.png');
      return { logoPath: p, logoCid: 'lp-logo', isPng } as const;
    }
  }
  return { logoPath: undefined, logoCid: undefined, isPng: false } as const;
}

function baseTemplate({ title, intro, body, cta, preheader, logoCid }: { title: string; intro?: string; body: string; cta?: { href: string; label: string }; preheader?: string; logoCid?: string }) {
  const navy = '#191970';
  const coral = '#ff546b';
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" content="yes" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <meta charSet="utf-8" />
    <title>${title}</title>
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
                    <td style="vertical-align:middle"><img src="${logoCid ? `cid:${logoCid}` : `${WEB_BASE}/logo.svg`}" alt="Levend Portret" height="28" style="display:block;border:0;outline:none;text-decoration:none;"></td>
                    <td align="right" style="font-weight:700">${title}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="background:#ffffff;padding:24px 24px 8px 24px;">
                ${intro ? `<p style=\"margin:0 0 12px 0;color:#334155;\">${intro}</p>` : ''}
                <div style="color:#111827;line-height:1.55;font-size:15px">${body}</div>
                ${cta ? `<div style=\"margin-top:20px\"><a href=\"${cta.href}\" style=\"display:inline-block;background:${coral};color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600\">${cta.label}</a></div>` : ''}
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" style="background:#ffffff;padding:16px 24px;color:#64748b;font-size:12px;border-top:1px solid #e5e7eb;">
                © ${new Date().getFullYear()} Levend Portret · <a href="${WEB_BASE}" style="color:#64748b;text-decoration:underline">levendportret.nl</a>
                <div style="margin-top:4px">Contact: <a href="mailto:info@levendportret.nl" style="color:#64748b;text-decoration:underline">info@levendportret.nl</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Notify admins about a new signup (used for Google signups)
async function sendAdminNewSignupNotifications() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', notifyNewSignup: true } as any,
      select: { email: true },
    });
    const optedIn = admins.map((a: any) => a.email).filter((e: any): e is string => !!e);
    const envAdmins = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const recipients = Array.from(new Set([...(optedIn.map((e: string) => e.toLowerCase())), ...envAdmins]));
    if (recipients.length === 0) return;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[notify][google] Sending new-signup notification to:', recipients.join(', '));
    }
    const { createTransport } = require('nodemailer');
    const transport = createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : undefined,
      secure: process.env.EMAIL_SERVER_SECURE === 'true' ? true : undefined,
      auth: process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD ? {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      } : undefined,
    });
    const subject = 'Nieuwe aanmelding op Levend Portret';
    const text = 'Er is een nieuwe aanmelding gedaan. Ga naar het admin dashboard om de aanvraag te bekijken en goed te keuren.';
    const navy = '#191970';
    const coral = '#ff546b';
    const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003';
    const html = `<!doctype html><html lang="nl"><head><meta name="viewport" content="width=device-width" /><meta charSet="utf-8" /></head>
      <body style="margin:0;padding:0;background:#f7f7fb;font-family:Montserrat,Segoe UI,Arial,sans-serif;color:#111;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f7f7fb" style="background:#f7f7fb;padding:24px 0;">
          <tr><td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
              <tr>
                <td bgcolor="${navy}" style="background:${navy};padding:16px 20px;color:#fff;font-weight:700">Nieuwe aanmelding</td>
              </tr>
              <tr>
                <td style="padding:24px 24px 8px 24px;color:#111827;line-height:1.55;font-size:15px">
                  <p style="margin:0 0 12px 0;color:#334155;">Er is een nieuwe aanmelding binnengekomen.</p>
                  <p style="margin:0">Open het dashboard om de aanvraag te bekijken en te beoordelen.</p>
                  <div style="margin-top:16px">
                    <a href="${baseUrl}/dashboard" style="display:inline-block;background:${coral};color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">Naar admin dashboard</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;color:#64748b;font-size:12px;border-top:1px solid #e5e7eb;">© ${new Date().getFullYear()} Levend Portret</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body></html>`;
    await transport.sendMail({
      to: recipients.join(', '),
      from: process.env.EMAIL_FROM,
      replyTo: process.env.EMAIL_REPLY_TO || 'Levend Portret <info@levendportret.nl>',
      subject,
      html,
      text,
    });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('sendAdminNewSignupNotifications failed', e);
  }
}

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
      } : {}),

      
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
        const { logoPath, logoCid, isPng } = resolveLogoAsset();
        const subject = 'Verifieer je e-mailadres';
        const html = baseTemplate({ title: 'Inloggen', intro: 'Klik op de knop hieronder om in te loggen.', body: '<p>Deze link is tijdelijk geldig. Als je deze e-mail niet hebt aangevraagd, kun je deze negeren.</p>', cta: { href: url, label: 'Log in' }, preheader: 'Log in met één klik via je e-mail', logoCid });
        const text = `Inloggen\n\nKlik om in te loggen: ${url}\n\nDeze link is tijdelijk geldig. Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.`;
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          replyTo: process.env.EMAIL_REPLY_TO || 'Levend Portret <info@levendportret.nl>',
          subject,
          text,
          html: html,
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

      // Helper to send a simple transactional email to user
      async function sendUserMail(to: string, subject: string, html: string, text: string, attachments?: any[]) {
        try {
          const { createTransport } = require('nodemailer');
          const transport = createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : undefined,
            secure: process.env.EMAIL_SERVER_SECURE === 'true' ? true : undefined,
            auth: process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD ? {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            } : undefined,
          });
          await transport.sendMail({
            to,
            from: process.env.EMAIL_FROM,
            replyTo: process.env.EMAIL_REPLY_TO || 'Levend Portret <info@levendportret.nl>',
            subject,
            html,
            text,
            ...(attachments ? { attachments } : {}),
          });
        } catch (e) {
          // Log only in dev, ignore failures silently otherwise
          if (process.env.NODE_ENV !== 'production') console.warn('sendUserMail failed', e);
        }
      }

      // Email provider verification result
      if (account?.provider === 'email') {
        const current = await prisma.user.findUnique({ where: { email: user.email }, select: { status: true, role: true } });
        if (current && (current as any).status === 'PENDING_VERIFICATION') {
          if (isAdminEmail) {
            // Admins worden direct ACTIVE en krijgen ADMIN rol
            await prisma.user.update({ where: { email: user.email }, data: { status: 'ACTIVE', role: 'ADMIN' } });
          } else {
            await prisma.user.update({ where: { email: user.email }, data: { status: 'PENDING_APPROVAL' } });
            // Ensure a minimal Company exists so /instellingen is not empty
            try {
              const u2 = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true, name: true, company: { select: { id: true } } } });
              if (u2 && !u2.company) {
                await prisma.company.create({ data: {
                  ownerId: u2.id,
                  name: u2.name ? `Bedrijf van ${u2.name}` : 'Nieuw bedrijf',
                  city: '', address: '', zipCode: '', houseNumber: '',
                  workPhone: null, workEmail: user.email, kvkNumber: null, website: null,
                  slug: `${(u2.name || 'bedrijf').toLowerCase().replace(/\s+/g,'-')}-${Date.now()}`,
                }});
              }
            } catch {}
            // Stuur bevestiging naar gebruiker: aanmelding ontvangen + e-mail geverifieerd
            const subject = 'Aanmelding ontvangen — e-mail geverifieerd';
            const { logoPath, logoCid, isPng } = resolveLogoAsset();
            const html = baseTemplate({
              title: 'Aanmelding ontvangen',
              intro: 'We hebben je aanmelding ontvangen.',
              body: '<p>Je e-mailadres is geverifieerd. We beoordelen je aanmelding zo snel mogelijk. Je ontvangt bericht zodra je account is geactiveerd.</p><p>We bellen je binnenkort om je aanmelding te bespreken. Heb je vragen of wil je alvast iets doorgeven? Mail ons via <a href="mailto:info@levendportret.nl">info@levendportret.nl</a>.</p>',
              cta: { href: process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000', label: 'Ga naar de website' },
              logoCid,
            });
            const text = 'We hebben je aanmelding ontvangen en je e-mailadres is geverifieerd. We beoordelen je aanmelding zo snel mogelijk. We bellen je binnenkort om je aanmelding te bespreken. Vragen? Mail ons via info@levendportret.nl.';
            if (user.email) await sendUserMail(user.email, subject, html, text, logoPath ? [{ filename: path.basename(logoPath), path: logoPath, cid: logoCid, contentType: isPng ? 'image/png' : 'image/svg+xml' }] : undefined);
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
          // Ensure a minimal Company exists so /instellingen is not empty
          try {
            const u2 = await prisma.user.findUnique({ where: { email: user.email }, select: { id: true, name: true, company: { select: { id: true } } } });
            if (u2 && !u2.company) {
              await prisma.company.create({ data: {
                ownerId: u2.id,
                name: u2.name ? `Bedrijf van ${u2.name}` : 'Nieuw bedrijf',
                city: '', address: '', zipCode: '', houseNumber: '',
                workPhone: null, workEmail: user.email, kvkNumber: null, website: null,
                slug: `${(u2.name || 'bedrijf').toLowerCase().replace(/\s+/g,'-')}-${Date.now()}`,
              }});
            }
          } catch {}
          // Google signup: stuur aanmelding ontvangen
          const subject = 'Aanmelding ontvangen';
          const { logoPath, logoCid, isPng } = resolveLogoAsset();
          const html = baseTemplate({
            title: subject,
            intro: 'We hebben je aanmelding ontvangen.',
            body: '<p>We beoordelen je aanmelding zo snel mogelijk. Je ontvangt bericht zodra je account is geactiveerd.</p><p>We bellen je binnenkort om je aanmelding te bespreken. Heb je vragen of wil je alvast iets doorgeven? Mail ons via <a href="mailto:info@levendportret.nl">info@levendportret.nl</a>.</p>',
            cta: { href: process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000', label: 'Ga naar de website' },
            logoCid,
          });
          const text = 'We hebben je aanmelding ontvangen. We beoordelen je aanmelding zo snel mogelijk. We bellen je binnenkort om je aanmelding te bespreken. Vragen? Mail ons via info@levendportret.nl.';
          if (user.email) await sendUserMail(user.email, subject, html, text, logoPath ? [{ filename: path.basename(logoPath), path: logoPath, cid: logoCid, contentType: isPng ? 'image/png' : 'image/svg+xml' }] : undefined);
          // Notify admins for Google-based new signup
          await sendAdminNewSignupNotifications();
        }
      }
    }
  },
  debug: process.env.NODE_ENV !== 'production'
};

export type { NextAuthOptions } from 'next-auth';
