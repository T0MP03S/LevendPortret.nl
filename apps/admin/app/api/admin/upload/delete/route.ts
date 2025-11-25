import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is verplicht' }, { status: 400 });
    }

    // Extract the key from the URL
    // URL format: https://pub-xxx.r2.dev/uploads/filename.jpg or similar
    const publicUrl = process.env.R2_PUBLIC_URL || '';
    const bucketName = process.env.R2_BUCKET_NAME;
    
    if (!bucketName) {
      console.error('R2_BUCKET_NAME is not configured');
      return NextResponse.json({ error: 'Storage niet geconfigureerd' }, { status: 500 });
    }
    
    if (!publicUrl || !url.startsWith(publicUrl)) {
      // If URL doesn't match our R2 URL, just return success (nothing to delete)
      return NextResponse.json({ ok: true });
    }

    const key = url.replace(publicUrl + '/', '').replace(publicUrl, '');
    if (!key || key.includes('..')) {
      return NextResponse.json({ error: 'Ongeldige key' }, { status: 400 });
    }

    await s3.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 });
  }
}
