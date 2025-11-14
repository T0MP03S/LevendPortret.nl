import { prisma } from '@levendportret/db';
import { notFound } from 'next/navigation';

export default async function PublicCompanyPage({ params }: { params: { slug: string } }) {
  const page = await prisma.companyPage.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      status: true,
      longVideoVimeoId: true,
      aboutLong: true,
      gallery: true,
      accentColor: true,
      titleFont: true,
      bodyFont: true,
      roundedCorners: true,
      showCompanyNameNextToLogo: true,
      socials: true,
      company: { select: { name: true } },
    }
  });
  if (!page || page.status !== 'PUBLISHED') return notFound();

  const gallery = Array.isArray(page.gallery) ? (page.gallery as any[]) : [];
  const titleFont = page.titleFont || 'Montserrat';
  const bodyFont = page.bodyFont || 'Roboto';

  const makeGoogle = (n: string) => n.replace(/ /g, '+');
  const families = Array.from(new Set([titleFont, bodyFont])).map(f => `${makeGoogle(f)}:wght@400;700`).join('&family=');
  const href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <link rel="stylesheet" href={href} />
      <header className="space-y-3">
        <h1 className="text-3xl font-bold" style={{ fontFamily: `'${titleFont}', sans-serif` }}>{page.company?.name}</h1>
        {page.longVideoVimeoId && (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://player.vimeo.com/video/${page.longVideoVimeoId}`}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Bedrijfsvideo"
            />
          </div>
        )}
      </header>
      <section className="space-y-4">
        {page.aboutLong ? (
          <article className="prose" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
            {page.aboutLong}
          </article>
        ) : null}
        {gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((g: any, idx: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={idx} src={g.url} alt="" className={`w-full h-40 object-cover ${page.roundedCorners ? 'rounded-lg' : ''}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
