import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: {
    default: 'Jodo Admin',
    template: '%s — Jodo Admin',
  },
  description: 'Jodo Admin',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans text-[15px] antialiased">
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
