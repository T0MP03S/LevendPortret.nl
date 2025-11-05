export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-600">Welkom! Hier komt het overzicht voor moderatie en beheer.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-2">In behandeling</h2>
          <p className="text-zinc-600">Lijst met nieuwe aanmeldingen volgt.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-2">Statistieken</h2>
          <p className="text-zinc-600">Charts en cijfers volgen.</p>
        </div>
      </div>
    </div>
  );
}
