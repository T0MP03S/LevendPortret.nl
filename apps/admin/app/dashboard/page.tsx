"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/users?status=PENDING_APPROVAL", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        setPendingCount(Array.isArray(data.items) ? data.items.length : 0);
      } catch {
        setPendingCount(0);
      }
    };
    load();
  }, []);

  const badge = pendingCount === 0 ? null : (
    <span className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-coral text-white text-xs w-5 h-5">
      {pendingCount === 1 ? "!" : pendingCount}
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative rounded-2xl border border-zinc-200 p-6">
          {badge}
          <h2 className="text-xl font-semibold mb-2">Gebruikersbeheer</h2>
          <p className="text-zinc-600 mb-4">Beheer gebruikers. Filter op status en product.</p>
          <a href="/dashboard/gebruikers" className="inline-flex px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">
            Open gebruikers
          </a>
        </div>
      </div>
    </div>
  );
}
