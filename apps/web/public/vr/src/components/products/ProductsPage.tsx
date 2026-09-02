'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/products/ProductCard';
import { Search, SlidersHorizontal, Grid3x3, LayoutList, ArrowUpDown, Sparkles, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useRef, useEffect } from 'react';
import type { ARProduct } from '@/types/product';
import { CATEGORIES } from '@/types/product';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'price-asc', label: 'Price Low' },
  { value: 'price-desc', label: 'Price High' },
  { value: 'size', label: 'File Size' },
] as const;

const popularCategories = ['Furniture', 'Lighting', 'Decor', 'Seating'];

export default function ProductsPage() {
  const { viewProduct, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, allProducts, productsLoaded, sortBy, setSortBy } = useAppStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSort, setShowSort] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('product-search-history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Sync recent searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('product-search-history', JSON.stringify(recentSearches));
    } catch {
      // localStorage may be unavailable
    }
  }, [recentSearches]);

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 8);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Search suggestions based on query
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2 || !allProducts) return [];
    const q = searchQuery.toLowerCase();
    return allProducts
      .filter((p: ARProduct) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [searchQuery, allProducts]);

  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    let filtered = allProducts.filter((p: ARProduct) => {
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch && p.isActive;
    });

    switch (sortBy) {
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'size':
        filtered = [...filtered].sort((a, b) => (a.model.fileSizeMb || 0) - (b.model.fileSizeMb || 0));
        break;
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);
        break;
    }

    return filtered;
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && 
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && focusedIndex >= 0 && suggestions.length > 0) {
      e.preventDefault();
      const product = suggestions[focusedIndex];
      viewProduct(product.slug, product);
      setShowSuggestions(false);
      setSearchQuery('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        addRecentSearch(searchQuery);
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (product: ARProduct) => {
    viewProduct(product.slug, product);
    setShowSuggestions(false);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoading = !productsLoaded;
  const currentSortLabel = sortOptions.find(s => s.value === sortBy)?.label || 'Sort';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AR Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our collection of AR-enabled products. Scan, view in 3D, and place them in your room.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 search-glow rounded-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
              setFocusedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowSuggestions(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          
          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border/60 bg-background shadow-xl overflow-hidden"
              >
                <div className="p-1.5">
                  {suggestions.map((product, index) => (
                    <button
                      key={product.slug}
                      onClick={() => selectSuggestion(product)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        focusedIndex === index
                          ? 'bg-emerald-50 dark:bg-emerald-950/50'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={product.model.posterUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku} · {product.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {product.price ? (
                          <p className="text-xs font-semibold">₹{product.price.toLocaleString()}</p>
                        ) : (
                          <p className="text-xs text-emerald-600">Enquiry</p>
                        )}
                        {product.model.fileSizeMb && (
                          <p className="text-[10px] text-muted-foreground">{product.model.fileSizeMb} MB</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-border/40 px-3 py-2 flex items-center gap-2">
                  <Search className="h-3 w-3 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground">
                    Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border/60 text-[9px] font-mono">↑↓</kbd> to navigate, <kbd className="px-1 py-0.5 rounded bg-muted border border-border/60 text-[9px] font-mono">Enter</kbd> to select
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Searches Dropdown */}
          <AnimatePresence>
            {showSuggestions && searchQuery.length === 0 && recentSearches.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border/60 bg-background shadow-xl overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">Recent Searches</p>
                  </div>
                </div>
                <div className="p-1.5 max-h-64 overflow-y-auto">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted transition-colors group"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <button
                        onClick={() => {
                          setSearchQuery(term);
                          setShowSuggestions(false);
                        }}
                        className="flex-1 text-left text-sm truncate"
                      >
                        {term}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecentSearches(prev => prev.filter(item => item !== term));
                        }}
                        className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/10 transition-all shrink-0"
                        aria-label={`Remove ${term} from recent searches`}
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/40 px-3 py-2">
                  <button
                    onClick={clearRecentSearches}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear Recent Searches
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
          {CATEGORIES.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className={`cursor-pointer transition-all text-xs ${
                selectedCategory === cat
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results count + Sort + View mode */}
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.p
            key={isLoading ? 'loading' : filteredProducts.length}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            {isLoading ? 'Loading...' : `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`}
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {currentSortLabel}
            </button>
            <AnimatePresence>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-border/60 bg-background py-1 shadow-xl overflow-hidden"
                  >
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setShowSort(false); }}
                        className={`flex w-full items-center px-3 py-1.5 text-xs transition-colors ${
                          sortBy === option.value
                            ? 'bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-muted' : ''}`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-muted' : ''}`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
          viewMode === 'list' ? 'lg:grid-cols-1' : ''
        }`}>
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              onClick={() => viewProduct(product.slug, product)}
              className="cursor-pointer"
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40 blur-xl scale-150 opacity-60" />
            <div className="relative rounded-full bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:via-teal-900 dark:to-cyan-950 p-5 shadow-lg shadow-emerald-500/10">
              <Search className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h3 className="mt-6 text-lg font-semibold">No products found</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            We couldn&apos;t find any products matching your search. Try adjusting your filters or browse by category below.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Clear All Filters
          </Button>

          <div className="mt-8">
            <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              Try these popular categories
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {popularCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full border border-border/60 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
