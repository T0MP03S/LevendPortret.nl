import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') return bad('Unauthorized', 401);

  // Basic env checks
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE_URL) {
    return bad('R2 niet geconfigureerd. Zet R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET en R2_PUBLIC_BASE_URL in .env.local', 500);
  }

  const body = await req.json().catch(() => ({} as any));
  const fileName = String(body?.fileName || '').trim();
  const contentType = String(body?.contentType || '').trim();
  const contentHash = body?.contentHash ? String(body.contentHash).toLowerCase() : '';
  if (!fileName || !contentType) return bad('fileName en contentType zijn verplicht');
  if (!contentType.startsWith('image/')) return bad('Alleen afbeeldingen zijn toegestaan');

  // Ensure page exists and fetch companyId for namespacing
  const page = await prisma.companyPage.findUnique({ where: { id: params.id }, select: { id: true, companyId: true } });
  if (!page) return bad('Niet gevonden', 404);

  try {
    const base = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const extFromName = (base.match(/\.([a-zA-Z0-9]{1,5})$/)?.[1] || '').toLowerCase();
    const extFromType = contentType === 'image/png' ? 'png' : contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/webp' ? 'webp' : '';
    const ext = extFromName || extFromType || 'bin';

    const s3 = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
      forcePathStyle: true,
    });

    const key = contentHash
      ? `clips-thumbnails/sha256/${contentHash}.${ext}`
      : `clips-thumbnails/${page.companyId}/${Date.now()}-${base}`;

    // If exists, reuse
    try {
      await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
      const publicUrl = R2_PUBLIC_BASE_URL.endsWith('/') ? `${R2_PUBLIC_BASE_URL}${key}` : `${R2_PUBLIC_BASE_URL}/${key}`;
      return NextResponse.json({ uploadUrl: null, publicUrl, key, existing: true });
    } catch {}

    const put = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(s3, put, { expiresIn: 60 * 5 });

    const publicUrl = R2_PUBLIC_BASE_URL.endsWith('/') ? `${R2_PUBLIC_BASE_URL}${key}` : `${R2_PUBLIC_BASE_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key, existing: false });
  } catch (e: any) {
    console.error('R2 presign error (clips-thumbnail):', e);
    const msg = process.env.NODE_ENV !== 'production' ? (e?.message || 'Unknown error') : 'Kon upload-URL niet genereren';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
