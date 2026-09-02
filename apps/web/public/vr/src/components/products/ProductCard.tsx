'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Maximize2, Smartphone, Box, Heart, GitCompareArrows, ImageIcon, ShoppingCart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import type { ARProduct } from '@/types/product';
import { useState, useCallback } from 'react';

interface ProductCardProps {
  product: ARProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { isWishlisted, toggleWishlist, toggleCompare, compareList, addToCart, setQuickViewProduct } = useAppStore();
  const isInCompare = compareList.includes(product.slug);
  const wishlisted = isWishlisted(product.slug);
  const hasRealModel = product.model.glbUrl && 
    !product.model.glbUrl.endsWith('/') && 
    product.model.glbUrl !== '/models/' &&
    product.model.glbUrl !== '/models';

  // Check if product was created within last 7 days
  const isRecentlyAdded = useCallback(() => {
    const created = new Date(product.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }, [product.createdAt]);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErrored, setImgErrored] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const initials = product.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleImgError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    setImgErrored(true);
  }, []);

  const handleImgLoad = useCallback(() => {
    setImgLoaded(true);
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnimating(true);
    toggleWishlist(product.slug);
    setTimeout(() => setHeartAnimating(false), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="group h-full overflow-hidden border-border/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:ring-1 hover:ring-emerald-500/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted img-shine">
          {/* Shine sweep effect on hover */}
          <div className="img-shine-effect absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" style={{ transform: 'translateX(-100%) skewX(-15deg)' }} />

          {/* Shimmer loading skeleton while image loads */}
          {!imgLoaded && !imgErrored && (
            <div className="absolute inset-0 animate-shimmer" />
          )}

          {/* Actual image */}
          {!imgErrored && (
            <img
              src={product.model.posterUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={handleImgError}
              onLoad={handleImgLoad}
            />
          )}

          {/* Gradient fallback on error */}
          {imgErrored && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:via-teal-900 dark:to-cyan-950">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-inner">
                <span className="text-2xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {initials}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-emerald-600/70 dark:text-emerald-400/70">
                <ImageIcon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium">No preview</span>
              </div>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
            <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm gap-1">
              <Eye className="h-3 w-3" /> 3D
            </Badge>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="flex items-center gap-1 rounded-full bg-white/90 text-foreground backdrop-blur-sm px-3 py-1 text-xs font-medium shadow-sm hover:bg-white transition-colors cursor-pointer"
              aria-label={`Quick view ${product.name}`}
            >
              <Maximize2 className="h-3 w-3" /> Quick View
            </motion.button>
            {hasRealModel && (
              <Badge variant="secondary" className="bg-emerald-500/90 text-white backdrop-blur-sm gap-1">
                <Smartphone className="h-3 w-3" /> AR
              </Badge>
            )}
          </div>
          {/* Category Badge */}
          <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm text-xs">
            {product.category}
          </Badge>
          
          {/* Top right: Recently Added + 3D Ready */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {isRecentlyAdded() && (
              <Badge className="bg-amber-500 text-white backdrop-blur-sm gap-1 text-[10px] shadow-sm">
                <Clock className="h-2.5 w-2.5" /> New
              </Badge>
            )}
            {hasRealModel && (
              <Badge className="bg-emerald-600 text-white backdrop-blur-sm gap-1 text-xs shadow-md">
                <Box className="h-3 w-3" /> 3D Ready
              </Badge>
            )}
          </div>

          {/* Wishlist heart button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleWishlistToggle}
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm border border-border/40 shadow-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
          >
            <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'} ${heartAnimating ? 'heart-pop' : ''}`} />
          </motion.button>

          {/* Compare button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product.slug);
            }}
            className={`absolute bottom-3 left-3 flex h-8 items-center gap-1.5 rounded-full px-3 text-[10px] font-medium backdrop-blur-sm border shadow-sm transition-all hover:scale-105 opacity-0 group-hover:opacity-100 ${isInCompare ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-background/90 text-foreground border-border/40'}`}
          >
            <GitCompareArrows className="h-3 w-3" />
            {isInCompare ? 'Added' : 'Compare'}
          </motion.button>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold leading-tight line-clamp-1 text-sm">{product.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">{product.sku}</p>
              </div>
              {product.enquiryOnly && (
                <Badge variant="outline" className="shrink-0 text-[10px] text-emerald-600 border-emerald-200 dark:border-emerald-800 px-1.5">
                  Enquiry
                </Badge>
              )}
            </div>

            {/* Dimensions */}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3H3v7h18V3Z"/><path d="M21 14H3v7h18v-7Z"/></svg>
              {product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} {product.dimensions.unit}
            </p>

            {/* Price and File Size */}
            <div className="flex items-center justify-between">
              {product.price ? (
                <p className="text-lg font-bold">₹{product.price.toLocaleString()}</p>
              ) : (
                <p className="text-sm font-medium text-emerald-600">Request Quote</p>
              )}
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleAddToCart}
                  className="btn-fill flex h-7 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:text-white dark:bg-emerald-950/50 dark:hover:text-white transition-colors px-2.5"
                >
                  <ShoppingCart className="h-3.5 w-3.5 relative z-[1]" />
                  <span className="text-[10px] font-medium relative z-[1]">Add</span>
                </motion.button>
                {product.model.fileSizeMb && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {product.model.fileSizeMb > 1 ? `${product.model.fileSizeMb} MB` : `${(product.model.fileSizeMb * 1024).toFixed(0)} KB`}
                  </span>
                )}
                {wishlisted && (
                  <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
