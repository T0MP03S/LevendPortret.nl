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
  const status = (searchParams.get('status') || 'ACTIVE') as 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'PENDING_VERIFICATION';
  const planParam = (searchParams.get('plan') || '').toUpperCase();
  const plan = planParam === 'FREE' || planParam === 'PAID' ? (planParam as 'FREE' | 'PAID') : undefined;
  const users = await prisma.user.findMany({
    where: { status, ...(plan ? { plan } : {}), role: { not: 'ADMIN' } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      plan: true,
      planUpdatedAt: true,
      createdAt: true,
      company: { select: { id: true, name: true, city: true } },
    },
  });
  return NextResponse.json({ items: users });
}
