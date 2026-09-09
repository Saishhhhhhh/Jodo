'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Package,
  Search,
  ArrowRight,
  CheckCircle2,
  FileEdit,
  BookOpen,
  ShoppingBag,
  Megaphone,
} from 'lucide-react';
import { useAiContentStore, AiContentType } from '@/stores/ai-content';

interface CmsProductOption {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  material: string;
  collection: string;
  imageUrl: string;
  existingDescription: string;
  attributes: Record<string, string>;
}

const SAMPLE_CMS_PRODUCTS: CmsProductOption[] = [
  {
    id: 'prod_101',
    title: 'Aurelia Minimalist Teak Armchair',
    sku: 'JD-CHR-001',
    category: 'Living Room',
    price: 24999,
    material: 'Burma Teakwood & Boucle',
    collection: 'Scandinavian Serenity',
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
    existingDescription: 'Scandinavian style teakwood lounge chair with textured upholstery and ergonomic form.',
    attributes: {
      Dimensions: '78 x 82 x 75 cm',
      Finish: 'Natural Matte Organic Oil',
      Weight: '14.5 kg',
      Warranty: '5 Years Structural',
    },
  },
  {
    id: 'prod_102',
    title: 'Nordic Oak Floating Bedframe',
    sku: 'JD-BED-004',
    category: 'Bedroom',
    price: 48999,
    material: 'American White Oak',
    collection: 'Kyoto-Nordic Archive',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
    existingDescription: 'Floating platform bedframe in solid oak with concealed cantilevered pedestal base.',
    attributes: {
      Dimensions: '210 x 190 x 85 cm',
      LoadCapacity: '450 kg',
      Joinery: 'Zero-squeak interlocking CNC',
      Warranty: '10 Years Frame',
    },
  },
  {
    id: 'prod_103',
    title: 'Solstice Marble & Brass Dining Table',
    sku: 'JD-DNG-012',
    category: 'Dining',
    price: 89999,
    material: 'Italian Carrara Marble & Brushed Brass',
    collection: 'Monumental Mineralia',
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
    existingDescription: 'Eight-seater dining table with continuous Carrara marble slab and cast brass fluted columns.',
    attributes: {
      Dimensions: '240 x 105 x 76 cm',
      Seating: '8 to 10 Seats',
      MarbleOrigin: 'Carrara, Italy',
      Weight: '185 kg',
    },
  },
  {
    id: 'prod_104',
    title: 'Komorebi Hand-Woven Cane Credenza',
    sku: 'JD-STG-008',
    category: 'Storage',
    price: 38500,
    material: 'Ashwood & Natural Hexagonal Cane',
    collection: 'Botanical Modern',
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    existingDescription: 'Hexagonal woven cane sideboard with soft close hinges and concealed cable ports.',
    attributes: {
      Dimensions: '160 x 45 x 75 cm',
      Storage: '3 Soft-Close Compartments',
      Finish: 'Clear Satin Polyurethane',
    },
  },
];

export function QuickContentGenerator() {
  const router = useRouter();
  const { generateContent } = useAiContentStore();

  const [contentType, setContentType] = useState<AiContentType>('product_description');
  const [selectedProduct, setSelectedProduct] = useState<CmsProductOption>(SAMPLE_CMS_PRODUCTS[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredProducts = SAMPLE_CMS_PRODUCTS.filter((p) =>
    p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const item = generateContent({
        contentType,
        product: {
          id: selectedProduct.id,
          title: selectedProduct.title,
          sku: selectedProduct.sku,
          category: selectedProduct.category,
          price: selectedProduct.price,
          material: selectedProduct.material,
          collection: selectedProduct.collection,
          imageUrl: selectedProduct.imageUrl,
          existingDescription: selectedProduct.existingDescription,
          dimensions: selectedProduct.attributes.Dimensions,
        },
        tone: 'Luxury',
        length: 'Medium',
      });

      setIsGenerating(false);

      // Navigate to the appropriate module tab
      if (contentType === 'product_description') {
        router.push('/ai-content/product-descriptions');
      } else if (contentType === 'catalogue_content') {
        router.push('/ai-content/catalogue-content');
      } else if (contentType === 'listing_copy') {
        router.push('/ai-content/listing-copy');
      } else {
        router.push('/ai-content/campaign-content');
      }
    }, 600);
  };

  return (
    <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-foreground">Create Content with AI</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Select a target content format and product from CMS to auto-populate attributes and draft high-converting copy.
          </p>
        </div>

        <Badge variant="outline" className="text-xs self-start sm:self-auto py-1 px-3 bg-primary/5 text-primary border-primary/20">
          Anti-Hallucination Guard Active
        </Badge>
      </div>

      {/* Step 1: Content Type Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          1. Select Content Type
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'product_description' as AiContentType,
              title: 'Product Description',
              icon: FileEdit,
              desc: 'Storefront titles, descriptions & SEO',
            },
            {
              id: 'catalogue_content' as AiContentType,
              title: 'Catalogue Content',
              icon: BookOpen,
              desc: 'Specs, care guidelines & archive briefs',
            },
            {
              id: 'listing_copy' as AiContentType,
              title: 'Listing Copy',
              icon: ShoppingBag,
              desc: 'Amazon, Flipkart, Myntra bullet points',
            },
            {
              id: 'campaign_content' as AiContentType,
              title: 'Campaign Content',
              icon: Megaphone,
              desc: 'Multi-channel email, WhatsApp, IG, SMS',
            },
          ].map((type) => {
            const isSelected = contentType === type.id;
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setContentType(type.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 text-foreground'
                    : 'border-border hover:bg-muted/30 text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-semibold text-xs text-foreground">{type.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{type.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Product Search & Auto-Loaded CMS Details */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            2. Product from CMS (Auto-Fetched)
          </label>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search CMS products by name, SKU..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Product selector dropdown pills */}
        <div className="flex flex-wrap gap-2">
          {filteredProducts.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => setSelectedProduct(prod)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                {prod.title} ({prod.sku})
              </button>
            );
          })}
        </div>

        {/* Auto-Loaded Product Card */}
        {selectedProduct && (
          <div className="border rounded-xl p-4 bg-muted/20 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-3 rounded-lg overflow-hidden border aspect-square max-w-[160px] bg-background">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-9 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{selectedProduct.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                    <span>SKU: {selectedProduct.sku}</span>
                    <span>•</span>
                    <span>Category: {selectedProduct.category}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px] self-start sm:self-auto">
                  {selectedProduct.collection}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Material:</span>
                  <span className="font-medium text-foreground">{selectedProduct.material}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Dimensions:</span>
                  <span className="font-medium text-foreground">{selectedProduct.attributes.Dimensions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Weight:</span>
                  <span className="font-medium text-foreground">{selectedProduct.attributes.Weight || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Warranty:</span>
                  <span className="font-medium text-foreground">{selectedProduct.attributes.Warranty || 'Standard'}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <span className="text-muted-foreground block text-[11px]">Existing CMS Description:</span>
                <p className="text-foreground text-[11px] line-clamp-2 mt-0.5 leading-relaxed">
                  {selectedProduct.existingDescription}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Generate CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t gap-3">
        <span className="text-xs text-muted-foreground">
          Generates a draft with anti-hallucination validation. Never published automatically.
        </span>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm font-semibold"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating Draft...' : 'Generate with AI'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
