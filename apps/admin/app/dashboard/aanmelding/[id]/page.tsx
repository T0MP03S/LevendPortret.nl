"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AanmeldingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Kon details niet laden");
        const data = await res.json();
        setItem(data.item);
      } catch (e: any) {
        setError(e?.message || "Er ging iets mis");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <div className="p-6 text-zinc-600">Laden…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item) return <div className="p-6 text-zinc-600">Niet gevonden.</div>;

  const u = item;
  const c = item.company || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Aanmelding</h1>
        <p className="mt-2 text-zinc-600">Bekijk de gegevens en keur goed of wijs af.</p>
        <div className="mt-3 flex items-center gap-3">
          <a href="/dashboard/in-behandeling" className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-sm">Terug naar overzicht</a>
          <button
            onClick={async () => {
              try {
                const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'REJECT' }) });
                if (res.ok) router.push('/dashboard/in-behandeling');
              } catch {}
            }}
            className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-sm"
          >
            Afwijzen
          </button>
          <button
            onClick={async () => {
              try {
                const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'APPROVE' }) });
                if (res.ok) router.push('/dashboard/in-behandeling');
              } catch {}
            }}
            className="px-3 py-1.5 rounded-md bg-coral text-white hover:bg-[#e14c61] text-sm"
          >
            Goedkeuren
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-2">Gebruiker</h2>
          <div className="text-sm text-zinc-700 space-y-1">
            <div><span className="font-medium">Naam:</span> {u.name || '-'} </div>
            <div><span className="font-medium">E-mail:</span> {u.email}</div>
            <div><span className="font-medium">Status:</span> {u.status}</div>
            <div><span className="font-medium">Aangemaakt:</span> {new Date(u.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-2">Bedrijf</h2>
          <div className="text-sm text-zinc-700 space-y-1">
            <div><span className="font-medium">Naam:</span> {c.name || '-'}</div>
            <div><span className="font-medium">Plaats:</span> {c.city || '-'}</div>
            <div><span className="font-medium">Adres:</span> {c.address || '-'} {c.houseNumber || ''}</div>
            <div><span className="font-medium">Postcode:</span> {c.zipCode || '-'}</div>
            <div><span className="font-medium">KVK:</span> {c.kvkNumber || '-'}</div>
            <div><span className="font-medium">Website:</span> {c.website || '-'}</div>
            <div><span className="font-medium">Tagline:</span> {c.tagline || '-'}</div>
            <div><span className="font-medium">Sector:</span> {c.sector || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
