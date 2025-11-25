import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Levend Portret — Admin',
  description: 'Beheer en moderatie.',
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
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@levendportret/auth';
import type { Session } from 'next-auth';
import { Providers } from './providers';
import { UserNav } from './components/UserNav';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/site.webmanifest?v=2" />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <Providers session={session}>
          <header className="bg-transparent">
            <div className="max-w-5xl mx-auto px-6 py-6">
              <div className="bg-navy text-white rounded-2xl shadow-md px-5 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <img src="/logo.svg" alt="Levend Portret" className="h-8 w-auto" />
                  <span className="font-semibold tracking-wide">Admin</span>
                </Link>
                {session?.user && (session.user as any).role === 'ADMIN' ? (
                  <UserNav />
                ) : null}
              </div>
            </div>
          </header>
          <main className="max-w-3xl mx-auto px-6 py-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
