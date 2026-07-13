'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CircularGallery from './CircularGallery';

const collections = [
  {
    id: 'home-decor',
    title: 'Home Decor',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85',
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
  const galleryItems = collections.map(c => ({
    image: c.image,
    text: c.title
  }));

  return (
    <section className="w-full px-5 md:px-10 py-0 font-sans">
      <div className="max-w-[1400px] mx-auto bg-terracotta rounded-[32px] p-6 md:p-12 overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-white font-bold text-2xl md:text-[32px] tracking-tight">
            Explore Collections
          </h2>
          
          <Link 
            href="/shop" 
            className="group flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
          >
            Explore all
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Circular Gallery (React Bits) */}
        <div className="w-full h-[300px] md:h-[480px] relative rounded-[24px] overflow-hidden">
          <CircularGallery
            items={galleryItems}
            bend={0}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollEase={0.05}
            font="bold 30px Syne"
            scrollSpeed={2}
          />
        </div>
        
      </div>
    </section>
  );
}
