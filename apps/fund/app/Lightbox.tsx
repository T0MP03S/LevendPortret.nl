"use client";

import { useEffect } from "react";

type LightboxProps = {
  vimeoId: string;
  onClose: () => void;
};

export default function Lightbox({ vimeoId, onClose }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] md:max-w-[560px] md:max-h-[90vh] aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Sluiten"
          className="absolute top-3 right-3 bg-white text-black rounded-full w-9 h-9 shadow-md hover:bg-zinc-100"
        >
          ×
        </button>
        <iframe
          className="w-full h-full"
          src={`https://player.vimeo.com/video/${encodeURIComponent(
            vimeoId
          )}?autoplay=1&muted=0&title=0&byline=0&portrait=0`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Clip"
        />
      </div>
    </div>
  );
}
