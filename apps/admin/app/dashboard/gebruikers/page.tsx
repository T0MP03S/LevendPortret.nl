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
};

export default function GebruikersPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users?status=ACTIVE", { cache: "no-store" });
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
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Gebruikers</h1>
        <p className="mt-2 text-zinc-600">Actieve gebruikersbeheer.</p>
        <div className="mt-3 flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Terug naar dashboard</Link>
          <Link href="/dashboard/afgekeurd" className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Naar Afgekeurd</Link>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <span className="text-sm text-zinc-700">Totaal: {items.length}</span>
          <button onClick={load} className="text-sm underline">Verversen</button>
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
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700">{it.status}</span>
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
