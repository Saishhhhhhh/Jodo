import React, { Suspense } from 'react';
import ShopClient from '../../components/shop/ShopClient';

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/products`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: { category?: string; [key: string]: string | string[] | undefined };
}) {
  const products = await getProducts();
  const initialCategory = typeof searchParams?.category === 'string' ? searchParams.category : undefined;
  
  return (
    <div className="min-h-screen bg-white pt-20 md:pt-32 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">Shop Our Collection</h1>
          <p className="text-gray-500 max-w-xl text-base md:text-lg px-2">Discover premium furniture designed to elevate your living spaces.</p>
        </div>
        <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading collection...</div>}>
          <ShopClient initialProducts={products} initialCategory={initialCategory} />
        </Suspense>
      </div>
    </div>
  );
}
