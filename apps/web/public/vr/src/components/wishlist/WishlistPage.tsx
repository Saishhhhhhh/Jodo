'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Trash2, Eye, Smartphone, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

export default function WishlistPage() {
  const { wishlist, allProducts, viewProduct, navigateTo, toggleWishlist } = useAppStore();

  const wishlistProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    return wishlist
      .map(slug => allProducts.find(p => p.slug === slug))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }, [allProducts, wishlist]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">
            {wishlistProducts.length > 0 
              ? `${wishlistProducts.length} saved product${wishlistProducts.length !== 1 ? 's' : ''}` 
              : 'Your wishlist is empty'}
          </p>
        </div>
        {wishlistProducts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive mt-1"
            onClick={() => {
              [...wishlist].forEach(slug => toggleWishlist(slug));
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear All
          </Button>
        )}
      </div>

      {/* Products Grid */}
      {wishlistProducts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {wishlistProducts.map((product, index) => {
              const hasRealModel = product.model.glbUrl && 
                !product.model.glbUrl.endsWith('/') && 
                product.model.glbUrl !== '/models/';
              return (
                <motion.div
                  key={product.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                >
                  <Card className="group h-full overflow-hidden border-border/40 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.model.posterUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm gap-1">
                          <Eye className="h-3 w-3" /> 3D
                        </Badge>
                        {hasRealModel && (
                          <Badge variant="secondary" className="bg-emerald-500/90 text-white backdrop-blur-sm gap-1">
                            <Smartphone className="h-3 w-3" /> AR
                          </Badge>
                        )}
                      </div>
                      <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm text-xs">
                        {product.category}
                      </Badge>
                      {/* Remove button */}
                      <button
                        onClick={() => toggleWishlist(product.slug)}
                        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-red-600"
                      >
                        <Heart className="h-4 w-4 fill-white" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2.5">
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-tight line-clamp-1 text-sm">{product.name}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground font-mono">{product.sku}</p>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3H3v7h18V3Z"/><path d="M21 14H3v7h18v-7Z"/></svg>
                          {product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} {product.dimensions.unit}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                            onClick={() => viewProduct(product.slug, product)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View Details
                          </Button>
                          {product.model.fileSizeMb && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {product.model.fileSizeMb > 1 ? `${product.model.fileSizeMb} MB` : `${(product.model.fileSizeMb * 1024).toFixed(0)} KB`}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-full bg-muted p-5">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">No items in wishlist</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
            Start exploring our AR-enabled products and tap the heart icon to save your favorites.
          </p>
          <Button
            onClick={() => navigateTo('products')}
            className="mt-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
          >
            <Package className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </div>
      )}
    </motion.div>
  );
}
