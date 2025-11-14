import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { z } from 'zod';

const phoneRegex = /^[0-9+\s\-()]{6,20}$/;
const postcodeRegex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i;
const kvkRegex = /^[0-9]{8}$/; // NL KvK is 8 cijfers

const Schema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  houseNumber: z.string().min(1),
  zipCode: z.string().regex(postcodeRegex, 'Ongeldige postcode (bijv. 1234 AB)'),
  city: z.string().min(1),
  workPhone: z.string().regex(phoneRegex).nullable().optional(),
  kvkNumber: z.string().regex(kvkRegex).nullable().optional(),
  website: z.string().url().or(z.literal('')).nullable().optional(),
  description: z.string().max(250).nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
});

export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  // Normalize website: auto-prefix https:// if missing scheme
  if (typeof body.website === 'string') {
    const raw = body.website.trim();
    if (raw && !/^https?:\/\//i.test(raw)) {
      body.website = `https://${raw}`;
    }
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 });
  // Extra regel: als er een externe website is ingevuld, is een korte beschrijving verplicht (max 250 tekens)
  if (parsed.data.website && !((parsed.data.description || '').trim())) {
    return NextResponse.json({ error: 'Korte beschrijving is verplicht wanneer een website is ingevuld (max 250 tekens).' }, { status: 400 });
  }
  const ownerId = (session.user as any).id;
  const existing = await prisma.company.findUnique({ where: { ownerId } });
  if (existing) {
    await prisma.company.update({ where: { id: existing.id }, data: {
      name: parsed.data.name,
      address: parsed.data.address,
      houseNumber: parsed.data.houseNumber,
      zipCode: parsed.data.zipCode.toUpperCase().replace(/\s+/, ' '),
      city: parsed.data.city,
      workPhone: parsed.data.workPhone || null,
      kvkNumber: parsed.data.kvkNumber || null,
      website: parsed.data.website || null,
      description: parsed.data.description || null,
      logoUrl: parsed.data.logoUrl || null,
    } });
  } else {
    await prisma.company.create({ data: {
      ownerId,
      name: parsed.data.name,
      address: parsed.data.address,
      houseNumber: parsed.data.houseNumber,
      zipCode: parsed.data.zipCode.toUpperCase().replace(/\s+/,' '),
      city: parsed.data.city,
      workPhone: parsed.data.workPhone || null,
      kvkNumber: parsed.data.kvkNumber || null,
      website: parsed.data.website || null,
      description: parsed.data.description || null,
      logoUrl: parsed.data.logoUrl || null,
      slug: (parsed.data.name).toLowerCase().replace(/\s+/g,'-') + `-${Date.now()}`
    } });
  }
  return NextResponse.json({ ok: true });
}
