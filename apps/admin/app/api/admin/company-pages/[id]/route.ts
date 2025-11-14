import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const page = await prisma.companyPage.findUnique({
    where: { id: params.id },
    include: {
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
          logoUrl: true,
          ownerId: true,
        }
      }
    }
  });
  if (!page) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  const clips = await prisma.clip.findMany({ where: { companyId: page.companyId }, orderBy: { createdAt: 'asc' }, select: { id: true, vimeoShortId: true, status: true } });
  return NextResponse.json({ page, clips });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || '').toUpperCase();
  if (!['PUBLISH','REJECT','REVERT_TO_REVIEW','UPDATE'].includes(action)) {
    return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 });
  }
  const page = await prisma.companyPage.findUnique({ where: { id: params.id }, select: { id: true, companyId: true, status: true } });
  if (!page) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });

  if (action === 'PUBLISH') {
    const vimeoIds = Array.isArray(body?.vimeoIds) ? body.vimeoIds.map((x: any)=> String(x||'').trim()).filter((x: string)=>/^\d+$/.test(x)) : [];
    if (vimeoIds.length < 2) return NextResponse.json({ error: 'Voer 2 geldige Vimeo IDs in' }, { status: 400 });
    // Upsert two clips for the company, set to PUBLISHED
    const existing = await prisma.clip.findMany({ where: { companyId: page.companyId }, orderBy: { createdAt: 'asc' } });
    const ops: any[] = [];
    // Ensure unique set of up to 2 IDs
    const ids: string[] = Array.from(new Set(vimeoIds)).slice(0,2) as string[];
    // Replace or create first two
    for (let i=0;i<ids.length;i++) {
      const id = ids[i];
      if (existing[i]) {
        ops.push(prisma.clip.update({ where: { id: existing[i].id }, data: { vimeoShortId: id, status: 'PUBLISHED' as any } }));
      } else {
        ops.push(prisma.clip.create({ data: { companyId: page.companyId, vimeoShortId: id, status: 'PUBLISHED' as any } }));
      }
    }
    // Archive any other existing clips beyond the first two
    if (existing.length > 2) {
      ops.push(prisma.clip.updateMany({ where: { companyId: page.companyId, id: { in: existing.slice(2).map(c=>c.id) } }, data: { status: 'ARCHIVED' as any } }));
    }
    await prisma.$transaction(ops);
    await prisma.companyPage.update({ where: { id: params.id }, data: { status: 'PUBLISHED' as any } });
    return NextResponse.json({ id: params.id, status: 'PUBLISHED' });
  }

  if (action === 'REJECT') {
    const notes = String(body?.notes || '').trim();
    if (!notes) return NextResponse.json({ error: 'Geef een reden mee' }, { status: 400 });
    await prisma.moderation.create({ data: { resourceType: 'COMPANY' as any, resourceId: page.id, status: 'REJECTED' as any, notes } });
    await prisma.companyPage.update({ where: { id: params.id }, data: { status: 'DRAFT' as any } });
    return NextResponse.json({ id: params.id, status: 'DRAFT' });
  }

  // REVERT_TO_REVIEW
  if (action === 'REVERT_TO_REVIEW') {
    await prisma.companyPage.update({ where: { id: params.id }, data: { status: 'IN_REVIEW' as any } });
    return NextResponse.json({ id: params.id, status: 'IN_REVIEW' });
  }

  // UPDATE basic fields
  const allowed = ['aboutLong','gallery','accentColor','titleFont','bodyFont','roundedCorners','showCompanyNameNextToLogo','socials','showContactPage'] as const;
  const data: any = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      (data as any)[key] = (body as any)[key];
    }
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Geen wijzigingen' }, { status: 400 });
  await prisma.companyPage.update({ where: { id: params.id }, data });
  return NextResponse.json({ id: params.id, ok: true });
}
