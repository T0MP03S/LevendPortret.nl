"use client";

import { useEffect, useState } from "react";

type WebsiteCompany = {
  id: string;
  name: string | null;
  city: string | null;
  website: string | null;
  owner?: { id: string; status: string; email: string; name: string | null } | null;
};

type Aanvraag = {
  id: string;
  status: string;
  companyId: string;
  slug: string;
  updatedAt: string;
  lastRequestNotes?: string | null;
  company?: { id: string; name: string | null; city: string | null; website: string | null; owner?: { id: string; status: string; name: string | null; email: string | null } | null } | null;
};

export default function ClipsBeheerPage() {
  const [tab, setTab] = useState<'websites' | 'aanvragen' | 'gepubliceerd'>('websites');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [websiteCompanies, setWebsiteCompanies] = useState<WebsiteCompany[]>([]);
  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [published, setPublished] = useState<Aanvraag[]>([]);
  const [query, setQuery] = useState<string>('');
  const [clipModalOpen, setClipModalOpen] = useState(false);
  const [clipModalVisible, setClipModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<WebsiteCompany | null>(null);
  const [vimeoShort, setVimeoShort] = useState('');
  const [vimeoLong, setVimeoLong] = useState('');
  const [savingClips, setSavingClips] = useState(false);
  const [modalError, setModalError] = useState('');

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch('/api/admin/clips/overview', { cache: 'no-store' });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Kon data niet laden');
      setWebsiteCompanies(data.websiteCompanies || []);
      setAanvragen(data.aanvragen || []);
      setPublished(data.published || []);
    } catch (e: any) {
      setError(e?.message || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openClipsModal = (company: WebsiteCompany) => {
    setSelectedCompany(company);
    setVimeoShort('');
    setVimeoLong('');
    setModalError('');
    setClipModalOpen(true);
    requestAnimationFrame(() => setClipModalVisible(true));
  };

  const closeClipsModal = () => {
    setClipModalVisible(false);
    setTimeout(() => {
      setClipModalOpen(false);
      setSelectedCompany(null);
      setVimeoShort('');
      setVimeoLong('');
      setModalError('');
    }, 150);
  };

  const canSaveClips = /^\d+$/.test(vimeoShort.trim()) && /^\d+$/.test(vimeoLong.trim());

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
          <button className={`px-4 py-2 text-sm ${tab==='websites' ? 'bg-coral text-white' : 'bg-white'}`} onClick={()=>setTab('websites')}>Websites</button>
          <button className={`px-4 py-2 text-sm ${tab==='aanvragen' ? 'bg-coral text-white' : 'bg-white'}`} onClick={()=>setTab('aanvragen')}>Aanvragen</button>
          <button className={`px-4 py-2 text-sm ${tab==='gepubliceerd' ? 'bg-coral text-white' : 'bg-white'}`} onClick={()=>setTab('gepubliceerd')}>Gepubliceerd</button>
        </div>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Zoek op naam of plaats" className="border border-zinc-300 rounded-md px-3 py-2 text-sm w-64" />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {loading ? (
        <div>Laden…</div>
      ) : tab === 'websites' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {websiteCompanies.filter(c => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            return (c.name||'').toLowerCase().includes(q) || (c.city||'').toLowerCase().includes(q);
          }).map(c => (
            <div key={c.id} className="border rounded-xl bg-white p-4">
              <div className="font-semibold">{c.name || 'Onbekend bedrijf'}</div>
              <div className="text-xs text-zinc-600">{c.city || ''}</div>
              {c.website ? (
                <a href={c.website} target="_blank" rel="noreferrer" className="text-sm text-coral underline mt-2 inline-block">Website</a>
              ) : null}
              <div className="mt-2 text-xs text-zinc-600">Eigenaar: {c.owner?.name || c.owner?.email || 'Onbekend'} ({c.owner?.status || '??'})</div>
              {c.website && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-50"
                    onClick={() => openClipsModal(c)}
                  >
                    Clips openen
                  </button>
                </div>
              )}
            </div>
          ))}
          {websiteCompanies.length === 0 && (
            <div className="text-sm text-zinc-600">Geen bedrijven met externe website gevonden.</div>
          )}
        </div>
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
                <a href={`/dashboard/clips/${a.id}`} className="px-3 py-1 rounded-md border border-zinc-300 hover:bg-zinc-50">Openen</a>
              </div>
            </div>
          ))}
          {aanvragen.length === 0 && (
            <div className="text-sm text-zinc-600">Geen aanvragen zichtbaar. Alleen ACTIVE zonder externe website en status IN_REVIEW worden getoond.</div>
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
              <div className="mt-3 flex items-center gap-2">
                <a href={`/dashboard/clips/${p.id}`} className="px-3 py-1 rounded-md border border-zinc-300 hover:bg-zinc-50">Bewerken</a>
              </div>
            </div>
          ))}
          {published.length === 0 && (
            <div className="text-sm text-zinc-600">Geen gepubliceerde pagina's.</div>
          )}
        </div>
      )}

      {clipModalOpen && (
        <div
          className={`fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${clipModalVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeClipsModal}
          aria-modal="true"
          role="dialog"
        >
          <div
            className={`w-full max-w-sm bg-white rounded-xl border border-zinc-200 shadow-xl p-5 transform transition-all duration-150 ${clipModalVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Clips voor {selectedCompany?.name || 'bedrijf'} openen</h3>
            <p className="mt-2 text-sm text-zinc-600">Vul twee Vimeo IDs in (short 9x16 en lang 16x9). Deze clips verschijnen op de Clips-overzichtspagina.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-zinc-700">Short (9x16) Vimeo ID</label>
                <input
                  value={vimeoShort}
                  onChange={(e) => setVimeoShort(e.target.value)}
                  className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Bijv. 123456789"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-700">Lang (16x9) Vimeo ID</label>
                <input
                  value={vimeoLong}
                  onChange={(e) => setVimeoLong(e.target.value)}
                  className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Bijv. 987654321"
                />
              </div>
              {modalError && <div className="text-sm text-red-600">{modalError}</div>}
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-50"
                onClick={closeClipsModal}
                disabled={savingClips}
              >
                Annuleren
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-coral text-white text-sm hover:bg-[#e14c61] disabled:opacity-50"
                disabled={savingClips || !canSaveClips || !selectedCompany}
                onClick={async () => {
                  if (!selectedCompany) return;
                  setSavingClips(true);
                  setModalError('');
                  try {
                    const res = await fetch(`/api/admin/clips/company/${selectedCompany.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ vimeoIds: [vimeoShort.trim(), vimeoLong.trim()] }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      throw new Error(data?.error || 'Opslaan mislukt');
                    }
                    closeClipsModal();
                  } catch (e: any) {
                    setModalError(e?.message || 'Opslaan mislukt');
                  } finally {
                    setSavingClips(false);
                  }
                }}
              >
                Clips opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
