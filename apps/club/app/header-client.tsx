"use client";
import { Header } from "@levendportret/ui";
import { signOut } from "next-auth/react";

export default function HeaderClient({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null; status?: string | null } | null }) {
  return <Header user={user} onSignOut={() => signOut({ callbackUrl: "/" })} />;
}
