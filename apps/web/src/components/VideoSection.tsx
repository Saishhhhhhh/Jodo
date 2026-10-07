import React from 'react';
import Image from 'next/image';

export default function VideoSection() {
  return (
    <section className="w-full bg-transparent py-0 font-sans">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        <div 
          className="relative w-full overflow-hidden shadow-lg flex items-center justify-center" 
          style={{ borderRadius: '15px' }}
        >
          {/* Background Video */}
          <video 
            src="/homevideo.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/40 z-10" />

          {/* Centered Content */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 w-full h-[450px] md:h-[600px]">
            {/* Logo - Centered White Treatment */}
            <div className="relative w-[240px] sm:w-[320px] md:w-[420px] lg:w-[480px] h-[105px] sm:h-[140px] md:h-[185px] lg:h-[210px]">
              <Image 
                src="/logo.png"
                alt="Jodo"
                fill
                className="object-contain brightness-0 invert drop-shadow-2xl"
                priority
              />
            </div>

            {/* Tagline overlay - Smaller font size, minimal */}
            <p 
              className="text-white/95 font-medium text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase mt-3 md:mt-4 drop-shadow-lg"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              The Joy of Together
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
