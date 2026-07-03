'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export interface Product {
  id: string;
  brand: string;
  title: string;
  rating: number;
  reviews: number;
  price: number;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      brand: product.brand,
    });
  };

  return (
    <div className="group relative flex flex-col gap-3 w-full">
      {/* ── Product Image Container ── */}
      <div className="relative w-full aspect-[4/5] bg-[#F9F6F0] rounded-[15px] overflow-hidden">
        
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-0">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
          {/* Subtle gradient overlay to ensure the quick add button is legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </Link>

        {/* Favorite Button */}
        <button 
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 hover:bg-terracotta hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
          aria-label="Add to favorites"
        >
          <Heart className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Hover "Quick Add" Button */}
        <div className="absolute inset-x-0 bottom-0 p-3 md:p-3 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-20">
          <button 
            onClick={handleQuickAdd}
            className="w-full bg-white/90 backdrop-blur-md text-[#1C1A17] hover:bg-[#1C1A17] hover:text-white flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-[14px] transition-colors shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            Quick Add
          </button>
        </div>
      </div>

      {/* ── Product Info ── */}
      <div className="flex flex-col px-1">
        <div className="flex justify-between items-start gap-4">
          <Link href={`/products/${product.id}`}>
            <h3 className="text-[#1C1A17] font-bold text-[15px] md:text-[16px] leading-snug line-clamp-2 group-hover:text-terracotta transition-colors">
              {product.title}
            </h3>
          </Link>
          <div className="text-[#1C1A17] font-bold text-[15px] md:text-[16px] whitespace-nowrap">
            ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-400 text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase">
            {product.brand}
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
            <Star className="w-3.5 h-3.5 fill-[#FDB022] text-[#FDB022]" />
            <span>{product.rating}</span>
            <span className="text-gray-400 font-normal">({product.reviews})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
