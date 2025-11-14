"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  company?: { id: string; name: string | null; city: string | null } | null;
  memberships?: { product: string; status: string; startDate: string; endDate: string | null }[];
};

export default function GebruikersPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'PENDING_VERIFICATION'>('ACTIVE');
  const [productFilter, setProductFilter] = useState<'ALL' | 'PAID' | 'FUND'>('ALL');

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ status: statusFilter });
      if (productFilter !== 'ALL') qs.set('product', productFilter);
      const res = await fetch(`/api/admin/users?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Kon gebruikers niet laden");
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, productFilter]);

  const changeStatus = async (id: string, action: 'APPROVE' | 'REJECT' | 'SET_PENDING') => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Status wijzigen mislukt");
      setItems((prev) => prev.map((u) => (u.id === id ? { ...u, status: data.status || u.status } : u)));
    } catch (e) {
      // noop: eenvoudige UI, foutmelding in header
      setError((e as any)?.message || "Status wijzigen mislukt");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs text-zinc-500">Dashboard &gt; Gebruikers</div>
        <h1 className="text-3xl md:text-4xl font-bold">Gebruikers</h1>
        <p className="mt-2 text-zinc-600">Beheer gebruikers. Filter op status en product.</p>
        <div className="mt-3 flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Terug naar dashboard</Link>
          {/* Afgekeurd aparte pagina verwijderd; filter hierboven gebruiken */}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-700">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-2 py-1.5 rounded-md border border-zinc-300 text-sm">
              <option value="ALL">Alle</option>
              <option value="ACTIVE">Actief</option>
              <option value="PENDING_APPROVAL">In behandeling</option>
              <option value="REJECTED">Afgekeurd</option>
              <option value="PENDING_VERIFICATION">Verificatie</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-700">Product</label>
            <select value={productFilter} onChange={(e) => setProductFilter(e.target.value as any)} className="px-2 py-1.5 rounded-md border border-zinc-300 text-sm">
              <option value="ALL">Alle</option>
              <option value="PAID">CLUB/COACH</option>
              <option value="FUND">FUND</option>
            </select>
          </div>
          <button onClick={load} className="text-sm underline">Verversen</button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <span className="text-sm text-zinc-700">Totaal: {items.length}</span>
          <span className="text-xs text-zinc-500">Gefilterd: {statusFilter === 'ALL' ? 'Alle' : statusFilter === 'ACTIVE' ? 'Actief' : statusFilter === 'PENDING_APPROVAL' ? 'In behandeling' : statusFilter === 'REJECTED' ? 'Afgekeurd' : 'Verificatie'}{productFilter !== 'ALL' ? ` · ${productFilter === 'PAID' ? 'CLUB/COACH' : 'FUND'}` : ''}</span>
        </div>
        {loading ? (
          <div className="p-6 text-zinc-600">Laden…</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-zinc-600">Geen gebruikers gevonden.</div>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {items.map((it) => (
              <li key={it.id} className="p-4 flex items-center gap-4 justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.name || it.email}</div>
                  <div className="text-sm text-zinc-600 truncate">{it.company?.name || "Zonder bedrijfsnaam"} {it.company?.city ? `— ${it.company.city}` : ""}</div>
                  {it.memberships && it.memberships.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {it.memberships.map((m, idx) => (
                        <span key={idx} className={`text-[11px] px-1.5 py-0.5 rounded-full ${m.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'}`}>{m.product}:{m.status}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700">{it.status}</span>
                  {it.status !== 'ACTIVE' && (
                    <button onClick={() => changeStatus(it.id, 'APPROVE')} className="px-2 py-1.5 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs">Goedkeuren</button>
                  )}
                  {it.status !== 'REJECTED' && (
                    <button onClick={() => changeStatus(it.id, 'REJECT')} className="px-2 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 text-xs">Afkeuren</button>
                  )}
                  {it.status !== 'PENDING_APPROVAL' && (
                    <button onClick={() => changeStatus(it.id, 'SET_PENDING')} className="px-2 py-1.5 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs">Op in behandeling</button>
                  )}
                  <Link href={`/dashboard/gebruiker/${it.id}`} className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-sm">Bewerken</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
