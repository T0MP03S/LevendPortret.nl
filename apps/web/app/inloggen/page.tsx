"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from "next-auth/react";
import { useSession } from 'next-auth/react';
import { Button } from "@levendportret/ui";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingMagic, setLoadingMagic] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(false);

  const focusAndScroll = (id: string) => {
    const el = document.getElementById(id) as HTMLElement | null;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace('/');
    }
  }, [authStatus, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    const valid = /^\S+@\S+\.\S+$/.test(email.trim());
    if (!valid) {
      setEmailError('Voer een geldig e-mailadres in.');
      setLoadingEmail(false);
      requestAnimationFrame(()=>focusAndScroll('email'));
      return;
    }
    setEmailError("");
    setStep(2);
    setLoadingEmail(false);
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoadingCredentials(true);
    if (password.trim().length < 8) {
      setPasswordError('Wachtwoord moet minimaal 8 tekens bevatten.');
      setLoadingCredentials(false);
      requestAnimationFrame(()=>focusAndScroll('password'));
      return;
    }
    setPasswordError("");
    const res = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    if ((res as any)?.error) {
      setStatus({ type: "error", message: "Onjuiste inloggegevens of account nog niet geactiveerd." });
      setLoadingCredentials(false);
      requestAnimationFrame(()=>focusAndScroll('password'));
    } else {
      window.location.href = '/post-auth';
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-navy mb-6 text-center">{step === 1 ? 'Inloggen of Registreren' : 'Kies je methode'}</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        {status.message && (
          <div role="alert" aria-live="polite" className={`p-3 rounded text-sm ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {status.message}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Log in met Google of vul je e-mailadres in om verder te gaan. Je kunt daarna kiezen voor een magic link of wachtwoord.</p>
            <Button type="button" variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: '/post-auth' })}>Inloggen met Google</Button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">of</span></div></div>
            <form onSubmit={handleEmailSubmit} className="space-y-3" aria-busy={loadingEmail}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mailadres</label>
              <input
                id="email"
                type="email"
                className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-coral focus:border-coral ${emailError ? 'border-red-400' : 'border-gray-300'}`}
                value={email}
                onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                aria-invalid={emailError ? true : false}
                aria-describedby={emailError ? 'email-error' : undefined}
                required
              />
              {emailError && <p id="email-error" className="text-xs text-red-600">{emailError}</p>}
              <Button type="submit" variant="coral" className="w-full" disabled={loadingEmail}>
                {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verder
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">E-mailadres: <strong>{email}</strong> <button onClick={() => setStep(1)} className="text-coral text-xs hover:underline">(wijzig)</button></p>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">of</span></div></div>
            <Button
              type="button"
              variant="default"
              className="w-full"
              disabled={loadingMagic}
              onClick={async () => { setLoadingMagic(true); await signIn('email', { email: email.toLowerCase(), callbackUrl: '/post-auth' }); setLoadingMagic(false); }}
            >
              {loadingMagic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Stuur mij een inloglink
            </Button>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">of</span></div></div>
            <form onSubmit={handleCredentials} className="space-y-3" aria-busy={loadingCredentials}>
              <label className="block text-sm font-medium text-gray-700">Wachtwoord</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-coral focus:border-coral pr-16 ${passwordError ? 'border-red-400' : 'border-gray-300'}`}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                  aria-invalid={passwordError ? true : false}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-1 my-auto w-10 h-10 flex items-center justify-center rounded text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {passwordError && <p id="password-error" className="text-xs text-red-600">{passwordError}</p>}
              <Button type="submit" variant="default" className="w-full" disabled={loadingCredentials}>
                {loadingCredentials && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Inloggen met wachtwoord
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
