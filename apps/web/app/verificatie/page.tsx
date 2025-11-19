"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";

export default function VerificatiePage() {
  const qp = useSearchParams();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const e = (qp.get("email") || "").trim();
    if (e) setEmail(e);
  }, [qp]);

  const resend = async () => {
    setErr(""); setOk("");
    const e = email.trim().toLowerCase();
    if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      setErr("Vul een geldig e-mailadres in");
      return;
    }
    setSending(true);
    try {
      // 1) Invalideer bestaande tokens voor dit e-mailadres
      const delRes = await fetch('/api/auth/resend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: e }) });
      if (!delRes.ok) {
        const j = await delRes.json().catch(()=>({}));
        throw new Error(j?.error || 'Kon oude link ongeldig maken');
      }
      // 2) Haal CSRF token op
      const csrfRes = await fetch('/api/auth/csrf', { cache: 'no-store' });
      const csrfJson = await csrfRes.json();
      const csrfToken = csrfJson?.csrfToken;
      if (!csrfToken) throw new Error('CSRF fout');
      // 3) Vraag nieuwe magic link aan
      const form = new URLSearchParams();
      form.set('email', e);
      form.set('callbackUrl', '/post-auth');
      form.set('csrfToken', csrfToken);
      const sendRes = await fetch('/api/auth/signin/email', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
      if (!sendRes.ok) {
        throw new Error('Verzenden mislukt');
      }
      setOk('Nieuwe verificatielink verstuurd. Controleer je inbox.');
    } catch (ex: any) {
      setErr(ex?.message || 'Er ging iets mis');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-navy mb-4">Controleer je e-mail</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <p>
          We hebben je een verificatielink gestuurd. Klik op de link in je e-mail om je e-mailadres te bevestigen.
        </p>
        <p className="text-sm text-gray-600">
          Ontvang je niets? Controleer je spam of vraag hieronder een nieuwe link aan. De oude link wordt dan ongeldig.
        </p>
        {ok && <div className="p-3 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm">{ok}</div>}
        {err && <div className="p-3 rounded-md border border-red-300 bg-red-50 text-red-800 text-sm">{err}</div>}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1">
            <label className="block text-sm text-zinc-700">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2"
              placeholder="naam@bedrijf.nl"
            />
          </div>
          <button
            onClick={resend}
            disabled={sending || !email}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61] disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            <span>Nieuwe magic link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
