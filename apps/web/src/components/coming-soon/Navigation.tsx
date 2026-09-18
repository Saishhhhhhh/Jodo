'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Store, Shield } from 'lucide-react';
import { soundEngine } from '@/audio/woodSound';

interface NavigationProps {
  currentSectionTheme?: 'cream' | 'terracotta';
}

export const Navigation: React.FC<NavigationProps> = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isTerracottaBg, setIsTerracottaBg] = useState<boolean>(false);

  const toggleSound = () => {
    const newState = soundEngine.toggle();
    setSoundEnabled(newState);
  };

  useEffect(() => {
    // Observe terracotta sections to automatically flip navigation colors
    const checkContrast = () => {
      const terracottaSection = document.getElementById('brand-statement-section');
      if (!terracottaSection) return;

      const rect = terracottaSection.getBoundingClientRect();
      // If the top nav (around y = 50px) overlaps with the terracotta section
      if (rect.top <= 60 && rect.bottom >= 40) {
        setIsTerracottaBg(true);
      } else {
        setIsTerracottaBg(false);
      }
    };

    window.addEventListener('scroll', checkContrast, { passive: true });
    checkContrast();

    return () => window.removeEventListener('scroll', checkContrast);
  }, []);

  const textColorClass = isTerracottaBg ? 'text-[#F4EBDD]' : 'text-[#24211E]';
  const mutedColorClass = isTerracottaBg ? 'text-[#F4EBDD]/70' : 'text-[#57524C]';

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 px-6 md:px-14 py-6 flex items-center justify-between transition-colors duration-500 pointer-events-none ${textColorClass}`}
    >
      {/* Brand Wordmark */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <a
          href="#"
          className="group flex items-baseline gap-2 text-decoration-none"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="font-serif text-2xl md:text-3xl tracking-[0.22em] font-normal uppercase transition-transform group-hover:scale-105">
            JODO
          </span>
          <span className={`hidden sm:inline-block font-mono text-[9px] tracking-[0.25em] uppercase ${mutedColorClass}`}>
            · STUDIO
          </span>
        </a>
      </div>

      {/* Center Section Cues (Desktop) */}
      <nav className="hidden lg:flex items-center gap-6 pointer-events-auto">
        <a
          href="#object-chair-section"
          className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-100 ${mutedColorClass}`}
        >
          01 / The Chair
        </a>
        <span className={`w-1 h-1 rounded-full ${isTerracottaBg ? 'bg-[#F4EBDD]/40' : 'bg-[#C65F45]/40'}`} />
        <a
          href="#coming-soon-section"
          className={`font-mono text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-100 ${mutedColorClass}`}
        >
          Waitlist
        </a>
        <span className={`w-1 h-1 rounded-full ${isTerracottaBg ? 'bg-[#F4EBDD]/40' : 'bg-[#C65F45]/40'}`} />
        <Link
          href="/home"
          className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-all hover:text-[#C65F45] ${
            isTerracottaBg ? 'text-[#F4EBDD]' : 'text-[#24211E]'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-[#C65F45]" />
          <span>Explore Store</span>
        </Link>
        <span className={`w-1 h-1 rounded-full ${isTerracottaBg ? 'bg-[#F4EBDD]/40' : 'bg-[#C65F45]/40'}`} />
        <a
          href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-100 ${mutedColorClass}`}
        >
          <Shield className="w-3.5 h-3.5 opacity-70" />
          <span>Admin</span>
        </a>
      </nav>

      {/* Right Controls: Sound Toggle & Storefront Action */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Subtle Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-[0.18em] transition-all backdrop-blur-sm ${
            isTerracottaBg
              ? 'border-[#F4EBDD]/30 bg-[#9F4635]/40 hover:bg-[#9F4635]/60 text-[#F4EBDD]'
              : 'border-[#24211E]/15 bg-[#FAF6F0]/70 hover:bg-[#FAF6F0] text-[#24211E]'
          }`}
          title={soundEnabled ? 'Mute wood acoustic feedback' : 'Enable realistic wood joinery sounds'}
          aria-label="Toggle wood sound effects"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#C65F45]" />
              <span className="hidden sm:inline">Acoustics ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 opacity-60" />
              <span className="hidden sm:inline">Sound OFF</span>
            </>
          )}
        </button>

        {/* Explore Storefront Button */}
        <Link
          href="/home"
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] border transition-all ${
            isTerracottaBg
              ? 'border-[#F4EBDD] text-[#F4EBDD] bg-[#F4EBDD]/10 hover:bg-[#F4EBDD]/20'
              : 'border-[#C65F45] text-[#C65F45] bg-[#C65F45]/5 hover:bg-[#C65F45] hover:text-[#FAF6F0]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C65F45] animate-ping" />
          <span>Enter Store</span>
        </Link>
      </div>
    </header>
  );
};

