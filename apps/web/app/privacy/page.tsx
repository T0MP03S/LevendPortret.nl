"use client";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-navy mb-6">Privacybeleid</h1>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4 text-zinc-800 leading-relaxed">
        <p>We gaan zorgvuldig om met jouw gegevens. Op deze pagina vind je in het kort hoe wij met persoonsgegevens omgaan. De volledige versie volgt binnenkort.</p>
        <h2 className="text-xl font-semibold text-navy mt-4">Wat verzamelen we?</h2>
        <p>Naam en contactgegevens (zoals e-mail en telefoon), bedrijfsgegevens en optioneel mediabestanden (logo/afbeeldingen) voor je pagina.</p>
        <h2 className="text-xl font-semibold text-navy mt-4">Waarvoor gebruiken we dit?</h2>
        <p>Voor het aanmaken van je account, het publiceren van je bedrijfsinformatie binnen Levend Portret en het bieden van ondersteuning.</p>
        <h2 className="text-xl font-semibold text-navy mt-4">Jouw rechten</h2>
        <p>Je kunt altijd je gegevens inzien, wijzigen of verwijderen via de instellingen of door contact op te nemen met <a className="text-coral hover:underline" href="mailto:info@levendportret.nl">info@levendportret.nl</a>.</p>
      </div>
    </div>
  );
}
