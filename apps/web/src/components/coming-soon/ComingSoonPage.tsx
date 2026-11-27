'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SofaScene to prevent server-side WebGL evaluation
const SofaScene = dynamic(
  () => import('./SofaScene').then((mod) => mod.SofaScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center bg-[#F5EFE6]">
        <img
          src="/logo.png"
          alt="JODO"
          className="w-32 md:w-40 h-auto animate-pulse select-none"
        />
      </div>
    ),
  }
);

export default function ComingSoonPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#F5EFE6] text-[#24211E]">
      {/* Main Single Scroll Assembly & Coming Soon Experience */}
      <main className="relative w-full">
        <SofaScene />
      </main>
    </div>
  );
}
