import './globals.css';
import React from 'react';
import { Footer } from '@levendportret/ui';
import HeaderClient from './header-client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import Providers from './providers';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://levendportret.nl'),
  title: 'Levend Portret — het eerlijke verhaal',
  description: 'Welkomstpagina, propositie en aanmelding voor Levend Portret.',
  openGraph: {
    title: 'Levend Portret — het eerlijke verhaal',
    description: 'Welkomstpagina, propositie en aanmelding voor Levend Portret.',
    url: 'https://levendportret.nl',
    siteName: 'Levend Portret',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Levend Portret' }],
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Levend Portret — het eerlijke verhaal',
    description: 'Welkomstpagina, propositie en aanmelding voor Levend Portret.',
    images: ['/og.png'],
  },
};

const fontLinks = (
  <>
    <link rel="preload" as="font" type="font/woff2" href="/fonts/Bree Regular.woff2" crossOrigin="anonymous" />
    <link rel="preload" as="font" type="font/woff2" href="/fonts/Bree Bold.woff2" crossOrigin="anonymous" />
    <link rel="stylesheet" href="https://use.typekit.net/jkw7vng.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet" />
  </>
);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="nl">
      <head>
        {fontLinks}
      </head>
      <body className="min-h-screen bg-gray-50 text-zinc-900 antialiased font-body">
        <Providers session={session}>
          <HeaderClient user={session?.user} />
          <main className="min-h-[calc(100vh-200px)]">{children}</main>
          <Footer />
        </Providers>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src={process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || 'https://plausible.io/js/script.js'}
          />
        ) : null}
      </body>
    </html>
  );
}
