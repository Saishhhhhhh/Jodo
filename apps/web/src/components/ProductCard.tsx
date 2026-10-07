'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export interface Product {
  id: string;
  brand: string;
  title: string;
  rating?: number;
  reviews?: number;
  price: number;
  imageUrl: string;
  inventoryQuantity?: number;
  isOutOfStock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  
  // Hydration fix
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlisted = mounted ? isInWishlist(product.id) : false;
  const isOutOfStock = Boolean(
    product.isOutOfStock || 
    (typeof product.inventoryQuantity === 'number' && product.inventoryQuantity <= 0)
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
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
          {/* Subtle gradient overlay to ensure card action buttons are legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>

        {/* Out-of-Stock Label */}
        {isOutOfStock && (
          <div className="absolute top-3.5 left-3.5 z-10 bg-black/80 backdrop-blur-md text-white text-[10px] md:text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
            Out of Stock
          </div>
        )}

        {/* Wishlist Button: Heart icon saves product to customer's wishlist */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem({
              id: product.id,
              title: product.title,
              price: product.price,
              imageUrl: product.imageUrl,
              brand: product.brand,
            });
          }}
          className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isWishlisted ? 'text-terracotta bg-white' : 'text-gray-600 hover:bg-terracotta hover:text-white hover:scale-110'}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          title={isWishlisted ? "In Wishlist" : "Add to Wishlist"}
        >
          <Heart className="w-4 h-4" strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Card Actions: Add to Cart / View Details */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 flex items-center gap-2 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-20">
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-md ${
              isOutOfStock 
                ? 'bg-gray-200/90 text-gray-500 cursor-not-allowed'
                : 'bg-white text-[#1C1A17] hover:bg-terracotta hover:text-white active:scale-95'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="truncate">{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          
          <Link
            href={`/products/${product.id}`}
            className="py-2.5 px-3 rounded-xl font-semibold text-[13px] bg-[#1C1A17]/90 hover:bg-[#1C1A17] text-white transition-all shadow-md flex items-center justify-center whitespace-nowrap active:scale-95"
          >
            View Details
          </Link>
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
