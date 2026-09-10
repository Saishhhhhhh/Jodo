'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ViewType, ARProduct } from '@/types/product';

export interface CartItem {
  slug: string;
  name: string;
  sku: string;
  category: string;
  posterUrl: string;
  price: number | null;
  quantity: number;
}

interface AppState {
  // Navigation
  currentView: ViewType;
  previousView: ViewType | null;
  selectedProductSlug: string | null;
  selectedProduct: ARProduct | null;
  
  // Data
  allProducts: ARProduct[];
  productsLoaded: boolean;
  
  // UI State
  searchQuery: string;
  selectedCategory: string;
  isLoading: boolean;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest' | 'size';
  
  // Admin
  isAdminLoggedIn: boolean;
  editingProduct: ARProduct | null;
  showProductForm: boolean;
  
  // Wishlist (persisted)
  wishlist: string[];
  
  // Recently Viewed (persisted)
  recentlyViewed: string[];
  
  // Product Comparison
  compareList: string[];
  isComparing: boolean;
  
  // Cart (persisted)
  cart: CartItem[];
  
  // Mini cart open state (not persisted)
  cartOpen: boolean;
  
  // Quick View (not persisted)
  quickViewProduct: ARProduct | null;
  
  // AR Mode (triggered by QR deep link)
  arMode: boolean;
  
  // Navigation methods
  navigateTo: (view: ViewType) => void;
  viewProduct: (slug: string, product?: ARProduct) => void;
  goBack: () => void;
  
  // Data methods
  setAllProducts: (products: ARProduct[]) => void;
  
  // UI methods
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setIsLoading: (loading: boolean) => void;
  setSortBy: (sort: 'name' | 'price-asc' | 'price-desc' | 'newest' | 'size') => void;
  
  // Admin methods
  setAdminLoggedIn: (loggedIn: boolean) => void;
  setEditingProduct: (product: ARProduct | null) => void;
  setShowProductForm: (show: boolean) => void;
  setSelectedProduct: (product: ARProduct | null) => void;
  
  // Wishlist methods
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  
  // Recently Viewed methods
  addToRecentlyViewed: (slug: string) => void;
  
  // Comparison methods
  toggleCompare: (slug: string) => void;
  clearCompare: () => void;
  
  // Cart methods
  addToCart: (product: ARProduct, quantity?: number) => void;
  removeFromCart: (slug: string) => void;
  updateCartQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  cartTotal: () => number;
  cartCount: () => number;
  
  // Quick View methods
  setQuickViewProduct: (product: ARProduct | null) => void;
  
  // AR Mode methods
  setArMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home',
      previousView: null,
      selectedProductSlug: null,
      selectedProduct: null,
      
      // Data (not persisted - loaded fresh each session)
      allProducts: [],
      productsLoaded: false,
      
      // UI State
      searchQuery: '',
      selectedCategory: 'All',
      isLoading: false,
      sortBy: 'newest',
      
      // Admin (not persisted)
      isAdminLoggedIn: false,
      editingProduct: null,
      showProductForm: false,
      
      // Wishlist (persisted)
      wishlist: [],
      
      // Recently Viewed (persisted)
      recentlyViewed: [],
      
      // Product Comparison
      compareList: [],
      isComparing: false,
      
      // Cart (persisted)
      cart: [],
      
      // Mini cart open state
      cartOpen: false,
      
      // Quick View
      quickViewProduct: null,
      
      // AR Mode
      arMode: false,
      
      // Navigation methods
      navigateTo: (view) => set((state) => ({ 
        previousView: state.currentView, 
        currentView: view,
        selectedProductSlug: view !== 'product-detail' ? null : state.selectedProductSlug,
        selectedProduct: view !== 'product-detail' ? null : state.selectedProduct,
        showProductForm: false,
      })),
      viewProduct: (slug, product) => {
        const existing = product || get().allProducts.find(p => p.slug === slug);
        const filtered = get().recentlyViewed.filter(s => s !== slug);
        set({ 
          previousView: get().currentView,
          currentView: 'product-detail', 
          selectedProductSlug: slug,
          selectedProduct: existing || null,
          recentlyViewed: [slug, ...filtered].slice(0, 6),
        });
      },
      goBack: () => set((state) => ({ 
        currentView: state.previousView || 'home',
        previousView: null,
        selectedProductSlug: null,
        selectedProduct: null,
      })),
      
      // Data methods
      setAllProducts: (products) => set({ allProducts: products, productsLoaded: true }),
      
      // UI methods
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setSortBy: (sort) => set({ sortBy: sort }),
      
      // Admin methods
      setAdminLoggedIn: (loggedIn) => set({ isAdminLoggedIn: loggedIn }),
      setEditingProduct: (product) => set({ editingProduct: product }),
      setShowProductForm: (show) => set({ showProductForm: show }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      
      // Wishlist methods
      toggleWishlist: (slug) => set((state) => {
        const exists = state.wishlist.includes(slug);
        return {
          wishlist: exists
            ? state.wishlist.filter(s => s !== slug)
            : [...state.wishlist, slug],
        };
      }),
      isWishlisted: (slug) => get().wishlist.includes(slug),
      
      // Recently Viewed methods
      addToRecentlyViewed: (slug) => set((state) => {
        const filtered = state.recentlyViewed.filter(s => s !== slug);
        return {
          recentlyViewed: [slug, ...filtered].slice(0, 6),
        };
      }),
      
      // Comparison methods
      toggleCompare: (slug) => set((state) => {
        const exists = state.compareList.includes(slug);
        if (exists) {
          const newList = state.compareList.filter(s => s !== slug);
          return {
            compareList: newList,
            isComparing: newList.length >= 2,
          };
        } else {
          if (state.compareList.length >= 3) return state; // max 3
          const newList = [...state.compareList, slug];
          return {
            compareList: newList,
            isComparing: newList.length >= 2,
          };
        }
      }),
      clearCompare: () => set({ compareList: [], isComparing: false }),
      
      // Cart methods
      addToCart: (product, quantity = 1) => set((state) => {
        const existing = state.cart.find(item => item.slug === product.slug);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.slug === product.slug
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            cartOpen: true,
          };
        }
        return {
          cart: [
            ...state.cart,
            {
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              category: product.category,
              posterUrl: product.model.posterUrl,
              price: product.price,
              quantity,
            },
          ],
          cartOpen: true,
        };
      }),
      removeFromCart: (slug) => set((state) => ({
        cart: state.cart.filter(item => item.slug !== slug),
      })),
      updateCartQuantity: (slug, quantity) => set((state) => {
        if (quantity <= 0) {
          return { cart: state.cart.filter(item => item.slug !== slug) };
        }
        return {
          cart: state.cart.map(item =>
            item.slug === slug ? { ...item, quantity } : item
          ),
        };
      }),
      clearCart: () => set({ cart: [] }),
      setCartOpen: (open) => set({ cartOpen: open }),
      cartTotal: () => {
        return get().cart.reduce((total, item) => {
          return total + (item.price || 0) * item.quantity;
        }, 0);
      },
      cartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Quick View methods
      setQuickViewProduct: (product) => set({ quickViewProduct: product }),
      
      // AR Mode methods
      setArMode: (enabled) => set({ arMode: enabled }),
    }),
    {
      name: 'arview-storage',
      partialize: (state) => ({
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
        cart: state.cart,
      }),
    }
  )
);
