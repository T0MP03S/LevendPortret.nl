"use client";
import { useEffect, useRef, useState } from 'react';
import { Mail, X } from 'lucide-react';
import { TeamImage } from './team-image';

const team = [
  { name: 'Bert Kranendonk', role: 'Coach', email: 'bert@levendportret.nl', imageUrl: '/team/bert.jpg' },
  { name: 'Barry Annes', role: 'Coming soon', email: 'barry@levendportret.nl', imageUrl: '/team/unknown.jpg' },
  { name: 'Frank van Eijk', role: 'Filmmaker', email: 'frank@levendportret.nl', imageUrl: '/team/frank.jpg' },
];

const bios: Record<string, string> = {
  'Bert Kranendonk': 'Binnenkort beschikbaar.',
  'Barry Annes': 'Binnenkort beschikbaar.',
  'Frank van Eijk': 'Frank van Eijk studeerde af aan de filmacademie. Werkte daarna als editor bij de NOS en begon in 1993 als zelfstandig regisseur en scenatioschrijver. Hij werkte voor veel verschillende soorten opdrachtgevers: Omroepen, commerciële bedrijven, overheid en Defensie. Creativiteit en kwaliteit staat bij hem hoog in het vaandel. Al enige jaren maakt hij ook content voor Social Media en YouTube.'
};

export default function EvenVoorstellenPage() {
  const [selected, setSelected] = useState<typeof team[number] | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  function onOpen(member: typeof team[number]) {
    lastFocusedRef.current = (document.activeElement as HTMLElement) || null;
    setSelected(member);
  }

  function onClose() {
    setSelected(null);
    const to = lastFocusedRef.current;
    if (to) {
      setTimeout(() => to.focus(), 0);
    }
  }

  useEffect(() => {
    if (selected && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [selected]);

  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusables = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Mission Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">Even voorstellen</h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          Levend Portret biedt een communityoplossing voor ondernemingen aan het begin van hun bestaansgeschiedenis.
        </p>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-navy text-center mb-12">Ons Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center">
          {team.map((member) => (
            <div key={member.name} className="bg-white p-6 rounded-2xl shadow-sm text-center w-full max-w-[320px]">
              <div className="w-40 h-40 rounded-full mx-auto mb-4 bg-gray-200 overflow-hidden">
                {/* Standaard gecentreerd */}
                <TeamImage src={member.imageUrl} alt={member.name} width={320} height={320} quality={90} />
              </div>
              <h3 className="text-lg font-bold text-navy">{member.name}</h3>
              <p className="text-coral mb-4">{member.role}</p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={`mailto:${member.email}`}
                  aria-label={`Mail ${member.name}`}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-zinc-200 hover:bg-zinc-50"
                >
                  <Mail className="w-4 h-4 text-navy" />
                </a>
                <button
                  type="button"
                  onClick={() => onOpen(member)}
                  className="inline-flex items-center px-4 h-11 rounded-md bg-navy text-white hover:bg-[#15155e] text-sm"
                >
                  {`Over ${member.name.split(' ')[0]}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-navy mb-4">Neem contact op</h2>
        <p className="text-lg text-gray-700 mb-2">Voor algemene vragen zijn we bereikbaar via:</p>
        <a href="mailto:info@levendportret.nl" className="text-xl text-coral font-bold hover:underline">
          info@levendportret.nl
        </a>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onKeyDown={(e)=>{ if (e.key==='Escape') onClose(); trapFocus(e); }}>
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
            aria-describedby="team-modal-desc"
            className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4"
          >
            <div className="flex justify-end p-3">
              <button ref={closeBtnRef} onClick={onClose} className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-zinc-200 hover:bg-zinc-50" aria-label="Sluiten">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6 px-6 pb-6">
              <div className="w-full">
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <TeamImage src={selected.imageUrl} alt={selected.name} width={900} height={900} quality={95} loading="eager" priority />
                </div>
              </div>
              <div className="space-y-3">
                <h3 id="team-modal-title" className="text-2xl text-navy">{`Over ${selected.name.split(' ')[0]}`}</h3>
                <p id="team-modal-desc" className="text-gray-700 font-body text-sm leading-relaxed">{bios[selected.name] || 'Binnenkort beschikbaar.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
