"use client";
import Link from "next/link";
import { Button } from "./button";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  user?: { name?: string | null; email?: string | null; image?: string | null } | null;
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
              <div className="hidden md:flex items-center space-x-2 text-white font-heading">
                <User className="w-5 h-5" />
                <span className="text-sm">{user.name || user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="border border-white text-white hover:bg-white hover:text-navy"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Uitloggen
              </Button>
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
