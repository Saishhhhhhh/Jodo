'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function StoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isComingSoon = pathname === '/coming-soon';

  // Prevent caret browsing from placing a blinking cursor on static text clicks
  React.useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }
      const selection = window.getSelection();
      // If the click merely collapsed at a point (caret browsing), remove it
      if (selection && selection.isCollapsed) {
        selection.removeAllRanges();
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

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
