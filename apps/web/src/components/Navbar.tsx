'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, User, Heart, Home, Menu } from 'lucide-react';
import { GrAppsRounded } from "react-icons/gr";
import { useState, useEffect } from 'react';
import SearchOverlay from './SearchOverlay';
import CartOverlay from './CartOverlay';
import MobileMenuOverlay from './MobileMenuOverlay';
import { useCartStore } from '../store/useCartStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<{ label: string, url: string }[]>([]);
  const cartCount = useCartStore((state) => state.cartCount());
  const wishlistCount = useWishlistStore((state) => state.wishlistCount());
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    
    // Fetch Header Menu dynamically
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/navigation/header-menu`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.items) {
          setMenuItems(data.data.items);
        }
      })
      .catch(err => console.error("Failed to fetch header menu:", err));
  }, []);

  const { customer, isAuthenticated } = useCustomerStore();
  const isAuth = mounted && isAuthenticated();

  return (
    <>
      <header className="w-full bg-white sticky top-0 z-[100] shadow-sm">
        {/* ── TOP TIER: Search, Logo, Actions ── */}
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between h-[75px]">
          
          {/* LEFT: Search Bar (Desktop) / Logo (Mobile) */}
          <div className="flex-1 flex justify-start items-center">
            {/* Logo on Mobile */}
            <Link href="/" className="md:hidden flex items-center justify-start h-full py-1">
              <Image
                src="/logo.png"
                alt="Jodo"
                width={140}
                height={45}
                className="h-[44px] sm:h-[48px] w-auto object-contain transition-opacity hover:opacity-90"
                priority
              />
            </Link>

            {/* Search on Desktop */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center justify-between w-[250px] border-b border-gray-300 pb-1.5 text-gray-500 hover:text-terracotta transition-colors group"
            >
              <span className="text-sm">Search for Furniture</span>
              <Search className="w-4 h-4 text-gray-400 group-hover:text-terracotta transition-colors" strokeWidth={1.5} />
            </button>
          </div>

          {/* CENTER: Logo (Desktop Only) */}
          <div className="hidden md:flex flex-1 justify-center items-center h-full">
            <Link href="/" className="flex items-center justify-center h-full py-1.5 group">
              <Image
                src="/logo.png"
                alt="Jodo"
                width={220}
                height={65}
                className="h-[58px] lg:h-[64px] w-auto object-contain transition-opacity group-hover:opacity-90"
                priority
              />
            </Link>
          </div>

          {/* RIGHT: Action Icons */}
          <div className="flex-1 flex justify-end items-center gap-4 md:gap-6">
            
            {/* Sign Up / Account */}
            <Link href={isAuth ? "/account" : "/login"} className="hidden md:flex items-center gap-2 group">
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

            {/* Mobile Search Icon */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden flex relative group" 
              aria-label="Search"
            >
              <Search className="w-[22px] h-[22px] text-gray-800 group-hover:text-terracotta transition-colors" strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" aria-label="Wishlist" className="flex relative group">
              <Heart className="w-[22px] h-[22px] text-gray-800 group-hover:text-terracotta transition-colors" strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex relative group" 
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
          <nav className="max-w-[1440px] mx-auto px-4 lg:px-8 hidden md:flex items-center justify-center gap-6 xl:gap-8 h-[45px] overflow-x-auto">
            {menuItems.length > 0 ? (
              menuItems.map(({ label, url }) => (
                <Link
                  key={label}
                  href={url}
                  className="text-[13px] xl:text-[14px] font-semibold text-gray-800 hover:text-terracotta transition-colors whitespace-nowrap"
                >
                  {label}
                </Link>
              ))
            ) : (
              <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
            )}
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
        
        <MobileMenuOverlay 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)}
          menuItems={menuItems}
        />
      </header>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-[90] flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
          <Home className={`w-[22px] h-[22px] ${pathname === '/' ? 'text-terracotta' : 'text-gray-500 group-hover:text-terracotta'}`} strokeWidth={2.25} />
          <span className={`text-[10px] font-medium ${pathname === '/' ? 'text-terracotta' : 'text-gray-500 group-hover:text-terracotta'}`}>Home</span>
        </Link>
        <button onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 group">
          <GrAppsRounded className={`w-[22px] h-[22px] ${isMenuOpen ? 'text-terracotta' : 'text-gray-500 group-hover:text-terracotta'}`} />
          <span className={`text-[10px] font-medium ${isMenuOpen ? 'text-terracotta' : 'text-gray-500 group-hover:text-terracotta'}`}>Menu</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 group">
          <div className="relative">
            <ShoppingBag className={`w-[22px] h-[22px] ${isCartOpen ? 'text-terracotta' : 'text-gray-500 group-hover:text-terracotta'}`} strokeWidth={2.25} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-[16px] h-[16px] bg-terracotta text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-medium ${isCartOpen ? 'text-terracotta' : 'text-gray-500 group-hover:text-terracotta'}`}>Cart</span>
        </button>
        <Link href={isAuth ? "/account" : "/login"} className="flex flex-col items-center justify-center w-full h-full gap-1 group">
          <User className={`w-[22px] h-[22px] ${pathname?.startsWith('/account') || pathname === '/login' ? 'text-terracotta' : 'text-gray-500 group-hover:text-terracotta'}`} strokeWidth={2.25} />
          <span className={`text-[10px] font-medium ${pathname?.startsWith('/account') || pathname === '/login' ? 'text-terracotta' : 'text-gray-500 group-hover:text-terracotta'}`}>Account</span>
        </Link>
      </div>
    </>
  );
}
