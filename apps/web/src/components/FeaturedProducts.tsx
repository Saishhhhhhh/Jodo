import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';

async function fetchProductsFromAdminPanel(): Promise<Product[]> {
  const fallbackProducts: Product[] = [
    {
      id: '6a438dfe74b049d5bc53d522',
      brand: 'RetroHome',
      title: 'Mid-Century TV Stand',
      price: 399,
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviews: 42,
    },
    {
      id: '6a438dfe74b049d5bc53d51f',
      brand: 'IronCraft',
      title: 'Industrial Bookshelf',
      price: 349,
      imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      reviews: 84,
    },
    {
      id: '6a438dfe74b049d5bc53d51b',
      brand: 'ErgoMates',
      title: 'Ergonomic Office Chair',
      price: 199.5,
      imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews: 215,
    },
    {
      id: '6a438dfe74b049d5bc53d51e',
      brand: 'SleepWell',
      title: 'Queen Size Platform Bed',
      price: 599,
      imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&auto=format&fit=crop&q=80',
      rating: 4.6,
      reviews: 38,
    },
    {
      id: '6a438dfe74b049d5bc53d51d',
      brand: 'Jodo Living',
      title: 'Minimalist Nightstand',
      price: 145,
      imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      reviews: 56,
    },
    {
      id: '6a438dfe74b049d5bc53d51c',
      brand: 'Plush Designs',
      title: 'Velvet Accent Sofa',
      price: 1450,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews: 89,
    },
    {
      id: '6a438dfe74b049d5bc53d51a',
      brand: 'Jodo Living',
      title: 'Modern Oak Dining Table',
      price: 899,
      imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews: 124,
    },
    {
      id: '6a438dfe74b049d5bc53d521',
      brand: 'ClearView',
      title: 'Glass Top Coffee Table',
      price: 249,
      imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviews: 32,
    },
    {
      id: '6a438dfe74b049d5bc53d523',
      brand: 'Jodo Premium',
      title: 'Luxury Marble Dining Table',
      price: 2499,
      imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews: 12,
    },
    {
      id: 'furn-out-01',
      brand: 'Jodo Outdoors',
      title: 'Outdoor Teak Lounge Chair',
      price: 499,
      imageUrl: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviews: 67,
    }
  ];

  try {
    const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/storefront/products`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return fallbackProducts;
    }

    const json = await res.json();
    
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((p: { _id: string; vendor?: string; title: string; price: number; imageUrl?: string }) => ({
        id: p._id,
        brand: p.vendor || 'JODO',
        title: p.title,
        price: p.price,
        imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1629367142309-a612bd2435e0?auto=format&fit=crop&w=600&q=85',
        rating: 5.0,
        reviews: 0,
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
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[#111111] font-bold text-[32px] tracking-tight">
            Featured Products 
          </h2>
          
          <Link 
            href="/shop/beauty" 
            className="group flex items-center gap-2 text-[#555555] font-semibold text-[15px] hover:text-[#111111] transition-colors"
          >
            Check all items 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </div>

        {/* Products Grid / Horizontal Scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
