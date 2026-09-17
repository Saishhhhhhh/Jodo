'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp, Store, Shield } from 'lucide-react';

export const FooterSection: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full min-h-[85vh] py-24 px-6 md:px-14 bg-[#FAF6F0] text-[#24211E] flex flex-col justify-between border-t border-[#24211E]/10 select-none">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-[#8E867E]">
        <span>JODO DESIGN STUDIO</span>
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 text-[#57524C] hover:text-[#C65F45] transition-colors cursor-pointer"
        >
          <span>BACK TO APEX</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Calm Centered Statement */}
      <div className="max-w-4xl mx-auto text-center my-auto py-12">
        <h2 className="font-serif text-4xl sm:text-6xl md:text-8xl font-light text-[#24211E] uppercase tracking-tight mb-4">
          SEE YOU SOON.
        </h2>

        <div className="font-serif text-3xl sm:text-5xl font-normal text-[#C65F45] tracking-[0.2em] uppercase mb-4">
          JODO
        </div>

        <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-[#57524C] font-light mb-8">
          Furniture for the spaces between life.
        </p>

        {/* Quick Portal Access */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#24211E] text-[#F4EBDD] font-mono text-xs uppercase tracking-[0.18em] hover:bg-[#C65F45] transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Enter Full Storefront</span>
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#24211E]/20 text-[#24211E] font-mono text-xs uppercase tracking-[0.18em] hover:border-[#C65F45] hover:text-[#C65F45] transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Open Admin Panel</span>
          </a>
        </div>
      </div>

      {/* Editorial Footer Grid */}
      <div className="w-full pt-10 border-t border-[#24211E]/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-mono tracking-wider text-[#8E867E]">
        <div className="flex items-center gap-6">
          <span>NEW DELHI</span>
          <span>·</span>
          <span>AHMEDABAD</span>
          <span>·</span>
          <span>MILAN</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/home" className="hover:text-[#C65F45] transition-colors">Storefront</Link>
          <Link href="/shop" className="hover:text-[#C65F45] transition-colors">Shop</Link>
          <Link href="/collections" className="hover:text-[#C65F45] transition-colors">Collections</Link>
          <Link href="/about" className="hover:text-[#C65F45] transition-colors">About</Link>
          <Link href="/contact" className="hover:text-[#C65F45] transition-colors">Contact</Link>
        </div>

        <div className="text-center md:text-right">
          © {new Date().getFullYear()} JODO FURNITURE LABS. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};

