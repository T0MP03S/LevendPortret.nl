"use client";

import { useState } from "react";

const templates = [
  { key: "magic-link", label: "Magic link" },
  { key: "registration-received", label: "Aanmelding ontvangen" },
  { key: "approved", label: "Account geactiveerd" },
  { key: "rejected", label: "Niet goedgekeurd" },
  { key: "default", label: "Test" },
];

export default function EmailTestPage() {
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const send = async (type: string) => {
    setMsg(null);
    setBusy(type);
    try {
      const res = await fetch("/api/dev/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Send failed");
      setMsg(`✔ Verzonden: ${type} → ${to}`);
    } catch (e: any) {
      setMsg(`✖ Mislukt: ${e?.message || e}`);
    } finally {
      setBusy(null);
    }
  };

  const disabled = !to || busy !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">E-mail templates testen</h1>
        <p className="text-zinc-600">Stel een ontvanger in en verstuur testmails per template.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-6 space-y-4 max-w-xl">
        <label className="block text-sm font-medium text-zinc-700">Ontvanger</label>
        <input
          type="email"
          placeholder="naam@voorbeeld.nl"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coral"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {templates.map((t) => (
            <button
              key={t.key}
              onClick={() => send(t.key)}
              disabled={disabled}
              className={`inline-flex items-center justify-center px-3 py-2 rounded-md text-white ${busy === t.key ? 'bg-zinc-400' : 'bg-coral hover:bg-[#e14c61]'} disabled:opacity-60`}
            >
              {busy === t.key ? 'Versturen…' : t.label}
            </button>
          ))}
        </div>
        {msg && <div className="text-sm pt-2">{msg}</div>}
        <p className="text-xs text-zinc-500 pt-1">In development heb je `EMAIL_SEND_IN_DEV=true` nodig om écht te mailen.</p>
      </div>
    </div>
  );
}
