import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ShopClient from '../../../components/shop/ShopClient';

async function getCollection(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/collections/${slug}`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching collection ${slug}:`, error);
    return null;
  }
}

export default async function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = await getCollection(params.slug);
  
  if (!collection) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-white">
      
      {/* Collection Hero */}
      <div className="relative w-full h-[300px] md:h-[450px]">
        <Image
          src={collection.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80'}
          alt={collection.title}
          fill
          priority
          className="object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-white/90 max-w-2xl text-lg md:text-xl font-medium shadow-sm">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid with Filtering (Reusing ShopClient) */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {collection.products?.length || 0} Products
          </h2>
        </div>
        
        {collection.products && collection.products.length > 0 ? (
          <ShopClient initialProducts={collection.products} />
        ) : (
          <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-3xl border border-gray-100">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p>We are currently updating this collection. Please check back later.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
