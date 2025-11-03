import Link from 'next/link';

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="py-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Levend Portret, het eerlijke verhaal</h1>
        <p className="mt-4 text-lg text-zinc-600 max-w-2xl">
          Welkom. Ontdek hoe de coach, clips en club jouw onderneming een vliegende start geven.
        </p>
        <div className="mt-8">
          <Link href="/aanmelden" className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white hover:bg-zinc-800">
            Meld je aan
          </Link>
        </div>
      </section>
    </main>
  );
}
