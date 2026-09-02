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
  const [banners, setBanners] = useState<any[]>(HERO_SLIDES);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/storefront/banners`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setBanners(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch banners:', err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % banners.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <section className="px-4 lg:px-6 py-0">
      {/* ── HERO CONTAINER ── */}
      <div
        className="relative w-full overflow-hidden flex flex-col rounded-[24px] min-h-[500px] lg:min-h-[max(720px,calc(100vh-120px))] bg-[#D1C4B7]"
      >
        {/* Background images with Ken Burns effect */}
        {banners.map((slide, index) => (
          <div
            key={slide._id || slide.image}
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
            {banners.map((slide, index) => (
              <div 
                key={slide._id || slide.image}
                style={{ opacity: index === currentImage ? 1 : 0 }}
                className={`w-full flex flex-col justify-start transition-all duration-1000 ease-in-out ${
                  index === currentImage ? 'relative translate-y-0 z-10 pointer-events-auto' : 'absolute top-0 left-0 translate-y-8 z-0 pointer-events-none'
                }`}
              >
                {/* Tagline */}
                <p className="text-white text-[13px] md:text-[15px] font-bold mb-2 md:mb-4 tracking-wide">
                  {slide.tagline}
                </p>

                {/* Main headline */}
                <h1 className="text-white text-2xl md:text-5xl lg:text-[56px] font-bold leading-[1.2] mb-3 md:mb-6 drop-shadow-lg max-w-4xl">
                  {slide.heading}
                </h1>

                {/* Subtext */}
                <p className="text-white/95 text-[12px] md:text-[14px] font-medium leading-relaxed max-w-[420px]">
                  {slide.subtext}
                </p>
              </div>
            ))}
          </div>

          {/* Discover Now button */}
          <Link
            href={banners[currentImage]?.buttonUrl || "/shop"}
            className="flex items-center gap-3 md:gap-4 w-fit transition-transform hover:-translate-y-0.5 bg-terracotta mt-4 md:mt-6 rounded-lg md:rounded-[8px] pl-4 pr-1.5 py-1.5 md:pl-6 md:pr-2 md:py-2"
          >
            <span className="text-white font-bold text-[13px] md:text-[15px]">{banners[currentImage]?.buttonText || "Discover Now"}</span>
            <span
              className="flex items-center justify-center bg-white rounded-full w-7 h-7 md:w-8 md:h-8"
            >
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-terracotta" />
            </span>
          </Link>
        </div>

        {/* ── MOBILE SLIDER BUTTON (Corner Effect) ── */}
        <div className="absolute bottom-0 right-0 z-30 flex md:hidden">
          {/* Inverted corner - Left side */}
          <svg className="absolute bottom-0 left-[-20px] w-5 h-5" viewBox="0 0 32 32" fill="none">
            <path d="M0 32H32V0C32 17.673 17.673 32 0 32Z" fill="white" />
          </svg>

          {/* Inverted corner - Top side */}
          <svg className="absolute top-[-20px] right-0 w-5 h-5" viewBox="0 0 32 32" fill="none">
            <path d="M32 0V32H0C17.673 32 32 17.673 32 0Z" fill="white" />
          </svg>

          <div
            className="bg-white flex items-center justify-center"
            style={{
              borderTopLeftRadius: '24px',
              padding: '16px 12px 12px 16px',
            }}
          >
            <button 
              onClick={() => setCurrentImage((prev) => (prev + 1) % banners.length)}
              className="w-12 h-12 bg-terracotta rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:scale-105 transition-transform"
            >
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* ── DESKTOP SLIDER BUTTON ── */}
        <div className="absolute bottom-8 left-8 z-30 hidden md:block">
          <button 
            onClick={() => setCurrentImage((prev) => (prev + 1) % banners.length)}
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
