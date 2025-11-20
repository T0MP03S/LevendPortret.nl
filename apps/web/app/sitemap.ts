import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/aanmelden`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/even-voorstellen`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/coach`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/voorwaarden`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];
}
