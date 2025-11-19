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
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL as string;

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE_URL) {
    return NextResponse.json({ error: 'R2 niet geconfigureerd' }, { status: 500 });
  }
  const me = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { status: true, id: true, company: { select: { id: true } } } });
  if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if ((me as any).status !== 'ACTIVE') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const companyId = me.company?.id || null;
  if (!companyId) return NextResponse.json({ error: 'Geen bedrijf gevonden' }, { status: 400 });
  const { fileName, contentType, contentHash, size } = await req.json().catch(() => ({}));
  if (!fileName || !contentType) return NextResponse.json({ error: 'fileName en contentType zijn verplicht' }, { status: 400 });
  const ALLOWED = new Set(['image/jpeg','image/png','image/webp']);
  if (!ALLOWED.has(String(contentType))) return NextResponse.json({ error: 'Alleen JPEG/PNG/WEBP zijn toegestaan' }, { status: 400 });
  const MAX_GALLERY_BYTES = 5 * 1024 * 1024; // 5MB
  if (typeof size === 'number' && size > MAX_GALLERY_BYTES) {
    return NextResponse.json({ error: 'Afbeelding is te groot (max 5MB)' }, { status: 400 });
  }
  const base = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const extFromName = (base.match(/\.([a-zA-Z0-9]{1,5})$/)?.[1] || '').toLowerCase();
  const extFromType = contentType === 'image/png' ? 'png' : contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/webp' ? 'webp' : '';
  const ext = extFromName || extFromType || 'bin';
  const s3 = new S3Client({ region: 'auto', endpoint: R2_ENDPOINT, credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }, forcePathStyle: true });
  const key = contentHash
    ? `company-pages/${companyId}/gallery/sha256/${String(contentHash).toLowerCase()}.${ext}`
    : `company-pages/${companyId}/gallery/${Date.now()}-${base}`;
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
}
