"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Slideshow({ images, rounded }: { images: { url: string }[]; rounded: boolean }) {
  const safe = Array.isArray(images) ? images.filter((g)=> typeof g?.url === 'string' && g.url) : [];
  const [idx, setIdx] = useState(0);
  if (safe.length === 0) return null;
  const prev = () => setIdx((i) => (i === 0 ? safe.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === safe.length - 1 ? 0 : i + 1));
  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={safe[idx].url} alt="" loading="lazy" className={`w-full h-full object-cover ${rounded ? 'rounded-xl' : ''}`} />
      {safe.length > 1 && (
        <>
          <button type="button" aria-label="Vorige" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/60">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button type="button" aria-label="Volgende" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/60">
            <ArrowRight className="w-5 h-5" />
          </button>
        </>
      )}
      {safe.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {safe.map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
