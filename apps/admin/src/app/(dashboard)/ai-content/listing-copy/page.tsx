'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  Sparkles,
  Layers,
  CheckCircle2,
  Package,
  Globe,
  ArrowRight,
  Store,
} from 'lucide-react';
import { useAiContentStore, AiContentItem } from '@/stores/ai-content';
import { ContentEditorPanel } from '@/components/ai-content/content-editor-panel';

const LISTING_CHANNELS = ['Website', 'Amazon', 'Flipkart', 'Myntra', 'Other'];

const CMS_PRODUCTS = [
  { id: 'prod_102', title: 'Nordic Oak Floating Bedframe', sku: 'JD-BED-004', category: 'Bedroom', price: 48999, material: 'American White Oak', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80' },
  { id: 'prod_101', title: 'Aurelia Minimalist Teak Armchair', sku: 'JD-CHR-001', category: 'Living Room', price: 24999, material: 'Burma Teak & Boucle', imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80' },
  { id: 'prod_103', title: 'Solstice Marble & Brass Dining Table', sku: 'JD-DNG-012', category: 'Dining', price: 89999, material: 'Carrara Marble & Brass', imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80' },
];

export default function ListingCopyPage() {
  const { items, generateContent } = useAiContentStore();

  const [selectedProduct, setSelectedProduct] = useState(CMS_PRODUCTS[0]);
  const [selectedChannel, setSelectedChannel] = useState<string>('Amazon');
  const [keywordsStr, setKeywordsStr] = useState<string>('floating platform bed, solid oak bedframe, king size platform bed, japanese minimalist bed');
  const [isGenerating, setIsGenerating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Active preview item
  const [activeItem, setActiveItem] = useState<AiContentItem | null>(
    items.find((i) => i.contentType === 'listing_copy') || items[0] || null
  );

  const handleGenerateListing = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);
      const newItem = generateContent({
        contentType: 'listing_copy',
        product: {
          id: selectedProduct.id,
          title: selectedProduct.title,
          sku: selectedProduct.sku,
          category: selectedProduct.category,
          price: selectedProduct.price,
          material: selectedProduct.material,
          imageUrl: selectedProduct.imageUrl,
        },
        channel: selectedChannel,
        tone: 'Professional',
        length: 'Detailed',
        keywords,
      });

      setActiveItem(newItem);
      setIsGenerating(false);
      toast.success(`${selectedChannel} listing copy generated!`);
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
        }
      }, 150);
    }, 700);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Listing Copy
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              E-Commerce Marketplace Copy
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate channel-tailored titles, bullet points, and high-converting search keywords for Amazon, Flipkart, Myntra, and web.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Store className="w-4 h-4 text-primary" />
          <span>Multi-Channel Formatter Active</span>
        </div>
      </div>

      {/* Generator Configuration (Section 7) */}
      <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Product */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              1. Select Product
            </label>
            <div className="space-y-2">
              {CMS_PRODUCTS.map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-foreground">{prod.title}</div>
                      <div className="text-[11px] text-muted-foreground">{prod.sku} • {prod.category}</div>
                    </div>
                    <span className="font-semibold text-xs text-emerald-600">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Marketplace & Channel Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                2. Marketplace / Channel
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {LISTING_CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition-all text-center ${
                      selectedChannel === ch
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Search Intent & Backend Keywords
              </label>
              <Input
                value={keywordsStr}
                onChange={(e) => setKeywordsStr(e.target.value)}
                placeholder="Target marketplace keywords (comma separated)"
                className="text-xs"
              />
              <span className="text-[11px] text-muted-foreground block">
                Keywords will be naturally woven into the 5 core bullet points and backend search terms.
              </span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-3 border-t">
          <Button
            type="button"
            onClick={handleGenerateListing}
            disabled={isGenerating}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm font-semibold text-xs px-6"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating Listing Copy...' : `Generate ${selectedChannel} Copy`}
          </Button>
        </div>
      </div>

      {/* Editor & Preview Panel */}
      {activeItem && (
        <div ref={resultRef} className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Marketplace Listing Output</h2>
            <span className="text-xs text-muted-foreground">
              Reviewing: {activeItem.productName} ({activeItem.channel || 'Marketplace'})
            </span>
          </div>

          <ContentEditorPanel key={activeItem.id} item={activeItem} />
        </div>
      )}
    </div>
  );
}
