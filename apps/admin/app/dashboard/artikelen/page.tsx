"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Eye, Lock, ArrowLeft } from "lucide-react";

type Item = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  visibility: "PUBLIC" | "MEMBERS";
  publishedAt: string | null;
  updatedAt: string;
};

export default function ArtikelenPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [visibility, setVisibility] = useState<string>("");

  const [page, setPage] = useState(1);
  const [take, setTake] = useState(20);
  const [total, setTotal] = useState(0);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / take)), [total, take]);

  const load = async (opts?: { resetPage?: boolean }) => {
    setLoading(true); setError("");
    try {
      const p = opts?.resetPage ? 1 : page;
      const params = new URLSearchParams({ page: String(p), take: String(take) });
      if (q.trim()) params.set("q", q.trim());
      if (status) params.set("status", status);
      if (visibility) params.set("visibility", visibility);
      const res = await fetch(`/api/admin/articles?${params.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || "Kon artikelen niet laden");
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
      setPage(Number(data.page || 1));
      setTake(Number(data.take || 20));
    } catch (e:any) {
      setError(e?.message || "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = async () => { await load({ resetPage: true }); };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <a href="/dashboard" className="flex items-center gap-1 hover:text-coral"><ArrowLeft className="w-3 h-3" /> Dashboard</a>
          <span>&gt;</span>
          <span>Artikelen</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 md:w-6 md:h-6"/> Artikelen</h1>
          <Link href="/dashboard/artikel/nieuw" className="inline-flex items-center gap-1 md:gap-2 rounded-md bg-coral text-white px-2 md:px-3 py-1.5 md:py-2 text-sm hover:bg-[#e14c61]"><Plus className="w-4 h-4"/><span className="hidden sm:inline">Nieuw artikel</span><span className="sm:hidden">Nieuw</span></Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ onFilter(); } }} placeholder="Zoek titel/slug" className="pl-8 pr-3 py-2 border border-zinc-300 rounded-md text-sm w-full sm:w-48 md:w-64" />
        </div>
        <div className="flex gap-2">
          <select value={status} onChange={e=>setStatus(e.target.value)} className="border border-zinc-300 rounded-md px-2 md:px-3 py-2 text-sm flex-1 sm:flex-none">
            <option value="">Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
          <select value={visibility} onChange={e=>setVisibility(e.target.value)} className="border border-zinc-300 rounded-md px-2 md:px-3 py-2 text-sm flex-1 sm:flex-none">
            <option value="">Zichtbaar</option>
            <option value="PUBLIC">Public</option>
            <option value="MEMBERS">Members</option>
          </select>
          <button onClick={onFilter} className="px-3 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50 text-sm">Filter</button>
        </div>
      </div>

      {error ? <div className="text-red-600">{error}</div> : null}
      {loading ? (
        <div>Laden…</div>
      ) : items.length === 0 ? (
        <div className="text-zinc-600">Geen artikelen gevonden.</div>
      ) : (
        <ul className="divide-y divide-zinc-200 bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {items.map((it)=> (
            <li key={it.id} className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate text-sm md:text-base">{it.title}</div>
                <div className="text-xs text-zinc-600 truncate">/{it.slug}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1 md:gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full border ${it.status==='PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : it.status==='SCHEDULED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>{it.status}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${it.visibility==='PUBLIC' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{it.visibility==='PUBLIC'? <Eye className="w-3 h-3"/> : <Lock className="w-3 h-3"/>}<span className="hidden sm:inline">{it.visibility}</span></span>
                  {it.publishedAt ? <span className="text-zinc-500 hidden md:inline">Geplaatst {new Date(it.publishedAt).toLocaleString()}</span> : null}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <Link href={`/dashboard/artikel/${it.id}`} className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-sm w-full sm:w-auto text-center">Bewerken</Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-sm text-zinc-600">Totaal: {total}</div>
        <div className="flex items-center gap-2">
          <button disabled={page<=1} onClick={()=>{ setPage(p=>Math.max(1,p-1)); setTimeout(()=>load(),0); }} className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-sm disabled:opacity-50">Vorige</button>
          <span className="text-sm">{page} / {pages}</span>
          <button disabled={page>=pages} onClick={()=>{ setPage(p=>Math.min(pages,p+1)); setTimeout(()=>load(),0); }} className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-sm disabled:opacity-50">Volgende</button>
        </div>
      </div>
    </div>
  );
}
