'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

const collections = [
  {
    id: 'home-decor',
    title: 'Home\nDecor',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85',
    items: '3 items',
  },
  {
    id: 'chairs',
    title: 'Chairs',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tables',
    title: 'Tables',
    image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80',
  }
];

export default function CollectionsSection() {
  // By default, the second item (index 1) is active/expanded
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <section className="w-full bg-transparent py-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[#111111] font-bold text-[32px] tracking-tight">
            Explore Collections
          </h2>
          
          <Link 
            href="/shop" 
            className="group flex items-center gap-2 text-sm font-semibold text-[#666666] hover:text-[#111111] transition-colors"
          >
            Explore all
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Expanding Accordion Grid */}
        <div 
          className="flex flex-col md:flex-row w-full h-[500px] gap-4 md:gap-5"
          onMouseLeave={() => setActiveIndex(1)} // Revert to default on mouse leave
        >
          {collections.map((c, index) => {
            const isActive = index === activeIndex;
            
            return (
              <Link
                key={c.id}
                href={`/shop/${c.id}`}
                onMouseEnter={() => setActiveIndex(index)}
                className={`relative rounded-[24px] overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group ${
                  isActive ? 'flex-[2.5] md:flex-[2.5]' : 'flex-1 md:flex-1'
                }`}
              >
                {/* Background Image */}
                <Image
                  src={c.image}
                  alt={c.title.replace('\n', ' ')}
                  fill
                  className={`object-cover transition-transform duration-1000 ${isActive ? 'scale-105' : 'scale-100'}`}
                  unoptimized
                />
                
                {/* Gradient Overlay for Text Readability */}
                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-700 ${isActive ? 'from-black/60 via-black/0' : 'from-black/80 via-black/20'} to-transparent opacity-80`} />

                {/* Optional Items Tag (Top Left) */}
                {c.items && (
                  <div className="absolute top-6 left-6 bg-white text-[#F05E51] font-bold text-[13px] px-3.5 py-1.5 rounded-md shadow-sm">
                    {c.items}
                  </div>
                )}

                {/* Collection Title (Bottom Left) */}
                <h3 className="absolute bottom-6 left-6 text-white font-bold text-[32px] leading-[1.1] whitespace-pre-line z-10">
                  {c.title}
                </h3>

                {/* Hover Arrow Button (Bottom Right) */}
                <div 
                  className={`absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center transition-all duration-500 shadow-lg z-10 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 text-[#C9A87C] stroke-[2.5px]" />
                </div>
              </Link>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
