import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { z } from 'zod';

const dutchPostcode = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;
const phoneRegex = /^[0-9+\s\-()]{6,20}$/;

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().regex(phoneRegex, 'Ongeldig telefoonnummer').optional().nullable(),
  company: z
    .object({
      name: z.string().min(2).optional(),
      city: z.string().min(1).optional(),
      address: z.string().min(1).optional(),
      zipCode: z.string().regex(dutchPostcode, 'Ongeldige postcode (bv. 1234 AB)').optional(),
      houseNumber: z.string().min(1).optional(),
      workPhone: z.string().regex(phoneRegex, 'Ongeldig telefoonnummer').optional().nullable(),
      kvkNumber: z.string().optional().nullable(),
      website: z.string().url().optional().nullable(),
    })
    .optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      plan: true,
      planUpdatedAt: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          city: true,
          address: true,
          zipCode: true,
          houseNumber: true,
          workPhone: true,
          kvkNumber: true,
          website: true,
          slug: true,
          tagline: true,
          description: true,
          sector: true,
          socials: true,
          logoUrl: true,
        },
      },
    },
  });
  if (!user || user.role === 'ADMIN') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item: user });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const action = body?.action as 'APPROVE' | 'REJECT' | 'SET_PENDING' | 'SET_PLAN';
  if (!action) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  try {
    const target = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } });
    if (!target || target.role === 'ADMIN') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (action === 'SET_PLAN') {
      const plan = (body?.plan as 'FREE' | 'PAID') || null;
      if (!plan || (plan !== 'FREE' && plan !== 'PAID')) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      const updated = await prisma.user.update({ where: { id: params.id }, data: { plan, planUpdatedAt: new Date() } });
      return NextResponse.json({ ok: true, plan: updated.plan, planUpdatedAt: updated.planUpdatedAt });
    }
    const status = action === 'APPROVE' ? 'ACTIVE' : action === 'REJECT' ? 'REJECTED' : 'PENDING_APPROVAL';
    const updated = await prisma.user.update({ where: { id: params.id }, data: { status } });
    return NextResponse.json({ ok: true, status: updated.status });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true, id: true } });
  if (!target || target.role === 'ADMIN') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer', issues: parsed.error.flatten() }, { status: 400 });
  }
  const { name, phone, company } = parsed.data;
  try {
    if (name !== undefined || phone !== undefined) {
      await prisma.user.update({ where: { id: params.id }, data: { ...(name !== undefined ? { name } : {}), ...(phone !== undefined ? { phone } : {}) } });
    }
    if (company) {
      const existing = await prisma.company.findUnique({ where: { ownerId: params.id } });
      if (existing) {
        await prisma.company.update({ where: { id: existing.id }, data: { ...company } });
      } else {
        await prisma.company.create({ data: { ownerId: params.id, name: company.name || 'Onbekend', city: company.city || '', address: company.address || '', zipCode: company.zipCode || '', houseNumber: company.houseNumber || '', workPhone: company.workPhone || null, kvkNumber: company.kvkNumber || null, website: company.website || null, slug: (company.name || 'bedrijf').toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}` } });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { role: true } });
  if (!target || target.role === 'ADMIN') return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const existing = await prisma.company.findUnique({ where: { ownerId: params.id } });
    if (existing) {
      await prisma.company.delete({ where: { id: existing.id } });
    }
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
