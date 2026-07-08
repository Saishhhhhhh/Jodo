'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import { Leaf, Award, Recycle, Shield } from 'lucide-react';

const HORIZONTAL_ITEMS = [
  {
    title: "Initial Concept",
    desc: "Drawing inspiration from organic shapes and modern minimalism. We begin with a simple line.",
    img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    color: "bg-[#F3EFEA]" // taupe-light tint
  },
  {
    title: "Material Sourcing",
    desc: "Selecting only the finest, sustainable materials for longevity. Nature provides our palette.",
    img: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=1200&q=80",
    color: "bg-[#D1C4B7]" 
  },
  {
    title: "Master Craftsmanship",
    desc: "Our artisans spend countless hours perfecting every joint and seam. Precision is our signature.",
    img: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1200&q=80",
    color: "bg-[#E8DFD5]"
  },
  {
    title: "The Final Piece",
    desc: "A timeless addition to your home, ready to be enjoyed for generations to come.",
    img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
    color: "bg-[#D1C4B7]"
  }
];

export default function AboutPage() {
  // Refs for scroll tracking
  const heroRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);
  
  // Hero Parallax Scroll Math
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Scale up and fade out for the word "CRAFT" (reduced from 15x to 5x)
  const heroScale = useTransform(heroScroll, [0, 1], [1, 5]);
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);

  // Horizontal Scroll Math
  const { scrollYProgress: horizontalScroll } = useScroll({
    target: horizontalRef,
  });
  const xTransform = useTransform(horizontalScroll, [0, 1], ["0%", "-66.66%"]);

  return (
    <div className="bg-[#FAF6F1] min-h-screen font-sans">
      
      {/* 1. The Parallax Text Hero */}
      <section ref={heroRef} className="h-[120vh] relative flex items-start justify-center pt-40 overflow-hidden bg-white">
        {/* Subtle background noise/gradient could go here */}
        <motion.div 
          className="sticky top-[30vh] origin-center z-10"
          style={{ scale: heroScale, opacity: heroOpacity }}
        >
          <h1 className="text-[15vw] md:text-[10vw] font-bold text-center leading-[0.8] tracking-tighter text-jodo-dark uppercase">
            CRAFT
          </h1>
        </motion.div>
        
        {/* Secondary text that stays static */}
        <div className="absolute bottom-32 left-8 md:left-24 max-w-md z-20">
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

      {/* 2. Horizontal Scroll Gallery (The Journey) - Editorial Style */}
      <section ref={horizontalRef} className="relative h-[400vh] bg-[#FAF6F1] z-30">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          
          {/* Container is 300vw. We slide it left by 66.66% (200vw) so it perfectly stops at the end */}
          <motion.div style={{ x: xTransform }} className="flex w-[300vw] h-full">
            {HORIZONTAL_ITEMS.map((item, i) => (
              <div 
                key={i} 
                className="w-screen lg:w-[75vw] h-full flex flex-col justify-center relative px-8 lg:px-20"
              >
                <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-20 items-center w-full max-w-6xl mx-auto">
                  
                  {/* Huge Watermark Number */}
                  <div className="absolute top-[-50px] left-[-20px] lg:top-[-120px] lg:left-[-80px] text-[10rem] lg:text-[20rem] font-bold text-[#E8DFD5]/70 leading-none pointer-events-none z-0 tracking-tighter select-none">
                    0{i + 1}
                  </div>

                  {/* Editorial Image Frame */}
                  <div className="w-full lg:w-[55%] aspect-[4/5] relative rounded-[24px] overflow-hidden shadow-sm z-10 group">
                    <Image 
                      src={item.img} 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                      alt={item.title}
                    />
                  </div>
                  
                  {/* Text Box */}
                  <div className="w-full lg:w-[45%] flex flex-col relative z-20 pt-8 lg:pt-0">
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

      {/* 3. The Bento Box Grid (Our Values) */}
      <section className="py-32 max-w-[1440px] mx-auto px-4 md:px-8 bg-white rounded-t-[60px] -mt-10 relative z-40 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        
        <div className="mb-20 text-center">
          <h2 className="text-5xl md:text-7xl text-jodo-dark font-semibold tracking-tighter mb-6">Our DNA</h2>
          <p className="text-2xl text-taupe-dark max-w-2xl mx-auto">The core principles that shape every piece we design.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 auto-rows-[250px]">
          
          {/* Large Wide Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="md:col-span-2 md:row-span-1 bg-[#FAF6F1] rounded-[40px] p-10 flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-shadow"
          >
            <Leaf className="w-12 h-12 text-terracotta mb-6" />
            <h3 className="text-3xl font-semibold text-jodo-dark mb-4">Sustainability First</h3>
            <p className="text-taupe-dark text-lg max-w-md">Every tree we use is ethically sourced, ensuring we give back more than we take from the environment.</p>
            {/* Aesthetic circle blur */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-terracotta/10 blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
          </motion.div>

          {/* Tall Vertical Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-1 md:row-span-2 bg-jodo-dark text-white rounded-[40px] p-10 flex flex-col justify-end relative overflow-hidden group"
          >
            <div className="absolute inset-0 z-0">
               <Image 
                 src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80" 
                 alt="Texture" 
                 fill 
                 className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" 
               />
            </div>
            <div className="relative z-10">
              <Award className="w-12 h-12 text-gold mb-6" />
              <h3 className="text-3xl font-semibold mb-4">Award Winning</h3>
              <p className="text-taupe-light text-lg">Recognized globally for minimalist innovation.</p>
            </div>
          </motion.div>

          {/* Small Top Right Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:col-span-1 md:row-span-1 bg-terracotta text-white rounded-[40px] p-10 flex flex-col justify-center group hover:-translate-y-2 transition-transform duration-500"
          >
            <Shield className="w-10 h-10 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">10-Year Warranty</h3>
            <p className="text-white/80">Built to last a lifetime.</p>
          </motion.div>

          {/* Small Bottom Left Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-1 md:row-span-1 bg-white border border-taupe-light rounded-[40px] p-10 flex flex-col justify-center group"
          >
            <Recycle className="w-10 h-10 text-jodo-dark mb-4" />
            <h3 className="text-2xl font-semibold text-jodo-dark mb-2">Zero Waste</h3>
            <p className="text-taupe-dark">Optimized cutting.</p>
          </motion.div>

          {/* Medium Bottom Block */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="md:col-span-1 md:row-span-1 bg-[#D1C4B7] rounded-[40px] p-10 flex flex-col justify-center relative overflow-hidden group"
          >
            <h3 className="text-3xl font-semibold text-jodo-dark mb-2 relative z-10">Ergonomics</h3>
            <p className="text-jodo-dark/70 text-lg relative z-10">Posture perfect design.</p>
            <div className="absolute right-[-20%] bottom-[-20%] text-[10rem] text-white/30 font-bold pointer-events-none group-hover:scale-110 transition-transform duration-700">
              E
            </div>
          </motion.div>

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
