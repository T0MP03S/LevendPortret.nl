import Link from 'next/link';

export default function Page() {
  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center">
      <h1 className="text-3xl font-bold mb-6">Levend Portret Admin</h1>
      <p className="text-zinc-700 mb-6">Log in om toegang te krijgen tot het beheerpaneel.</p>
      <Link
        href="/inloggen"
        className="inline-block px-6 py-3 rounded-md bg-coral text-white hover:bg-[#e14c61] font-semibold"
      >
        Inloggen
      </Link>
    </div>
  );
}
