"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { LogOut, User, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  user?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null; status?: string | null } | null;
  onSignOut?: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const pathname = usePathname();
  const [host, setHost] = useState<string | null>(null);
  const [hostname, setHostname] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.host);
      setHostname(window.location.hostname);
    }
  }, []);
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  const clipsActive = isLocal ? (!!host && host.includes(':3002')) : (hostname?.split('.')[0] === 'clips');
  const clubActive = isLocal ? (!!host && host.includes(':3001')) : (hostname?.split('.')[0] === 'club');
  const adminActive = isLocal ? (!!host && host.includes(':3003')) : (hostname?.split('.')[0] === 'admin');
  const coachActive = pathname?.startsWith('/coach') ?? false;
  const fundActive = pathname?.startsWith('/fund') ?? false;
  const evenActive = pathname?.startsWith('/even-voorstellen') ?? false;
  const WEB = ((process.env.NEXT_PUBLIC_WEB_URL && process.env.NEXT_PUBLIC_WEB_URL.length > 0)
    ? process.env.NEXT_PUBLIC_WEB_URL
    : (typeof window !== 'undefined'
      ? (() => {
          const { protocol, hostname } = window.location;
          const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
          if (isLocal) return 'http://localhost:3000';
          const parts = hostname.split('.');
          const apex = parts.slice(-2).join('.');
          return `${protocol}//${apex}`;
        })()
      : 'http://localhost:3000')
  ).replace(/\/$/, '');
  const resolveBase = (sub: 'admin' | 'club' | 'clips', envVar?: string, devFallback?: string) => {
    const env = (envVar || '').trim();
    if (env.length > 0) return env.replace(/\/$/, '');
    if (typeof window === 'undefined') return (devFallback || '').replace(/\/$/, '');
    const { protocol, hostname } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) return (devFallback || '').replace(/\/$/, '');
    const parts = hostname.split('.');
    const apex = parts.slice(-2).join('.');
    return `${protocol}//${sub}.${apex}`;
  };
  const CLUB = resolveBase('club', process.env.NEXT_PUBLIC_CLUB_URL, 'http://localhost:3001');
  const CLIPS = resolveBase('clips', process.env.NEXT_PUBLIC_CLIPS_URL, 'http://localhost:3002');
  const ADMIN = resolveBase('admin', process.env.NEXT_PUBLIC_ADMIN_URL, 'http://localhost:3003');
  const onWeb = !clipsActive && !clubActive && !adminActive;
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
  const [hidePendingLink, setHidePendingLink] = useState(false);
  useEffect(() => {
    try {
      if (typeof document === 'undefined') return;
      const raw = document.cookie.split('; ').find(x => x.startsWith('lp_pending_seen_at='));
      if (!raw) { setHidePendingLink(false); return; }
      const value = raw.split('=')[1];
      const ts = parseInt(value, 10);
      if (!isNaN(ts)) {
        const ageMs = Date.now() - ts;
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        setHidePendingLink(ageMs >= sevenDaysMs);
      } else {
        setHidePendingLink(false);
      }
    } catch {}
  }, []);
  return (
    <div className="w-full px-4 pt-2 md:pt-4">
      <header className="max-w-7xl mx-auto bg-navy rounded-2xl shadow-lg pl-2 pr-2 py-1 md:px-6 md:py-4 flex items-center justify-between relative">
        {/* Logo */}
        <Link href={onWeb ? '/' : `${WEB}/`} className="flex items-center">
          {/* Logo iets kleiner op mobiel */}
          <img src="/logo.svg" alt="Levend Portret" className="h-5 md:h-8 -ml-4" width={112} height={32} />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-heading">
          <Link href={CLIPS} aria-current={clipsActive ? 'page' : undefined} className={(clipsActive ? 'text-coral ' : 'text-white hover:text-coral ') + 'transition-colors'}>
            Clips
          </Link>
          <Link href={CLUB} aria-current={clubActive ? 'page' : undefined} className={(clubActive ? 'text-coral ' : 'text-white hover:text-coral ') + 'transition-colors'}>
            Club
          </Link>
          <Link href={onWeb ? '/coach' : `${WEB}/coach`} aria-current={coachActive ? 'page' : undefined} className={(coachActive ? 'text-coral ' : 'text-white hover:text-coral ') + 'transition-colors'}>
            Coach
          </Link>
          <Link href={onWeb ? '/fund' : `${WEB}/fund`} aria-current={fundActive ? 'page' : undefined} className={(fundActive ? 'text-coral ' : 'text-white hover:text-coral ') + 'transition-colors'}>
            Fund
          </Link>
          <Link href={onWeb ? '/even-voorstellen' : `${WEB}/even-voorstellen`} aria-current={evenActive ? 'page' : undefined} className={(evenActive ? 'text-coral ' : 'text-white hover:text-coral ') + 'transition-colors'}>
            Even voorstellen
          </Link>
        </nav>

        <div className="flex items-center space-x-0 md:space-x-3">
          {/* Burger-menu voor mobiel */}
          <div className="md:hidden" ref={mobileNavRef}>
            <button
              type="button"
              onClick={() => setMobileNavOpen(v => !v)}
              className="inline-flex items-center justify-center h-9 w-9 text-white hover:text-coral"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {mobileNavOpen && (
              <div className="absolute right-4 left-auto mt-3 w-64 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-40 font-heading">
                <nav className="flex flex-col divide-y divide-zinc-100 text-sm">
                  <Link href={CLIPS} aria-current={clipsActive ? 'page' : undefined} className={(clipsActive ? 'bg-zinc-50 ' : '') + 'px-4 py-3 hover:bg-zinc-50'} onClick={()=>setMobileNavOpen(false)}>Clips</Link>
                  <Link href={CLUB} aria-current={clubActive ? 'page' : undefined} className={(clubActive ? 'bg-zinc-50 ' : '') + 'px-4 py-3 hover:bg-zinc-50'} onClick={()=>setMobileNavOpen(false)}>Club</Link>
                  <Link href={onWeb ? '/coach' : `${WEB}/coach`} aria-current={coachActive ? 'page' : undefined} className={(coachActive ? 'bg-zinc-50 ' : '') + 'px-4 py-3 hover:bg-zinc-50'} onClick={()=>setMobileNavOpen(false)}>Coach</Link>
                  <Link href={onWeb ? '/fund' : `${WEB}/fund`} aria-current={fundActive ? 'page' : undefined} className={(fundActive ? 'bg-zinc-50 ' : '') + 'px-4 py-3 hover:bg-zinc-50'} onClick={()=>setMobileNavOpen(false)}>Fund</Link>
                  <Link href={onWeb ? '/even-voorstellen' : `${WEB}/even-voorstellen`} aria-current={evenActive ? 'page' : undefined} className={(evenActive ? 'bg-zinc-50 ' : '') + 'px-4 py-3 hover:bg-zinc-50'} onClick={()=>setMobileNavOpen(false)}>Even voorstellen</Link>
                  {!user ? (
                    <div className="p-3 grid grid-cols-2 gap-2">
                      <Link href={onWeb ? '/inloggen' : `${WEB}/inloggen`} onClick={()=>setMobileNavOpen(false)} className="inline-flex items-center justify-center h-8 rounded-md border border-zinc-300 text-zinc-800 hover:bg-zinc-50 text-sm">Inloggen</Link>
                      <Link href={onWeb ? '/aanmelden' : `${WEB}/aanmelden`} onClick={()=>setMobileNavOpen(false)} className="inline-flex items-center justify-center h-8 rounded-md bg-coral text-white hover:bg-[#e14c61] text-sm">Aanmelden</Link>
                    </div>
                  ) : null}
                </nav>
              </div>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center space-x-4">
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
                      {/* Toon Instellingen altijd voor ingelogde gebruikers */}
                      <Link href={`${WEB}/instellingen`} className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setOpen(false)}>Instellingen</Link>
                      {/* Voor niet-ACTIVE gebruikers: laat tijdelijk ook In behandeling zien (verdwijnt na 7 dagen) */}
                      {user.status !== 'ACTIVE' && !hidePendingLink ? (
                        <Link href={`${WEB}/in-behandeling`} className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setOpen(false)}>In behandeling</Link>
                      ) : null}
                      <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 text-left">
                        <LogOut className="w-4 h-4" /> Uitloggen
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {user.role === 'ADMIN' ? (
                <Link href={`${ADMIN}/dashboard`}>
                <Button variant="ghost" size="sm" className="border border-white text-white hover:bg-white hover:text-navy">
                  Dashboard
                </Button>
              </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link href={onWeb ? '/inloggen' : `${WEB}/inloggen`}>
                <Button variant="ghost" size="sm">
                  Inloggen
                </Button>
              </Link>
              <Link href={onWeb ? '/aanmelden' : `${WEB}/aanmelden`}>
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
