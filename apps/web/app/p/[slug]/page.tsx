import { redirect } from 'next/navigation';

export default function PublicCompanyRedirect({ params }: { params: { slug: string } }) {
  const base = (process.env.NEXT_PUBLIC_CLIPS_URL || 'http://localhost:3002').replace(/\/$/, '');
  redirect(`${base}/${params.slug}`);
}
