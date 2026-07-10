'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Leaf, Award, Recycle, Shield } from 'lucide-react';

import TextPressure from '@/components/TextPressure';

const HORIZONTAL_ITEMS = [
  {
    title: "The Origin",
    desc: "Every iconic piece begins as a whisper. We strip away the unnecessary, searching for the perfect balance between form, function, and raw emotion.",
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "The Elements",
    desc: "We let nature speak. Sourcing sustainable oak, raw linens, and forged metals that carry a history, ensuring each piece ages beautifully with your home.",
    img: "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "The Obsession",
    desc: "True luxury lies in the unseen details. Our artisans spend hundreds of hours perfecting the invisible joints and seamless contours that define Jodo.",
    img: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "The Experience",
    desc: "More than furniture. We design the silent backdrops to your life's most meaningful moments, creating spaces that truly breathe with you.",
    img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
  }
];

export default function AboutPage() {
  // Refs for scroll tracking
  const horizontalRef = useRef<HTMLElement>(null);

  // Horizontal Scroll Math (4 items = slide to -75%)
  const { scrollYProgress: horizontalScroll } = useScroll({
    target: horizontalRef,
    offset: ["start start", "end end"]
  });
  const smoothHorizontalScroll = useSpring(horizontalScroll, { stiffness: 100, damping: 30, restDelta: 0.001 });
  // Finish horizontal sliding at 80% scroll progress to give the 4th slide time to rest before scrolling away
  const xTransform = useTransform(smoothHorizontalScroll, [0, 0.8], ["0%", "-75%"]);



  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* 1. Hero Section */}
      <section className="h-screen w-full relative bg-white overflow-hidden flex items-center justify-center">
        
        
        {/* TextPressure Layer */}
        <div className="relative z-10 w-full max-w-[80vw] md:max-w-[60vw] h-[200px] md:h-[400px] pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <TextPressure
              text="JODO"
              flex
              alpha={false}
              stroke={false}
              width
              weight
              italic
              textColor="#c85a3c"
              strokeColor="#c85a3c"
              minFontSize={36}
            />
          </div>
        </div>
        
      </section>

      {/* 2. Horizontal Scroll Gallery */}
      <section ref={horizontalRef} className="h-[500vh] relative bg-[#FCF6F4] overflow-x-clip">
        <div className="sticky top-0 h-screen w-full pt-[110px]">
          
          {/* Container is 400vw. We slide it left by 75% (300vw) so it perfectly stops at the end */}
          <motion.div style={{ x: xTransform, willChange: "transform" }} className="flex w-[400vw] h-full">
            {HORIZONTAL_ITEMS.map((item, i) => (
              <div 
                key={i} 
                className="w-[100vw] h-full relative flex flex-col lg:flex-row items-center justify-center px-8 lg:px-24"
              >
                {/* Huge Watermark Number (Fixed to Viewport Corners, pushed down below header) */}
                <div className="absolute top-[20px] left-[-40px] lg:top-[40px] lg:left-[-100px] text-[8rem] lg:text-[12rem] font-bold text-[#D1C4B7]/40 leading-none pointer-events-none z-0 tracking-tighter select-none">
                  0{i + 1}
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center w-full max-w-6xl mx-auto">

                  {/* Editorial Image Frame */}
                  <div className="w-full lg:w-[45%] aspect-[3/4] relative rounded-[24px] overflow-hidden z-10 group shadow-lg">
                    <Image 
                      src={item.img} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-all duration-1000" 
                      alt={item.title}
                    />
                  </div>
                  
                  {/* Text Box */}
                  <div className="w-full lg:w-[55%] flex flex-col relative z-20 pt-8 lg:pt-0 lg:pl-16">
                     <div className="w-16 h-[3px] bg-terracotta mb-8" />
                     <h2 className="text-4xl lg:text-6xl font-medium text-jodo-dark mb-6 tracking-tight leading-[1.1]">
                       {item.title}
                     </h2>
                     <p className="text-xl lg:text-2xl text-taupe-dark leading-relaxed font-light">
                       {item.desc}
                     </p>
                  </div>

                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* 3. Our DNA Section (Layout imported from Homepage) */}
      <section className="relative w-full max-w-[1400px] mx-auto px-5 md:px-10 py-24 md:py-32 bg-white">
        
        <div className="flex flex-col lg:flex-row items-start justify-between gap-16 lg:gap-24">

          {/* ── LEFT SIDE — Text ── */}
          <div className="flex-1 max-w-[600px]">
            
            <div className="mb-6">
              <p className="text-terracotta font-bold text-sm tracking-widest uppercase">
                Our Story
              </p>
            </div>

            <h2 className="text-[#1C1A17] font-bold mb-8 tracking-tight leading-[1.15] text-4xl md:text-5xl lg:text-6xl">
              Born from a frustration with the ordinary.
            </h2>
            
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                Jodo began when a group of industrial designers and master carpenters realized that the modern furniture industry had lost its way. Mass-produced, disposable pieces had replaced the timeless, durable craftsmanship of the past.
              </p>
              <p>
                We set out to change that. By combining traditional woodworking techniques with cutting-edge sustainable materials, we created a design language that speaks to both heritage and the future. Every curve is intentional, every joint is reinforced, and every piece tells a story of obsessive attention to detail.
              </p>
            </div>
          </div>

          {/* ── RIGHT SIDE — Images ── */}
          <div className="flex-1 w-full relative">
            
            <div className="relative w-full aspect-square md:aspect-[10/9]">
              {/* Main Large Image */}
              <div className="absolute inset-0 rounded-[40px] overflow-hidden group z-0">
                <Image
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
                  alt="Our DNA main"
                  fill
                  className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                  unoptimized
                />
              </div>

              {/* Solid White Cutout Block */}
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
                    src="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80"
                    alt="Our DNA detail"
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

      {/* 4. Alternate Image Left Section */}
      <section className="relative w-full max-w-[1400px] mx-auto px-5 md:px-10 py-24 md:py-32 bg-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
          
          {/* ── LEFT SIDE — Image ── */}
          <div className="flex-1 w-full relative">
            <div className="relative w-full aspect-[4/5] md:aspect-square">
              <div className="absolute inset-0 rounded-[40px] overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
                  alt="Crafting process"
                  fill
                  className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE — Text ── */}
          <div className="flex-1 max-w-[600px]">
            <div className="mb-6">
              <p className="text-terracotta font-bold text-sm tracking-widest uppercase">
                Crafting Excellence
              </p>
            </div>

            <h2 className="text-[#1C1A17] font-bold mb-8 tracking-tight leading-[1.15] text-4xl md:text-5xl lg:text-6xl">
              Where tradition meets modern living.
            </h2>
            
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                Our process is a delicate balance of honoring time-tested woodworking techniques while embracing modern, sustainable materials. We don't just build furniture; we engineer silent companions for your life's most meaningful moments.
              </p>
              <p>
                From the initial sketch to the final, hand-applied finish, every piece is subjected to a rigorous standard of excellence. We believe that true luxury is found in the details that you feel, long after the initial visual impact has settled.
              </p>
            </div>
          </div>
          
        </div>
      </section>

      {/* 5. Why Choose Us (Masonry Bento Box) */}
      <section className="w-full bg-[#FCF6F4] relative z-10 py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          
          <div className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
            <h2 className="text-[#1C1A17] font-bold mb-6 tracking-tight leading-[1.15] text-4xl md:text-5xl">
              Why choose Jodo?
            </h2>
            <p className="text-gray-600 text-lg">
              We don't cut corners. We build pieces that become part of your family's heritage.
            </p>
          </div>

          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Item 1 - Large Span (2 columns) */}
            <div className="md:col-span-2 group relative p-10 rounded-[32px] bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 rounded-2xl bg-[#FCF6F4] flex items-center justify-center mb-8 group-hover:bg-terracotta group-hover:text-white transition-all duration-500">
                  <Leaf className="w-8 h-8 text-terracotta group-hover:text-white transition-colors duration-500 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-[#1C1A17] mb-3">Sustainable Sourcing</h4>
                  <p className="text-gray-500 leading-relaxed text-base max-w-md">Every piece is crafted from ethically sourced, renewable materials, ensuring we give back as much as we take. Our commitment to the planet is non-negotiable.</p>
                </div>
              </div>
              <span className="absolute -bottom-8 -right-4 text-[200px] font-bold text-[#F5EBE8] leading-none pointer-events-none select-none z-0">
                1
              </span>
            </div>
            
            {/* Bento Item 2 - Standard Span (1 column) */}
            <div className="md:col-span-1 group relative p-10 rounded-[32px] bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 rounded-2xl bg-[#FCF6F4] flex items-center justify-center mb-8 group-hover:bg-terracotta group-hover:text-white transition-all duration-500">
                  <Award className="w-8 h-8 text-terracotta group-hover:text-white transition-colors duration-500 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-[#1C1A17] mb-3">Master Craftsmanship</h4>
                  <p className="text-gray-500 leading-relaxed text-base">Hand-finished by artisans with decades of expertise.</p>
                </div>
              </div>
              <span className="absolute -bottom-8 -right-4 text-[200px] font-bold text-[#F5EBE8] leading-none pointer-events-none select-none z-0">
                2
              </span>
            </div>

            {/* Bento Item 3 - Standard Span (1 column) */}
            <div className="md:col-span-1 group relative p-10 rounded-[32px] bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 rounded-2xl bg-[#FCF6F4] flex items-center justify-center mb-8 group-hover:bg-terracotta group-hover:text-white transition-all duration-500">
                  <Recycle className="w-8 h-8 text-terracotta group-hover:text-white transition-colors duration-500 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-[#1C1A17] mb-3">Circular Design</h4>
                  <p className="text-gray-500 leading-relaxed text-base">Engineered with modularity to be repaired, reused, and completely recycled.</p>
                </div>
              </div>
              <span className="absolute -bottom-8 -right-4 text-[200px] font-bold text-[#F5EBE8] leading-none pointer-events-none select-none z-0">
                3
              </span>
            </div>

            {/* Bento Item 4 - Large Span (2 columns) */}
            <div className="md:col-span-2 group relative p-10 rounded-[32px] bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-16 h-16 rounded-2xl bg-[#FCF6F4] flex items-center justify-center mb-8 group-hover:bg-terracotta group-hover:text-white transition-all duration-500">
                  <Shield className="w-8 h-8 text-terracotta group-hover:text-white transition-colors duration-500 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold tracking-tight text-[#1C1A17] mb-3">Lifetime Guarantee</h4>
                  <p className="text-gray-500 leading-relaxed text-base max-w-md">We stand behind our obsessive quality standards. Your investment in Jodo is protected forever against defects in workmanship.</p>
                </div>
              </div>
              <span className="absolute -bottom-8 -right-4 text-[200px] font-bold text-[#F5EBE8] leading-none pointer-events-none select-none z-0">
                4
              </span>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
