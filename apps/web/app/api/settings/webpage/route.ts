import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { z } from 'zod';

function extractVimeoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.hostname.includes('vimeo.com')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && /^\d+$/.test(last)) return last;
    }
  } catch {}
  return null;
}

const BodySchema = z.object({
  aboutLong: z.string().max(5000).nullable().optional(),
  longVideo: z.string().max(200).nullable().optional(),
  gallery: z.array(z.object({ url: z.string().url() , width: z.number().nullable().optional(), height: z.number().nullable().optional(), type: z.string().nullable().optional() })).min(0).max(5).optional(),
  accentColor: z.string().max(20).nullable().optional(),
  titleFont: z.string().max(100).nullable().optional(),
  bodyFont: z.string().max(100).nullable().optional(),
  roundedCorners: z.boolean().optional(),
  showCompanyNameNextToLogo: z.boolean().optional(),
  socials: z.record(z.string(), z.string()).nullable().optional(),
  showContactPage: z.boolean().optional(),
  status: z.enum(['DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED']).optional(),
});

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { status: true, id: true, company: { select: { id: true, website: true } } } });
  if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if ((me as any).status !== 'ACTIVE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const companyId = me.company?.id || null;
  if (!companyId) return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 400 });
  // Require full access: CLUB + COACH + CLIPS active memberships for this user+company
  const mems = await prisma.membership.findMany({ where: { userId: me.id, companyId, status: 'ACTIVE' as any } });
  const hasClub = mems.some((m:any)=> m.product === 'CLUB');
  const hasCoach = mems.some((m:any)=> m.product === 'COACH');
  const hasClips = mems.some((m:any)=> m.product === 'CLIPS');
  if (!(hasClub && hasCoach && hasClips)) return NextResponse.json({ error: 'Volledige toegang vereist' }, { status: 403 });
  const page = await prisma.companyPage.findUnique({ where: { companyId } });
  let lastRejectionMessage: string | null = null;
  if (page) {
    const mod = await prisma.moderation.findFirst({
      where: { resourceType: 'COMPANY' as any, resourceId: page.id, status: 'REJECTED' as any },
      orderBy: { createdAt: 'desc' },
      select: { notes: true }
    });
    lastRejectionMessage = mod?.notes || null;
  }
  return NextResponse.json({ companyHasWebsite: !!me.company?.website, page, lastRejectionMessage });
}

export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { status: true, id: true, company: { select: { id: true, website: true } } } });
  if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if ((me as any).status !== 'ACTIVE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const companyId = me.company?.id || null;
  if (!companyId) return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 400 });
  if (me.company?.website) return NextResponse.json({ error: 'Niet beschikbaar voor bedrijven met externe website' }, { status: 400 });
  // Require full access: CLUB + COACH + CLIPS active memberships for this user+company
  const mems = await prisma.membership.findMany({ where: { userId: me.id, companyId, status: 'ACTIVE' as any } });
  const hasClub = mems.some((m:any)=> m.product === 'CLUB');
  const hasCoach = mems.some((m:any)=> m.product === 'COACH');
  const hasClips = mems.some((m:any)=> m.product === 'CLIPS');
  if (!(hasClub && hasCoach && hasClips)) return NextResponse.json({ error: 'Volledige toegang vereist' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 });
  const v = parsed.data;
  const data: any = {
    aboutLong: v.aboutLong ?? null,
    gallery: v.gallery ?? null,
    accentColor: v.accentColor ?? null,
    titleFont: v.titleFont ?? null,
    bodyFont: v.bodyFont ?? null,
    roundedCorners: v.roundedCorners ?? false,
    showCompanyNameNextToLogo: v.showCompanyNameNextToLogo ?? true,
    socials: v.socials ?? null,
  };
  const hasLongVideo = Object.prototype.hasOwnProperty.call(body, 'longVideo');
  if (hasLongVideo) {
    data.longVideoVimeoId = v.longVideo ? (extractVimeoId(v.longVideo) || null) : null;
  }
  const hasShowContactPage = Object.prototype.hasOwnProperty.call(body, 'showContactPage');
  if (hasShowContactPage) {
    data.showContactPage = v.showContactPage as boolean;
  }
  if (v.status) data.status = v.status;
  const existing = await prisma.companyPage.findUnique({ where: { companyId } });
  if (existing) {
    await prisma.companyPage.update({ where: { companyId }, data });
  } else {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } });
    const raw = (company?.name || 'Bedrijf').replace(/[^A-Za-z0-9]/g, '');
    const base = raw && raw.length > 0 ? raw : `Page`;
    let slug = base;
    let n = 2;
    // Ensure unique slug by appending -2, -3, ... if needed
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const exists = await prisma.companyPage.findUnique({ where: { slug } });
      if (!exists) break;
      slug = `${base}-${n++}`;
    }
    await prisma.companyPage.create({ data: { companyId, slug, ...data } });
  }
  return NextResponse.json({ ok: true });
}
