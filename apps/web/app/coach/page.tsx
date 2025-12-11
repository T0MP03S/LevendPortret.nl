export default function CoachPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl md:text-4xl text-center text-navy mb-4">Coach</h1>
      <p className="text-center text-gray-700 font-body mb-8">
        Onze coach is een ervaren ondernemer die je gaat helpen om een elevator pitch te maken. Een elevator pitch is een korte krachtige presentatie waarin u de kern van uw bedrijf verwoord.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy mb-2">1. De kern van uw bedrijf</h3>
          <p className="text-gray-700 font-body">We stellen samen vast wat uw bedrijf te bieden heeft.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy mb-2">2. Onderscheidend vermogen</h3>
          <p className="text-gray-700 font-body">Wij gaan op zoek naar die elementen in uw propositie waarin u zich onderscheidt van uw concurrenten.</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy mb-2">3. Klantgerichtheid</h3>
          <p className="text-gray-700 font-body">Hoe kunt u uw klanten verleiden om zaken met u te doen.</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl text-navy mb-2">Van advies naar actie</h3>
        <p className="text-gray-700 font-body">De inzichten vertalen we direct naar het script voor uw promotievideo en 30-seconden social clip. Zo bent u na de coaching strategisch scherp én heeft u direct professionele content.</p>
        <div className="mt-6 flex justify-center">
          <a href="/aanmelden" className="inline-flex items-center px-4 py-2 rounded-md bg-coral text-white hover:bg-[#e14c61]">Vraag adviesgesprek aan</a>
        </div>
      </div>
    </div>
  );
}
