import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const me = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true, name: true, email: true, status: true, phone: true,
      company: { select: { id: true, name: true, address: true, houseNumber: true, zipCode: true, city: true, workPhone: true, kvkNumber: true, website: true, description: true, logoUrl: true } }
    }
  });
  if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if ((me as any).status !== 'ACTIVE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ user: { id: me.id, name: me.name, email: me.email, status: me.status, phone: (me as any).phone || null }, company: me.company || null });
}
