'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Eye, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { ARProduct } from '@/types/product';

export default function RecentlyViewedSection() {
  const { recentlyViewed, allProducts, productsLoaded, viewProduct, navigateTo } = useAppStore();

  const recentProducts = useMemo(() => {
    if (!allProducts || recentlyViewed.length === 0) return [];
    return recentlyViewed
      .map(slug => allProducts.find(p => p.slug === slug))
      .filter((p): p is ARProduct => !!p && p.isActive);
  }, [allProducts, recentlyViewed]);

  if (!productsLoaded || recentProducts.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">Recently Viewed</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Continue Exploring</h2>
            <p className="mt-2 text-muted-foreground">
              Pick up where you left off
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

        {/* Products horizontal scroll */}
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin">
          {recentProducts.map((product, index) => {
            const hasRealModel = product.model.glbUrl && !product.model.glbUrl.endsWith('/') && product.model.glbUrl !== '/models/';
            return (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => viewProduct(product.slug, product)}
                className="cursor-pointer shrink-0 w-56 sm:w-64"
              >
                <Card className="h-full overflow-hidden border-border/40 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 group">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.model.posterUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm text-[10px]">
                        <Eye className="h-2.5 w-2.5 mr-0.5" /> 3D
                      </Badge>
                      {hasRealModel && (
                        <Badge className="bg-emerald-500/90 text-white backdrop-blur-sm text-[10px]">
                          <Smartphone className="h-2.5 w-2.5 mr-0.5" /> AR
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} {product.dimensions.unit}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
