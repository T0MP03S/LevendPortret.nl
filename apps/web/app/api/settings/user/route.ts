import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { z } from 'zod';

const phoneRegex = /^[0-9+\s\-()]{6,20}$/;
const Schema = z.object({ name: z.string().min(1), phone: z.string().regex(phoneRegex).nullable().optional() });

export async function PUT(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 });
  await prisma.user.update({ where: { id: (session.user as any).id }, data: { name: parsed.data.name, phone: parsed.data.phone ?? null } });
  return NextResponse.json({ ok: true });
}
