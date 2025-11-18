import "./globals.css";
import React from "react";
import { Footer } from "@levendportret/ui";
import HeaderClient from "./header-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@levendportret/auth";
import Providers from "./providers";
import HideChrome from "./hide-chrome";

export const metadata = {
  title: "Levend Portret — Funds",
  description: "Overzicht en detail van funds (doneren in v2).",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="nl">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/jkw7vng.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gray-50 text-zinc-900 antialiased font-heading">
        <Providers session={session}>
          <HideChrome>
            <HeaderClient user={session?.user} />
          </HideChrome>
          <main className="min-h-[calc(100vh-200px)]">{children}</main>
          <HideChrome>
            <Footer />
          </HideChrome>
        </Providers>
      </body>
    </html>
  );
}
