'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, User, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchOverlay from './SearchOverlay';
import CartOverlay from './CartOverlay';
import { useCartStore } from '../store/useCartStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useWishlistStore } from '../store/useWishlistStore';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = useCartStore((state) => state.cartCount());
  const wishlistCount = useWishlistStore((state) => state.wishlistCount());
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { customer, isAuthenticated } = useCustomerStore();
  const isAuth = mounted && isAuthenticated();

  return (
    <header className="w-full bg-white sticky top-0 z-[100] shadow-sm">
      {/* ── TOP TIER: Search, Logo, Actions ── */}
      <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between h-[75px]">
        
        {/* LEFT: Search Bar */}
        <div className="flex-1 flex justify-start">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-between w-[250px] border-b border-gray-300 pb-1.5 text-gray-500 hover:border-terracotta transition-colors group"
          >
            <span className="text-sm">Search for Furniture</span>
            <Search className="w-4 h-4 text-gray-400 group-hover:text-terracotta transition-colors" />
          </button>
        </div>

        {/* CENTER: Logo */}
        <div className="flex-1 flex justify-center h-full items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Jodo"
              width={350}
              height={90}
              className="w-[260px] md:w-[320px] h-auto object-contain scale-105"
              priority
            />
          </Link>
        </div>

        {/* RIGHT: Action Icons */}
        <div className="flex-1 flex justify-end items-center gap-6">
          
          {/* Sign Up / Account */}
          <Link href={isAuth ? "/account" : "/login"} className="flex items-center gap-2 group">
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-[13px] font-semibold text-gray-900 group-hover:text-terracotta transition-colors leading-tight">
                {isAuth ? `Hi, ${customer?.firstName}` : 'Sign In'}
              </span>
              <span className="text-[11px] font-medium text-terracotta leading-tight">
                {isAuth ? 'My Account' : 'Get Upto Rs. 1,500 off'}
              </span>
            </div>
            <User className="w-6 h-6 text-gray-800 group-hover:text-terracotta transition-colors" strokeWidth={1.5} />
          </Link>



          {/* Wishlist */}
          <Link href="/wishlist" aria-label="Wishlist" className="relative group">
            <Heart className="w-6 h-6 text-gray-800 group-hover:text-terracotta transition-colors" strokeWidth={1.5} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative group" 
            aria-label="Cart"
          >
            <ShoppingBag className="w-6 h-6 text-gray-800 group-hover:text-terracotta transition-colors" strokeWidth={1.5} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

        </div>
      </div>

      {/* ── BOTTOM TIER: Navigation Links ── */}
      <div className="w-full border-t border-gray-100 bg-white">
        <nav className="max-w-[1440px] mx-auto px-4 lg:px-8 hidden lg:flex items-center justify-center gap-6 xl:gap-8 h-[45px] overflow-x-auto">
          {[
            { label: 'Furniture', href: '/shop' },
            { label: 'Sofas & Seating', href: '/shop?category=sofas' },
            { label: 'Mattresses', href: '/shop?category=mattresses' },
            { label: 'Home Decor', href: '/shop?category=decor' },
            { label: 'Explore Collections', href: '/collections' },
            { label: 'Shop All', href: '/shop' },
            { label: 'Lamps & Lighting', href: '/shop?category=lighting' },
            { label: 'Kitchen & Dining', href: '/shop?category=kitchen' },
            { label: 'Our Story', href: '/about' },
            { label: 'Contact Us', href: '/contact' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[13px] xl:text-[14px] font-semibold text-gray-800 hover:text-terracotta transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      <CartOverlay
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  );
}
