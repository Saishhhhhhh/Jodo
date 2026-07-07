'use client';

import React, { useEffect, useState } from 'react';
import { useWishlistStore } from '../../store/useWishlistStore';
import ProductCard from '../../components/ProductCard';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[#F9F6F0] py-16 md:py-24 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Your Wishlist</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Keep track of the pieces you love. Add them to your cart when you&apos;re ready to make them yours.
        </p>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 lg:px-8 py-16 md:py-24">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={{
                  id: item.id,
                  title: item.title,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  brand: item.brand,
                  rating: 5.0, // Default mock rating
                  reviews: Math.floor(Math.random() * 50) + 10, // Mock reviews
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-[#B65A45]" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">
              You haven&apos;t saved any items yet. Start exploring our collections to find your perfect match.
            </p>
            <Link 
              href="/shop" 
              className="px-8 py-4 bg-[#B65A45] text-white font-bold rounded-xl hover:bg-[#a04e3b] transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
