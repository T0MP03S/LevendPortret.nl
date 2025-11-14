import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ClipsPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = (searchParams?.page || '').trim();
  const targetBase = 'http://localhost:3002';
  const target = page && page !== '1'
    ? `${targetBase}/?page=${encodeURIComponent(page)}`
    : `${targetBase}/`;

  redirect(target);
}
