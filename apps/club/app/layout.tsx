import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Levend Portret Club',
  description: 'Club – tips, nieuws en ledenomgeving.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

import './globals.css';
import React from 'react';
import { Footer } from '@levendportret/ui';
import HeaderClient from './header-client';
import Providers from './providers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';

const fontLinks = (
  <>
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
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/site.webmanifest?v=2" />
      </head>
      <body className="min-h-screen bg-gray-50 text-zinc-900 antialiased font-body">
        <Providers session={session}>
          <HeaderClient user={session?.user} />
          <main className="min-h-[calc(100vh-200px)]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
