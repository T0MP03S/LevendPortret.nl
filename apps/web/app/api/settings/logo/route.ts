import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { z } from 'zod';

const Schema = z.object({
  logoUrl: z.string().url(),
});

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Ongeldige logoUrl' }, { status: 400 });

  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { company: true } });
  if (!me?.company) return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });

  await prisma.company.update({
    where: { id: me.company.id },
    data: { logoUrl: parsed.data.logoUrl },
  });

  return NextResponse.json({ ok: true });
}
