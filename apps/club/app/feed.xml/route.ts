import { prisma } from '@levendportret/db';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_CLUB_URL || 'https://club.levendportret.nl';
  
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      publishedAt: {
        lte: new Date(),
      },
    },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
      thumbnailUrl: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 20,
  });

  const escapeXml = (str: string) => 
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const rssItems = articles.map((article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${baseUrl}/nieuws/${article.slug}</link>
      <guid isPermaLink="true">${baseUrl}/nieuws/${article.slug}</guid>
      <pubDate>${article.publishedAt?.toUTCString() || ''}</pubDate>
      <description>${escapeXml(article.excerpt || '')}</description>
      ${article.thumbnailUrl ? `<enclosure url="${escapeXml(article.thumbnailUrl)}" type="image/jpeg" />` : ''}
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Levend Portret Club</title>
    <link>${baseUrl}</link>
    <description>Nieuws en artikelen van Levend Portret Club</description>
    <language>nl-NL</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
