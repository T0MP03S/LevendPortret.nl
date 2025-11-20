"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyClipsEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [ok, setOk] = useState<string>("");
  const [v1, setV1] = useState<string>("");
  const [v2, setV2] = useState<string>("");

  const load = async () => {
    setLoading(true); setError(""); setOk("");
    try {
      const res = await fetch(`/api/admin/clips/company/${params.id}`, { cache: 'no-store' });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Kon clips niet laden');
      const clips = Array.isArray(data?.clips) ? data.clips : [];
      setV1(clips[0]?.vimeoShortId || "");
      setV2(clips[1]?.vimeoShortId || "");
    } catch (e:any) {
      setError(e?.message || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params.id]);

  const save = async () => {
    setError(""); setOk(""); setLoading(true);
    try {
      const ids = [v1.trim(), v2.trim()].filter(x => /^\d+$/.test(x));
      const res = await fetch(`/api/admin/clips/company/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vimeoIds: ids }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt');
      setOk('Opgeslagen');
    } catch (e:any) {
      setError(e?.message || 'Opslaan mislukt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-xs text-zinc-500">Dashboard &gt; Clipsbeheer &gt; Extern bedrijf</div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Clips invullen</h1>
        <a href="/dashboard/clips" className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Terug</a>
      </div>

      {error ? <div className="text-red-600">{error}</div> : null}
      {ok ? <div className="text-emerald-700">{ok}</div> : null}

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <p className="text-sm text-zinc-700">Vul de Vimeo IDs in voor de korte (9x16) en lange (16x9) clip.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-zinc-700">Short (9x16)</label>
            <input value={v1} onChange={e=>setV1(e.target.value)} placeholder="Vimeo ID (short)" className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-zinc-700">Lang (16x9)</label>
            <input value={v2} onChange={e=>setV2(e.target.value)} placeholder="Vimeo ID (lang)" className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" />
          </div>
        </div>
        <div className="text-xs text-zinc-600">Je moet 2 geldige Vimeo IDs invullen om te publiceren.</div>
        <div className="flex items-center gap-2 pt-2">
          <button onClick={save} disabled={loading} className="px-4 py-2 rounded-md bg-coral text-white disabled:opacity-50">Opslaan</button>
          <button onClick={()=>router.push('/dashboard/clips')} className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Terug</button>
        </div>
      </div>
    </div>
  );
}
