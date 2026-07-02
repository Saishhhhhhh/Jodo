'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-5 md:px-10 py-0 overflow-hidden">
      
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 bg-white -z-10" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">

        {/* ── LEFT SIDE — Text ── */}
        <div className="flex-1 max-w-[600px]">
          
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-[2px] bg-terracotta"></span>
            <p className="text-terracotta font-bold text-sm tracking-widest uppercase">
              Craftsmanship & Style
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="text-[#1C1A17] font-bold mb-8 tracking-tight leading-[1.15] text-4xl md:text-5xl lg:text-6xl">
            We help turn your design <span className="text-terracotta italic font-serif font-light">dreams</span> into reality.
          </h2>
          
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-[500px]">
            Curated, stylish pieces for every space. With a focus on comfort and craftsmanship, our pieces are designed to inspire and elevate your everyday life.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            {/* Discover More Link */}
            <Link
              href="/about"
              className="group relative inline-flex items-center gap-4 bg-[#1C1A17] text-white overflow-hidden rounded-full px-8 py-4 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
            >
              <div className="absolute inset-0 bg-terracotta translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
              <span className="relative z-10 font-semibold text-[15px]">Discover More</span>
              <span className="relative z-10 flex items-center justify-center bg-white rounded-full w-8 h-8 group-hover:bg-[#1C1A17] transition-colors duration-500">
                <ArrowUpRight className="w-4 h-4 text-[#1C1A17] group-hover:text-white transition-colors duration-500" />
              </span>
            </Link>
            
            {/* Explore Collection Link */}
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-4 bg-transparent border-2 border-[#1C1A17] text-[#1C1A17] overflow-hidden rounded-full px-8 py-4 transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
            >
              <div className="absolute inset-0 bg-[#1C1A17] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
              <span className="relative z-10 font-semibold text-[15px] group-hover:text-white transition-colors duration-500">Explore Collection</span>
            </Link>
          </div>
        </div>

        {/* ── RIGHT SIDE — Images ── */}
        <div className="flex-1 w-full relative">
          
          <div className="relative w-full aspect-square md:aspect-[10/9]">
            {/* Main Large Image */}
            <div className="absolute inset-0 rounded-[40px] overflow-hidden group z-0">
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85"
                alt="Living room"
                fill
                className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                unoptimized
              />
            </div>

            {/* Solid White Cutout Block to create the gap and rounded inner corners */}
            <div className="absolute left-[-2px] bottom-[-2px] z-10 w-[55%] h-[55%] bg-white rounded-tr-[32px]">
              
              {/* Inverted corner - Top side */}
              <svg className="absolute top-[-30px] left-0 w-[32px] h-[32px] z-20" viewBox="0 0 32 32" fill="none">
                <path d="M0 0v32h32C14.327 32 0 17.673 0 0z" fill="white" />
              </svg>

              {/* Inverted corner - Right side */}
              <svg className="absolute bottom-0 right-[-30px] w-[32px] h-[32px] z-20" viewBox="0 0 32 32" fill="none">
                <path d="M32 32H0V0c0 17.673 14.327 32 32 32z" fill="white" />
              </svg>

              {/* Overlapping Secondary Image */}
              <div className="absolute left-0 bottom-0 w-[92%] h-[92%] rounded-[28px] overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
                  alt="Furniture detail"
                  fill
                  className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                  unoptimized
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
