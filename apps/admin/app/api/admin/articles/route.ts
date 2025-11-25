import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

function toInt(v: string | null | undefined, d: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : d;
}

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim().toLowerCase() || '';
  const status = url.searchParams.get('status') || '';
  const visibility = url.searchParams.get('visibility') || '';
  const page = Math.max(1, toInt(url.searchParams.get('page'), 1));
  const take = Math.min(50, toInt(url.searchParams.get('take'), 20));
  const skip = (page - 1) * take;

  const where: any = {};
  if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }];
  if (status) where.status = status as any;
  if (visibility) where.visibility = visibility as any;

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take,
      select: { id: true, slug: true, title: true, excerpt: true, thumbnailUrl: true, status: true, visibility: true, publishedAt: true, updatedAt: true },
    }),
    prisma.article.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, take });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const title = String(body.title || '').trim();
  const inputSlug = String(body.slug || '').trim();
  if (!title) return NextResponse.json({ error: 'Titel is verplicht' }, { status: 400 });
  let slug = inputSlug || slugify(title);
  if (!slug) return NextResponse.json({ error: 'Slug is ongeldig' }, { status: 400 });
  const exists = await prisma.article.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: 'Slug bestaat al' }, { status: 400 });

  const now = new Date();
  const status = (body.status as any) || 'DRAFT';
  const visibility = (body.visibility as any) || 'PUBLIC';
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  const created = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt: body.excerpt || null,
      body: body.body ?? null,
      status,
      visibility,
      publishedAt: status === 'PUBLISHED' ? (publishedAt || now) : publishedAt,
      authorId: (session.user as any).id || null,
    },
    select: { id: true, slug: true },
  });
  return NextResponse.json({ ok: true, id: created.id, slug: created.slug });
}
