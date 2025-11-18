import { prisma } from '@levendportret/db';
import { headers } from 'next/headers';
import Grid, { type Item } from './Grid';

export const dynamic = 'force-dynamic';

async function getOEmbedThumb(vimeoId: string): Promise<string | null> {
  try {
    const url = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${vimeoId}`)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof (data as any)?.thumbnail_url === 'string' ? (data as any).thumbnail_url : null;
  } catch {
    return null;
  }
}

function stripHtml(input: string): string {
  try {
    return input.replace(/<[^>]*>/g, '');
  } catch {
    return input;
  }
}

export default async function ClipsPageFund({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Number(searchParams?.page ?? '1');
  const ua = headers().get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|IEMobile|Windows Phone/i.test(ua);
  const perPage = isMobile ? 8 : 2;
  const skip = (page - 1) * perPage;

  const where: any = { status: 'PUBLISHED' };

  // Zelfde logica als web: max. 1 clip per bedrijf
  const allClips = await prisma.clip.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      company: {
        include: {
          companyPage: true,
        },
      },
    },
  });

  const byCompany: any[] = [];
  const seenCompanyIds = new Set<string>();
  for (const clip of allClips) {
    const cid = (clip as any).companyId as string | undefined;
    if (!cid || seenCompanyIds.has(cid)) continue;
    seenCompanyIds.add(cid);
    byCompany.push(clip);
  }

  const total = byCompany.length;
  const pageClips = byCompany.slice(skip, skip + perPage);

  const items: Item[] = await Promise.all(
    pageClips.map(async (c: any) => {
      const company = c.company || {};
      const shortRaw = (company.description || '') as string;
      let companyDesc = stripHtml(shortRaw).trim();
      if (!companyDesc) {
        const longRaw = (company.companyPage?.aboutLong || '') as string;
        const text = stripHtml(longRaw).trim();
        if (text) {
          companyDesc = text.length > 250 ? `${text.slice(0, 247)}…` : text;
        }
      }
      // Prefer explicit admin-provided 9:16 thumbnail; then Vimeo oEmbed; finally first gallery image
      const explicitThumb = (company.companyPage?.clipsThumbnailUrl as string) || null;
      const gallery = Array.isArray(company.companyPage?.gallery) ? (company.companyPage!.gallery as any[]) : [];
      const galleryThumb = gallery.length > 0 && typeof gallery[0]?.url === 'string' ? (gallery[0].url as string) : null;
      const vimeoThumb = await getOEmbedThumb((c as any).vimeoShortId ?? (c as any).vimeoId);

      return {
        id: c.id as string,
        vimeoId: (c as any).vimeoShortId ?? (c as any).vimeoId,
        companyName: (company.name as string) ?? 'Onbekend bedrijf',
        companyDesc,
        website: (company.website as string) || null,
        slug: ((company.companyPage?.slug as string) || (company.slug as string) || ''),
        thumb: explicitThumb || vimeoThumb || galleryThumb,
        logoUrl: (company.logoUrl as string) || null,
      } as Item;
    })
  );

  const pageCount = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Clips</h1>
      <Grid items={items} currentPage={page} pageCount={pageCount} />
    </div>
  );
}
