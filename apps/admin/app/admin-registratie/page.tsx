"use client";

import { useEffect, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AdminRegistrationPage() {
  const [sessionEmail, setSessionEmail] = useState<string>("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getSession().then((s) => {
      setSessionEmail(s?.user?.email || "");
    }).catch(() => {
      setSessionEmail("");
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setMessage("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }
    if (password !== confirm) {
      setMessage("Wachtwoorden komen niet overeen.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Er is iets misgegaan.");
      } else {
        // Direct automatisch inloggen met credentials en naar dashboard
        const email = sessionEmail || "";
        try {
          const resLogin = await signIn("credentials", {
            email,
            password,
            callbackUrl: "/dashboard",
            redirect: true
          });
          if ((resLogin as any)?.error) {
            router.push("/inloggen");
          }
          return;
        } catch {
          router.push("/inloggen");
        }
      }
    } catch (err) {
      setMessage("Er is iets misgegaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-center">Admin-registratie</h1>
      <p className="text-center text-zinc-600 mb-4">Wachtwoord instellen voor: <span className="font-semibold">{sessionEmail || "jouw e-mailadres"}</span></p>
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <p className="text-zinc-700 mb-4">Vul je naam in en stel je wachtwoord in om toegang te krijgen tot het admin dashboard.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Naam</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nieuw wachtwoord</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Verberg wachtwoord" : "Toon wachtwoord"}
                className="absolute inset-y-0 right-2 flex items-center text-zinc-500 hover:text-zinc-700"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bevestig wachtwoord</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral/60"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Verberg wachtwoord" : "Toon wachtwoord"}
                className="absolute inset-y-0 right-2 flex items-center text-zinc-500 hover:text-zinc-700"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {message && (
            <div className="p-3 rounded text-sm bg-zinc-100 text-zinc-800">{message}</div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Opslaan..." : "Wachtwoord opslaan"}
          </button>
        </form>
      </div>
    </div>
  );
}

