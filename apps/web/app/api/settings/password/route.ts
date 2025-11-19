import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import bcrypt from 'bcrypt';
import { checkRateLimit } from '../../../../lib/rate-limit';

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rl = await checkRateLimit({ key: `pwd:user:${(session.user as any).id}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) return NextResponse.json({ error: 'Te veel pogingen, probeer later opnieuw.' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const { oldPassword, newPassword } = body || {};
  if (!oldPassword || !newPassword || String(newPassword).length < 8) return NextResponse.json({ error: 'Ongeldig wachtwoord' }, { status: 400 });
  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { passwordHash: true } });
  if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!me.passwordHash) return NextResponse.json({ error: 'Wachtwoord wijzigen is niet beschikbaar voor deze account' }, { status: 400 });
  const ok = await bcrypt.compare(oldPassword, me.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Oud wachtwoord is onjuist' }, { status: 400 });
  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: (session.user as any).id }, data: { passwordHash: hash } });
  return NextResponse.json({ ok: true });
}
