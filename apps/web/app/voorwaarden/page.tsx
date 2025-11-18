"use client";

export default function VoorwaardenPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-navy mb-6">Algemene voorwaarden</h1>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4 text-zinc-800 leading-relaxed">
        <p>Hier vind je binnenkort de volledige algemene voorwaarden van Levend Portret. Deze pagina bevat nu een beknopte samenvatting.</p>
        <h2 className="text-xl font-semibold text-navy mt-4">Samenvatting</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>Dienstverlening: coaching, productie en publicatie van bedrijfsprofielen en clips.</li>
          <li>Betalingen en termijnen: conform offerte of beveiligde betaalomgeving (v2).</li>
          <li>Rechten: je behoudt rechten op je eigen materiaal; Levend Portret heeft gebruiksrecht voor publicatie binnen het platform.</li>
          <li>Privacy & beveiliging: zie ook het <a className="text-coral hover:underline" href="/privacy">privacybeleid</a>.</li>
        </ul>
        <p>Vragen? Mail ons via <a className="text-coral hover:underline" href="mailto:info@levendportret.nl">info@levendportret.nl</a>.</p>
      </div>
    </div>
  );
}
