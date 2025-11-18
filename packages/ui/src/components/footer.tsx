import Link from "next/link";
import { Button } from "./button";

export function Footer() {
  return (
    <footer className="w-full bg-navy text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div>
            <img src="/logo.svg" alt="Levend Portret" className="h-8 mb-2" />
            <p className="text-white/70 text-sm">Het eerlijke verhaal</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigatie</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="http://localhost:3002" className="text-white/70 hover:text-coral transition-colors">Clips</Link>
              </li>
              <li>
                <Link href="http://localhost:3001" className="text-white/70 hover:text-coral transition-colors">Club</Link>
              </li>
              <li>
                <Link href="http://localhost:3000/coach" className="text-white/70 hover:text-coral transition-colors">Coach</Link>
              </li>
              <li>
                <Link href="http://localhost:3000/fund" className="text-white/70 hover:text-coral transition-colors">Fund</Link>
              </li>
              <li>
                <Link href="http://localhost:3000/even-voorstellen" className="text-white/70 hover:text-coral transition-colors">Even voorstellen</Link>
              </li>
              <li>
                <Link href="http://localhost:3000/privacy" className="text-white/70 hover:text-coral transition-colors">Privacy</Link>
              </li>
              <li>
                <Link href="http://localhost:3000/voorwaarden" className="text-white/70 hover:text-coral transition-colors">Voorwaarden</Link>
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
