'use client';

import { useAppStore } from '@/store/useAppStore';
import { Home, Grid3x3, Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSyncExternalStore } from 'react';

const bottomNavItems = [
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'products' as const, label: 'Browse', icon: Grid3x3 },
  { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
  { id: '_cart' as const, label: 'Cart', icon: ShoppingBag },
] as const;

export default function MobileBottomNav() {
  const { currentView, navigateTo, setCartOpen, wishlist, cartCount } = useAppStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <nav className="flex items-center justify-around border-t border-border/40 bg-background/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = item.id === '_cart'
            ? false
            : currentView === item.id;
          const showBadge = item.id === 'wishlist' && wishlist.length > 0;
          const cartItems = item.id === '_cart' ? cartCount() : 0;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === '_cart') {
                  setCartOpen(true);
                } else {
                  navigateTo(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px]"
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-muted-foreground'
                }`} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
                    {wishlist.length}
                  </span>
                )}
                {cartItems > 0 && item.id === '_cart' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-600 px-0.5 text-[8px] font-bold text-white"
                  >
                    {cartItems}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-600' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavActive"
                  className="absolute top-0 left-3 right-3 h-0.5 rounded-full bg-emerald-600"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
