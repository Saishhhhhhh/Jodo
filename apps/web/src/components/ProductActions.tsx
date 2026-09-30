'use client';

import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

interface ProductActionsProps {
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    brand?: string;
  };
  addons?: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    brand?: string;
  }[];
}

export default function ProductActions({ product, addons = [] }: ProductActionsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    addons.forEach((addon) => addItem(addon));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product);
    addons.forEach((addon) => addItem(addon));
    router.push('/checkout');
  };

  return (
    <div className="flex gap-3 mb-10">
      <button 
        onClick={handleAddToCart}
        className={`flex-1 ${
          added 
            ? 'bg-emerald-600 text-white' 
            : 'bg-[#B65A45] text-white hover:bg-[#B65A45]/90'
        } py-3.5 rounded-md font-bold text-[15px] transition-all duration-200 shadow-sm flex items-center justify-center gap-2`}
      >
        {added ? (
          <>
            <Check className="w-4 h-4 stroke-[3]" />
            ADDED!
          </>
        ) : (
          'ADD TO CART'
        )}
      </button>
      <button 
        onClick={handleBuyNow}
        className="flex-1 bg-[#B65A45] text-white hover:bg-[#B65A45]/90 py-3.5 rounded-md font-bold text-[15px] transition-colors shadow-sm"
      >
        BUY NOW
      </button>
    </div>
  );
}
