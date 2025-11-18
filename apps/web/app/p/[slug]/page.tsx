import { redirect } from 'next/navigation';

export default function PublicCompanyRedirect({ params }: { params: { slug: string } }) {
  const base = process.env.APP_URL_FUND || 'http://localhost:3002';
  redirect(`${base}/${params.slug}`);
}
