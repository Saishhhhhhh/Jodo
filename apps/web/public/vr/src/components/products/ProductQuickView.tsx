'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, ArrowRight, ImageIcon, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useState, useCallback } from 'react';

export default function ProductQuickView() {
  const { quickViewProduct, setQuickViewProduct, isWishlisted, toggleWishlist, addToCart, viewProduct } = useAppStore();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErrored, setImgErrored] = useState(false);

  const isOpen = quickViewProduct !== null;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setQuickViewProduct(null);
        setTimeout(() => {
          setImgLoaded(false);
          setImgErrored(false);
        }, 200);
      }
    },
    [setQuickViewProduct],
  );

  const handleViewFullDetails = useCallback(() => {
    if (quickViewProduct) {
      viewProduct(quickViewProduct.slug, quickViewProduct);
      setQuickViewProduct(null);
    }
  }, [quickViewProduct, viewProduct, setQuickViewProduct]);

  const handleAddToCart = useCallback(() => {
    if (quickViewProduct) {
      addToCart(quickViewProduct);
    }
  }, [quickViewProduct, addToCart]);

  const handleToggleWishlist = useCallback(() => {
    if (quickViewProduct) {
      toggleWishlist(quickViewProduct.slug);
    }
  }, [quickViewProduct, toggleWishlist]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const wishlisted = isWishlisted(product.slug);

  const initials = product.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden border-border/40 glass-card"
        aria-label={`Quick view: ${product.name}`}
      >
        <DialogTitle className="sr-only">
          Quick view: {product.name}
        </DialogTitle>

        <motion.div
          key={product.slug}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-t-xl lg:rounded-t-none lg:rounded-l-xl bg-muted">
              {!imgLoaded && !imgErrored && (
                <div className="absolute inset-0 animate-shimmer" />
              )}

              {!imgErrored && (
                <img
                  src={product.model.posterUrl}
                  alt={product.name}
                  className={`h-full w-full object-cover transition-all duration-500 ${
                    imgLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onError={() => setImgErrored(true)}
                  onLoad={() => setImgLoaded(true)}
                />
              )}

              {imgErrored && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:via-teal-900 dark:to-cyan-950">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-inner">
                    <span className="text-3xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {initials}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-emerald-600/70 dark:text-emerald-400/70">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">No preview</span>
                  </div>
                </div>
              )}

              <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm text-xs">
                {product.category}
              </Badge>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col justify-between p-5 lg:p-6 gap-4">
              <div className="space-y-3">
                {/* Product name */}
                <div>
                  <h2 className="text-xl font-bold leading-tight text-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">
                    {product.sku}
                  </p>
                </div>

                {/* Price */}
                <div>
                  {product.price ? (
                    <p className="text-2xl font-bold text-foreground">
                      ₹{product.price.toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-base font-semibold text-emerald-600">
                      Request Quote
                    </p>
                  )}
                </div>

                {/* Dimensions */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4 text-muted-foreground/70" />
                  <span>
                    {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth}{' '}
                    {product.dimensions.unit}
                  </span>
                </div>

                {/* Short description - truncated to 2 lines */}
                {product.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* File size if available */}
                {product.model.fileSizeMb && (
                  <p className="text-xs text-muted-foreground/70">
                    3D Model:{' '}
                    {product.model.fileSizeMb > 1
                      ? `${product.model.fileSizeMb} MB`
                      : `${(product.model.fileSizeMb * 1024).toFixed(0)} KB`}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                {/* Add to Cart */}
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-11"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>

                {/* Secondary actions row */}
                <div className="flex gap-3">
                  {/* View Full Details */}
                  <Button
                    variant="outline"
                    onClick={handleViewFullDetails}
                    className="flex-1 gap-2 h-10"
                  >
                    View Full Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {/* Wishlist toggle */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleWishlist}
                    className={`h-10 w-10 shrink-0 ${
                      wishlisted
                        ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:border-red-800 dark:bg-red-950/50 dark:hover:bg-red-950'
                        : ''
                    }`}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        wishlisted ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}