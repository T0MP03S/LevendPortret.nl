"use client";

import * as React from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  const onClick = () => {
    const err = new Error("Sentry test error: manual trigger from /sentry-example-page");
    Sentry.captureException(err);
    // Rethrow to visualize the error in the UI/dev overlay as well
    throw err;
  };

  return (
    <main className="min-h-[60vh] p-8 grid place-items-center">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl md:text-3xl font-bold">Sentry test</h1>
        <p className="mt-2 text-zinc-600">
          Klik op de knop hieronder om een test error te genereren. Controleer daarna in Sentry → Issues of het event is binnengekomen.
        </p>
        <button onClick={onClick} className="mt-6 px-4 py-2 rounded-md bg-coral text-white hover:opacity-90">
          Trigger Sentry error
        </button>
      </div>
    </main>
  );
}
