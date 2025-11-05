"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [credEmail, setCredEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingCred, setLoadingCred] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const p = params?.get("email");
    if (p) {
      setEmail(p);
      setCredEmail(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoadingEmail(true);
    try {
      const addr = email.trim().toLowerCase();
      const pre = await fetch('/api/admin/is-allowed-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addr })
      });
      const data = await pre.json();
      if (!data.allowed) {
        setMessage("Dit e-mailadres heeft geen toegang tot de admin.");
        return;
      }
      const res = await signIn("email", {
        email: addr,
        callbackUrl: "/dashboard",
        redirect: false
      });
      if ((res as any)?.error) {
        setMessage("Kon geen magic link versturen.");
      } else {
        router.push(`/admin-verificatie?email=${encodeURIComponent(addr)}`);
      }
    } catch {
      setMessage("Er is iets misgegaan.");
    } finally {
      setLoadingEmail(false);
    }
  };

  const loginWithCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoadingCred(true);
    try {
      const res = await signIn("credentials", {
        email: credEmail.trim().toLowerCase(),
        password,
        callbackUrl: "/dashboard",
        redirect: true
      });
      if (res?.error) setMessage("Ongeldige inloggegevens of e-mail nog niet geverifieerd.");
    } catch {
      setMessage("Er is iets misgegaan.");
    } finally {
      setLoadingCred(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Inloggen</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Stap 1: Magic link aanvragen</h2>
          <p className="text-zinc-700 mb-3 text-sm">Vul je e-mailadres in om een magic link te ontvangen voor je admin-registratie.</p>
          <form onSubmit={requestMagicLink} className="space-y-3">
            <input
              type="email"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="jij@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61] disabled:opacity-60"
              disabled={loadingEmail}
            >
              {loadingEmail ? "Versturen..." : "Stuur magic link"}
            </button>
          </form>
        </div>

        <div className="border-t border-zinc-200 pt-4">
          <h2 className="text-lg font-semibold mb-2">Stap 2: Inloggen met wachtwoord</h2>
          <form onSubmit={loginWithCredentials} className="space-y-3">
            <input
              type="email"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="jij@voorbeeld.nl"
              value={credEmail}
              onChange={(e) => setCredEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="Je wachtwoord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {message && <div className="text-sm text-red-600">{message}</div>}
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60"
              disabled={loadingCred}
            >
              {loadingCred ? "Inloggen..." : "Inloggen"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
