"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  companyId: string;
  slug: string;
  status: string;
  accentColor?: string | null;
  titleFont?: string | null;
  bodyFont?: string | null;
  roundedCorners: boolean;
  showCompanyNameNextToLogo: boolean;
  showContactPage: boolean;
  gallery?: any;
  company?: { id: string; name: string | null; city: string | null } | null;
};

export default function CompanyPagesReviewPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/company-pages?status=IN_REVIEW`, { cache: "no-store" });
      if (!res.ok) throw new Error("Kon webpagina's niet laden");
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setError("");
    try {
      const res = await fetch(`/api/admin/company-pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Actie mislukt');
      setItems(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Actie mislukt');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Webpagina's in review</h1>
      {error && <div className="text-red-600">{error}</div>}
      {loading ? (
        <div>Laden…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(it => (
            <div key={it.id} className="border rounded-xl p-4 bg-white">
              <div className="font-semibold">{it.company?.name || 'Onbekend bedrijf'}</div>
              <div className="text-xs text-zinc-600">{it.company?.city || ''}</div>
              <div className="mt-2 text-sm">Slug: <span className="font-mono">{it.slug}</span></div>
              <div className="mt-2 text-sm">Status: {it.status}</div>
              <div className="mt-3 flex items-center gap-2">
                <button className="px-3 py-1 rounded-md border border-zinc-300 hover:bg-zinc-50" onClick={() => act(it.id, 'REJECT')}>Afwijzen</button>
                <button className="px-3 py-1 rounded-md bg-coral text-white" onClick={() => act(it.id, 'APPROVE')}>Goedkeuren</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-zinc-600">Geen items om te beoordelen.</div>
          )}
        </div>
      )}
    </div>
  );
}
