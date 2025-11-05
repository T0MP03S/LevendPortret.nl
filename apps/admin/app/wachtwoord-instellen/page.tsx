"use client";

import { useState } from "react";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.error || "Er is iets misgegaan.");
      } else {
        setMessage("Wachtwoord ingesteld. Je kunt nu inloggen met e-mail + wachtwoord.");
      }
    } catch (err) {
      setMessage("Er is iets misgegaan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Wachtwoord instellen</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nieuw wachtwoord</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bevestig wachtwoord</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {message && (
            <div className="p-3 rounded text-sm bg-zinc-100 text-zinc-800">{message}</div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Opslaan..." : "Wachtwoord opslaan"}
          </button>
        </form>
      </div>
    </div>
  );
}
