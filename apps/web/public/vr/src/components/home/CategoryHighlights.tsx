'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/types/product';
import { useMemo } from 'react';

const categoryIcons: Record<string, string> = {
  Furniture: '🪑',
  Seating: '💺',
  Tables: '🪵',
  Lighting: '💡',
  Decor: '🏺',
  Storage: '📚',
};

const categoryDescriptions: Record<string, string> = {
  Furniture: 'Premium AR-enabled furniture',
  Seating: 'Chairs, sofas & more',
  Tables: 'Coffee, dining & desk tables',
  Lighting: 'Lamps & lighting fixtures',
  Decor: 'Vases, art & accessories',
  Storage: 'Shelves & organizers',
};

const categoryColors: Record<string, string> = {
  Furniture: 'from-emerald-500 to-teal-500',
  Seating: 'from-teal-500 to-cyan-500',
  Tables: 'from-cyan-500 to-emerald-500',
  Lighting: 'from-amber-500 to-orange-500',
  Decor: 'from-rose-500 to-pink-500',
  Storage: 'from-amber-500 to-rose-500',
};

const categoryHSL: Record<string, string> = {
  Furniture: '160 84% 39%',
  Seating: '174 66% 40%',
  Tables: '188 80% 36%',
  Lighting: '38 92% 50%',
  Decor: '350 89% 60%',
  Storage: '25 95% 53%',
};

export default function CategoryHighlights() {
  const { navigateTo, setSelectedCategory, allProducts, productsLoaded } = useAppStore();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!allProducts || allProducts.length === 0) return counts;
    allProducts.forEach(p => {
      if (p.isActive) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  const categories = CATEGORIES.filter(c => c !== 'All');

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 mb-4 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400"
          >
            🏷️ Collections
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Product Categories</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Browse our AR-enabled product collections
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const count = categoryCounts[category] || 0;
            const gradientColor = categoryColors[category] || 'from-emerald-500 to-teal-500';
            return (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => {
                  setSelectedCategory(category);
                  navigateTo('products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative flex items-center gap-4 rounded-xl border border-border/40 bg-background p-5 text-left transition-all duration-300 overflow-hidden card-shine hover-lift"
              >
                {/* Animated gradient line on left */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to bottom, hsl(${categoryHSL[category] || '160 84% 39%'}), transparent)` }}
                />
                
                {/* Subtle gradient glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.06] transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse at 30% 50%, hsl(${categoryHSL[category] || '160 84% 39%'} / 0.15), transparent 70%)` }}
                />
                
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/80 text-3xl shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  {categoryIcons[category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{category}</h3>
                    {productsLoaded && count > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                        {count} product{count !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {categoryDescriptions[category] || 'AR-enabled products'}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-emerald-600 shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
