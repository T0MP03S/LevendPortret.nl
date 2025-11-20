import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_CLIPS_URL || 'http://localhost:3002').replace(/\/$/, '');
  const host = (() => { try { return new URL(base).host; } catch { return 'localhost:3002'; } })();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${base}/sitemap.xml`,
    host,
  };
}
