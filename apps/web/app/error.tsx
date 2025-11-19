"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Optionally log to monitoring
    // console.error(error);
  }, [error]);

  return (
    <html lang="nl">
      <body>
        <main className="min-h-[70vh] grid place-items-center p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-navy/10 grid place-items-center">
              <AlertTriangle className="w-12 h-12 text-coral" aria-hidden />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Er ging iets mis</h1>
            <p className="mt-2 text-zinc-600">Probeer het opnieuw. Blijft dit gebeuren? Neem even contact op.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={reset} className="px-4 py-2 rounded-md bg-coral text-white hover:opacity-90">Opnieuw proberen</button>
              <Link href="/" className="px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50">Naar home</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
