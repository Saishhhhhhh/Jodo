import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ShopClient from '../../../components/shop/ShopClient';

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

function formatCategoryTitle(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const title = formatCategoryTitle(params.category);
  return {
    title: `${title} Furniture | Shop JODO Home`,
    description: `Discover premium handcrafted ${title} furniture designed for durability and comfort at JODO Home.`,
  };
}

export default async function ShopCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const products = await getProducts();
  const categoryTitle = formatCategoryTitle(params.category);

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-24 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Breadcrumbs */}
        <div className="py-4 flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-terracotta transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/shop" className="hover:text-terracotta transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-gray-800">{categoryTitle}</span>
        </div>

        <div className="mb-8 md:mb-12 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">
            {categoryTitle}
          </h1>
          <p className="text-gray-500 max-w-xl text-base md:text-lg px-2">
            Explore our curated {categoryTitle.toLowerCase()} designs crafted to bring elegance and functionality to your space.
          </p>
        </div>

        <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading collection...</div>}>
          <ShopClient initialProducts={products} initialCategory={params.category} />
        </Suspense>
      </div>
    </div>
  );
}
