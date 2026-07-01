import React from 'react';
import Image from 'next/image';

export default function VideoSection() {
  return (
    <section className="w-full bg-transparent pt-16 pb-0 font-sans">
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
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 w-full h-[400px] md:h-[600px]">
            {/* Logo */}
            <div className="relative w-[400px] h-[160px] md:w-[700px] md:h-[240px]">
              <Image 
                src="/logo.png"
                alt="Jodo Logo"
                fill
                className="object-contain object-bottom brightness-0 invert drop-shadow-2xl"
                priority
              />
            </div>
            
            {/* Text - Pulled up with negative margin to reduce gap */}
            <h2 
              className="text-white font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight leading-tight drop-shadow-lg max-w-[800px] -mt-4 md:-mt-12"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Where Design Meets Life.
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
