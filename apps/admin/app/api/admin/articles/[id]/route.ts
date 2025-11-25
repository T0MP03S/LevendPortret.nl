import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const art = await prisma.article.findUnique({ 
    where: { id: params.id },
    include: { category: true },
  });
  if (!art) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  return NextResponse.json({ article: art });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.title === 'string') data.title = body.title.trim();
  if (typeof body.excerpt === 'string' || body.excerpt === null) data.excerpt = body.excerpt || null;
  if (body.body !== undefined) data.body = body.body; // expect JSON
  if (typeof body.thumbnailUrl === 'string' || body.thumbnailUrl === null) data.thumbnailUrl = body.thumbnailUrl || null;
  if (typeof body.status === 'string') data.status = body.status;
  if (typeof body.visibility === 'string') data.visibility = body.visibility;
  if (typeof body.publishedAt === 'string') data.publishedAt = new Date(body.publishedAt);
  if (Array.isArray(body.tags)) data.tags = body.tags;
  if (typeof body.metaTitle === 'string' || body.metaTitle === null) data.metaTitle = body.metaTitle || null;
  if (typeof body.metaDescription === 'string' || body.metaDescription === null) data.metaDescription = body.metaDescription || null;
  if (typeof body.ogImageUrl === 'string' || body.ogImageUrl === null) data.ogImageUrl = body.ogImageUrl || null;
  if (typeof body.slug === 'string') {
    const newSlug = (body.slug.trim() || (data.title ? slugify(data.title) : ''));
    if (!newSlug) return NextResponse.json({ error: 'Slug is ongeldig' }, { status: 400 });
    const exists = await prisma.article.findUnique({ where: { slug: newSlug } });
    if (exists && exists.id !== params.id) return NextResponse.json({ error: 'Slug bestaat al' }, { status: 400 });
    data.slug = newSlug;
  }
  // Handle categoryId - can be string or null
  if (body.categoryId !== undefined) {
    data.categoryId = body.categoryId || null;
  }
  // auto publishedAt if status becomes PUBLISHED without date
  if (data.status === 'PUBLISHED' && !data.publishedAt) data.publishedAt = new Date();

  const updated = await prisma.article.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, article: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await prisma.article.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
