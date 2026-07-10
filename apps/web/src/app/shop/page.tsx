import React from 'react';
import ShopClient from '../../components/shop/ShopClient';

async function getProducts() {
  try {
    const res = await fetch('http://localhost:4000/api/storefront/products', {
      next: { revalidate: 60 } // Revalidate every minute
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

export default async function ShopPage() {
  const products = await getProducts();
  
  return (
    <div className="min-h-screen bg-white pt-32 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Shop Our Collection</h1>
          <p className="text-gray-500 max-w-xl text-lg">Discover premium furniture designed to elevate your living spaces.</p>
        </div>
        <ShopClient initialProducts={products} />
      </div>
    </div>
  );
}
