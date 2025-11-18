"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function HeaderNav({
  name,
  logoUrl,
  accent,
  rounded,
  titleFont,
  hasGallery,
  showContact,
  showNameNextToLogo = true,
}: {
  name: string;
  logoUrl?: string | null;
  accent: string;
  rounded: boolean;
  titleFont: string;
  hasGallery: boolean;
  showContact: boolean;
  showNameNextToLogo?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const roundedCls = rounded ? "rounded-xl" : "";
  const linkCls = "px-3 py-1.5 text-sm rounded-md text-white hover:opacity-90";
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-zinc-200">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-3" style={{ fontFamily: `'${titleFont}', sans-serif` }}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={name} className={`h-10 w-10 object-contain border border-zinc-200 bg-white ${roundedCls}`} />
            ) : null}
            {showNameNextToLogo ? (
              <span className="text-lg font-semibold">{name}</span>
            ) : null}
          </div>
          <div className="md:hidden">
            <button
              aria-label={open ? 'Sluit menu' : 'Open menu'}
              aria-expanded={open}
              onClick={()=>setOpen(o=>!o)}
              className="p-2 rounded-md border border-zinc-300 hover:bg-zinc-50"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <a href="#video" className={linkCls} style={{ background: accent }}>Video</a>
            <a href="#over-ons" className={linkCls} style={{ background: accent }}>Over ons</a>
            {hasGallery && (
              <a href="#fotos" className={linkCls} style={{ background: accent }}>Foto's</a>
            )}
            {showContact && (
              <a href="#contact" className={linkCls} style={{ background: accent }}>Contact</a>
            )}
          </nav>
        </div>
        {open && (
          <div className="mt-2 md:hidden">
            <nav className="flex flex-col gap-2">
              <a onClick={()=>setOpen(false)} href="#video" className={linkCls} style={{ background: accent }}>Video</a>
              <a onClick={()=>setOpen(false)} href="#over-ons" className={linkCls} style={{ background: accent }}>Over ons</a>
              {hasGallery && (
                <a onClick={()=>setOpen(false)} href="#fotos" className={linkCls} style={{ background: accent }}>Foto's</a>
              )}
              {showContact && (
                <a onClick={()=>setOpen(false)} href="#contact" className={linkCls} style={{ background: accent }}>Contact</a>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
