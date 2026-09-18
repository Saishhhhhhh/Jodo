'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Eye, Smartphone, QrCode, Maximize2, Ruler, Weight, ArrowLeft, Box, RotateCw, Heart, Share2, Check, MessageCircle, ArrowRight, ChevronRight, ShoppingCart, Minus, Plus, Star, ThumbsUp, Camera } from 'lucide-react';
import { useScroll } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useState, useRef, useMemo, useEffect } from 'react';
import type { ARProduct } from '@/types/product';
import { getDeviceType, supportsAR } from '@/lib/device';

interface ProductARViewerProps {
  product: ARProduct;
  arMode?: boolean;
}

type ModelViewerElement = HTMLElement & { activateAR?: () => void };

export function ProductARViewer({ product, arMode = false }: ProductARViewerProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const viewerRef = useRef<ModelViewerElement>(null);

  const arSupported = useMemo(() => {
    if (typeof navigator === 'undefined') return true;
    return supportsAR(navigator.userAgent);
  }, []);

  // Check if the GLB file actually exists (not a placeholder path)
  const hasRealModel = product.model.glbUrl && !product.model.glbUrl.endsWith('/') && product.model.glbUrl !== '/models/';

  useEffect(() => {
    // We cannot auto-activate AR on iOS without a user gesture due to browser security.
    // However, on Android, we can redirect directly to Google Scene Viewer intent to launch AR instantly.
    if (!arMode || !hasRealModel) return;

    const ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const isAndroid = /Android/i.test(ua);

    if (isAndroid) {
      const origin = window.location.origin;
      // Resolve path
      let glbPath = product.model.glbUrl;
      if (glbPath.startsWith('/vr')) {
        glbPath = glbPath.replace('/vr', '');
      }
      const absoluteGlbUrl = `${origin}${glbPath}`;
      
      // Build Google Scene Viewer intent link
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(absoluteGlbUrl)}&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`;
      
      console.log('Android AR auto-launch redirect:', intentUrl);
      window.location.href = intentUrl;
    }
  }, [arMode, hasRealModel, product]);

  const handleARLaunch = () => {
    if (viewerRef.current?.activateAR) {
      viewerRef.current.activateAR();
    }
  };

  return (
    <div className="space-y-4">
      {/* 3D Viewer Container */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-border/40">
        <div className="relative w-full" style={{ height: '450px', maxHeight: '65vh' }}>
          
          {hasRealModel ? (
            /* Real model-viewer component */
            <model-viewer
              ref={viewerRef as React.RefObject<HTMLElement>}
              src={`${product.model.glbUrl}?t=${Date.now()}`}
              ios-src={product.model.usdzUrl ? `${product.model.usdzUrl}?t=${Date.now()}` : undefined}
              poster={product.model.posterUrl}
              alt={`3D model of ${product.name}`}
              ar
              ar-scale="auto"
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              exposure="1"
              environment-image="neutral"
              shadow-softness="0.5"
              style={{ width: '100%', height: '100%', background: 'transparent' }}
            >
              <button
                type="button"
                slot="ar-button"
                className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95"
              >
                <Smartphone className="h-4 w-4" />
                View in My Room
              </button>
            </model-viewer>
          ) : (
            /* Fallback: Poster image preview */
            <div className="relative flex h-full w-full items-center justify-center">
              <img
                src={product.model.posterUrl}
                alt={`3D model of ${product.name}`}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
                <div className="rounded-2xl bg-white/90 backdrop-blur-sm p-6 shadow-xl">
                  <Box className="h-10 w-10 text-emerald-600 mx-auto" />
                  <p className="mt-3 text-sm font-semibold text-center">3D Preview</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">GLB model coming soon</p>
                </div>
              </div>
            </div>
          )}

          {/* AR Mode Auto-Launch Overlay */}
          {arMode && hasRealModel && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center animate-in zoom-in duration-300">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready for AR</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Tap the button below to open your camera and place the product in your room.
                </p>
                <Button 
                  size="lg" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 text-lg shadow-lg shadow-emerald-500/30"
                  onClick={handleARLaunch}
                >
                  <Camera className="mr-2 h-5 w-5" /> Open Camera
                </Button>
              </div>
            </div>
          )}

          {/* Floating badges */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Badge className="bg-black/70 text-white backdrop-blur-sm gap-1.5 text-xs">
              {hasRealModel ? (
                <>
                  <Eye className="h-3 w-3" /> Interactive 3D
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" /> 3D Preview
                </>
              )}
            </Badge>
            {hasRealModel && (
              <Badge className="bg-emerald-600/90 text-white backdrop-blur-sm gap-1.5 text-xs">
                <RotateCw className="h-3 w-3" /> Auto-rotate
              </Badge>
            )}
          </div>

          {/* Bottom overlay info */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm text-xs pointer-events-auto">
              {product.dimensions.width}×{product.dimensions.height}×{product.dimensions.depth} {product.dimensions.unit}
            </Badge>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowInstructions(!showInstructions)}
              className="bg-white/90 backdrop-blur-sm text-xs pointer-events-auto"
            >
              <Maximize2 className="mr-1 h-3 w-3" />
              Controls
            </Button>
          </div>
        </div>

        {/* AR Instructions Panel */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border/40 bg-muted/30"
            >
              <div className="p-4">
                <h4 className="text-sm font-semibold mb-3">
                  {hasRealModel ? '3D & AR Controls' : '3D Controls'}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center text-sm shrink-0">🖱️</div>
                    <span>Click & drag to rotate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center text-sm shrink-0">🔍</div>
                    <span>Scroll to zoom in/out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center text-sm shrink-0">✋</div>
                    <span>Two-finger zoom (mobile)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center text-sm shrink-0">↔️</div>
                    <span>Two-finger to pan</span>
                  </div>
                  {hasRealModel && arSupported && (
                    <>
                      <div className="flex items-center gap-2 col-span-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-sm shrink-0">📱</div>
                        <span className="font-medium text-emerald-700">Tap &quot;View in My Room&quot; to place in AR</span>
                      </div>
                    </>
                  )}
                </div>
                {hasRealModel && arSupported && (
                  <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                      💡 AR Tips: Move your phone slowly to detect the floor. Tap to place the product. Pinch to resize.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AR Button (only shown if no real model viewer has its own AR button) */}
      {!hasRealModel && arSupported && (
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 text-white py-6 text-base font-semibold"
            onClick={() => setShowInstructions(true)}
          >
            <Smartphone className="mr-2 h-5 w-5" />
            View in My Room
          </Button>
        </motion.div>
      )}

      {!arSupported && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
              AR is not supported on this device/browser
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-500">
              You can still view the product in 3D above. For AR, use a mobile device with AR support (Android with ARCore or iPhone with ARKit).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { selectedProduct, goBack, isWishlisted, toggleWishlist, allProducts, viewProduct, navigateTo, setSelectedCategory, addToCart, cart, arMode, setArMode } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [arBannerDismissed, setArBannerDismissed] = useState(false);
  const { scrollY } = useScroll();

  // Clear AR mode when leaving product detail
  useEffect(() => {
    return () => { setArMode(false); setArBannerDismissed(false); };
  }, [setArMode]);

  // Auto-dismiss AR banner after 8 seconds
  useEffect(() => {
    if (arMode && !arBannerDismissed) {
      const timer = setTimeout(() => setArBannerDismissed(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [arMode, arBannerDismissed]);

  useEffect(() => {
    // Show sticky CTA after scrolling past 400px on product detail
    const unsubscribe = scrollY.on('change', (latest) => {
      setShowStickyCTA(latest > 400);
    });
    return () => unsubscribe();
  }, [scrollY]);
  const [quantity, setQuantity] = useState(1);
  const qrImageUrl = useMemo(() => {
    return selectedProduct ? `/api/qr?slug=${selectedProduct.slug}&size=200&t=${Date.now()}` : null;
  }, [selectedProduct]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return allProducts
      .filter(p => p.category === selectedProduct.category && p.slug !== selectedProduct.slug)
      .slice(0, 4);
  }, [selectedProduct, allProducts]);

  const cartItem = cart.find(item => item.slug === selectedProduct?.slug);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, quantity);
    setQuantity(1);
  };

  const handleShare = async () => {
    if (!selectedProduct) return;
    const url = `${window.location.origin}?product=${selectedProduct.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedProduct.name, text: selectedProduct.description, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-muted p-4">
          <Box className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="mt-4 text-muted-foreground">No product selected</p>
        <Button variant="outline" onClick={goBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const p = selectedProduct;
  const hasRealModel = p.model.glbUrl && !p.model.glbUrl.endsWith('/') && p.model.glbUrl !== '/models/';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* AR Mode Banner - shown when arriving via QR scan */}
      <AnimatePresence>
        {arMode && !arBannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-[1px]">
              <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <QrCode className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">QR Code Scanned!</p>
                    <p className="mt-0.5 text-xs text-white/80">
                      {hasRealModel
                        ? 'Tap "View in My Room" below the 3D model to place this product in your space.'
                        : 'You\'re viewing this product from a QR scan. Explore the 3D preview below!'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArBannerDismissed(true)}
                    className="shrink-0 rounded-lg p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Dismiss"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                {hasRealModel && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-3 flex"
                  >
                    <div className="rounded-xl bg-white/15 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-white" />
                      <span className="text-xs font-medium text-white">Look for the green "View in My Room" button below the 3D viewer</span>
                      <motion.span
                        animate={{ x: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="h-3 w-3 text-white" />
                      </motion.span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => navigateTo('home')}
                className="cursor-pointer text-muted-foreground hover:text-emerald-600 text-xs"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => {
                  setSelectedCategory(p.category);
                  navigateTo('products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="cursor-pointer text-muted-foreground hover:text-emerald-600 text-xs"
              >
                Products
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => {
                  setSelectedCategory(p.category);
                  navigateTo('products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="cursor-pointer text-muted-foreground hover:text-emerald-600 text-xs"
              >
                {p.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-medium text-foreground/80 line-clamp-1">
                {p.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {/* Product Header */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{p.category}</Badge>
              {hasRealModel && (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 gap-1">
                  <Eye className="h-3 w-3" /> 3D Ready
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">{p.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">SKU: {p.sku}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              {p.price ? (
                <p className="text-2xl font-bold">₹{p.price.toLocaleString()}</p>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-3 py-1 text-sm">
                  Enquiry Only
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-9 w-9 ${isWishlisted(p.slug) ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800' : ''}`}
                  onClick={() => toggleWishlist(p.slug)}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted(p.slug) ? 'fill-red-500' : ''}`} />
                </Button>
              </motion.div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={handleShare}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 3D Viewer - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ProductARViewer product={p} arMode={arMode} />
        </div>

        {/* Product Info Sidebar */}
        <div className="space-y-5">
          {/* Dimensions */}
          <Card className="border-border/40">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Ruler className="h-4 w-4 text-emerald-600" />
                Dimensions
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Width</p>
                  <p className="text-lg font-bold mt-0.5">{p.dimensions.width}</p>
                  <p className="text-[10px] text-muted-foreground">{p.dimensions.unit}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Height</p>
                  <p className="text-lg font-bold mt-0.5">{p.dimensions.height}</p>
                  <p className="text-[10px] text-muted-foreground">{p.dimensions.unit}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Depth</p>
                  <p className="text-lg font-bold mt-0.5">{p.dimensions.depth}</p>
                  <p className="text-[10px] text-muted-foreground">{p.dimensions.unit}</p>
                </div>
              </div>
              {p.weight && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/40">
                  <Weight className="h-4 w-4" />
                  Weight: {p.weight} kg
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="border-border/40">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-600" />
                AR Quick Access
              </h3>
              <p className="text-xs text-muted-foreground">
                Scan this QR code with your phone camera to instantly open this product in AR mode and view it in your room.
              </p>
              <div className="flex justify-center rounded-xl bg-white p-3 border border-border/40">
                {qrImageUrl && (
                  <img
                    src={qrImageUrl}
                    alt="QR Code - Scan to view this product in AR"
                    className="h-36 w-36 rounded-lg"
                  />
                )}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="h-3.5 w-3.5" />
                <span>Scan → Opens product → Tap &quot;View in My Room&quot;</span>
              </div>
              {qrImageUrl && (
                <a
                  href={`/api/qr?slug=${p.slug}&size=400`}
                  download={`${p.slug}-qr.png`}
                  className="block"
                >
                  <Button variant="outline" size="sm" className="w-full mt-1 text-xs">
                    <QrCode className="mr-1 h-3 w-3" /> Download QR Code
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-border/40">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </CardContent>
          </Card>

          {/* Model Info */}
          {hasRealModel && (
            <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  3D Model Info
                </h3>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Format</span>
                    <span className="font-mono">GLB</span>
                  </div>
                  {p.model.fileSizeMb && (
                    <div className="flex justify-between">
                      <span>File Size</span>
                      <span>{p.model.fileSizeMb} MB</span>
                    </div>
                  )}
                  {p.model.usdzUrl && (
                    <div className="flex justify-between">
                      <span>iOS Format</span>
                      <span className="font-mono">USDZ</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add to Cart with Quantity */}
          <Card className="border-border/40">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                Add to Cart
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border/60 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted rounded-l-lg transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium border-x border-border/60">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted rounded-r-lg transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20"
                >
                  <ShoppingCart className="mr-1.5 h-4 w-4" />
                  {cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20">
              Request Quote
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Hi! I'm interested in the ${p.name} (SKU: ${p.sku}). Can you share more details?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full border-2 gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="pt-4"
      >
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold">Customer Reviews</h2>
          <Badge variant="secondary" className="text-xs">4.5 avg</Badge>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { name: 'Arjun K.', date: '2 weeks ago', rating: 5, text: 'Excellent AR preview! The model was accurate and helped me decide on the perfect fit for my living room.', initials: 'AK', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
            { name: 'Meera S.', date: '1 month ago', rating: 4, text: 'Great quality 3D model. Wish there was an iOS AR version too. Otherwise perfect experience.', initials: 'MS', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400' },
          ].map((review) => (
            <Card key={review.name} className="border-border/40 hover:border-emerald-200/60 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${review.color}`}>
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-[10px] text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={`h-3.5 w-3.5 ${si < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button type="button" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-emerald-600 transition-colors">
                    <ThumbsUp className="h-3 w-3" /> Helpful
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Sticky CTA Bar */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.sku} · {p.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWishlist(p.slug)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${isWishlisted(p.slug) ? 'border-red-200 bg-red-50 dark:bg-red-950/30' : 'border-border/60 hover:bg-muted'}`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted(p.slug) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </motion.button>
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                >
                  <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="pt-4"
        >
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold">Related Products</h2>
            <Badge variant="secondary" className="text-xs">{relatedProducts.length} items</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp, i) => (
              <motion.div
                key={rp.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                whileHover={{ y: -4 }}
                className="cursor-pointer"
                onClick={() => viewProduct(rp.slug, rp)}
              >
                <Card className="overflow-hidden border-border/40 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
                  <div className="aspect-square overflow-hidden bg-muted relative">
                    <img
                      src={rp.model.posterUrl}
                      alt={rp.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <Badge className="absolute top-2 left-2 bg-background/80 text-foreground backdrop-blur-sm text-[10px]">
                      {rp.category}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold line-clamp-1">{rp.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{rp.sku}</p>
                    <div className="flex items-center justify-between mt-2">
                      {rp.price ? (
                        <p className="text-sm font-bold">₹{rp.price.toLocaleString()}</p>
                      ) : (
                        <p className="text-xs text-emerald-600 font-medium">Request Quote</p>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
