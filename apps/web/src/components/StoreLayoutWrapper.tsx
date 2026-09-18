'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function StoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isComingSoon = pathname === '/coming-soon';

  // If on /coming-soon, let ComingSoonPage handle its own full-screen canvas
  if (isComingSoon) {
    return <>{children}</>;
  }

  // Clean storefront navigation & footer with no top bar
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
