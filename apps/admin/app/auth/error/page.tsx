"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const MESSAGES: Record<string, { title: string; desc: string }> = {
  AccessDenied: {
    title: "Toegang geweigerd",
    desc: "Dit e-mailadres heeft geen toegang tot de admin.",
  },
  CredentialsSignin: {
    title: "Inloggegevens onjuist",
    desc: "Het e-mailadres of wachtwoord kloppen niet, of de e-mail is nog niet geverifieerd.",
  },
  EmailSignin: {
    title: "Magic link niet verstuurd",
    desc: "We konden geen magic link sturen. Probeer het opnieuw of controleer het e-mailadres.",
  },
  Verification: {
    title: "Verificatie mislukt",
    desc: "De verificatielink is ongeldig of verlopen. Vraag een nieuwe link aan.",
  },
  Callback: {
    title: "Callback fout",
    desc: "Er ging iets mis tijdens het inloggen. Probeer het opnieuw.",
  },
  Configuration: {
    title: "Configuratiefout",
    desc: "Er ontbreekt een instelling. Controleer de serverconfiguratie (env).",
  },
};

export default function AuthErrorPage() {
  const params = useSearchParams();
  const code = params.get("error") || "";

  const meta =
    MESSAGES[code] ||
    ({
      title: "Er is iets misgegaan",
      desc: "Probeer het opnieuw of neem contact op met de beheerder.",
    } as const);

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">{meta.title}</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <p className="text-zinc-700">{meta.desc}</p>
        {code && (
          <p className="text-xs text-zinc-500 break-all">Foutcode: {code}</p>
        )}
        <div className="flex gap-3">
          <Link
            href="/inloggen"
            className="inline-flex px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]"
          >
            Terug naar inloggen
          </Link>
          <Link
            href="/"
            className="inline-flex px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50"
          >
            Startpagina
          </Link>
        </div>
      </div>
    </div>
  );
}
