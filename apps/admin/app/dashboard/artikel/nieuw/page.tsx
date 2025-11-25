"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function NieuwArtikelPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">("DRAFT");
  const [visibility, setVisibility] = useState<"PUBLIC" | "MEMBERS">("PUBLIC");
  const [publishedAt, setPublishedAt] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    try {
      setSaving(true); setError("");
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, excerpt, status, visibility, publishedAt: publishedAt || undefined }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || "Opslaan mislukt");
      router.push(`/dashboard/artikel/${data.id}`);
    } catch (e:any) {
      setError(e?.message || "Opslaan mislukt");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <a href="/dashboard" className="flex items-center gap-1 hover:text-coral"><ArrowLeft className="w-3 h-3" /> Dashboard</a>
        <span>&gt;</span>
        <a href="/dashboard/artikelen" className="hover:text-coral">Artikelen</a>
        <span>&gt;</span>
        <span>Nieuw</span>
      </div>
      <h1 className="text-2xl font-bold">Nieuw artikel</h1>

      {error ? <div className="text-red-600">{error}</div> : null}

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-zinc-700">Titel</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" placeholder="Titel"/>
        </div>
        <div>
          <label className="block text-sm text-zinc-700">Slug (optioneel)</label>
          <input value={slug} onChange={e => {
              const val = e.target.value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-');
              setSlug(val);
            }} className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2" placeholder="voorbeeld-artikel"/>
        </div>
        <div>
          <label className="block text-sm text-zinc-700">Excerpt / korte intro</label>
          <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} rows={3} className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-zinc-700">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value as any)} className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-700">Zichtbaarheid</label>
            <select value={visibility} onChange={e=>setVisibility(e.target.value as any)} className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2">
              <option value="PUBLIC">Public</option>
              <option value="MEMBERS">Members</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-700">Publicatiedatum (optioneel)</label>
            <input type="datetime-local" value={publishedAt} onChange={e=>setPublishedAt(e.target.value)} className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2"/>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={save} disabled={saving || !title.trim()} className="px-4 py-2 rounded-md bg-coral text-white disabled:opacity-50">Opslaan</button>
        <a href="/dashboard/artikelen" className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Annuleren</a>
      </div>
    </div>
  );
}
