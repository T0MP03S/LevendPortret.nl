import type { MetadataRoute } from 'next';
import { prisma } from '@levendportret/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://clips.levendportret.nl';
  const items: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'daily', priority: 0.6 },
  ];
  try {
    const pages = await prisma.companyPage.findMany({
      where: { status: 'PUBLISHED' as any },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
    for (const p of pages) {
      if (!p.slug) continue;
      items.push({
        url: `${base}/${encodeURIComponent(p.slug)}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch {
    // ignore errors in dev
  }
  return items;
}
