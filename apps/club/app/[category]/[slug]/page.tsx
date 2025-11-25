import { prisma } from '@levendportret/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { notFound } from 'next/navigation';
import BlockRenderer from '../../components/BlockRenderer';

const CATEGORY_LABELS: Record<string, string> = {
  nieuws: 'Nieuws',
  tips: 'Tips & Tricks',
  achtergrond: 'Achtergrond',
  interviews: 'Interviews',
};

export default async function ArtikelDetail({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id as string | undefined;
  const hasClub = userId
    ? !!(await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' as any, product: 'CLUB' as any },
      }))
    : false;

  const now = new Date();
  const decodedSlug = decodeURIComponent(params.slug);
  const decodedCategory = decodeURIComponent(params.category);

  const art = await prisma.article.findFirst({
    where: {
      slug: decodedSlug,
      category: decodedCategory,
      status: 'PUBLISHED',
      publishedAt: { lte: now },
    },
  });

  if (!art) return notFound();

  const WEB = (process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000').replace(/\/$/, '');
  const gated = art.visibility === 'MEMBERS' && !hasClub;

  // Parse blocks from body
  const blocks = Array.isArray(art.body) ? art.body : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Back button + Breadcrumb */}
      <div className="flex items-center gap-4 mb-6">
        <a href="/" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-coral transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Terug
        </a>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>/</span>
          <a href={`/?category=${art.category}`} className="hover:text-coral">
            {CATEGORY_LABELS[art.category] || art.category}
          </a>
        </div>
      </div>

      {/* Article header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
          <span className="px-3 py-1 rounded-full bg-zinc-100">
            {CATEGORY_LABELS[art.category] || art.category}
          </span>
          {art.publishedAt && (
            <span>{new Date(art.publishedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          )}
          {art.visibility === 'MEMBERS' && (
            <span className="px-2 py-0.5 rounded-full bg-coral/10 text-coral text-xs">Alleen voor leden</span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">{art.title}</h1>
        {art.excerpt && <p className="text-lg text-zinc-600">{art.excerpt}</p>}
      </div>

      {gated ? (
        <div className="p-8 rounded-2xl border border-zinc-200 bg-white text-center">
          <h2 className="text-xl font-semibold text-navy mb-3">Alleen voor leden</h2>
          <p className="text-zinc-600 mb-6">Dit artikel is exclusief voor Club leden. Log in om verder te lezen.</p>
          <a
            href={`${WEB}/inloggen`}
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-coral text-white hover:bg-[#e14c61] transition-colors"
          >
            Inloggen
          </a>
        </div>
      ) : (
        <>
          {art.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={art.thumbnailUrl}
              alt=""
              className="w-full rounded-2xl border border-zinc-200 mb-8"
            />
          )}
          <article className="prose prose-lg max-w-none">
            <BlockRenderer blocks={blocks as any} />
          </article>
        </>
      )}

      {/* Back link */}
      <div className="mt-12 pt-8 border-t border-zinc-200">
        <a href="/" className="inline-flex items-center gap-2 text-coral hover:underline">
          ← Terug naar overzicht
        </a>
      </div>
    </div>
  );
}
