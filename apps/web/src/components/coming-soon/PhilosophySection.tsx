'use client';

import React from 'react';
import { Compass, Hammer, Feather } from 'lucide-react';

export const PhilosophySection: React.FC = () => {
  return (
    <section className="relative w-full py-32 md:py-48 px-6 md:px-14 bg-[#F4EBDD] border-t border-b border-[#24211E]/10 overflow-hidden">
      {/* Background Architectural Accent lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full max-w-7xl mx-auto border-x border-[#24211E]/15 grid grid-cols-3 md:grid-cols-4" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Index pill */}
        <div className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#C65F45]">
            PHILOSOPHY 01
          </span>
          <div className="w-12 h-px bg-[#C65F45]" />
        </div>

        {/* Large Editorial Headline */}
        <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#24211E] tracking-tight uppercase leading-[0.95] mb-12">
          MADE TO COME <br />
          <span className="italic font-normal text-[#C65F45]">TOGETHER.</span>
        </h2>

        {/* Supporting Editorial Statement */}
        <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#24211E] font-light leading-relaxed max-w-3xl mb-20">
          Thoughtful forms. Honest materials. Furniture designed for the way life actually happens.
        </p>

        {/* Three Editorial Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-[#24211E]/15">
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#8E867E] flex items-center gap-2">
              <Hammer className="w-3.5 h-3.5 text-[#C65F45]" />
              <span>01 / FRICTION JOINERY</span>
            </div>
            <h3 className="font-serif text-2xl text-[#24211E] font-normal">
              No Glue. No Disposability.
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#57524C] leading-relaxed">
              Every leg, stretcher, and arch interlocks mechanically with millimeter tolerance. You
              can assemble, disassemble, and move your pieces across homes without degradation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#8E867E] flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[#C65F45]" />
              <span>02 / CONTEMPORARY INDIAN</span>
            </div>
            <h3 className="font-serif text-2xl text-[#24211E] font-normal">
              Rooted in Subcontinental Modernism
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#57524C] leading-relaxed">
              Drawing inspiration from Chandigarh modernism, Ahmedabad brick architecture, and
              centuries of Indian joinery traditions refined into modern geometric calm.
            </p>
          </div>

          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#8E867E] flex items-center gap-2">
              <Feather className="w-3.5 h-3.5 text-[#C65F45]" />
              <span>03 / TACTILE PATINA</span>
            </div>
            <h3 className="font-serif text-2xl text-[#24211E] font-normal">
              Materials that Age With Grace
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#57524C] leading-relaxed">
              Solid seasoned teak, raw brushed brass dowels, and warm natural terracotta finishes
              that deepen in warmth and character over decades of touch.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
