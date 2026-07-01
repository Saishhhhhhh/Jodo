import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="relative w-full max-w-[1320px] mx-auto px-4 lg:px-8 mt-8 lg:mt-12 mb-16">
      
      {/* ── BACKGROUND WAVY LINES ── */}
      <div className="absolute top-[-180px] left-1/2 -translate-x-[40%] z-0 pointer-events-none opacity-50">
        <svg width="1200" height="600" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 200 C 200 50, 300 450, 500 350 C 700 250, 800 100, 1200 150" stroke="#EAE3D9" strokeWidth="1.5" />
          <path d="M 0 250 C 250 100, 250 500, 550 400 C 850 300, 800 50, 1200 100" stroke="#EAE3D9" strokeWidth="1.5" />
          <path d="M 0 300 C 300 150, 200 550, 600 450 C 1000 350, 800 0, 1200 50" stroke="#EAE3D9" strokeWidth="1.5" />
          <path d="M 0 150 C 150 150, 350 350, 450 250 C 550 150, 750 200, 1200 250" stroke="#EAE3D9" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-20">

        {/* ── LEFT SIDE — Text ── */}
        <div className="flex-1 max-w-[560px]">
          
          {/* Tagline Badge */}
          <div className="mb-6">
            <p className="text-terracotta font-semibold text-[15px] leading-relaxed max-w-[480px]">
              With a focus on style, comfort, and craftsmanship, our pieces are designed to inspire and elevate every room.
            </p>
          </div>

          {/* Main Headline */}
          <h2 className="text-[#1C1A17] font-semibold mb-10 tracking-tight leading-[1.2] text-3xl md:text-4xl lg:text-[44px] max-w-[520px]">
            We help turn your design dreams into reality with curated, stylish pieces for every space.
          </h2>

          {/* View All Projects Link */}
          <Link
            href="/about"
            className="inline-flex items-center gap-4 w-fit transition-transform hover:-translate-y-0.5 bg-terracotta"
            style={{
              borderRadius: '8px',
              padding: '8px 8px 8px 24px',
            }}
          >
            <span className="text-white font-bold text-[15px]">View All Projects</span>
            <span
              className="flex items-center justify-center bg-white rounded-full"
              style={{ width: '32px', height: '32px' }}
            >
              <ArrowUpRight className="w-4 h-4 text-terracotta" />
            </span>
          </Link>
        </div>

        {/* ── RIGHT SIDE — Image ── */}
        <div className="flex-1 w-full max-w-[700px]">
          <div
            className="relative w-full overflow-hidden transition-transform hover:scale-[1.01] duration-700"
            style={{
              borderRadius: '32px',
              paddingBottom: '65%', // Aspect ratio
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85"
              alt="Woman in beautiful sunlit living room"
              fill
              className="object-cover object-center"
              unoptimized
            />
          </div>
        </div>

      </div>
    </section>
  );
}
