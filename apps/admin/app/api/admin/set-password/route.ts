import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const BodySchema = z.object({
  name: z.string().min(1),
  password: z.string().min(8)
});

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const pwdHash = await hash(parsed.data.password, 10);

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: parsed.data.name,
        passwordHash: pwdHash,
        emailVerified: new Date()
      }
    });

    // Return success; client will sign in with credentials to refresh session
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
