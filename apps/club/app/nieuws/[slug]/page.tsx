import { prisma } from '@levendportret/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { notFound } from 'next/navigation';
import BlockRenderer from '../../components/BlockRenderer';

export default async function ArtikelDetail({ params }: { params: { slug: string } }) {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id as string | undefined;
  const hasClub = userId
    ? !!(await prisma.membership.findFirst({ where: { userId, status: 'ACTIVE' as any, product: 'CLUB' as any } }))
    : false;
  const now = new Date();
  // Decode URL-encoded slug (e.g. "Nieuw%20Artikel" -> "Nieuw Artikel")
  const decodedSlug = decodeURIComponent(params.slug);
  const art = await prisma.article.findFirst({
    where: { slug: decodedSlug, status: 'PUBLISHED', publishedAt: { lte: now } },
  });
  if (!art) return notFound();

  const WEB = (process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000').replace(/\/$/, '');

  const gated = art.visibility === 'MEMBERS' && !hasClub;

  // Parse blocks from body
  const blocks = Array.isArray(art.body) ? art.body : [];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <a href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-coral transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Terug naar overzicht
      </a>
      <div className="text-zinc-500 text-sm">{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : ''} {art.visibility === 'MEMBERS' ? '· Alleen voor leden' : ''}</div>
      <h1 className="text-3xl font-bold text-navy">{art.title}</h1>
      {art.excerpt ? <p className="text-zinc-700 text-lg">{art.excerpt}</p> : null}

      {gated ? (
        <div className="p-6 rounded-xl border border-zinc-200 bg-white">
          <h2 className="text-xl font-semibold mb-2">Alleen voor leden</h2>
          <p className="text-zinc-700">Log in om dit artikel te lezen.</p>
          <a href={`${WEB}/inloggen`} className="inline-flex mt-3 px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Inloggen</a>
        </div>
      ) : (
        <>
          {art.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={art.thumbnailUrl} alt="" className="w-full rounded-xl border mb-6" />
          ) : null}
          <BlockRenderer blocks={blocks as any} />
        </>
      )}
    </div>
  );
}
