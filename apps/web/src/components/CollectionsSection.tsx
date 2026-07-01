import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Flame } from 'lucide-react';

export default function CollectionsSection() {
  return (
    <section className="w-full bg-[#FFFFFF] py-[80px] font-sans">
      {/* Scaled down max-width for better viewport fitting */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 xl:px-[40px] relative">
        
        {/* ── BACKGROUND EDITORIAL GRID LINES ── */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
          {/* 25% Line - Passes through text */}
          <div className="absolute top-0 bottom-[-160px] w-[1px] bg-[#EAE5DF]" style={{ left: 'calc(25% - 10px)' }} />
          {/* 50% Line - Main Gap center */}
          <div className="absolute top-0 bottom-[-160px] w-[1px] bg-[#EAE5DF]" style={{ left: '50%' }} />
          {/* Horizontal Line at Section Bottom */}
          <div className="absolute left-0 right-0 h-[1px] bg-[#EAE5DF]" style={{ bottom: '-80px' }} />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* ========================================== */}
          {/* ROW 1 (Hero & Bedroom) */}
          {/* ========================================== */}
          
          {/* ── HERO IMAGE (Top Left) ── */}
          <div className="relative w-full h-[380px]">
            {/* Sharp bottom-right corner (0px) so the circular puzzle bite is perfectly clean */}
            <div className="absolute inset-0 overflow-hidden shadow-sm" style={{ borderRadius: '24px 24px 0 24px' }}>
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85"
                alt="2026 New Collection"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                unoptimized
              />
              {/* Floating Pill */}
              <div
                className="absolute bottom-6 left-6 flex items-center gap-2 px-5 py-3 rounded-full z-20 shadow-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.98)' }}
              >
                <Flame className="w-4 h-4 text-[#E6CCA0]" />
                <span className="text-[#111111] font-bold text-[13px]">2026 New Collection</span>
              </div>
            </div>

            {/* ── THE CENTRAL PUZZLE CIRCLE ── */}
            {/* Centered perfectly in the 40px grid gap! */}
            <div 
              className="absolute z-30 flex items-center justify-center pointer-events-none hidden lg:flex"
              style={{ 
                top: '100%', 
                left: '100%', 
                marginTop: '20px', // half of gap-10 (40px)
                marginLeft: '20px', // half of gap-10 (40px)
                transform: 'translate(-50%, -50%)' 
              }}
            >
              {/* White Cutout Mask (160px) bridging the 3 sharp image corners */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#ffffff] rounded-full w-[160px] h-[160px]" />
              
              {/* Spinning Text Badge - Scaled up proportionally to leave a tighter white ring */}
              <div className="relative flex items-center justify-center w-[130px] h-[130px] pointer-events-auto cursor-pointer group">
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]"
                >
                  <path id="circle-path-center" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                  <text fontSize="9.5" fontWeight="700" fill="#111111" letterSpacing="1.5">
                    <textPath href="#circle-path-center">JODO • BRINGING SPACES TOGETHER • JODO • BRINGING SPACES TOGETHER • </textPath>
                  </text>
                </svg>
                {/* Center Button */}
                <div
                  className="relative z-10 w-[48px] h-[48px] rounded-full flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:rotate-45"
                  style={{ backgroundColor: '#E6CCA0' }}
                >
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5px]" />
                </div>
              </div>
            </div>
          </div>

          {/* ── HEADING & BEDROOM (Top Right) ── */}
          <div className="flex flex-col justify-between h-[380px]">
            {/* Heading */}
            <div className="flex items-start justify-between">
              <h2 className="font-bold text-[#111111] leading-[1.05] text-[40px] xl:text-[46px] max-w-[340px]">
                Customize the New Jodo Collection
              </h2>
            </div>

            {/* Bedroom Image - Sharp bottom-left corner for the perfect bite */}
            <Link
              href="/shop/bedroom"
              className="relative block w-full overflow-hidden group shadow-sm"
              style={{ borderRadius: '24px 24px 24px 0', height: '180px' }}
            >
              <Image
                src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=85"
                alt="Bedroom"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-[#111111]/5 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute bottom-6 right-6 text-[#FFFFFF] font-bold text-[22px] tracking-[0.08em] uppercase drop-shadow-md z-10">
                Bedroom
              </span>
            </Link>
          </div>

          {/* ========================================== */}
          {/* ROW 2 (Text & Kitchen/Living) */}
          {/* ========================================== */}

          {/* ── TEXT CONTENT (Bottom Left) ── */}
          <div className="flex flex-col pr-12 pt-6">
            <h3 className="text-[#111111] font-bold text-[32px] leading-[1.1] mb-4">
              Synory's New Collection Has Everything for a Chic and Cozy Upgrade
            </h3>
            <p className="text-[#666666] font-medium text-[16px] leading-relaxed max-w-[460px]">
              Give your space a chic and cozy upgrade! From soft linens to stylish decor,
              find everything you need for that perfect blend of comfort and elegance.
            </p>
          </div>

          {/* ── KITCHEN & LIVING ROOM (Bottom Right) ── */}
          <div className="grid grid-cols-2 gap-10 items-start w-full">

            {/* Kitchen - Sharp top-left corner for the perfect bite */}
            <Link
              href="/shop/kitchen"
              className="relative block overflow-hidden group shadow-sm w-full"
              style={{ borderRadius: '0 24px 24px 24px', height: '240px' }}
            >
              <Image
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=85"
                alt="Kitchen"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-[#111111]/5 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute bottom-6 left-0 w-full text-center text-[#FFFFFF] font-bold text-[20px] tracking-[0.08em] uppercase drop-shadow-md z-10">
                Kitchen
              </span>
            </Link>

            {/* Living Room - Staggered downward and scaled for balance */}
            <Link
              href="/shop/living-room"
              className="relative block overflow-hidden group shadow-sm w-full mt-12"
              style={{ borderRadius: '24px', height: '260px' }}
            >
              <Image
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85"
                alt="Living Room"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-[#111111]/5 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute bottom-6 left-0 w-full text-center text-[#FFFFFF] font-bold text-[20px] tracking-[0.08em] uppercase drop-shadow-md z-10">
                Living Room
              </span>
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
