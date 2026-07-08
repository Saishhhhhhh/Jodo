'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Leaf, Award, Recycle, Shield } from 'lucide-react';
import Antigravity from '@/components/Antigravity';
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
  const heroRef = useRef<HTMLElement>(null);
  const horizontalRef = useRef<HTMLElement>(null);
  
  // Hero Scroll Split Math
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Smooth the raw scroll value with physics to eliminate mouse wheel stutter/lag
  const smoothHeroScroll = useSpring(heroScroll, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Zoom in and fade out on scroll
  const heroScale = useTransform(smoothHeroScroll, [0, 1], [1, 4]);
  const heroOpacity = useTransform(smoothHeroScroll, [0, 0.4], [1, 0]);

  // Horizontal Scroll Math (4 items = slide to -75%)
  const { scrollYProgress: horizontalScroll } = useScroll({
    target: horizontalRef,
  });
  const smoothHorizontalScroll = useSpring(horizontalScroll, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const xTransform = useTransform(smoothHorizontalScroll, [0, 1], ["0%", "-75%"]);



  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* 1. Hero Section with Join on Load & Zoom on Scroll */}
      <section ref={heroRef} className="h-[150vh] relative bg-white">
        
        {/* Unified Sticky Wrapper for Background and Text */}
        <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
          
          {/* Antigravity Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Antigravity
              count={600}
              magnetRadius={10}
              ringRadius={10}
              waveSpeed={0.4}
              waveAmplitude={1}
              particleSize={1.4}
              lerpSpeed={0.05}
              color="#c85a3c"
              autoAnimate
              particleVariance={1}
              rotationSpeed={0}
              depthFactor={1}
              pulseSpeed={3}
              particleShape="capsule"
              fieldStrength={10}
            />
          </div>

          {/* TextPressure Layer */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-auto">
            <div className="w-full max-w-[80vw] md:max-w-[60vw] h-[200px] md:h-[400px] relative">
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
          
        </div>
        
        {/* Secondary text that stays static */}
        <div className="absolute bottom-[20vh] lg:bottom-[25vh] left-8 md:left-24 max-w-md z-20">
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5, duration: 1 }}
             className="text-2xl text-taupe-dark font-medium"
           >
             We don't just build furniture. We engineer comfort. Scroll to discover the Jodo journey.
           </motion.p>
        </div>
      </section>

      {/* 2. Horizontal Scroll Gallery */}
      <section ref={horizontalRef} className="h-[400vh] relative bg-[#FAF6F1] overflow-x-clip">
        <div className="sticky top-0 h-screen w-full pt-[110px]">
          
          {/* Container is 400vw. We slide it left by 75% (300vw) so it perfectly stops at the end */}
          <motion.div style={{ x: xTransform, willChange: "transform" }} className="flex w-[400vw] h-full">
            {HORIZONTAL_ITEMS.map((item, i) => (
              <div 
                key={i} 
                className="w-[100vw] h-full relative flex flex-col lg:flex-row items-center justify-center px-8 lg:px-24"
              >
                <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center w-full max-w-6xl mx-auto">
                  
                  {/* Huge Watermark Number (Behind Image - Top Left) */}
                  <div className="absolute top-[-60px] left-[-120px] lg:top-[-120px] lg:left-[-220px] text-[10rem] lg:text-[15rem] font-bold text-[#D1C4B7]/50 leading-none pointer-events-none z-0 tracking-tighter select-none">
                    0{i + 1}
                  </div>

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
                Our DNA
              </p>
            </div>

            <h2 className="text-[#1C1A17] font-bold mb-10 tracking-tight leading-[1.15] text-4xl md:text-5xl lg:text-6xl">
              The core principles that shape every piece we design.
            </h2>
            
            <div className="space-y-10">
              
              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-[#FAF6F1] flex items-center justify-center shrink-0 group-hover:bg-terracotta group-hover:text-white transition-colors duration-300">
                  <Leaf className="w-6 h-6 text-terracotta group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1C1A17] mb-2">Sustainability First</h4>
                  <p className="text-gray-600 leading-relaxed">Every tree we use is ethically sourced, ensuring we give back more than we take from the environment.</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-[#FAF6F1] flex items-center justify-center shrink-0 group-hover:bg-terracotta group-hover:text-white transition-colors duration-300">
                  <Award className="w-6 h-6 text-terracotta group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1C1A17] mb-2">Award-Winning Design</h4>
                  <p className="text-gray-600 leading-relaxed">Recognized globally for blending minimalist aesthetics with unparalleled ergonomic comfort.</p>
                </div>
              </div>
              
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

      {/* 4. Infinite Marquee & Footer Transition */}
      <section className="py-24 bg-terracotta overflow-hidden relative z-40">
        
        <div className="flex whitespace-nowrap overflow-hidden">
          {/* We duplicate the text twice so it can loop seamlessly */}
          <motion.div 
            className="flex text-[4rem] md:text-[6rem] font-bold text-white tracking-tighter gap-12 pr-12 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
          >
            <span>DESIGN</span> <span className="text-3xl">✦</span>
            <span>COMFORT</span> <span className="text-3xl">✦</span>
            <span>AESTHETICS</span> <span className="text-3xl">✦</span>
            <span>CRAFT</span> <span className="text-3xl">✦</span>
            {/* Duplicates for loop */}
            <span>DESIGN</span> <span className="text-3xl">✦</span>
            <span>COMFORT</span> <span className="text-3xl">✦</span>
            <span>AESTHETICS</span> <span className="text-3xl">✦</span>
            <span>CRAFT</span> <span className="text-3xl">✦</span>
          </motion.div>
        </div>
        
        <div className="flex justify-center mt-20">
          <motion.a 
            href="/shop"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#FAF6F1] text-terracotta border-2 border-transparent px-12 py-5 rounded-full text-xl font-semibold hover:bg-transparent hover:border-[#FAF6F1] hover:text-[#FAF6F1] transition-all duration-300"
          >
            Start Your Journey
          </motion.a>
        </div>
      </section>

    </div>
  );
}
