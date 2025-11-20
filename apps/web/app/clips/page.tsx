import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ClipsPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = (searchParams?.page || '').trim();
  const targetBase = (process.env.NEXT_PUBLIC_CLIPS_URL || 'http://localhost:3002').replace(/\/$/, '');
  const target = page && page !== '1'
    ? `${targetBase}/?page=${encodeURIComponent(page)}`
    : `${targetBase}/`;

  redirect(target);
}
