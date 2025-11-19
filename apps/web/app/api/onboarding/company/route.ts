import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { z } from 'zod';
import { checkRateLimit } from '../../../../lib/rate-limit';

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

const nullIfEmpty = (v: unknown) => {
  if (typeof v !== 'string') return v as any;
  const s = v.trim();
  return s === '' ? null : s;
};

const OnboardingSchema = z.object({
  phone: z.preprocess(cleanPhone, z.string().regex(dutchPhone, 'Ongeldig telefoonnummer')), 
  name: z.string().min(2),
  city: z.string().regex(cityRegex, 'Plaats mag geen cijfers bevatten').min(2),
  address: z.string().min(1),
  zipCode: z.string().regex(dutchPostcode, 'Ongeldige postcode (bv. 1234 AB)'),
  houseNumber: z.string().regex(houseNumberRegex, 'Huisnummer: alleen cijfers of cijfers + 1 letter'),
  workPhone: z.preprocess(cleanPhone, z.string().regex(dutchPhone, 'Ongeldig telefoonnummer').optional().nullable()).optional().nullable(),
  kvkNumber: z.preprocess(nullIfEmpty, z.string().optional().nullable()),
  website: z.preprocess(nullIfEmpty, z.string().url().optional().nullable()),
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
    const exists = await prisma.company.findUnique({ where: { slug } });
    if (!exists) return slug;
    attempt += 1;
    slug = `${slugify(base)}-${attempt}`;
  }
}

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    // Rate limit per IP
    const ip = getIp(req);
    const rl = await checkRateLimit({ key: `onb:ip:${ip}`, limit: 30, windowMs: 10 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Te veel verzoeken, probeer later opnieuw.' }, { status: 429 });
    }

    const body = await req.json();
    // Normalize website: allow domains without protocol by prefixing https://
    if (typeof body.website === 'string') {
      const raw = body.website.trim();
      if (raw && !/^https?:\/\//i.test(raw)) {
        body.website = `https://${raw}`;
      }
    }
    const parsed = OnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ongeldige invoer', issues: parsed.error.flatten() }, { status: 400 });
    }
    const { phone, name, city, address, zipCode, houseNumber, workPhone, kvkNumber, website } = parsed.data;

    await prisma.user.update({ where: { id: user.id }, data: { phone } });

    const existing = await prisma.company.findUnique({ where: { ownerId: user.id } });
    if (existing) {
      await prisma.company.update({
        where: { id: existing.id },
        data: { name, city, address, zipCode, houseNumber, workPhone, kvkNumber, website },
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const slug = await uniqueCompanySlug(name);
    await prisma.company.create({
      data: {
        ownerId: user.id,
        name,
        city,
        address,
        zipCode,
        houseNumber,
        workPhone: workPhone || null,
        kvkNumber: kvkNumber || null,
        website: website || null,
        slug,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Interne fout' }, { status: 500 });
  }
}
