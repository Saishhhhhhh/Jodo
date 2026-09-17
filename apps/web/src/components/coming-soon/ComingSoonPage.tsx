'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ChairScene to prevent server-side WebGL evaluation
const ChairScene = dynamic(
  () => import('./ChairScene').then((mod) => mod.ChairScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#F4EBDD] text-[#24211E]">
        <div className="font-serif text-3xl md:text-5xl uppercase tracking-[0.25em] text-[#C65F45] animate-pulse mb-4">
          JODO
        </div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#8E867E]">
          Loading 3D Experience...
        </div>
      </div>
    ),
  }
);

export default function ComingSoonPage() {
  return (
    <div className="relative w-full min-h-screen bg-[#F4EBDD] text-[#24211E]">
      {/* Subtle Cinematic Film Grain Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Main Single Scroll Assembly & Coming Soon Experience */}
      <main className="relative w-full">
        <ChairScene />
      </main>
    </div>
  );
}
