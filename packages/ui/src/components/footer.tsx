import Link from "next/link";
import { Button } from "./button";

export function Footer() {
  const WEB = (process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000').replace(/\/$/, '');
  const CLUB = (process.env.NEXT_PUBLIC_CLUB_URL || 'http://localhost:3001').replace(/\/$/, '');
  const CLIPS = (process.env.NEXT_PUBLIC_CLIPS_URL || 'http://localhost:3002').replace(/\/$/, '');
  return (
    <footer className="w-full bg-navy text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div>
            {/* Logo boven de tekst */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Levend Portret" className="h-8 mb-3" />
            <p className="text-white/80 text-sm leading-relaxed">
              U heeft een geweldig idee. Nu is het tijd om de wereld dat te laten weten. Onze coaching is speciaal ontworpen voor ondernemers die direct impact willen maken met een helder en visueel krachtig marketingverhaal én die willen bouwen aan een netwerk.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigatie</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={CLIPS} className="text-white/70 hover:text-coral transition-colors">Clips</Link>
              </li>
              <li>
                <Link href={CLUB} className="text-white/70 hover:text-coral transition-colors">Club</Link>
              </li>
              <li>
                <Link href={`${WEB}/coach`} className="text-white/70 hover:text-coral transition-colors">Coach</Link>
              </li>
              <li>
                <Link href={`${WEB}/fund`} className="text-white/70 hover:text-coral transition-colors">Fund</Link>
              </li>
              <li>
                <Link href={`${WEB}/even-voorstellen`} className="text-white/70 hover:text-coral transition-colors">Even voorstellen</Link>
              </li>
              <li>
                <Link href={`${WEB}/privacy`} className="text-white/70 hover:text-coral transition-colors">Privacy</Link>
              </li>
              <li>
                <Link href={`${WEB}/voorwaarden`} className="text-white/70 hover:text-coral transition-colors">Voorwaarden</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-white/70 text-sm mb-4">info@levendportret.nl</p>
            <div className="mt-4">
              <a href="mailto:info@levendportret.nl">
                <Button variant="coral" size="sm">Mail ons</Button>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
          <p>© {new Date().getFullYear()} Levend Portret. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
}

