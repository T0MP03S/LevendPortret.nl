export default function FundComingSoon() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">Fund</h1>
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
        <p className="text-gray-700 font-body">Deze pagina is in voorbereiding. Binnenkort vind je hier alle informatie over ons fund-concept.</p>
        <p className="text-gray-600 font-body mt-2">Heb je nu al vragen? Neem gerust contact op.</p>
        <div className="mt-6">
          <a href="mailto:info@levendportret.nl" className="inline-flex items-center px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Mail ons</a>
        </div>
      </div>
      <div className="mt-6">
        <a href="/" className="text-coral hover:underline">Terug naar home</a>
      </div>
    </div>
  );
}
