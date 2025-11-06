"use client";
import Link from "next/link";
import { Button } from "./button";
import { LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null; status?: string | null } | null;
  onSignOut?: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const handleSignOut = () => {
    if (onSignOut) return onSignOut();
    if (typeof window !== 'undefined') {
      const callbackUrl = encodeURIComponent('/');
      window.location.href = `/api/auth/signout?callbackUrl=${callbackUrl}`;
    }
  };
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="w-full px-4 pt-4">
      <header className="max-w-7xl mx-auto bg-navy rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Levend Portret" className="h-8" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-heading">
          <Link href="/" className="text-white hover:text-coral transition-colors">
            Home
          </Link>
          <Link href="http://localhost:3001" className="text-white hover:text-coral transition-colors">
            Club
          </Link>
          <Link href="http://localhost:3002" className="text-white hover:text-coral transition-colors">
            Fund
          </Link>
          <Link href="/even-voorstellen" className="text-white hover:text-coral transition-colors">
            Even voorstellen
          </Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="relative" ref={ref}>
                <button onClick={() => setOpen((v) => !v)} className="hidden md:inline-flex items-center space-x-2 text-white font-heading hover:text-coral">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.name || user.email}</span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden z-50">
                    <div className="py-1 text-sm text-zinc-800">
                      {user.status !== 'ACTIVE' ? (
                        <Link href="/in-behandeling" className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setOpen(false)}>In behandeling</Link>
                      ) : (
                        <Link href="/profiel/bewerken" className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setOpen(false)}>Profiel/bedrijf bewerken</Link>
                      )}
                      <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 text-left">
                        <LogOut className="w-4 h-4" /> Uitloggen
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {user.role === 'ADMIN' ? (
                <Link href="http://localhost:3003/dashboard">
                  <Button variant="ghost" size="sm" className="border border-white text-white hover:bg-white hover:text-navy">
                    Dashboard
                  </Button>
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link href="/inloggen">
                <Button variant="ghost" size="sm">
                  Inloggen
                </Button>
              </Link>
              <Link href="/aanmelden">
                <Button variant="coral" size="sm">
                  Aanmelden
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

