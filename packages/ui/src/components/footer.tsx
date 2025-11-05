import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";

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
                <Link href="/" className="text-white/70 hover:text-coral transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/even-voorstellen" className="text-white/70 hover:text-coral transition-colors">
                  Even voorstellen
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-coral transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/voorwaarden" className="text-white/70 hover:text-coral transition-colors">
                  Voorwaarden
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-white/70 text-sm mb-4">info@levendportret.nl</p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-coral transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-coral transition-colors"
              >
                <Linkedin className="w-5 h-5" />
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
