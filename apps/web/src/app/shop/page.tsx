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
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Furniture</h1>
          <p className="text-gray-600">Discover our premium collection of meticulously crafted pieces.</p>
        </div>
        <ShopClient initialProducts={products} />
      </div>
    </div>
  );
}
