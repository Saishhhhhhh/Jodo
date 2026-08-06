'use client';

import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { useRouter } from 'next/navigation';

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

  const handleAddToCart = () => {
    addItem(product);
    addons.forEach((addon) => addItem(addon));
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
        className="flex-1 bg-white border-2 border-[#B65A45] text-[#B65A45] hover:bg-[#B65A45]/5 py-3.5 rounded-md font-bold text-[15px] transition-colors shadow-sm"
      >
        ADD TO CART
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
