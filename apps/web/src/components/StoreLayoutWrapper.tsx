'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import { Sparkles } from 'lucide-react';

export default function StoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isComingSoon = pathname === '/';

  // If on the root Coming Soon landing page, let ComingSoonPage handle its own navigation & footer
  if (isComingSoon) {
    return <>{children}</>;
  }

  // On all other storefront pages (/home, /shop, /products, etc.), render full store navigation & footer
  return (
    <>
      {/* Launch Announcement Pill Banner */}
      <div className="w-full bg-[#C65F45] text-[#FAF6F0] py-2 px-4 text-center text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-2 sticky top-0 z-[110] shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Inaugural Collection Launching Soon</span>
        <span className="hidden sm:inline">·</span>
        <Link
          href="/"
          className="underline font-semibold hover:text-[#24211E] transition-colors ml-1"
        >
          View 3D Assembly Experience →
        </Link>
      </div>

      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
