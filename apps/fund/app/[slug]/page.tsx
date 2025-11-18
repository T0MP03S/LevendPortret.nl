import { prisma } from '@levendportret/db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Slideshow from './Slideshow';
import HeaderNav from './Header';
import { Mail, Phone, Globe, Facebook, Instagram, Linkedin, Youtube, Link2, MapPin } from 'lucide-react';
import VideoEmbed from './VideoEmbed';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slugParam = params.slug;
  const page = await prisma.companyPage.findFirst({
    where: {
      OR: [
        { slug: slugParam },
        { slug: slugParam.toLowerCase() },
      ],
    },
    select: {
      status: true,
      slug: true,
      aboutLong: true,
      gallery: true,
      clipsThumbnailUrl: true,
      company: { select: { name: true } },
    },
  });
  const canonical = `https://clips.levendportret.nl/${encodeURIComponent(slugParam)}`;
  if (!page || page.status !== 'PUBLISHED') {
    return {
      title: 'Levend Portret',
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }
  const name = page.company?.name || 'Levend Portret';
  const description = String(page.aboutLong || '').replace(/\s+/g, ' ').slice(0, 160);
  const gallery = Array.isArray(page.gallery) ? (page.gallery as any[]) : [];
  const galleryFirst = gallery.length > 0 ? (gallery[0]?.url || '') : '';
  const ogImage = galleryFirst || (page.clipsThumbnailUrl || '');
  const images = ogImage ? [{ url: ogImage }] : undefined;
  return {
    title: `${name} | Levend Portret` ,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${name} | Levend Portret`,
      description,
      url: canonical,
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Levend Portret`,
      description,
      images: images as any,
    },
  };
}

