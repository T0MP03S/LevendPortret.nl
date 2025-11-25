import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const runtime = 'nodejs';

const R2_ENDPOINT = process.env.R2_ENDPOINT as string;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID as string;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY as string;
const R2_BUCKET = process.env.R2_BUCKET as string;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL as string;

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE_URL) {
    return NextResponse.json({ error: 'R2 niet geconfigureerd. Zet R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET en R2_PUBLIC_BASE_URL in .env.local' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const { filename, contentType } = body;

  if (!filename || !contentType) {
    return NextResponse.json({ error: 'filename en contentType zijn verplicht' }, { status: 400 });
  }

  if (!contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'Alleen afbeeldingen toegestaan' }, { status: 400 });
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const extFromName = (filename.match(/\.([a-zA-Z0-9]{1,5})$/)?.[1] || '').toLowerCase();
  const extFromType = contentType === 'image/png' ? 'png' : contentType === 'image/jpeg' ? 'jpg' : contentType === 'image/webp' ? 'webp' : '';
  const ext = extFromName || extFromType || 'jpg';
  const key = `articles/${timestamp}-${randomId}.${ext}`;

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
      forcePathStyle: true,
    });

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
    const publicUrl = R2_PUBLIC_BASE_URL.endsWith('/') ? `${R2_PUBLIC_BASE_URL}${key}` : `${R2_PUBLIC_BASE_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (error: any) {
    console.error('R2 presign error:', error);
    return NextResponse.json({ error: 'Kon upload URL niet genereren' }, { status: 500 });
  }
}
