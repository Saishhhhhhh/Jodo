'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Star } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-5 md:px-10 py-20 lg:py-32 overflow-hidden">
      
      {/* ── BACKGROUND WAVY LINES ── */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 z-0 pointer-events-none opacity-40">
        {/* A large circular gradient blur for abstract modern feel */}
        <div className="w-[600px] h-[600px] bg-terracotta/20 rounded-full blur-[100px]" />
      </div>

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

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* View All Projects Link */}
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
            
            {/* Explore Collections Link */}
            <Link
              href="/collections"
              className="text-[#1C1A17] font-bold text-[15px] hover:text-terracotta transition-colors flex items-center gap-2 group"
            >
              Explore Collections
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* ── RIGHT SIDE — Images ── */}
        <div className="flex-1 w-full relative">
          
          <div className="relative w-[90%] ml-auto aspect-[4/5]">
            {/* Main Large Image with CSS Clip-path Cutout */}
            <div 
              className="absolute inset-0 shadow-2xl group"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 52% 100%, 52% 58%, 0 58%)',
                borderRadius: '40px'
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85"
                alt="Living room"
                fill
                className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                unoptimized
              />
            </div>

            {/* Overlapping Secondary Image */}
            <div className="absolute left-0 bottom-0 z-10 w-[48%] aspect-square rounded-[32px] overflow-hidden shadow-2xl group">
              <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
                alt="Furniture detail"
                fill
                className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                unoptimized
              />
            </div>
          </div>

          {/* Floating Experience Badge */}
          <div className="absolute top-[5%] left-0 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-white/50 z-20 flex flex-col items-center justify-center hover:-translate-y-2 transition-transform duration-500 cursor-default">
            <span className="text-terracotta font-bold text-3xl md:text-4xl">10+</span>
            <span className="text-gray-600 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1 text-center leading-tight">
              Years of<br/>Excellence
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
