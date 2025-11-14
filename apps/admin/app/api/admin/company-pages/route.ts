import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const statusParam = (searchParams.get('status') || 'IN_REVIEW').toUpperCase();

  const where: any = {};
  if (['DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED'].includes(statusParam)) where.status = statusParam;

  const items = await prisma.companyPage.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      companyId: true,
      slug: true,
      status: true,
      accentColor: true,
      titleFont: true,
      bodyFont: true,
      roundedCorners: true,
      showCompanyNameNextToLogo: true,
      showContactPage: true,
      gallery: true,
      company: { select: { id: true, name: true, city: true } },
      updatedAt: true,
      createdAt: true,
    }
  });

  return NextResponse.json({ items });
}
