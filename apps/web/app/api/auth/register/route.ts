import { NextResponse } from 'next/server';
import { prisma as db } from '@levendportret/db';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit } from '../../../lib/rate-limit';

function getIp(req: Request) {
  // Works locally; behind proxy use x-forwarded-for
  const header = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim();
  return header || '127.0.0.1';
}

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(6).optional().nullable(),
  companyName: z.string().min(2),
  companyCity: z.string().min(1),
  companyAddress: z.string().min(1),
  companyZip: z.string().min(4),
  companyHouseNumber: z.string().min(1),
  companyWorkPhone: z.string().optional().nullable(),
  companyKvk: z.string().optional().nullable(),
  companyWebsite: z.string().url().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
    const rl1 = checkRateLimit({ key: `reg:ip:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });
    if (!rl1.allowed) {
      return NextResponse.json({ error: 'Te veel pogingen, probeer later opnieuw.' }, { status: 429 });
    }
    const rl2 = checkRateLimit({ key: `reg:email:${emailNorm}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rl2.allowed) {
      return NextResponse.json({ error: 'Te veel pogingen voor dit e-mailadres, probeer later opnieuw.' }, { status: 429 });
    }

    // 1. Check if user already exists (case-insensitive by normalization)
    const existingUser = await db.user.findUnique({
      where: { email: emailNorm },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Een gebruiker met dit e-mailadres bestaat al.' }, { status: 409 });
    }

    // 2. Hash the password
    const passwordHash = await hash(password, 10);

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
            // TODO: Generate a unique slug
            slug: companyName.toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`,
          },
        },
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json({ message: 'Gebruiker succesvol aangemaakt.' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Er is een interne fout opgetreden.' }, { status: 500 });
  }
}
