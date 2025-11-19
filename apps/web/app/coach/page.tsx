export default function CoachComingSoon() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl md:text-4xl text-center text-navy mb-2">Persoonlijk Adviesgesprek</h1>
      <p className="text-center text-gray-700 font-body mb-8">Onze coach gaat met jou aan de slag om jouw positionering te verscherpen en direct toepasbaar te maken.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy mb-2">1. De kern van uw bedrijf</h3>
          <p className="text-gray-700 font-body">We identificeren de unieke sterke punten en specialisaties. Wat maakt u anders en waar ligt de meeste potentie?</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy mb-2">2. Het onweerstaanbare aanbod</h3>
          <p className="text-gray-700 font-body">Hoe zet u zich het beste in de markt? Welke boodschap raakt uw ideale klant en hoe positioneert u zich?</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg text-navy mb-2">3. De klantkeuze formule</h3>
          <p className="text-gray-700 font-body">Concrete handvatten zodat potentiële klanten voor u kiezen. Met overtuigende argumenten en heldere Call-to-Action.</p>
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
