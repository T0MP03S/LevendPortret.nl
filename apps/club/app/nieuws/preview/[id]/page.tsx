import { prisma } from '@levendportret/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import { notFound, redirect } from 'next/navigation';
import BlockRenderer from '../../../components/BlockRenderer';
import Link from 'next/link';

export default async function ArtikelPreview({ params }: { params: { id: string } }) {
  // Only admins can view draft previews
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';
  
  if (!isAdmin) {
    redirect('/');
  }

  const art = await prisma.article.findUnique({
    where: { id: params.id },
  });
  
  if (!art) return notFound();

  // Parse blocks from body
  const blocks = Array.isArray(art.body) ? art.body : [];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 text-center py-2 px-4 text-sm font-medium">
        <span>🔍 Preview modus — </span>
        <span className="opacity-75">Dit artikel is nog niet gepubliceerd</span>
        <Link href="/" className="ml-4 underline hover:no-underline">
          Sluiten
        </Link>
      </div>
      
      <div className="pt-10">
        {/* Back button */}
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-coral transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Terug naar overzicht
        </a>
        
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            art.status === 'DRAFT' ? 'bg-zinc-200 text-zinc-700' :
            art.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}>
            {art.status}
          </span>
          {art.visibility === 'MEMBERS' && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
              Alleen leden
            </span>
          )}
          {art.publishedAt && (
            <span className="text-zinc-500">
              {art.status === 'SCHEDULED' ? 'Gepland voor ' : ''}
              {new Date(art.publishedAt).toLocaleDateString('nl-NL', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-navy mt-4">{art.title}</h1>
        {art.excerpt ? <p className="text-zinc-700 text-lg mt-2">{art.excerpt}</p> : null}

        {art.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art.thumbnailUrl} alt="" className="w-full rounded-xl border my-6" />
        ) : null}
        
        <BlockRenderer blocks={blocks as any} />
      </div>
    </div>
  );
}
