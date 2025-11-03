export const metadata = {
  title: 'Levend Portret Club',
  description: 'Overzicht bedrijven en bedrijfsdetail met clips.'
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