export default async function PublicCompanyPage({ params }: { params: { slug: string } }) {
  const slugParam = params.slug;
  const page = await prisma.companyPage.findFirst({
    where: {
      OR: [
        { slug: slugParam },
        { slug: slugParam.toLowerCase() },
      ],
    },
    include: {
      company: { select: { name: true, logoUrl: true, address: true, houseNumber: true, zipCode: true, city: true, workPhone: true, website: true, socials: true, owner: { select: { email: true } } } },
    },
  });
  if (!page || page.status !== 'PUBLISHED') return notFound();

  const gallery = Array.isArray(page.gallery) ? (page.gallery as any[]) : [];
  const titleFont = page.titleFont || 'Montserrat';
  const bodyFont = page.bodyFont || 'Roboto';
  const fontsHref = `https://fonts.googleapis.com/css2?family=${Array.from(new Set([titleFont, bodyFont])).map(f => `${f.replace(/ /g, '+')}:wght@400;700`).join('&family=')}&display=swap`;

  const accent = page.accentColor || '#191970';
  const socialsPage = typeof page.socials === 'string' ? JSON.parse(page.socials) : (page.socials as any) || {};
  const socialsCompany = typeof (page.company as any)?.socials === 'string' ? JSON.parse((page.company as any).socials) : ((page.company as any)?.socials as any) || {};
  const socials = { ...socialsCompany, ...socialsPage } as any;
  const name = page.company?.name || '';
  const logoUrl = page.company?.logoUrl || '';
  const address = [page.company?.address, page.company?.houseNumber].filter(Boolean).join(' ');
  const cityline = [page.company?.zipCode, page.company?.city].filter(Boolean).join(' ');
  const fullAddress = [address, cityline].filter(Boolean).join(', ');
  const phone = page.company?.workPhone || '';
  const email = ((page as any).company?.workEmail) || page.company?.owner?.email || '';
  const roundedCls = page.roundedCorners ? 'rounded-xl' : '';

  // Minimal, safe markdown: escape HTML, support **bold**, keep paragraphs and line breaks
  const escapeHtml = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const mdInline = (s: string) => {
    // bold **text** and __text__
    return s
      .replace(/\*\*(.+?)\*\*/g, (_m, p1) => `<strong>${p1}</strong>`)
      .replace(/__(.+?)__/g, (_m, p1) => `<strong>${p1}</strong>`);
  };
  const mdToHtml = (input: string) => {
    const safe = escapeHtml(input || '');
    const paragraphs = safe.split(/\n\s*\n/);
    return paragraphs
      .map(p => `<p>${mdInline(p).replace(/\n/g, '<br/>')}</p>`) // keep single line breaks
      .join('');
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
      <link rel="stylesheet" href={fontsHref} />
      <HeaderNav
        name={name}
        logoUrl={logoUrl}
        accent={accent}
        rounded={!!page.roundedCorners}
        titleFont={titleFont}
        hasGallery={gallery.length > 0}
        showContact={!!page.showContactPage}
        showNameNextToLogo={!!page.showCompanyNameNextToLogo}
      />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* Lange video */}
        {page.longVideoVimeoId ? (
          <section id="video" className="space-y-3">
            <h2 className="text-xl font-semibold" style={{ fontFamily: `'${titleFont}', sans-serif` }}>Video</h2>
            <VideoEmbed vimeoId={page.longVideoVimeoId} roundedCls={roundedCls} title="Bedrijfsvideo" />
          </section>
        ) : null}

        {/* Over ons */}
        {page.aboutLong ? (
          <section id="over-ons" className="space-y-3 border-t border-zinc-200 pt-8">
            <h2 className="text-xl font-semibold" style={{ fontFamily: `'${titleFont}', sans-serif` }}>Over ons</h2>
            <div className="prose max-w-none text-base leading-relaxed" style={{ fontFamily: `'${bodyFont}', sans-serif` }} dangerouslySetInnerHTML={{ __html: mdToHtml(page.aboutLong || '') }} />
          </section>
        ) : null}

        {/* Slideshow met accentkleur achtergrond */}
        {gallery.length > 0 ? (
          <section id="fotos" className="px-0 py-6 border-t border-zinc-200">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-black" style={{ fontFamily: `'${titleFont}', sans-serif` }}>Foto's</h2>
              <Slideshow images={gallery as any} rounded={!!page.roundedCorners} />
            </div>
          </section>
        ) : null}

        {/* Contact (optioneel) */}
        {page.showContactPage ? (
          <section id="contact" className="space-y-4 border-t border-zinc-200 pt-8">
            <h2 className="text-xl font-semibold" style={{ fontFamily: `'${titleFont}', sans-serif` }}>Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-3" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
                {fullAddress ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: accent }} />
                    <span>{fullAddress}</span>
                  </div>
                ) : null}
                {phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" style={{ color: accent }} />
                    <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                  </div>
                ) : null}
                {email ? (
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" style={{ color: accent }} />
                    <a href={`mailto:${email}`} className="hover:underline">{email}</a>
                  </div>
                ) : null}
                {page.company?.website ? (
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" style={{ color: accent }} />
                    <a href={page.company.website} target="_blank" rel="noreferrer" className="hover:underline">{page.company.website}</a>
                  </div>
                ) : null}
                {/* Socials */}
                <ul className="mt-2 space-y-2">
                  {socials.facebook ? (
                    <li>
                      <a href={socials.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                        <Facebook className="w-5 h-5" style={{ color: accent }} />
                        <span>Facebook</span>
                      </a>
                    </li>
                  ) : null}
                  {socials.instagram ? (
                    <li>
                      <a href={socials.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                        <Instagram className="w-5 h-5" style={{ color: accent }} />
                        <span>Instagram</span>
                      </a>
                    </li>
                  ) : null}
                  {socials.linkedin ? (
                    <li>
                      <a href={socials.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                        <Linkedin className="w-5 h-5" style={{ color: accent }} />
                        <span>LinkedIn</span>
                      </a>
                    </li>
                  ) : null}
                  {socials.youtube ? (
                    <li>
                      <a href={socials.youtube} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                        <Youtube className="w-5 h-5" style={{ color: accent }} />
                        <span>YouTube</span>
                      </a>
                    </li>
                  ) : null}
                  {socials.tiktok ? (
                    <li>
                      <a href={socials.tiktok} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                        <Link2 className="w-5 h-5" style={{ color: accent }} />
                        <span>TikTok</span>
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
              <div className={`w-full aspect-[4/3] border border-zinc-200 ${roundedCls} overflow-hidden`}>
                {fullAddress ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                    title="Kaart"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-zinc-500">Geen adres opgegeven</div>
                )}
              </div>
            </div>
          </section>
        ) : null}

      </main>

      {/* Lokale footer voor klantpagina */}
      <footer className="mt-10 border-t border-zinc-200 py-6">
        <div className="max-w-5xl mx-auto px-6 text-sm text-zinc-600">
          Een productie van <a href="https://levendportret.nl" className="underline">LevendPortret.nl</a>
        </div>
      </footer>
    </div>
  );
}
