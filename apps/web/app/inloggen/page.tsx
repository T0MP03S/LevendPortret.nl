"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from "next-auth/react";
import { useSession } from 'next-auth/react';
import { Button } from "@levendportret/ui";
import { Eye, EyeOff } from "lucide-react";

export default function InloggenPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: "" | "error" | "success", message: string }>({ type: "", message: "" });
  const [step, setStep] = useState(initialEmail ? 2 : 1);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/');
    }
  }, [authStatus, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    const res = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    if ((res as any)?.error) {
      setStatus({ type: "error", message: "Onjuiste inloggegevens of account nog niet geactiveerd." });
    } else {
      window.location.href = '/post-auth';
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-6 text-center">{step === 1 ? 'Inloggen of Registreren' : 'Kies je methode'}</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        {status.message && (
          <div className={`p-3 rounded text-sm ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {status.message}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Button type="button" variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: '/post-auth' })}>Inloggen met Google</Button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">of</span></div></div>
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mailadres</label>
              <input id="email" type="email" className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" variant="coral" className="w-full">Verder</Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">E-mailadres: <strong>{email}</strong> <button onClick={() => setStep(1)} className="text-coral text-xs hover:underline">(wijzig)</button></p>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">of</span></div></div>
            <Button type="button" variant="default" className="w-full" onClick={() => signIn('email', { email: email.toLowerCase(), callbackUrl: '/post-auth' })}>Stuur mij een inloglink</Button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">of</span></div></div>
            <form onSubmit={handleCredentials} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Wachtwoord</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coral focus:border-coral pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="submit" variant="default" className="w-full">Inloggen met wachtwoord</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
