"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [aanvragenCount, setAanvragenCount] = useState<number>(0);
  const [notifyNewSignup, setNotifyNewSignup] = useState(false);
  const [savingNotify, setSavingNotify] = useState(false);
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

  useEffect(() => {
    const loadClips = async () => {
      try {
        const res = await fetch("/api/admin/clips/overview", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        setAanvragenCount(Array.isArray(data.aanvragen) ? data.aanvragen.length : 0);
      } catch {
        setAanvragenCount(0);
      }
    };
    loadClips();
  }, []);

  useEffect(() => {
    const loadNotify = async () => {
      try {
        const res = await fetch("/api/admin/notifications", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (typeof data.notifyNewSignup === "boolean") {
          setNotifyNewSignup(data.notifyNewSignup);
        }
      } catch {
        // ignore
      }
    };
    loadNotify();
  }, []);

  const toggleNotify = async () => {
    try {
      setSavingNotify(true);
      const next = !notifyNewSignup;
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyNewSignup: next }),
      });
      if (res.ok) {
        setNotifyNewSignup(next);
      }
    } finally {
      setSavingNotify(false);
    }
  };

  const badge = pendingCount === 0 ? null : (
    <span className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-coral text-white text-xs w-5 h-5">
      {pendingCount === 1 ? "!" : pendingCount}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
        <label className="inline-flex items-center gap-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-coral focus:ring-coral"
            checked={notifyNewSignup}
            disabled={savingNotify}
            onChange={toggleNotify}
          />
          <span>{savingNotify ? "Opslaan…" : "Mail bij nieuwe aanmelding"}</span>
        </label>
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
        <div className="relative rounded-2xl border border-zinc-200 p-6">
          {aanvragenCount > 0 && (
            <span className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-coral text-white text-xs w-5 h-5">
              {aanvragenCount > 9 ? '9+' : aanvragenCount}
            </span>
          )}
          <h2 className="text-xl font-semibold mb-2">Clipsbeheer</h2>
          <p className="text-zinc-600 mb-4">Overzicht van bedrijven met externe website en aanvragen.</p>
          <a href="/dashboard/clips" className="inline-flex px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">
            Open clipsbeheer
          </a>
        </div>
        <div className="relative rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-2">E-mail templates testen</h2>
          <p className="text-zinc-600 mb-4">Verstuur testmails (magic link, bevestigingen) naar een ontvanger.</p>
          <a href="/dashboard/email-test" className="inline-flex px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">
            Open e-mail test
          </a>
        </div>
      </div>
    </div>
  );
}
