'use client';

import { useAppStore } from '@/store/useAppStore';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function FeaturedProducts() {
  const { viewProduct, navigateTo, allProducts, productsLoaded } = useAppStore();

  const products = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    return allProducts.filter(p => p.isActive).slice(0, 3);
  }, [allProducts]);

  const isLoading = !productsLoaded;

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                <Sparkles className="h-3 w-3" />
                Curated
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">Featured Products</h2>
            </div>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Explore our curated collection of AR-enabled products. View them in 3D and place them in your room.
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            onClick={() => navigateTo('products')}
          >
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative mt-10">
          {/* Gradient border glow around section */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 pointer-events-none" />
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                </div>
              ))
            : products.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => viewProduct(product.slug, product)}
                  className="cursor-pointer"
                >
                  <ProductCard product={product} index={index} />
                </div>
              ))}
          </div>
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Button
            variant="outline"
            onClick={() => navigateTo('products')}
            className="gap-2"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
