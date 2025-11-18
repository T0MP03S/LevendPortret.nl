import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { status: true, id: true, company: { select: { id: true, name: true, website: true } } } });
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

  const { notes } = await req.json().catch(()=>({}));

  // Ensure there is a company page
  let page = await prisma.companyPage.findUnique({ where: { companyId } });
  if (!page) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { name: true } });
    const raw = (company?.name || 'Bedrijf').replace(/[^A-Za-z0-9]/g, '');
    const base = raw && raw.length > 0 ? raw : `Page`;
    let slug = base;
    let n = 2;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const exists = await prisma.companyPage.findUnique({ where: { slug } });
      if (!exists) break;
      slug = `${base}-${n++}`;
    }
    page = await prisma.companyPage.create({ data: { companyId, slug, status: 'DRAFT' as any } });
  }

  // If notes present: create an update request for published pages
  const notesStr = typeof notes === 'string' ? notes.trim() : '';
  if (notesStr) {
    if (page.status !== ('PUBLISHED' as any)) {
      return NextResponse.json({ error: 'Update aanvragen kan alleen voor gepubliceerde pagina\'s' }, { status: 400 });
    }
    await prisma.moderation.create({ data: { resourceType: 'COMPANY' as any, resourceId: page.id, status: 'SUBMITTED' as any, notes: notesStr } });
    return NextResponse.json({ ok: true });
  }

  // Otherwise: submit the page for review
  await prisma.companyPage.update({ where: { id: page.id }, data: { status: 'IN_REVIEW' as any } });
  return NextResponse.json({ ok: true });
}
