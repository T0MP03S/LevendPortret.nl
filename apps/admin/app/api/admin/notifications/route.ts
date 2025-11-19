import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const me = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { notifyNewSignup: true },
  });
  return NextResponse.json({ notifyNewSignup: me?.notifyNewSignup ?? false });
}

export async function PATCH(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const next = !!(body as any)?.notifyNewSignup;
  await prisma.user.update({ where: { id: (session.user as any).id }, data: { notifyNewSignup: next } });
  return NextResponse.json({ ok: true, notifyNewSignup: next });
}
