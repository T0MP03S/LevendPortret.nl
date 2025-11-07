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
  const statusParam = (searchParams.get('status') || 'ACTIVE').toUpperCase();
  const productParam = (searchParams.get('product') || '').toUpperCase();
  const product = productParam === 'CLUB' || productParam === 'COACH' || productParam === 'FUND' ? (productParam as 'CLUB' | 'COACH' | 'FUND') : undefined;

  const where = {
    ...(statusParam !== 'ALL' ? { status: statusParam as any } : {}),
    ...((productParam === 'PAID')
      ? { memberships: { some: { product: { in: ['CLUB','COACH'] as any }, status: 'ACTIVE' as const } } }
      : (product ? { memberships: { some: { product, status: 'ACTIVE' as const } } } : {})),
    role: { not: 'ADMIN' as const },
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      company: { select: { id: true, name: true, city: true } },
      memberships: {
        select: {
          product: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });
  return NextResponse.json({ items: users });
}
