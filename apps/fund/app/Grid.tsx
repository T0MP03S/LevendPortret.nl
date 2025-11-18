"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Lightbox from "./Lightbox";

export type Item = {
  id: string;
  vimeoId: string;
  companyName: string;
  companyDesc: string;
  website: string | null;
  slug: string;
  thumb: string | null;
  logoUrl: string | null;
};

export default function Grid({
  items,
  currentPage,
  pageCount,
}: {
  items: Item[];
  currentPage: number;
  pageCount: number;
}) {
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const mdToHtml = (s: string) => {
    const safe = escapeHtml(s || "");
    return safe
      .replace(/\*\*(.+?)\*\*/g, (_m, p1) => `<strong>${p1}</strong>`) // **bold**
      .replace(/__(.+?)__/g, (_m, p1) => `<strong>${p1}</strong>`) // __bold__
      .replace(/\n/g, "<br/>");
  };
  const [openId, setOpenId] = useState<string | null>(null);
  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items]);
  const openItem = openId ? byId[openId] : undefined;

  const detailHref = (slug: string) => {
    if (!slug) return "#";
    // In de Clips-app zelf gebruiken we een eigen detailpagina op /[slug]
    return `/${slug}`;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it) => (
          <div key={it.id} className="flex items-stretch gap-4 p-3 rounded-xl border border-zinc-200 bg-white shadow-sm">
            <button
              className="relative w-32 shrink-0 aspect-[9/16] overflow-hidden rounded-lg bg-zinc-100"
              onClick={() => setOpenId(it.id)}
              aria-label={`Speel clip van ${it.companyName}`}
            >
              {it.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.thumb} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-zinc-400">Geen thumbnail</div>
              )}
              <div className="absolute inset-0 grid place-items-center">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/70 text-white">▶</span>
              </div>
            </button>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center justify-between">
                {it.website ? (
                  <a
                    href={it.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-lg font-semibold hover:underline"
                  >
                    {it.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.logoUrl}
                        alt={it.companyName}
                        className="h-8 w-8 rounded-full border border-zinc-200 bg-white object-contain"
                      />
                    ) : null}
                    <span>{it.companyName}</span>
                  </a>
                ) : (
                  <a
                    href={detailHref(it.slug)}
                    className="inline-flex items-center gap-2 text-lg font-semibold hover:underline"
                  >
                    {it.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.logoUrl}
                        alt={it.companyName}
                        className="h-8 w-8 rounded-full border border-zinc-200 bg-white object-contain"
                      />
                    ) : null}
                    <span>{it.companyName}</span>
                  </a>
                )}
              </div>
              <p
                className="mt-2 text-sm text-zinc-600 line-clamp-4 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: mdToHtml(it.companyDesc) }}
              />
              <div className="pt-3 mt-auto flex justify-end">
                {it.website ? (
                  <a
                    href={it.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-md bg-coral text-white shadow hover:brightness-105 transition-colors"
                  >
                    Bekijk webpagina
                  </a>
                ) : it.slug ? (
                  <a
                    href={detailHref(it.slug)}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-md bg-coral text-white shadow hover:brightness-105 transition-colors"
                  >
                    Bekijk webpagina
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} pageCount={pageCount} />

      {openItem ? (
        <Lightbox vimeoId={openItem.vimeoId} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}

function Pagination({ currentPage, pageCount }: { currentPage: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Paginering">
      <PageLink page={Math.max(1, currentPage - 1)} disabled={currentPage === 1}>
        Vorige
      </PageLink>
      {pages.map((p) => (
        <PageLink key={p} page={p} active={p === currentPage}>
          {p}
        </PageLink>
      ))}
      <PageLink page={Math.min(pageCount, currentPage + 1)} disabled={currentPage === pageCount}>
        Volgende
      </PageLink>
    </nav>
  );
}

function PageLink({ page, children, active, disabled }: { page: number; children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  const cls = [
    "px-3 py-1 rounded-md border",
    active ? "bg-navy text-white border-navy" : "bg-white text-navy border-navy/30",
    disabled ? "opacity-50 pointer-events-none" : "hover:bg-navy hover:text-white",
  ].join(" ");
  return (
    <Link className={cls} href={page === 1 ? "/" : `/?page=${page}`}>
      {children}
    </Link>
  );
}
