import { MetadataRoute } from 'next';
import { prisma } from '@levendportret/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_CLUB_URL || 'https://club.levendportret.nl';
  
  // Get all published public articles
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
      updatedAt: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
  });

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/nieuws/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    ...articleUrls,
  ];
}
