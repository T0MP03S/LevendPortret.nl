import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { z } from 'zod';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const Schema = z.object({
  logoUrl: z.string().url(),
});

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Ongeldige logoUrl' }, { status: 400 });

  // Verify the uploaded object on R2 before trusting the URL
  try {
    const R2_ENDPOINT = process.env.R2_ENDPOINT as string;
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID as string;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY as string;
    const R2_BUCKET = process.env.R2_BUCKET as string;
    const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL as string;
    if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE_URL) {
      return NextResponse.json({ error: 'Opslag niet geconfigureerd' }, { status: 500 });
    }
    const url = parsed.data.logoUrl;
    if (!url.startsWith(R2_PUBLIC_BASE_URL)) {
      return NextResponse.json({ error: 'Ongeldige opslaglocatie' }, { status: 400 });
    }
    const key = url.substring(R2_PUBLIC_BASE_URL.endsWith('/') ? R2_PUBLIC_BASE_URL.length : (R2_PUBLIC_BASE_URL.length + 1));
    const s3 = new S3Client({ region: 'auto', endpoint: R2_ENDPOINT, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }, forcePathStyle: true });
    const head = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const size = Number(head.ContentLength || 0);
    const type = String(head.ContentType || '');
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (size <= 0 || size > maxBytes) {
      return NextResponse.json({ error: 'Logo is te groot (max 5MB)' }, { status: 400 });
    }
    if (!type.startsWith('image/')) {
      return NextResponse.json({ error: 'Alleen afbeeldingen zijn toegestaan' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Logo kon niet worden gevalideerd' }, { status: 400 });
  }

  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { company: true } });
  if (!me?.company) return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 });

  await prisma.company.update({
    where: { id: me.company.id },
    data: { logoUrl: parsed.data.logoUrl },
  });

  return NextResponse.json({ ok: true });
}
