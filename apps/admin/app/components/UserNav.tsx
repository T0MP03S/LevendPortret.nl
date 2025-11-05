"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export function UserNav() {
  const { data: session } = useSession();
  const name = (session?.user as any)?.name as string | undefined;
  const email = session?.user?.email || "";
  const role = (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/90 hidden sm:inline">
        {name ? `Hallo, ${name}` : email}
      </span>
      <Link href="/dashboard" className="text-sm underline hidden sm:inline">Dashboard</Link>
      <button
        onClick={() => signOut({ callbackUrl: "/inloggen" })}
        className="px-3 py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20 text-sm"
      >
        Uitloggen
      </button>
    </div>
  );
}
