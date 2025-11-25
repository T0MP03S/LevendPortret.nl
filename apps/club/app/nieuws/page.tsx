import { prisma } from '@levendportret/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import Link from 'next/link';

export default async function NieuwsIndex() {
  const session = (await getServerSession(authOptions as any)) as any;
  const userId = session?.user?.id as string | undefined;
  const hasClub = userId
    ? !!(await prisma.membership.findFirst({ where: { userId, status: 'ACTIVE' as any, product: 'CLUB' as any } }))
    : false;
  const now = new Date();
  const items = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED' as any,
      publishedAt: { lte: now },
      OR: hasClub ? [ { visibility: 'PUBLIC' as any }, { visibility: 'MEMBERS' as any } ] : [ { visibility: 'PUBLIC' as any } ]
    },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, slug: true, title: true, excerpt: true, thumbnailUrl: true, visibility: true, publishedAt: true },
    take: 24,
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy">Nieuws & Artikelen</h1>
        <p className="text-zinc-600">Laatste updates en verhalen van Levend Portret</p>
      </div>

      {items.length === 0 ? (
        <div className="text-zinc-600">Nog geen artikelen.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <li key={it.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
              <Link href={`/nieuws/${it.slug}`} className="block hover:bg-zinc-50">
                <div className="p-4 space-y-2">
                  <div className="text-xs text-zinc-500">{it.publishedAt ? new Date(it.publishedAt).toLocaleDateString() : ''} {it.visibility === 'MEMBERS' ? '· Member' : ''}</div>
                  <h3 className="text-lg font-semibold text-navy">{it.title}</h3>
                  {it.excerpt ? <p className="text-zinc-700 text-sm line-clamp-3">{it.excerpt}</p> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
