import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { status: true, id: true, company: { select: { id: true, website: true } } } });
  if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if ((me as any).status !== 'ACTIVE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const companyId = me.company?.id || null;
  if (!companyId) return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 400 });
  if (me.company?.website) return NextResponse.json({ error: 'Niet beschikbaar voor bedrijven met externe website' }, { status: 400 });
  // Membership gating: require CLUB + COACH + CLIPS ACTIVE
  const mems = await prisma.membership.findMany({ where: { userId: (session.user as any).id, companyId, status: 'ACTIVE' as any } });
  const hasClub = mems.some((m:any)=> m.product === 'CLUB');
  const hasCoach = mems.some((m:any)=> m.product === 'COACH');
  const hasClips = mems.some((m:any)=> m.product === 'CLIPS');
  if (!(hasClub && hasCoach && hasClips)) return NextResponse.json({ error: 'Volledige toegang vereist' }, { status: 403 });
  const page = await prisma.companyPage.findUnique({ where: { companyId }, select: { id: true, status: true } });
  if (!page) return NextResponse.json({ error: 'Geen concept gevonden' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const notesRaw = typeof body?.notes === 'string' ? body.notes : '';
  const notes = notesRaw.trim();

  if (page.status === 'DRAFT') {
    await prisma.companyPage.update({ where: { companyId }, data: { status: 'IN_REVIEW' } as any });
    await prisma.moderation.create({ data: { resourceType: 'COMPANY' as any, resourceId: page.id, status: 'SUBMITTED' as any, notes: notes || 'Eerste aanvraag' } });
    return NextResponse.json({ ok: true, status: 'IN_REVIEW' });
  }

  if (page.status === 'IN_REVIEW') {
    return NextResponse.json({ error: 'Je aanvraag is al in review' }, { status: 400 });
  }

  if (page.status === 'PUBLISHED') {
    if (!notes) return NextResponse.json({ error: 'Beschrijf wat je wilt aanpassen' }, { status: 400 });
    await prisma.moderation.create({ data: { resourceType: 'COMPANY' as any, resourceId: page.id, status: 'SUBMITTED' as any, notes } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Ongeldige status voor indienen' }, { status: 400 });
}
