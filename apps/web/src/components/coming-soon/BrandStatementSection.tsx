'use client';

import React from 'react';

export const BrandStatementSection: React.FC = () => {
  return (
    <section
      id="brand-statement-section"
      className="relative w-full min-h-screen py-36 md:py-48 px-6 md:px-14 bg-[#C65F45] text-[#F4EBDD] flex flex-col justify-between overflow-hidden select-none transition-colors duration-700"
    >
      {/* Moving subtle architectural sunlight shadow effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
        <div className="absolute -top-1/4 -right-1/4 w-[140vw] h-[140vh] bg-gradient-to-br from-white/20 via-transparent to-black/30 transform rotate-12 blur-3xl animate-pulse duration-[10000ms]" />
        <div className="absolute top-1/3 -left-1/4 w-96 h-96 bg-[#9F4635] rounded-full blur-3xl" />
      </div>

      {/* Top Header line */}
      <div className="relative z-10 w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] text-[#F4EBDD]/70 border-b border-[#F4EBDD]/20 pb-4">
        <span>03 / THE MANIFESTO</span>
        <span>JODO ESSENCE</span>
      </div>

      {/* Center Statement with Massive Editorial Typography */}
      <div className="relative z-10 max-w-5xl my-auto py-12">
        <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light leading-[1.05] tracking-tight mb-8 text-[#FAF6F0]">
          Furniture is more than what fills a room.
        </h2>

        <p className="font-serif italic text-2xl sm:text-4xl md:text-6xl text-[#F4EBDD]/90 font-normal leading-[1.1] tracking-tight">
          It shapes how we live in it.
        </p>
      </div>

      {/* Bottom Coordinates & Material Note */}
      <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-xs font-mono tracking-widest text-[#F4EBDD]/75 pt-6 border-t border-[#F4EBDD]/20">
        <div className="max-w-md text-xs font-sans text-[#F4EBDD]/80 leading-relaxed font-light">
          We strip away artificial laminates, fleeting trends, and disposable flat-pack fasteners to
          reveal the quiet dignity of solid craftsmanship.
        </div>
        <div className="text-right">
          <span className="uppercase text-[10px] tracking-[0.25em]">CRAFTED WITH HONESTY</span>
        </div>
      </div>
    </section>
  );
};
