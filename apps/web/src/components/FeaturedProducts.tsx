import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';

async function fetchProductsFromAdminPanel(): Promise<Product[]> {
  const fallbackProducts: Product[] = [
    {
      id: '6ab22d7d0ebb281a1ac0b121',
      brand: 'JODO',
      title: 'Ananta Sheesham Upholstered Dining Chairs (Set of 2)',
      price: 13999,
      imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80',
      rating: 4.9,
      reviews: 24,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b127',
      brand: 'JODO',
      title: 'Vistara 3-Seater Modular Sofa with Natural Cane Weave',
      price: 44999,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviews: 42,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b12c',
      brand: 'JODO',
      title: 'Sahyadri Fluted Oak 3-Drawer Nightstand',
      price: 11999,
      imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80',
      rating: 4.8,
      reviews: 19,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b130',
      brand: 'JODO',
      title: 'Malhar Low-Profile Teak Coffee Table with Storage Shelf',
      price: 15999,
      imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
      rating: 4.9,
      reviews: 31,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b134',
      brand: 'JODO',
      title: 'Nilgiri Modular Bookshelf & Room Divider (5-Tier)',
      price: 26999,
      imageUrl: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80',
      rating: 4.9,
      reviews: 28,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b139',
      brand: 'JODO',
      title: 'Samvaad Round 4-Seater Breakfast Table',
      price: 22499,
      imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1200&q=80',
      rating: 4.8,
      reviews: 15,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b10f',
      brand: 'JODO',
      title: 'Aurelia Minimalist Teak Armchair',
      price: 24999,
      imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviews: 37,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b115',
      brand: 'JODO',
      title: 'Nordic Oak Floating Platform Bedframe (King Size)',
      price: 48999,
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviews: 44,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b11b',
      brand: 'JODO',
      title: 'Aarambh Solid Teak Study Desk with Cable Management',
      price: 18499,
      imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      rating: 4.9,
      reviews: 22,
    },
    {
      id: '6ab22d7d0ebb281a1ac0b108',
      brand: 'JODO',
      title: 'Ananta Solid Sheesham 6-Seater Dining Table',
      price: 28999,
      imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviews: 58,
    }
  ];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/products`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return fallbackProducts;
    }

    const json = await res.json();
    
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((p: { _id: string; vendor?: string; title: string; price: number; imageUrl?: string; rating?: number; reviewsCount?: number }) => ({
        id: p._id,
        brand: p.vendor || 'JODO',
        title: p.title,
        price: p.price,
        imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1629367142309-a612bd2435e0?auto=format&fit=crop&w=600&q=85',
        rating: 5.0,
        reviews: 24,
      }));
    }

    return fallbackProducts;
  } catch (error) {
    console.error("Failed to fetch products from storefront API:", error);
    return fallbackProducts;
  }
}

export default async function FeaturedProducts() {
  // Fetch data on the server component
  const products = await fetchProductsFromAdminPanel();

  return (
    <section className="w-full bg-transparent py-0 font-sans">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h2 className="font-heading text-[#111111] font-bold text-[22px] sm:text-2xl md:text-[32px] tracking-tight whitespace-nowrap">
            Featured Furniture
          </h2>
          
          <Link 
            href="/shop" 
            className="group flex items-center gap-1 md:gap-2 text-[#555555] font-semibold text-[14px] md:text-[15px] hover:text-[#111111] transition-colors whitespace-nowrap shrink-0"
          >
            <span className="md:hidden">View all</span>
            <span className="hidden md:inline">Check all items</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </div>

        {/* Products Grid / Horizontal Scroll */}
        <div 
          className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-x-6 md:gap-y-12 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-6 md:pb-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[calc(50%-8px)] flex-shrink-0 snap-start md:w-auto md:flex-shrink-1">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
