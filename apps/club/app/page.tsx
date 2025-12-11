import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { prisma } from '@levendportret/db';
import ArticleList from './components/ArticleList';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const WEB = (process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000').replace(/\/$/, '');

  // Auto-publish any scheduled articles whose time has passed
  const now = new Date();
  await prisma.article.updateMany({
    where: {
      status: 'SCHEDULED',
      publishedAt: { lte: now },
    },
    data: {
      status: 'PUBLISHED',
    },
  });

  // Fetch published articles with category
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { lte: now },
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
    },
  });

  // Filter members-only articles if not logged in
  const userId = (session?.user as any)?.id as string | undefined;
  const hasClub = userId
    ? !!(await prisma.membership.findFirst({ where: { userId, status: 'ACTIVE' as any, product: 'CLUB' as any } }))
    : false;

  const visibleArticles = articles.filter(
    (a) => a.visibility === 'PUBLIC' || hasClub
  );

  // Get unique categories (only those with articles)
  const categoriesWithArticles = visibleArticles
    .map((a) => a.category)
    .filter((c): c is NonNullable<typeof c> => c !== null);
  const uniqueCategories = Array.from(
    new Map(categoriesWithArticles.map((c) => [c.slug, c])).values()
  );

  // Helper to extract text from body blocks for auto-excerpt
  const extractExcerpt = (body: any): string | null => {
    if (!body || !Array.isArray(body)) return null;
    
    // Find first text block
    for (const block of body) {
      if (block.type === 'text' && block.data?.content) {
        // Extract plain text from Tiptap JSON
        const extractText = (node: any): string => {
          if (typeof node === 'string') return node;
          if (node.text) return node.text;
          if (node.content && Array.isArray(node.content)) {
            return node.content.map(extractText).join('');
          }
          return '';
        };
        const text = extractText(block.data.content).trim();
        if (text) {
          // Limit to ~150 chars
          return text.length > 150 ? text.slice(0, 150).trim() + '...' : text;
        }
      }
    }
    return null;
  };

  // Map articles to include category slug
  const mappedArticles = visibleArticles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || extractExcerpt(a.body),
    thumbnailUrl: a.thumbnailUrl,
    category: a.category?.slug || 'nieuws',
    categoryName: a.category?.name || 'Nieuws',
    publishedAt: a.publishedAt?.toISOString() || null,
  }));

  if (!session) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl text-navy font-heading mb-3">Levend Portret Club</h1>
          <p className="text-gray-700 font-body">Nieuws, tips & tricks en achtergrondverhalen voor ondernemers.</p>
        </div>

        <div className="mb-8 p-4 bg-gradient-to-r from-navy/5 to-coral/5 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-700 text-sm sm:text-base">Log in of meld je aan om de clubartikelen te bekijken.</p>
          <div className="flex gap-2">
            <a href={`${WEB}/inloggen`} className="inline-flex items-center px-4 py-2 rounded-lg border border-coral text-coral hover:bg-coral/10 whitespace-nowrap font-medium">Inloggen</a>
            <a href={`${WEB}/aanmelden`} className="inline-flex items-center px-4 py-2 rounded-lg bg-coral text-white hover:bg-[#e14c61] whitespace-nowrap font-medium">Aanmelden</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl text-navy font-heading mb-3">Levend Portret Club</h1>
        <p className="text-gray-700 font-body">Nieuws, tips & tricks en achtergrondverhalen voor ondernemers.</p>
      </div>

      {mappedArticles.length > 0 ? (
        <ArticleList
          articles={mappedArticles}
          categories={uniqueCategories}
        />
      ) : (
        <p className="text-center text-zinc-500 py-12">Nog geen artikelen gepubliceerd.</p>
      )}
    </main>
  );
}
