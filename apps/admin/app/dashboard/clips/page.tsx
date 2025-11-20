"use client";

import { useEffect, useState } from "react";

type Aanvraag = {
  id: string;
  status: string;
  companyId: string;
  slug: string;
  updatedAt: string;
  lastRequestNotes?: string | null;
  isCompany?: boolean;
  company?: { id: string; name: string | null; city: string | null; website: string | null | boolean; owner?: { id: string; status: string; name: string | null; email: string | null } | null } | null;
};

export default function ClipsBeheerPage() {
  const [tab, setTab] = useState<'aanvragen' | 'updates' | 'gepubliceerd'>('aanvragen');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [updates, setUpdates] = useState<Aanvraag[]>([]);
  const [published, setPublished] = useState<Aanvraag[]>([]);
  const [query, setQuery] = useState<string>('');
  

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch('/api/admin/clips/overview', { cache: 'no-store' });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Kon data niet laden');
      setAanvragen(data.aanvragen || []);
      setUpdates(data.updates || []);
      setPublished(data.published || []);
    } catch (e: any) {
      setError(e?.message || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <div className="text-xs text-zinc-500">Dashboard &gt; Clipsbeheer</div>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Clipsbeheer</h1>
          <a
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Terug naar dashboard
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-lg border border-zinc-200 overflow-hidden">
          <button className={`px-4 py-2 text-sm ${tab==='aanvragen' ? 'bg-coral text-white' : 'bg-white'}`} onClick={()=>setTab('aanvragen')}>Aanvragen</button>
          <button className={`px-4 py-2 text-sm ${tab==='updates' ? 'bg-coral text-white' : 'bg-white'}`} onClick={()=>setTab('updates')}>Updates</button>
          <button className={`px-4 py-2 text-sm ${tab==='gepubliceerd' ? 'bg-coral text-white' : 'bg-white'}`} onClick={()=>setTab('gepubliceerd')}>Gepubliceerd</button>
        </div>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Zoek op naam of plaats" className="border border-zinc-300 rounded-md px-3 py-2 text-sm w-64" />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {loading ? (
        <div>Laden…</div>
      ) : tab === 'aanvragen' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aanvragen.filter(a => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            return (a.company?.name||'').toLowerCase().includes(q) || (a.company?.city||'').toLowerCase().includes(q);
          }).map(a => (
            <div key={a.id} className="border rounded-xl bg-white p-4">
              <div className="font-semibold">{a.company?.name || 'Onbekend bedrijf'}</div>
              <div className="text-xs text-zinc-600">{a.company?.city || ''}</div>
              <div className="mt-2 text-sm">Slug: <span className="font-mono">{a.slug}</span></div>
              <div className="mt-1 text-sm">Status: {a.status}</div>
              {a.lastRequestNotes && (
                <div className="mt-2 text-xs text-zinc-700 line-clamp-3">
                  Laatste update-aanvraag: {a.lastRequestNotes}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                {a.isCompany ? (
                  <>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Extern bedrijf</span>
                    <a href={`/dashboard/clips/company/${a.companyId}`} className="px-3 py-1 rounded-md border border-zinc-300 hover:bg-zinc-50">Clips invullen</a>
                  </>
                ) : (
                  <a href={`/dashboard/clips/${a.id}`} className="px-3 py-1 rounded-md border border-zinc-300 hover:bg-zinc-50">Openen</a>
                )}
              </div>
            </div>
          ))}
          {aanvragen.length === 0 && (
            <div className="text-sm text-zinc-600">Geen aanvragen zichtbaar. Alleen ACTIVE zonder externe website en status IN_REVIEW worden getoond.</div>
          )}
        </div>
      ) : tab === 'updates' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {updates.filter(u => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            return (u.company?.name||'').toLowerCase().includes(q) || (u.company?.city||'').toLowerCase().includes(q);
          }).map(u => (
            <div key={u.id} className="border rounded-xl bg-white p-4">
              <div className="font-semibold">{u.company?.name || 'Onbekend bedrijf'}</div>
              <div className="text-xs text-zinc-600">{u.company?.city || ''}</div>
              <div className="mt-2 text-sm">Slug: <span className="font-mono">{u.slug}</span></div>
              <div className="mt-1 text-sm">Status: {u.status}</div>
              {u.lastRequestNotes && (
                <div className="mt-2 text-xs text-zinc-700 line-clamp-3">
                  Laatste update-aanvraag: {u.lastRequestNotes}
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <a href={`/dashboard/clips/${u.id}`} className="px-3 py-1 rounded-md border border-zinc-300 hover:bg-zinc-50">Openen</a>
              </div>
            </div>
          ))}
          {updates.length === 0 && (
            <div className="text-sm text-zinc-600">Geen updates zichtbaar. Alleen PUBLISHED pagina's met ingediende updates worden getoond.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {published.filter(p => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            return (p.company?.name||'').toLowerCase().includes(q) || (p.company?.city||'').toLowerCase().includes(q);
          }).map(p => (
            <div key={p.id} className="border rounded-xl bg-white p-4">
              <div className="font-semibold">{p.company?.name || 'Onbekend bedrijf'}</div>
              <div className="text-xs text-zinc-600">{p.company?.city || ''}</div>
              <div className="mt-2 text-sm">Slug: <span className="font-mono">{p.slug}</span></div>
              <div className="mt-1 text-sm">Status: {p.status}</div>
              {(p as any).isExternal ? (
                <div className="mt-3 flex items-center gap-2">
                  {p.company?.website ? (
                    <a href={String(p.company.website)} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-md border border-zinc-300 hover:bg-zinc-50">Website openen</a>
                  ) : null}
                  <span className="text-xs text-zinc-600">Extern</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <a href={`/dashboard/clips/${p.id}`} className="px-3 py-1 rounded-md border border-zinc-300 hover:bg-zinc-50">Bewerken</a>
                </div>
              )}
            </div>
          ))}
          {published.length === 0 && (
            <div className="text-sm text-zinc-600">Geen gepubliceerde pagina's.</div>
          )}
        </div>
      )}
    </div>
  );
}
