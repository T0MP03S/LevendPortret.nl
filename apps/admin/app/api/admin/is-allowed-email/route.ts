import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const list = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const allowed = !!email && list.includes(String(email).trim().toLowerCase());
    return NextResponse.json({ allowed });
  } catch {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }
}
