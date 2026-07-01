import React from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, StarHalf } from 'lucide-react';

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
  // Generate stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-[14px] h-[14px] fill-[#FDB022] text-[#FDB022]" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-[14px] h-[14px]">
            <Star className="absolute inset-0 w-[14px] h-[14px] text-[#FDB022]" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-[14px] h-[14px] fill-[#FDB022] text-[#FDB022]" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-[14px] h-[14px] text-[#E5E7EB]" />);
      }
    }
    return stars;
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1">
      {/* ── Favorite Button ── */}
      <button 
        className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-[#111111] transition-colors"
        aria-label="Add to favorites"
      >
        <Heart className="w-5 h-5 transition-transform group-hover/btn:scale-110" strokeWidth={1.5} />
      </button>

      {/* ── Product Image ── */}
      <div className="relative w-full aspect-[4/3] bg-white flex items-center justify-center p-6">
        <div className="relative w-full h-full max-h-[180px]">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        </div>
      </div>

      {/* ── Product Info ── */}
      <div className="flex flex-col flex-grow px-6 pb-6 pt-2">
        {/* Brand */}
        <span className="text-[#888888] text-[12px] font-bold tracking-widest uppercase mb-2">
          {product.brand}
        </span>
        
        {/* Title */}
        <h3 className="text-[#111111] font-semibold text-[15px] leading-snug mb-3 line-clamp-2 min-h-[44px]">
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-5 mt-auto">
          <div className="flex items-center gap-0.5">
            {renderStars(product.rating)}
          </div>
          <span className="text-[#666666] text-[13px] font-medium mt-0.5">
            ({product.reviews})
          </span>
        </div>
        
        {/* Price */}
        <div className="text-[#111111] font-bold text-[18px]">
          ${product.price.toFixed(2)}
        </div>
      </div>

      {/* ── Hover "Add to Cart" Button ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-20">
        <button className="w-full bg-[#111111] hover:bg-[#222222] text-white flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold text-[15px] transition-colors shadow-md">
          <ShoppingBag className="w-5 h-5" strokeWidth={2} />
          Add to cart
        </button>
      </div>
    </div>
  );
}
