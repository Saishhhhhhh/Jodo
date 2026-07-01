import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Flame } from 'lucide-react';

// Reusable Category Card Component with Custom Mask Support
const CategoryCard = ({ href, src, alt, label, labelPosition, className, imageClassName = '', maskImage, style }) => (
  <Link 
    href={href} 
    className={`relative block group ${className}`}
    style={{ 
      WebkitMaskImage: maskImage, 
      maskImage: maskImage,
      ...style 
    }}
  >
    <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: style?.borderRadius || '32px' }}>
      <Image 
        src={src} 
        alt={alt} 
        fill 
        className={`object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${imageClassName}`} 
        unoptimized 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-[#111111]/5 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
    <span className={`absolute text-[#FFFFFF] font-bold tracking-[0.08em] uppercase drop-shadow-md z-10 ${labelPosition}`}>
      {label}
    </span>
  </Link>
);

export default function CollectionsSection() {
  return (
    <section className="w-full bg-[#FFFFFF] py-[120px] font-sans overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-5 md:px-12 xl:px-[80px]">
        
        {/* Main 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-[60px] items-start relative">
          
          {/* ========================================== */}
          {/* LEFT COLUMN (55%) */}
          {/* ========================================== */}
          <div className="flex flex-col relative w-full">
            
            {/* HERO IMAGE: Custom Organic Puzzle Shape */}
            {/* Cut-out at 100% 75% to seamlessly lock with the Kitchen card's protrusion */}
            <div 
              className="relative w-full h-[640px] rounded-[40px] overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
              style={{
                WebkitMaskImage: 'radial-gradient(circle 140px at 100% 75%, transparent 99.5%, black 100%)',
                maskImage: 'radial-gradient(circle 140px at 100% 75%, transparent 99.5%, black 100%)'
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85"
                alt="2026 New Collection Featured"
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                unoptimized
              />
              
              {/* Floating Pill overlapping bottom-left edge */}
              <div
                className="absolute bottom-10 left-10 flex items-center gap-2.5 px-7 py-4 rounded-full z-20 transition-transform duration-300 hover:-translate-y-1"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
                }}
              >
                <Flame className="w-5 h-5 text-[#E6CCA0]" />
                <span className="text-[#111111] font-bold text-[15px]">2026 New Collection</span>
              </div>
            </div>

            {/* Overlapping Circular Badge floating EXACTLY inside the Hero's cut-out */}
            <div 
              className="absolute z-30 group cursor-pointer lg:block hidden"
              style={{ top: '75%', right: '0', transform: 'translate(45px, -50%)' }}
            >
              <div className="relative flex items-center justify-center w-[150px] h-[150px]">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]">
                  <path id="badge-curve" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
                  <text fontSize="10" fontWeight="700" fill="#111111" letterSpacing="3.5">
                    <textPath href="#badge-curve">MADE IN GERMANY • SINCE 2001 • </textPath>
                  </text>
                </svg>
                
                <div className="relative z-10 w-[58px] h-[58px] bg-[#E6CCA0] rounded-full flex items-center justify-center text-[#FFFFFF] shadow-md transition-transform duration-300 ease-out group-hover:rotate-45 hover:scale-110">
                  <ArrowUpRight className="w-6 h-6 stroke-[2.5px]" />
                </div>
              </div>
            </div>

            {/* Typography Content */}
            <div className="mt-[50px] max-w-[650px] pr-8 lg:pr-12">
              <h3 className="text-[#111111] text-[40px] xl:text-[48px] font-bold leading-[1.1] mb-6">
                Synory's New Collection Has Everything for a Chic and Cozy Upgrade
              </h3>
              <p className="text-[#666666] text-[18px] leading-[1.7]">
                Give your space a chic and cozy upgrade! From soft linens to stylish decor, 
                find everything you need for that perfect blend of comfort and elegance.
              </p>
            </div>
            
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN (45%) */}
          {/* ========================================== */}
          <div className="flex flex-col relative w-full">
            
            {/* Heading Block (Strictly 180px height to align puzzle pieces) */}
            <div className="h-[180px] flex items-start justify-between">
              <h2 className="text-[#111111] text-[52px] xl:text-[64px] font-bold leading-[1.05] max-w-[500px]">
                Customize the New Boho Collection
              </h2>
            </div>

            {/* BEDROOM Card: Custom Notch on Top-Right */}
            <div className="h-[260px] w-full mb-[40px] transition-transform duration-300 hover:-translate-y-2">
              <CategoryCard 
                href="/shop/bedroom"
                src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=85"
                alt="Bedroom Collection"
                label="BEDROOM"
                labelPosition="top-8 left-8 text-[28px] xl:text-[32px]"
                className="w-full h-full"
                style={{ borderRadius: '32px' }}
                maskImage="radial-gradient(circle 80px at 100% 20%, transparent 99.5%, black 100%)"
              />
            </div>

            {/* KITCHEN & LIVING ROOM Staggered Puzzle Grid */}
            <div className="grid grid-cols-[1fr_1.2fr] gap-6 items-start w-full">
              
              {/* KITCHEN Card: Convex Protrusion fitting into Hero Hole */}
              {/* Pulled left by 30px so the massive top-left curve enters the column gap */}
              <div className="h-[280px] w-full -ml-[30px] transition-transform duration-300 hover:-translate-y-2 z-20">
                <CategoryCard 
                  href="/shop/kitchen"
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=85"
                  alt="Kitchen Collection"
                  label="KITCHEN"
                  labelPosition="bottom-8 left-0 w-full text-center text-[24px] xl:text-[28px]"
                  className="w-full h-full shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
                  style={{ 
                    borderTopLeftRadius: '130px', // The matching convex curve!
                    borderBottomLeftRadius: '32px',
                    borderTopRightRadius: '32px',
                    borderBottomRightRadius: '32px'
                  }}
                />
              </div>
              
              {/* LIVING ROOM Card: Custom Inward Curve on Upper-Left */}
              <div className="h-[400px] w-full transition-transform duration-300 hover:-translate-y-2">
                <CategoryCard 
                  href="/shop/living-room"
                  src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85"
                  alt="Living Room Collection"
                  label="LIVING ROOM"
                  labelPosition="bottom-8 left-0 w-full text-center text-[24px] xl:text-[28px]"
                  className="w-full h-full"
                  style={{ borderRadius: '32px' }}
                  maskImage="radial-gradient(circle 100px at 0% 0%, transparent 99.5%, black 100%)"
                />
              </div>
              
            </div>
            
          </div>

        </div>
      </div>
    </section>
  );
}
