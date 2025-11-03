export const metadata = {
  title: 'Levend Portret — Funds',
  description: 'Overzicht en detail van funds (doneren in v2).'
};

import './globals.css';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
