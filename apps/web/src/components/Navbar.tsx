'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, ChevronDown, User, Heart } from 'lucide-react';
import { useState } from 'react';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
  const [cartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="w-full bg-white sticky top-0 z-50 h-[72px]">
      <div className="w-full px-4 lg:px-6 flex items-center justify-between h-full relative">

        {/* ── LEFT: Logo ── */}
        <div className="flex-1 flex justify-start h-full">
          <Link href="/" className="flex items-center h-full">
            <Image
              src="/logo.png"
              alt="Jodo"
              width={256}
              height={150}
              className="w-[280px] h-auto object-contain -ml-10 translate-y-2"
              priority
            />
          </Link>
        </div>

        {/* ── CENTER: Navigation Links ── */}
        <nav className="hidden lg:flex items-center justify-center gap-8">
          {[
            { label: 'Home', href: '/', drop: false },
            { label: 'Who we are', href: '/about', drop: false },
            { label: 'Explore Products', href: '/shop', drop: true },
            { label: 'blogs', href: '/blog', drop: false },
            { label: 'faq', href: '/faq', drop: false },
          ].map(({ label, href, drop }) => (
            <Link
              key={label}
              href={href}
              className="relative group flex items-center gap-1.5 text-[15px] font-medium tracking-wide text-[#1C1A17] hover:text-terracotta transition-colors whitespace-nowrap capitalize"
            >
              {label}
              {drop && <ChevronDown className="w-4 h-4 opacity-50" />}
              <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-terracotta transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* ── RIGHT: Action Icons ── */}
        <div className="flex-1 flex justify-end items-center gap-6">
          {/* Account */}
          <Link href="/account" className="text-[#1C1A17] hover:text-terracotta transition-colors" aria-label="Account">
            <User className="w-5 h-5" strokeWidth={2} />
          </Link>

          {/* Wishlist */}
          <Link href="/wishlist" className="text-[#1C1A17] hover:text-terracotta transition-colors" aria-label="Wishlist">
            <Heart className="w-5 h-5" strokeWidth={2} />
          </Link>

          {/* Search */}
          <button onClick={() => setIsSearchOpen(true)} className="text-[#1C1A17] hover:text-terracotta transition-colors" aria-label="Search">
            <Search className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Cart */}
          <Link href="/cart" className="text-[#1C1A17] hover:text-terracotta transition-colors relative" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
