"use client";

import { useSearchParams } from "next/navigation";

export default function AdminVerifyPage() {
  const params = useSearchParams();
  const email = params.get("email") || "jouw e-mailadres";
  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-center">Controleer je e-mail</h1>
      <p className="text-center text-zinc-600 mb-4">voor <span className="font-semibold">{email}</span></p>
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <p className="text-zinc-700">
          We hebben je een link gestuurd om je admin-account te registreren. Open de link op dit apparaat om verder te gaan.
        </p>
        <ul className="list-disc ml-6 text-zinc-700 space-y-1">
          <li>Geen mail ontvangen? Controleer je spamfolder.</li>
          <li>In ontwikkeling wordt de link ook in de terminal gelogd.</li>
        </ul>
        <div className="text-center">
          <a href={`/inloggen?email=${encodeURIComponent(email)}`} className="inline-block px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">
            Terug naar inloggen
          </a>
        </div>
      </div>
    </div>
  );
}
