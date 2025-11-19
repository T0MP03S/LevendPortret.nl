import Link from 'next/link';
import { Button } from '@levendportret/ui';
import { Play, Users, Gift, UserCircle, MessageSquare, Film, Video, Megaphone, Calendar, Sparkles, Check } from 'lucide-react';

export default function Page() {
  return (
    <div className="relative max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="text-center py-20">
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/50 bg-white/70 md:bg-white/60 md:backdrop-blur p-6 md:p-12 shadow-lg">
          <img src="/logo-color.svg" alt="Levend Portret" className="h-32 md:h-40 mx-auto mb-8" />
          <p className="text-2xl text-navy/80 mb-6 font-heading" style={{ fontWeight: 500 }}>Het eerlijke verhaal</p>
          <p className="text-lg font-body text-gray-700 max-w-2xl mx-auto mb-10">
            Coaching, professionele clips en een actieve club die jouw onderneming zichtbaar maken.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/aanmelden">
              <Button variant="default" size="lg">
                Start jouw verhaal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="relative rounded-3xl p-8 md:p-12 bg-gradient-to-b from-navy/5 to-white">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
            <h2 className="text-2xl text-navy">Boost je onderneming!</h2>
            <p className="text-gray-700 font-body">
              U heeft een geweldig idee. Nu is het tijd om de wereld dat te laten weten. Onze coaching is speciaal ontworpen voor ondernemers die direct impact willen maken met een helder en visueel krachtig marketingverhaal én die willen bouwen aan een netwerk.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 transition hover:shadow-md hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center mb-4">
                <UserCircle className="w-6 h-6 text-coral" />
              </div>
              <h3 className="text-xl text-navy mb-3">Coach</h3>
              <p className="text-gray-600 font-body">
                Een ervaren ondernemer helpt je jouw bedrijfsidee pakkend te verwoorden in een sterke elevator pitch.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 transition hover:shadow-md hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-turquoise/10 rounded-lg flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-turquoise" />
              </div>
              <h3 className="text-xl text-navy mb-3">Clips</h3>
              <p className="text-gray-600 font-body">
                Professionele video's van 5 minuten en 30 seconden die jouw verhaal vertellen en je bedrijf laten zien.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 transition hover:shadow-md hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-navy" />
              </div>
              <h3 className="text-xl text-navy mb-3">Club</h3>
              <p className="text-gray-600 font-body">
                3 jaar lidmaatschap van een actieve club ondernemers die elkaar opdrachten gunnen en samen groeien.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Werkwijze */}
      <section className="py-12">
        <h2 className="text-2xl text-navy text-center mb-8">Hoe werkt het?</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-4">
          {[
            'Aanmelding',
            'Introductiegesprek',
            'Coachingsgesprek',
            'Scripts evalueren',
            'Opnames',
            'Montage',
            'Clip op clubwebsite',
            'Eigen bedrijfspagina'
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-zinc-100 transition hover:shadow-md">
              <div className="w-7 h-7 bg-coral rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 font-body">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prijs */}
      <section className="py-16">
        <div className="relative overflow-hidden bg-navy text-white p-12 rounded-2xl max-w-3xl mx-auto">
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-coral/10 via-transparent to-turquoise/10" />
          <div className="relative">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-4">Levend Portret Cadeau</h2>
            <p className="text-5xl text-coral mb-2">€2.450</p>
            <p className="text-white/70 font-body">excl. btw</p>
          </div>
          
          <div className="max-w-md mx-auto space-y-3 mb-8">
            {[ 
              'Coachingsgesprek', 
              '5 min video clip', 
              '30 sec social clip', 
              '3 jaar clublidmaatschap', 
              'Eigen bedrijfspagina', 
              'Webinars voor leden' 
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10">
                  <Check className="w-4 h-4" />
                </span>
                <span className="text-white/90 font-body">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/aanmelden">
              <Button variant="coral" size="lg">
                Meld je aan
              </Button>
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* Extra CTA */}
      <section className="py-20">
        <div className="relative overflow-hidden max-w-4xl mx-auto rounded-3xl border border-zinc-100 bg-white p-8 md:p-12 shadow-sm text-center">
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-coral/10 via-transparent to-turquoise/10" />
          <div className="relative">
            <h3 className="text-2xl md:text-3xl text-navy mb-3">Klaar om te starten?</h3>
            <p className="text-gray-700 font-body mb-6 md:mb-8">Plan een vrijblijvend kennismakingsgesprek en zet vandaag de eerste stap.</p>
            <Link href="/aanmelden"><Button variant="default" size="lg">Vrijblijvend kennismaken</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
