"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  company?: { id: string; name: string | null; city: string | null } | null;
};

export default function AfgekeurdPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users?status=REJECTED", { cache: "no-store" });
      if (!res.ok) throw new Error("Kon afgekeurde gebruikers niet laden");
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

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" })
      });
      if (!res.ok) throw new Error("Goedkeuren mislukt");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      // noop; eventueel toast
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Afgekeurd</h1>
        <p className="mt-2 text-zinc-600">Gebruikers die zijn afgewezen. Je kunt ze hier alsnog goedkeuren.</p>
        <div className="mt-3 flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Terug naar dashboard</Link>
          <Link href="/dashboard/in-behandeling" className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Naar In behandeling</Link>
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
          <div className="p-6 text-zinc-600">Geen afgekeurde gebruikers.</div>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {items.map((it) => (
              <li key={it.id} className="p-4 flex items-center gap-4 justify-between">
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.name || it.email}</div>
                  <div className="text-sm text-zinc-600 truncate">{it.company?.name || "Zonder bedrijfsnaam"} {it.company?.city ? `— ${it.company.city}` : ""}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => approve(it.id)} className="px-3 py-1.5 rounded-md bg-coral text-white hover:bg-[#e14c61] text-sm">Goedkeuren</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
