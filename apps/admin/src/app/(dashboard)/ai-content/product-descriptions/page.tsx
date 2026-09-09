'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles,
  Package,
  Layers,
  CheckCircle2,
  FileEdit,
  Tag,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAiContentStore, AiContentItem } from '@/stores/ai-content';
import { ContentEditorPanel } from '@/components/ai-content/content-editor-panel';

const CMS_PRODUCTS_LIST = [
  {
    id: 'prod_101',
    title: 'Aurelia Minimalist Teak Armchair',
    sku: 'JD-CHR-001',
    category: 'Living Room',
    price: 24999,
    material: 'Kiln-Dried Burma Teakwood & Boucle Fabric',
    colour: 'Oatmeal / Natural Teak',
    design: 'Scandinavian Minimalist Open-Frame',
    collection: 'Scandinavian Serenity',
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
    keyFeatures: 'Solid teakwood joinery, textured boucle, high-density ergonomic core, 5-year warranty',
    targetAudience: 'Discerning homeowners and boutique luxury hotels',
    existingDescription: 'Scandinavian style teakwood lounge chair with textured upholstery and ergonomic form.',
  },
  {
    id: 'prod_102',
    title: 'Nordic Oak Floating Bedframe',
    sku: 'JD-BED-004',
    category: 'Bedroom',
    price: 48999,
    material: 'American White Oak',
    colour: 'Natural Blond Oak',
    design: 'Japanese-Nordic Cantilevered Platform',
    collection: 'Kyoto-Nordic Archive',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80',
    keyFeatures: 'Concealed cantilever base, 450kg load rating, acoustic dampening birch slats',
    targetAudience: 'Urban homeowners upgrading to Japanese minimalist master bedrooms',
    existingDescription: 'Floating platform bedframe in solid oak with concealed cantilevered pedestal base.',
  },
  {
    id: 'prod_103',
    title: 'Solstice Marble & Brass Dining Table',
    sku: 'JD-DNG-012',
    category: 'Dining',
    price: 89999,
    material: 'Italian Carrara Marble & Cast Brass',
    colour: 'Milky White with Grey Veining & Brushed Brass',
    design: 'Monumental Roman Fluted Column',
    collection: 'Monumental Mineralia',
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&auto=format&fit=crop&q=80',
    keyFeatures: '30mm Carrara marble slab, brass fluted columns, seats 8-10 guests, stain resistant seal',
    targetAudience: 'Architects, interior designers, and luxury estate homeowners',
    existingDescription: 'Eight-seater dining table with continuous Carrara marble slab and cast brass fluted columns.',
  },
  {
    id: 'prod_104',
    title: 'Komorebi Hand-Woven Cane Credenza',
    sku: 'JD-STG-008',
    category: 'Storage',
    price: 38500,
    material: 'Ashwood & Natural Hexagonal Cane Webbing',
    colour: 'Caramel Ash / Honey Cane',
    design: 'Organic Modern Credenza',
    collection: 'Botanical Modern',
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
    keyFeatures: 'Breathable woven cane webbing, soft-close German hinges, concealed cable management',
    targetAudience: 'Minimalist living rooms and contemporary media rooms',
    existingDescription: 'Hexagonal woven cane sideboard with soft close hinges and concealed cable ports.',
  },
];

const TONE_OPTIONS = ['Premium', 'Luxury', 'Elegant', 'Professional', 'Friendly', 'Minimal'];
const LENGTH_OPTIONS: ('Short' | 'Medium' | 'Detailed')[] = ['Short', 'Medium', 'Detailed'];

