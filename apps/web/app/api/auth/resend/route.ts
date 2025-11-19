import { NextResponse } from 'next/server';
import { prisma } from '@levendportret/db';
import { checkRateLimit } from '../../../../lib/rate-limit';

function getIp(req: Request) {
  const header = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim();
  return header || '127.0.0.1';
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const emailRaw = (body?.email || '').toString();
    const email = emailRaw.trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
    }

    // Rate limit by IP and email
    const ip = getIp(req);
    const rl1 = await checkRateLimit({ key: `resend:ip:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });
    if (!rl1.allowed) return NextResponse.json({ error: 'Te veel pogingen, probeer later opnieuw.' }, { status: 429 });
    const rl2 = await checkRateLimit({ key: `resend:email:${email}`, limit: 5, windowMs: 60 * 60 * 1000 });
    if (!rl2.allowed) return NextResponse.json({ error: 'Te veel pogingen voor dit e-mailadres, probeer later opnieuw.' }, { status: 429 });

    // Invalidate existing verification tokens for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('resend error', e);
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 });
  }
}
