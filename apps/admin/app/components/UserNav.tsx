"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { User as UserIcon, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";

export function UserNav() {
  const { data: session } = useSession();
  const name = (session?.user as any)?.name as string | undefined;
  const email = session?.user?.email || "";
  const role = (session?.user as any)?.role;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (ref.current && ref.current.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!session?.user || role !== "ADMIN") return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20"
      >
        <UserIcon className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">{name || email}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-zinc-800 rounded-md shadow-lg ring-1 ring-black/5 z-50">
          <nav className="py-1 text-sm">
            <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/inloggen" }); }}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50 text-left"
            >
              <LogOut className="w-4 h-4" /> Uitloggen
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
