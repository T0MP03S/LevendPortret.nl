"use client";
import { useEffect, useRef, useState } from "react";

export default function VideoEmbed({ vimeoId, roundedCls, title = "Video" }: { vimeoId: string; roundedCls?: string; title?: string }) {
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wrapRef.current || visible) return;
    const el = wrapRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={wrapRef} className={`w-full aspect-video overflow-hidden bg-black ${roundedCls || ''}`}>
      {visible ? (
        <iframe
          src={`https://player.vimeo.com/video/${encodeURIComponent(vimeoId)}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          title={title}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full" />
      )}
    </div>
  );
}
