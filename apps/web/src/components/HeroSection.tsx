'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowLeftRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2000&q=85",
    tagline: "Crafting Comfort, Shaping Style",
    heading: "Elevating Everyday Living With Timeless Design",
    subtext: "From modern minimalist to timeless classics, our collection offers something for every taste, transforming any space into a place you'll love."
  },
  {
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85",
    tagline: "Minimalist Masterpieces",
    heading: "Discover the Beauty of Simple Living",
    subtext: "Embrace clean lines and uncluttered spaces. Our minimalist collection brings a sense of calm and clarity to your daily environment."
  },
  {
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85",
    tagline: "Bold & Contemporary",
    heading: "Statement Pieces For Modern Homes",
    subtext: "Make a lasting impression with our contemporary designs. Unique shapes and premium materials that define the modern aesthetic."
  }
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 lg:px-6 py-0">
      {/* ── HERO CONTAINER ── */}
      <div
        className="relative w-full overflow-hidden flex flex-col rounded-[24px] min-h-[500px] lg:min-h-[max(720px,calc(100vh-120px))] bg-[#D1C4B7]"
      >
        {/* Background images with Ken Burns effect */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt="Elegant living room"
              fill
              className={`object-cover object-center transition-transform duration-[10000ms] ease-linear ${
                index === currentImage ? 'scale-110' : 'scale-100'
              }`}
              priority={index === 0}
              unoptimized
            />
          </div>
        ))}
        
        {/* Dark overlay to ensure text remains readable against bright images */}
        <div className="absolute inset-0 bg-black/10 z-0"></div>

        {/* ── TEXT CONTENT — left side ── */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 md:px-10 lg:px-16 max-w-[800px]">
          
          <div className="relative w-full">
            {HERO_SLIDES.map((slide, index) => (
              <div 
                key={slide.image}
                style={{ opacity: index === currentImage ? 1 : 0 }}
                className={`w-full flex flex-col justify-start transition-all duration-1000 ease-in-out ${
                  index === currentImage ? 'relative translate-y-0 z-10 pointer-events-auto' : 'absolute top-0 left-0 translate-y-8 z-0 pointer-events-none'
                }`}
              >
                {/* Tagline */}
                <p className="text-white text-[15px] font-bold mb-4 tracking-wide">
                  {slide.tagline}
                </p>

                {/* Main headline */}
                <h1 className="text-white text-3xl md:text-5xl lg:text-[56px] font-bold leading-[1.2] mb-6 drop-shadow-lg max-w-4xl">
                  {slide.heading}
                </h1>

                {/* Subtext */}
                <p className="text-white/95 text-[14px] font-medium leading-relaxed max-w-[420px]">
                  {slide.subtext}
                </p>
              </div>
            ))}
          </div>

          {/* Discover Now button */}
          <Link
            href="/shop"
            className="flex items-center gap-4 w-fit transition-transform hover:-translate-y-0.5 bg-terracotta mt-4"
            style={{
              borderRadius: '8px',
              padding: '8px 8px 8px 24px',
            }}
          >
            <span className="text-white font-bold text-[15px]">Discover Now</span>
            <span
              className="flex items-center justify-center bg-white rounded-full"
              style={{ width: '32px', height: '32px' }}
            >
              <ArrowUpRight className="w-4 h-4 text-terracotta" />
            </span>
          </Link>
        </div>

        {/* ── BOTTOM LEFT CIRCULAR BUTTON ── */}
        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-10 hidden md:block">
          <button 
            onClick={() => setCurrentImage((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
          >
            <ArrowLeftRight className="w-5 h-5 text-terracotta" />
          </button>
        </div>

        {/* ── FLOATING BLOG CARD — Bottom Right ── */}
        <div className="absolute bottom-0 right-0 z-20 hidden lg:flex">
          
          {/* Inverted corner - Left side */}
          <svg className="absolute bottom-0 left-[-32px] w-8 h-8" viewBox="0 0 32 32" fill="none">
            <path d="M0 32H32V0C32 17.673 17.673 32 0 32Z" fill="white" />
          </svg>

          {/* Inverted corner - Top side */}
          <svg className="absolute top-[-32px] right-0 w-8 h-8" viewBox="0 0 32 32" fill="none">
            <path d="M32 0V32H0C17.673 32 32 17.673 32 0Z" fill="white" />
          </svg>

          <div
            className="bg-white flex items-stretch overflow-hidden"
            style={{
              borderTopLeftRadius: '32px',
              width: '640px',
              padding: '32px 32px 32px 40px',
            }}
          >
            {/* Text side */}
            <div className="flex-1 pr-6 flex flex-col justify-between py-1">
              <div>
                <h3 className="text-[#1C1A17] font-bold text-[22px] leading-snug mb-3">
                  60 Home Decor Ideas That Designers Swear By
                </h3>
                <p className="text-gray-500 text-[14px] leading-relaxed line-clamp-3 mb-5">
                  Utilize drawers and shelves to store everyday office
                  supplies and files you need access to. Credenzas with
                  deep pull-out drawers can be fitted with file folder...
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 w-fit transition-transform hover:-translate-y-0.5 bg-terracotta"
                style={{
                  borderRadius: '8px',
                  padding: '8px 8px 8px 20px',
                }}
              >
                <span className="text-white font-bold text-[14px]">Exclusive</span>
                <span
                  className="flex items-center justify-center bg-white rounded-full"
                  style={{ width: '24px', height: '24px' }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-terracotta" />
                </span>
              </Link>
            </div>
            
            {/* Image side */}
            <div className="relative w-[240px] shrink-0 rounded-[20px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80"
                alt="Decor ideas"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