export default function ProductDescriptionsPage() {
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId');

  const { items, generateContent } = useAiContentStore();

  // Find initial product based on query param or default
  const [selectedProduct, setSelectedProduct] = useState(
    CMS_PRODUCTS_LIST.find((p) => p.id === queryProductId) || CMS_PRODUCTS_LIST[0]
  );

  // Editable fields (auto-populated from CMS)
  const [productName, setProductName] = useState(selectedProduct.title);
  const [category, setCategory] = useState(selectedProduct.category);
  const [material, setMaterial] = useState(selectedProduct.material);
  const [colour, setColour] = useState(selectedProduct.colour);
  const [design, setDesign] = useState(selectedProduct.design);
  const [collection, setCollection] = useState(selectedProduct.collection);
  const [price, setPrice] = useState(String(selectedProduct.price));
  const [keyFeatures, setKeyFeatures] = useState(selectedProduct.keyFeatures);
  const [targetAudience, setTargetAudience] = useState(selectedProduct.targetAudience);

  // Settings
  const [tone, setTone] = useState<string>('Luxury');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [seoOptimized, setSeoOptimized] = useState<boolean>(true);
  const [keywordsStr, setKeywordsStr] = useState<string>('scandinavian furniture, teak armchair, modern living room');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<AiContentItem | null>(null);

  // When product selection changes, update inputs
  const handleProductSelect = (p: typeof CMS_PRODUCTS_LIST[0]) => {
    setSelectedProduct(p);
    setProductName(p.title);
    setCategory(p.category);
    setMaterial(p.material);
    setColour(p.colour);
    setDesign(p.design);
    setCollection(p.collection);
    setPrice(String(p.price));
    setKeyFeatures(p.keyFeatures);
    setTargetAudience(p.targetAudience);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);
      const item = generateContent({
        contentType: 'product_description',
        product: {
          id: selectedProduct.id,
          title: productName,
          sku: selectedProduct.sku,
          category,
          price: Number(price),
          material,
          colour,
          design,
          collection,
          imageUrl: selectedProduct.imageUrl,
          existingDescription: selectedProduct.existingDescription,
        },
        tone,
        length,
        seoOptimized,
        keywords,
        targetAudience,
      });

      setGeneratedItem(item);
      setIsGenerating(false);
    }, 700);
  };

  // Pre-load existing draft if available
  useEffect(() => {
    const existing = items.find((i) => i.contentType === 'product_description');
    if (existing && !generatedItem) {
      setGeneratedItem(existing);
    }
  }, [items, generatedItem]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Product Descriptions
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              AI Content Generator
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate high-converting, tone-tailored product descriptions grounded in authentic CMS data.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Strict Anti-Hallucination Active</span>
        </div>
      </div>

      {/* Generator Configuration Form (Section 4) */}
      <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            1. Select CMS Product (Auto-Populated)
          </span>
          <span className="text-xs text-muted-foreground">
            Data synchronized from JODO Database
          </span>
        </div>

        {/* Product selector buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CMS_PRODUCTS_LIST.map((prod) => {
            const isSelected = selectedProduct.id === prod.id;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleProductSelect(prod)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <div className="font-semibold text-xs text-foreground line-clamp-1">{prod.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center justify-between">
                  <span>{prod.sku}</span>
                  <span className="font-semibold text-emerald-600">₹{prod.price.toLocaleString('en-IN')}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Auto-populated Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Product Name</label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} className="text-xs" />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Category</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} className="text-xs" />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Collection</label>
            <Input value={collection} onChange={(e) => setCollection(e.target.value)} className="text-xs" />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Material</label>
            <Input value={material} onChange={(e) => setMaterial(e.target.value)} className="text-xs" />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Colour / Finish</label>
            <Input value={colour} onChange={(e) => setColour(e.target.value)} className="text-xs" />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Price (₹)</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="text-xs" />
          </div>
          <div className="md:col-span-2">
            <label className="font-semibold text-muted-foreground block mb-1">Key Features (from CMS specs)</label>
            <Input value={keyFeatures} onChange={(e) => setKeyFeatures(e.target.value)} className="text-xs" />
          </div>
          <div>
            <label className="font-semibold text-muted-foreground block mb-1">Target Audience</label>
            <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="text-xs" />
          </div>
        </div>

        {/* Content Settings: Tone, Length, SEO */}
        <div className="border-t pt-5 space-y-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            2. Content Settings
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Tone Selector */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-2">Tone</label>
              <div className="flex flex-wrap gap-1.5">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-1 rounded-md border text-xs font-medium transition-all ${
                      tone === t
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Length */}
            <div>
              <label className="font-semibold text-muted-foreground block mb-2">Description Length</label>
              <div className="flex gap-2">
                {LENGTH_OPTIONS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLength(l)}
                    className={`flex-1 py-1.5 rounded-md border text-xs font-medium transition-all ${
                      length === l
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-background hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* SEO Toggle & Keywords */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-muted-foreground">SEO Optimized</label>
                <Switch checked={seoOptimized} onCheckedChange={setSeoOptimized} />
              </div>
              {seoOptimized && (
                <Input
                  placeholder="Comma separated keywords"
                  value={keywordsStr}
                  onChange={(e) => setKeywordsStr(e.target.value)}
                  className="text-xs h-8"
                />
              )}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-3 border-t">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm font-semibold text-xs px-6"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating Description...' : 'Generate Description'}
          </Button>
        </div>
      </div>

      {/* AI Generated Result & Side-by-Side Editor (Section 5) */}
      {generatedItem && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">AI Generated Result</h2>
            <span className="text-xs text-muted-foreground">
              Every result must be saved as Draft or sent for Review prior to publishing.
            </span>
          </div>

          <ContentEditorPanel item={generatedItem} />
        </div>
      )}
    </div>
  );
}
