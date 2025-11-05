export const metadata = {
  title: 'Levend Portret — Admin',
  description: 'Beheer en moderatie.'
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
