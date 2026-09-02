'use client';

import { useAppStore } from '@/store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ScrollProgress from '@/components/layout/ScrollProgress';
import MiniCart from '@/components/cart/MiniCart';
import HeroSection from '@/components/home/HeroSection';
import HowItWorks from '@/components/home/HowItWorks';
import CategoryHighlights from '@/components/home/CategoryHighlights';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CTABanner from '@/components/home/CTABanner';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import RecentlyViewedSection from '@/components/home/RecentlyViewedSection';
import ProductsPage from '@/components/products/ProductsPage';
import ProductDetail from '@/components/product-detail/ProductDetail';
import ProductComparison from '@/components/products/ProductComparison';
import WishlistPage from '@/components/wishlist/WishlistPage';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import ProductQuickView from '@/components/products/ProductQuickView';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function HomeSkeleton() {
  return (
    <div className="space-y-0">
      <section className="relative overflow-hidden rounded-3xl bg-muted/50 border border-border/20">
        <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:p-16">
          <div className="space-y-5">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-10 w-full max-w-md rounded-xl" />
            <Skeleton className="h-10 w-4/5 max-w-sm rounded-xl" />
            <Skeleton className="h-5 w-3/5 max-w-xs rounded-lg" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-11 w-36 rounded-full" />
            </div>
          </div>
          <Skeleton className="aspect-square w-full rounded-2xl" />
        </div>
      </section>
      <section className="py-8">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </section>
    </div>
  );
}

function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <HowItWorks />
      <CategoryHighlights />
      <FeaturedProducts />
      <CTABanner />
      <TestimonialsSection />
      <RecentlyViewedSection />
    </div>
  );
}

function ARLaunchScreen({ glbUrl, productName }: { glbUrl: string; productName: string }) {
  const [launched, setLaunched] = useState(false);
  const viewerRef = useRef<any>(null);

  const launchAR = () => {
    setLaunched(true);
    
    // For Android, we can directly redirect to the intent URL for instant launch
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(glbUrl)}&mode=ar_only&resizable=false#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`;
      window.location.href = intentUrl;
      return;
    }

    // For iOS, model-viewer handles the USDZ conversion and Quick Look launch
    if (viewerRef.current && viewerRef.current.activateAR) {
      viewerRef.current.activateAR();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(182,90,69,0.15)',
          border: '2px solid rgba(182,90,69,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 2s infinite',
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#B65A45" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
      <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
        {productName}
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginBottom: '40px', lineHeight: 1.5, maxWidth: '280px' }}>
        See how this product looks in your space using augmented reality
      </p>
      {!launched ? (
        <button
          onClick={launchAR}
          style={{
            background: '#B65A45',
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            padding: '18px 48px',
            fontSize: '17px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(182,90,69,0.5)',
          }}
        >
          📸 Launch AR View
        </button>
      ) : (
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>Opening AR camera...</div>
      )}

      {/* Model Viewer used to trigger AR cross-platform */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px', overflow: 'hidden' }}>
        {/* @ts-ignore */}
        <model-viewer
          ref={viewerRef}
          src={glbUrl}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          environment-image="neutral"
        />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

function AppContent() {
  const { currentView, setAllProducts, productsLoaded, viewProduct, setArMode, allProducts } = useAppStore();
  const fetchedRef = useRef(false);
  const deepLinkHandled = useRef(false);
  const searchParams = useSearchParams();
  const [arLaunchState, setArLaunchState] = useState<{ glbUrl: string; productName: string } | null>(null);

  // IMMEDIATE AR LAUNCH on mobile — no product lookup needed
  useEffect(() => {
    const arParam = searchParams.get('ar');
    if (arParam !== 'true') return;
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (!isAndroid && !isIOS) return;

    const origin = window.location.origin;
    const glbUrl = `${origin}/models/thermos-hydration-bottle.glb`;

    if (isAndroid || isIOS) {
      setArLaunchState({ glbUrl, productName: 'Product AR Preview' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeepLink = useCallback(() => {
    if (deepLinkHandled.current) return;
    const productSlug = searchParams.get('product');
    const arParam = searchParams.get('ar');
    if (productSlug && productsLoaded && allProducts.length > 0) {
      deepLinkHandled.current = true;
      let product = allProducts.find(p => p.slug === productSlug) || allProducts[0];
      if (product) {
        if (arParam === 'true') setArMode(true);
        viewProduct(product.slug, product);
        window.history.replaceState({}, '', '/');
      }
    }
  }, [searchParams, productsLoaded, allProducts, viewProduct, setArMode]);

  useEffect(() => { handleDeepLink(); }, [handleDeepLink]);

  useEffect(() => {
    if (fetchedRef.current || productsLoaded) return;
    fetchedRef.current = true;
    const abortController = new AbortController();
    const retryTimers = new Set<number>();
    let cancelled = false;

    const wait = (ms: number) => new Promise<void>((resolve) => {
      const timer = window.setTimeout(() => { retryTimers.delete(timer); resolve(); }, ms);
      retryTimers.add(timer);
    });

    async function loadProducts() {
      fetch('/api/products/seed', { method: 'POST', signal: abortController.signal }).catch(() => {});
      let retries = 5;
      while (retries > 0 && !cancelled) {
        try {
          const res = await fetch('/api/products', { signal: abortController.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (cancelled) return;
          setAllProducts(data);
          return;
        } catch {
          retries--;
          if (retries > 0) await wait(1500);
        }
      }
    }
    loadProducts();

    return () => {
      cancelled = true;
      abortController.abort();
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      retryTimers.clear();
    };
  }, [productsLoaded, setAllProducts]);

  if (arLaunchState) {
    return <ARLaunchScreen glbUrl={arLaunchState.glbUrl} productName={arLaunchState.productName} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <AnimatePresence mode="wait">
            {!productsLoaded ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <HomeSkeleton />
              </motion.div>
            ) : (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <HomePage />
              </motion.div>
            )}
          </AnimatePresence>
        );
      case 'products': return <ProductsPage />;
      case 'product-detail': return <ProductDetail />;
      case 'wishlist': return <WishlistPage />;
      case 'compare': return <ProductComparison />;
      case 'admin':
      case 'admin-products': return <AdminDashboard />;
      case 'admin-analytics': return <AdminAnalytics />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 md:pb-6 sm:px-6 sm:py-8 lg:px-8"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <ScrollToTop />
      <MobileBottomNav />
      <ScrollProgress />
      <MiniCart />
      <ProductQuickView />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <AppContent />
    </Suspense>
  );
}
