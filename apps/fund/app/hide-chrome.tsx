"use client";

import { usePathname } from "next/navigation";

export default function HideChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isSlugPage = /^\/[A-Za-z0-9-_]+$/.test(pathname) && pathname !== "/";
  if (isSlugPage) return null;
  return <>{children}</>;
}
