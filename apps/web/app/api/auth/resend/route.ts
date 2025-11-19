import { NextResponse } from 'next/server';
import { prisma } from '@levendportret/db';
import { checkRateLimit } from '../../../../lib/rate-limit';

function getIp(req: Request) {
  const header = (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '').split(',')[0].trim();
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

    // Stricter rate limits (mask responses)
    const ip = getIp(req);
    const rl1 = await checkRateLimit({ key: `resend:ip:${ip}`, limit: 3, windowMs: 60 * 60 * 1000 });
    const rl2 = await checkRateLimit({ key: `resend:email:${email}`, limit: 3, windowMs: 60 * 60 * 1000 });
    if (!rl1.allowed || !rl2.allowed) {
      // Masked response to avoid enumeration/DoS hints
      return NextResponse.json({ ok: true });
    }

    // Invalidate existing verification tokens for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    // Always return a generic success to avoid enumeration
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('resend error', e);
    // Generic success even on error to reduce oracle effects; errors still logged
    return NextResponse.json({ ok: true });
  }
}
