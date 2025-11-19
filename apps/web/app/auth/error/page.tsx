"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const code = (params.get("error") || "").toString();

  let title = "Er ging iets mis";
  let message = "Probeer het later opnieuw.";

  if (code === "Verification") {
    title = "Verificatie mislukt";
    message = "De verificatielink is ongeldig of al gebruikt. Vraag een nieuwe link aan.";
  } else if (code === "AccessDenied") {
    title = "Toegang geweigerd";
    message = "Je hebt geen toegang tot deze actie.";
  } else if (code) {
    title = "Foutmelding";
    message = `Er is een fout opgetreden (${code}). Probeer het opnieuw.`;
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-navy">{title}</h1>
            <p className="mt-2 text-sm text-zinc-700">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/inloggen" className="inline-flex items-center rounded-md bg-coral text-white px-4 py-2 hover:bg-[#e14c61]">Opnieuw inloggen</Link>
          <Link href="/" className="inline-flex items-center rounded-md border border-zinc-300 px-4 py-2 hover:bg-zinc-50">Terug naar home</Link>
        </div>
      </div>
    </div>
  );
}
