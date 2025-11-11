import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
export const runtime = 'nodejs';

const R2_ENDPOINT = process.env.R2_ENDPOINT as string;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID as string;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY as string;
const R2_BUCKET = process.env.R2_BUCKET as string;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL as string; // e.g. https://pub.example.com or https://<accountid>.r2.cloudflarestorage.com/<bucket>

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return bad('Unauthorized', 401);

  // Basic env checks
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE_URL) {
    return bad('R2 niet geconfigureerd. Zie README voor R2_* env variabelen.', 500);
  }

  // Ensure ACTIVE user
  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { status: true, id: true } });
  if (!me) return bad('Not found', 404);
  if ((me as any).status !== 'ACTIVE') return bad('Forbidden', 403);

  const { fileName, contentType } = await req.json().catch(() => ({}));
  if (!fileName || !contentType) return bad('fileName en contentType zijn verplicht');
  if (!String(contentType).startsWith('image/')) return bad('Alleen afbeeldingen zijn toegestaan');

  try {
    // Sanitize filename and build key
    const base = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `logos/${me.id}/${Date.now()}-${base}`;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
      forcePathStyle: true,
    });

    const put = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(s3, put, { expiresIn: 60 * 5 }); // 5 minutes

    // Build public URL: allow both styles
    const publicUrl = R2_PUBLIC_BASE_URL.endsWith('/') ? `${R2_PUBLIC_BASE_URL}${key}` : `${R2_PUBLIC_BASE_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (e: any) {
    console.error('R2 presign error:', e);
    const msg = (process.env.NODE_ENV !== 'production') ? (e?.message || 'Unknown error') : 'Kon upload-URL niet genereren';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
