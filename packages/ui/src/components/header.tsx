"use client";
import Link from "next/link";
import { Button } from "./button";
import { LogOut, User, Menu, X } from "lucide-react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      const inAccount = accountRef.current?.contains(target);
      const inMobileNav = mobileNavRef.current?.contains(target);
      if (!inAccount) setOpen(false);
      if (!inMobileNav) setMobileNavOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="w-full px-4 pt-4">
      <header className="max-w-7xl mx-auto bg-navy rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="http://localhost:3000/" className="flex items-center">
          {/* Logo iets kleiner op mobiel */}
          <img src="/logo.svg" alt="Levend Portret" className="h-7 md:h-8" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-heading">
          <Link href="http://localhost:3001" className="text-white hover:text-coral transition-colors">
            Club
          </Link>
          <Link href="http://localhost:3002" className="text-white hover:text-coral transition-colors">
            Fund
          </Link>
          <Link href="http://localhost:3002" className="text-white hover:text-coral transition-colors">
            Clips
          </Link>
          <Link href="http://localhost:3000/even-voorstellen" className="text-white hover:text-coral transition-colors">
            Even voorstellen
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {/* Burger-menu voor mobiel */}
          <div className="md:hidden" ref={mobileNavRef}>
            <button
              type="button"
              onClick={() => setMobileNavOpen(v => !v)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/60 text-white hover:bg-white/10"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {mobileNavOpen && (
              <div className="absolute left-4 right-4 mt-3 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-40 font-heading">
                <nav className="flex flex-col divide-y divide-zinc-100 text-sm">
                  <Link href="http://localhost:3001" className="px-4 py-3 hover:bg-zinc-50" onClick={()=>setMobileNavOpen(false)}>
                    Club
                  </Link>
                  <Link href="http://localhost:3002" className="px-4 py-3 hover:bg-zinc-50" onClick={()=>setMobileNavOpen(false)}>
                    Fund
                  </Link>
                  <Link href="http://localhost:3002" className="px-4 py-3 hover:bg-zinc-50" onClick={()=>setMobileNavOpen(false)}>
                    Clips
                  </Link>
                  <Link href="/even-voorstellen" className="px-4 py-3 hover:bg-zinc-50" onClick={()=>setMobileNavOpen(false)}>
                    Even voorstellen
                  </Link>
                </nav>
              </div>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="relative" ref={accountRef}>
                {/* Desktop: naam + icoon */}
                <button onClick={() => setOpen((v) => !v)} className="hidden md:inline-flex items-center gap-2 h-9 px-2 text-white font-heading hover:text-coral align-middle">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.name || user.email}</span>
                </button>
                {/* Mobiel: alleen icoon / avatar */}
                <button onClick={() => setOpen((v) => !v)} className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/60 text-white hover:bg-white/10">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name || user.email || 'Account'} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black/5 overflow-hidden z-50">
                    <div className="py-1 text-sm text-zinc-800">
                      {user.status !== 'ACTIVE' ? (
                        <Link href="http://localhost:3000/in-behandeling" className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setOpen(false)}>In behandeling</Link>
                      ) : (
                        <Link href="http://localhost:3000/instellingen" className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setOpen(false)}>Instellingen</Link>
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
              <Link href="http://localhost:3000/inloggen">
                <Button variant="ghost" size="sm">
                  Inloggen
                </Button>
              </Link>
              <Link href="http://localhost:3000/aanmelden">
                <Button variant="coral" size="sm">
                  Aanmelden
                </Button>
              </Link>
            </>
          )}
        </div>
        {/* einde: flex items container */}
      </div>
      </header>
    </div>
  );
}
