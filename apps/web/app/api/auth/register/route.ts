import { NextResponse } from 'next/server';
import { prisma as db } from '@levendportret/db';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { checkRateLimit } from '../../../../lib/rate-limit';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export const runtime = 'nodejs';

function getIp(req: Request) {
  const header = (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim();
  return header || '127.0.0.1';
}

const dutchPostcode = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;
const dutchPhone = /^(?:\+31|0)(?:6\d{8}|[1-9]\d{8})$/;
const houseNumberRegex = /^\d+[A-Za-z]?$/;
const cityRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/;

const cleanPhone = (v: unknown) => {
  if (typeof v !== 'string') return v as any;
  const s = v.replace(/[\s\-()]/g, '');
  return s === '' ? null : s;
};

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.preprocess(cleanPhone, z.string().regex(dutchPhone, 'Ongeldig telefoonnummer').optional().nullable()).optional().nullable(),
  companyName: z.string().min(2),
  companyCity: z.string().regex(cityRegex, 'Plaats mag geen cijfers bevatten').min(2),
  companyAddress: z.string().min(1),
  companyZip: z.string().regex(dutchPostcode, 'Ongeldige postcode (bv. 1234 AB)'),
  companyHouseNumber: z.string().regex(houseNumberRegex, 'Huisnummer: alleen cijfers of cijfers + 1 letter'),
  companyWorkPhone: z.preprocess(cleanPhone, z.string().regex(dutchPhone, 'Ongeldig telefoonnummer').optional().nullable()).optional().nullable(),
  companyKvk: z.string().optional().nullable(),
  companyWebsite: z.string().url().optional().nullable(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniqueCompanySlug(base: string) {
  let slug = slugify(base);
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await db.company.findUnique({ where: { slug } });
    if (!exists) return slug;
    attempt += 1;
    slug = `${slugify(base)}-${attempt}`;
  }
}

async function sendAdminNewSignupNotifications() {
  try {
    const admins = await db.user.findMany({
      where: { role: 'ADMIN', notifyNewSignup: true } as any,
      select: { email: true },
    });
    const optedIn = admins.map((a) => a.email).filter((e): e is string => !!e);
    const envAdmins = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    // Union & normalize
    const recipients = Array.from(new Set([...optedIn.map((e) => e.toLowerCase()), ...envAdmins]));
    if (recipients.length === 0) return;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[notify] Sending new-signup notification to:', recipients.join(', '));
    }

    const server: SMTPTransport.Options = {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT ? Number(process.env.EMAIL_SERVER_PORT) : undefined,
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth:
        process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD
          ? {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            }
          : undefined,
    };
    const transport = nodemailer.createTransport(server);

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
      from: process.env.EMAIL_FROM || 'Levend Portret <noreply@example.com>',
      replyTo: process.env.EMAIL_REPLY_TO || 'Levend Portret <info@levendportret.nl>',
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error('admin notify new signup failed', e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Normalize website: allow domains without protocol by prefixing https://
    if (typeof body.companyWebsite === 'string') {
      const raw = (body.companyWebsite as string).trim();
      if (raw && !/^https?:\/\//i.test(raw)) {
        body.companyWebsite = `https://${raw}`;
      }
    }
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ongeldige invoer', issues: parsed.error.flatten() }, { status: 400 });
    }
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      companyName,
      companyCity,
      companyAddress,
      companyZip,
      companyHouseNumber,
      companyWorkPhone,
      companyKvk,
      companyWebsite,
    } = body;

    const emailNorm = (email as string).trim().toLowerCase();

    // Rate limit per IP and per email
    const ip = getIp(req);
    const rl1 = await checkRateLimit({ key: `reg:ip:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });
    if (!rl1.allowed) {
      return NextResponse.json({ error: 'Te veel pogingen, probeer later opnieuw.' }, { status: 429 });
    }
    const rl2 = await checkRateLimit({ key: `reg:email:${emailNorm}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rl2.allowed) {
      return NextResponse.json({ error: 'Te veel pogingen voor dit e-mailadres, probeer later opnieuw.' }, { status: 429 });
    }

    // 1. Check if user already exists (case-insensitive by normalization)
    const existingUser = await db.user.findUnique({
      where: { email: emailNorm },
    });

    if (existingUser) {
      // Do not reveal existence; return generic success. Client proceeds to magic-link flow.
      return NextResponse.json({ message: 'Als er al een account bestaat, ontvang je (opnieuw) een e-mail met vervolgstappen.' }, { status: 201 });
    }

    // 2. Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // 3. Create User and Company in a transaction
    const user = await db.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: emailNorm,
        phone,
        passwordHash,
        status: 'PENDING_VERIFICATION',
        company: {
          create: {
            name: companyName,
            city: companyCity,
            address: companyAddress,
            zipCode: companyZip,
            houseNumber: companyHouseNumber,
            workPhone: companyWorkPhone,
            kvkNumber: companyKvk,
            website: companyWebsite,
            slug: await uniqueCompanySlug(companyName),
          },
        },
      },
      include: {
        company: true,
      },
    });

    await sendAdminNewSignupNotifications();

    return NextResponse.json({ message: 'Gebruiker succesvol aangemaakt.' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Er is een interne fout opgetreden.' }, { status: 500 });
  }
}
