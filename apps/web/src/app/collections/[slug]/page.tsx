import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import ShopClient from '../../../components/shop/ShopClient';

interface CollectionData {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  products: any[];
}

async function getCollection(slug: string): Promise<CollectionData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${baseUrl}/api/storefront/collections/${slug}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        return data.data;
      }
    }
  } catch (error) {
    console.error(`Error fetching collection ${slug}:`, error);
  }

  // Fallback: search products by category/keyword directly
  try {
    const res = await fetch(`${baseUrl}/api/storefront/products`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      const allProducts = data.data || [];
      const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');
      const matchedProducts = allProducts.filter((p: any) => {
        const cat = (p.category || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        const roomType = (p.productDetails?.['Room Type'] || '').toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
        return (
          cat.includes(normalizedSlug) ||
          normalizedSlug.includes(cat) ||
          roomType.includes(normalizedSlug) ||
          tags.includes(slug) ||
          (normalizedSlug.includes('dining') && (cat.includes('dining') || title.includes('dining'))) ||
          (normalizedSlug.includes('living') && (cat.includes('living') || title.includes('living'))) ||
          (normalizedSlug.includes('bedroom') && (cat.includes('bedroom') || title.includes('bedroom')))
        );
      });

      if (matchedProducts.length > 0) {
        const formattedTitle = slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        return {
          _id: 'dynamic-' + slug,
          title: formattedTitle,
          slug: slug,
          description: `Handcrafted ${formattedTitle} furniture engineered for comfort, function, and enduring beauty.`,
          imageUrl: matchedProducts[0]?.imageUrl || 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80',
          products: matchedProducts,
        };
      }
    }
  } catch (error) {
    console.error(`Error in fallback product lookup for ${slug}:`, error);
  }

  return null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const collection = await getCollection(params.slug);
  if (!collection) {
    return {
      title: 'Collection Not Found | JODO Home',
    };
  }

  return {
    title: `${collection.title} | JODO Home`,
    description: collection.description || `Discover our curated ${collection.title} collection at JODO Home.`,
  };
}

export default async function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = await getCollection(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-20">
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-terracotta transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link href="/collections" className="hover:text-terracotta transition-colors">Collections</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-gray-800">{collection.title}</span>
      </div>

      {/* Collection Hero */}
      <div className="relative w-full h-[280px] md:h-[400px]">
        <Image
          src={collection.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80'}
          alt={collection.title}
          fill
          priority
          className="object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-white/80 text-xs md:text-sm uppercase tracking-widest font-semibold mb-2">
            Curated Collection
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 tracking-tight">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-white/90 max-w-2xl text-base md:text-lg font-medium shadow-sm">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Products Grid with Filtering (Reusing ShopClient) */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10 md:py-14">
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
