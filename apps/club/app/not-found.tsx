"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] grid place-items-center p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-navy/10 grid place-items-center">
          <Compass className="w-12 h-12 text-coral" aria-hidden />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Pagina niet gevonden</h1>
        <p className="mt-2 text-zinc-600">Deze pagina bestaat niet of is verplaatst.</p>
        <div className="mt-6">
          <Link href="/" className="inline-block px-4 py-2 rounded-md bg-coral text-white hover:opacity-90">Terug naar home</Link>
        </div>
      </div>
    </main>
  );
}
