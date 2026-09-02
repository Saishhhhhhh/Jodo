'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package, MessageCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function MiniCart() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartCount,
    viewProduct,
    allProducts,
  } = useAppStore();

  const total = cartTotal();
  const count = cartCount();

  const waMessage = useMemo(() => {
    if (cart.length === 0) return 'Hi! I would like to enquire about your AR products.';
    const items = cart.map(item => 
      `• ${item.name} (${item.sku}) x${item.quantity}${item.price ? ` — ₹${(item.price * item.quantity).toLocaleString()}` : ''}`
    ).join('\n');
    const totalLine = total > 0 ? `\n\nTotal: ₹${total.toLocaleString()}` : '';
    return `Hi! I'm interested in the following products:\n\n${items}${totalLine}\n\nCan you share more details?`;
  }, [cart, total]);

  const handleViewProduct = (slug: string) => {
    const product = allProducts.find(p => p.slug === slug);
    viewProduct(slug, product);
    setCartOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
          <SheetTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
            </div>
            Shopping Cart
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Browse our AR products and add items to your cart
              </p>
              <Button
                onClick={() => {
                  setCartOpen(false);
                  useAppStore.getState().navigateTo('products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
              >
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-3 p-3 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    {/* Product Image */}
                    <div
                      className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer"
                      onClick={() => handleViewProduct(item.slug)}
                    >
                      <img
                        src={item.posterUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-semibold line-clamp-1 cursor-pointer hover:text-emerald-600 transition-colors"
                        onClick={() => handleViewProduct(item.slug)}
                      >
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.sku}</p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateCartQuantity(item.slug, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.slug, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-border/60 hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="text-sm font-bold">
                          {item.price
                            ? `₹${(item.price * item.quantity).toLocaleString()}`
                            : 'Enquiry'}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.slug)}
                      className="self-start flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-border/40 px-6 py-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Subtotal ({count} {count === 1 ? 'item' : 'items'})
              </span>
              <span className="text-lg font-bold">
                {total > 0 ? `₹${total.toLocaleString()}` : 'Request Quote'}
              </span>
            </div>

            {/* WhatsApp Enquiry Button */}
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => setCartOpen(false)}
            >
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                size="lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {total > 0 ? 'Enquire via WhatsApp' : 'Send Enquiry'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={clearCart}
            >
              <Trash2 className="mr-1.5 h-3 w-3" />
              Clear Cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
