'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-between px-6 md:px-14 pt-28 pb-12 bg-[#F4EBDD] overflow-hidden select-none">
      {/* Top Tag */}
      <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-[0.28em] text-[#57524C] border-b border-[#24211E]/10 pb-4">
        <span>ARCHITECTURAL FURNITURE STUDIO</span>
        <span>EDITION NO. 01</span>
      </div>

      {/* Main Center Composition with Big COMING SOON in Terracotta */}
      <div className="flex flex-col items-center text-center my-auto px-4">
        {/* Brand Name */}
        <span className="font-serif text-2xl md:text-4xl tracking-[0.3em] font-normal uppercase text-[#24211E] mb-3">
          JODO
        </span>

        {/* Big Heading in Terracotta Color */}
        <h1
          className="font-serif font-light uppercase tracking-[0.12em] leading-[0.9] text-[#C65F45] select-none"
          style={{ fontSize: 'clamp(3.5rem, 12.5vw, 10.5rem)' }}
        >
          COMING SOON
        </h1>
      </div>

      {/* Bottom Scroll Prompt */}
      <div className="flex flex-col items-center gap-3">
        <a
          href="#object-chair-section"
          className="group flex flex-col items-center gap-2 text-decoration-none"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#24211E] group-hover:text-[#C65F45] transition-colors">
            SCROLL TO ASSEMBLE
          </span>
          <div className="w-8 h-8 rounded-full border border-[#24211E]/20 group-hover:border-[#C65F45] flex items-center justify-center transition-all group-hover:translate-y-1">
            <ArrowDown className="w-3.5 h-3.5 text-[#C65F45] animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  );
};
