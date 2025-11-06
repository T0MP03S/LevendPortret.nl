export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-600">Welkom! Hier komt het overzicht voor moderatie en beheer.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-2">In behandeling</h2>
          <p className="text-zinc-600 mb-4">Overzicht van nieuwe aanmeldingen die wachten op goedkeuring.</p>
          <a href="/dashboard/in-behandeling" className="inline-flex px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">
            Open overzicht
          </a>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-2">Gebruikersbeheer</h2>
          <p className="text-zinc-600 mb-4">Bekijk en bewerk actieve gebruikers.</p>
          <a href="/dashboard/gebruikers" className="inline-flex px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">
            Open gebruikers
          </a>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold mb-2">Afgekeurd</h2>
          <p className="text-zinc-600 mb-4">Overzicht van afgekeurde aanmeldingen die je opnieuw kunt keuren.</p>
          <a href="/dashboard/afgekeurd" className="inline-flex px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">
            Open afgekeurd
          </a>
        </div>
      </div>
    </div>
  );
}
