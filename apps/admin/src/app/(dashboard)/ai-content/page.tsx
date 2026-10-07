'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productsApi } from '@/lib/api-client';
import { useAiContentStore, AiContentItem, AiContentType, AiContentStatus } from '@/stores/ai-content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Plus,
  Search,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  FileText,
  ShoppingBag,
  Megaphone,
  BookOpen,
  TrendingUp,
  Percent,
  Timer,
  ArrowUpRight,
  Eye,
  Trash2,
  Send,
  RefreshCw,
  ExternalLink,
  Package,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  Pencil,
} from 'lucide-react';
import { QualityScoreBadge } from '@/components/ai-content/quality-score-badge';
import { ReviewDetailModal } from '@/components/ai-content/review-detail-modal';

interface CmsProduct {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  material: string;
  collection: string;
  imageUrl: string;
  existingDescription: string;
  dimensions: string;
}

const FALLBACK_PRODUCTS: CmsProduct[] = [
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
    dimensions: '78 x 82 x 75 cm',
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
    dimensions: '210 x 190 x 85 cm',
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
    dimensions: '240 x 105 x 76 cm',
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
    dimensions: '160 x 45 x 75 cm',
  },
];

function AiContentHubInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab') || 'studio';

  const {
    items,
    activities,
    getKpis,
    generateContent,
    saveDraft,
    publishToCms,
    deleteItem,
    approveContent,
    requestChanges,
    rejectContent,
  } = useAiContentStore();

  const [activeTab, setActiveTab] = useState<string>(tabQuery);

  // Sync tab with URL parameter if it changes
  useEffect(() => {
    if (tabQuery && tabQuery !== activeTab) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const kpis = getKpis();

  // Load real store products
  const { data: dbProductsRaw = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const res = await productsApi.list();
        return res.data?.data?.products || res.data?.data || [];
      } catch {
        return [];
      }
    },
  });

  const productList = useMemo<CmsProduct[]>(() => {
    if (!Array.isArray(dbProductsRaw) || dbProductsRaw.length === 0) return FALLBACK_PRODUCTS;
    const dbItems: CmsProduct[] = dbProductsRaw.map((p: any) => ({
      id: p._id || p.id,
      title: p.title || 'Untitled Product',
      sku: p.sku || 'JD-SKU',
      category: p.category || 'Furniture',
      price: Number(p.price) || 19999,
      material: p.material || 'Solid Wood',
      collection: p.collection || `${p.category || 'JODO'} Collection`,
      imageUrl: p.imageUrl || (p.galleryImages && p.galleryImages[0]) || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
      existingDescription: p.longDescription || p.shortDescription || '',
      dimensions: p.dimensions || 'Standard',
    }));
    const ids = new Set(dbItems.map((p) => p.id));
    const presetsToAdd = FALLBACK_PRODUCTS.filter((p) => !ids.has(p.id));
    return [...dbItems, ...presetsToAdd];
  }, [dbProductsRaw]);

  // Studio Generator State
  const [selectedProductId, setSelectedProductId] = useState<string>(productList[0]?.id || 'prod_101');
  const [contentType, setContentType] = useState<AiContentType>('product_description');
  const [tone, setTone] = useState<string>('Luxury');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Generated Result in Studio
  const [activeResult, setActiveResult] = useState<AiContentItem | null>(() => {
    return items.find((i) => i.contentType === 'product_description') || items[0] || null;
  });

  // Modal State
  const [selectedItemForModal, setSelectedItemForModal] = useState<AiContentItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Library Filters
  const [searchLibrary, setSearchLibrary] = useState('');
  const [libraryTypeFilter, setLibraryTypeFilter] = useState('all');
  const [libraryStatusFilter, setLibraryStatusFilter] = useState('all');

  // Currently selected product object
  const currentProduct = useMemo(() => {
    return productList.find((p) => p.id === selectedProductId) || productList[0];
  }, [productList, selectedProductId]);

  // Copy helper
  const [hasCopied, setHasCopied] = useState(false);
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Generate action
  const handleGenerate = () => {
    if (!currentProduct) {
      toast.error('Please select a product first');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const newItem = generateContent({
        contentType,
        product: {
          id: currentProduct.id,
          title: currentProduct.title,
          sku: currentProduct.sku,
          category: currentProduct.category,
          price: currentProduct.price,
          material: currentProduct.material,
          collection: currentProduct.collection,
          imageUrl: currentProduct.imageUrl,
          existingDescription: currentProduct.existingDescription,
          dimensions: currentProduct.dimensions,
        },
        tone,
        length,
        keywords: customNotes ? customNotes.split(',').map((s) => s.trim()) : undefined,
      });

      setActiveResult(newItem);
      setIsGenerating(false);
      toast.success(`Generated content for "${currentProduct.title}"!`);
    }, 400);
  };

  // 1-Click Publish from Studio
  const [isPublishing, setIsPublishing] = useState(false);
  const handlePublishDirect = async (itemToPublish: AiContentItem) => {
    setIsPublishing(true);
    try {
      const res = await publishToCms(itemToPublish.id, 'Admin User');
      toast.success(res.message || 'Published directly to Product in Store!');
      if (activeResult?.id === itemToPublish.id) {
        setActiveResult({ ...activeResult, status: 'Published' });
      }
    } catch {
      toast.error('Failed to publish content to product.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Filtered Library Items
  const filteredLibraryItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchLibrary.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchLibrary.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchLibrary.toLowerCase()));

      const matchesType = libraryTypeFilter === 'all' || item.contentType === libraryTypeFilter;
      const matchesStatus = libraryStatusFilter === 'all' || item.status === libraryStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [items, searchLibrary, libraryTypeFilter, libraryStatusFilter]);

  // Review Queue Items
  const reviewQueueItems = useMemo(() => {
    return items.filter((i) => i.status === 'Pending Review' || i.status === 'Changes Requested');
  }, [items]);

  // Published Items
  const publishedItems = useMemo(() => {
    return items.filter((i) => i.status === 'Published');
  }, [items]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* 1. Header Section - Jodo Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AI Content Studio
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2 py-0.5">
              JODO Commerce OS
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate high-converting product descriptions, marketplace listings, and marketing copy grounded in your catalog.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/products')}
            className="text-xs h-9"
          >
            <Package className="w-3.5 h-3.5 mr-1.5" />
            View Products
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab('studio')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Generation
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards - Jodo Clean Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Generated */}
        <div
          onClick={() => setActiveTab('library')}
          className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium text-muted-foreground">Total Generated</span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.totalGenerated}</div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">Storefront copy assets</span>
        </div>

        {/* Drafts */}
        <div
          onClick={() => {
            setActiveTab('library');
            setLibraryStatusFilter('Draft');
          }}
          className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium text-muted-foreground">Drafts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.drafts}</div>
          <span className="text-[11px] text-amber-500 font-medium mt-0.5 block">Ready to polish</span>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => setActiveTab('review')}
          className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.pendingReview}</div>
          <span className="text-[11px] text-blue-500 font-medium mt-0.5 block">Awaiting sign-off</span>
        </div>

        {/* Approved */}
        <div
          onClick={() => {
            setActiveTab('library');
            setLibraryStatusFilter('Approved');
          }}
          className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium text-muted-foreground">Approved</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.approved}</div>
          <span className="text-[11px] text-emerald-500 font-medium mt-0.5 block">Ready to publish</span>
        </div>

        {/* Published */}
        <div
          onClick={() => setActiveTab('published')}
          className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-purple-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium text-muted-foreground">Published</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.published}</div>
          <span className="text-[11px] text-purple-500 font-medium mt-0.5 block">Live in Storefront</span>
        </div>
      </div>

      {/* 3. Unified Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl h-auto gap-1">
          <TabsTrigger
            value="studio"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Studio (Generator)
          </TabsTrigger>

          <TabsTrigger
            value="library"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            All Content & Drafts ({items.length})
          </TabsTrigger>

          <TabsTrigger
            value="review"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            Review Queue ({reviewQueueItems.length})
          </TabsTrigger>

          <TabsTrigger
            value="published"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            Published ({publishedItems.length})
          </TabsTrigger>

          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-semibold py-2 px-3.5 rounded-lg flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Analytics & Activity
          </TabsTrigger>
        </TabsList>

        {/* ========================================================
            TAB 1: AI STUDIO (GENERATOR)
            ======================================================== */}
        <TabsContent value="studio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Easy 3-Step Controls */}
            <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
              <div className="border-b pb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Generate AI Content
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pick a product from your catalog and let AI craft tailored copy in seconds.
                </p>
              </div>

              {/* Step 1: Select Product */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>1. Choose Product</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    {productList.length} products available
                  </span>
                </label>

                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Select a product from your store..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {productList.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.title} ({p.sku}) - ₹{p.price.toLocaleString('en-IN')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Product Card Preview */}
                {currentProduct && (
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border flex items-center gap-3 mt-2">
                    <img
                      src={currentProduct.imageUrl}
                      alt={currentProduct.title}
                      className="w-12 h-12 rounded-md object-cover border shrink-0 bg-background"
                    />
                    <div className="overflow-hidden min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate">{currentProduct.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {currentProduct.category} • {currentProduct.material} • ₹{currentProduct.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Content Format */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  2. Choose Content Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'product_description' as AiContentType,
                      label: 'Product Description',
                      desc: 'Headline, narrative story & bullet specs',
                      icon: FileText,
                    },
                    {
                      id: 'listing_copy' as AiContentType,
                      label: 'Marketplace Listing',
                      desc: 'Amazon bullets, Flipkart & Myntra tabs',
                      icon: ShoppingBag,
                    },
                    {
                      id: 'campaign_content' as AiContentType,
                      label: 'Social & Ads',
                      desc: 'Instagram, Meta ads & promo emails',
                      icon: Megaphone,
                    },
                    {
                      id: 'catalogue_content' as AiContentType,
                      label: 'Lookbook Story',
                      desc: 'Editorial concept & artisan craft notes',
                      icon: BookOpen,
                    },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = contentType === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setContentType(t.id)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                            : 'border-border hover:border-border/80 bg-background text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {t.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                          {t.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Tone & Length */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Brand Tone</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Luxury">Luxury & Artisanal</SelectItem>
                        <SelectItem value="Minimal">Minimal & Scandi</SelectItem>
                        <SelectItem value="Friendly">Friendly & Warm</SelectItem>
                        <SelectItem value="Professional">Professional & Technical</SelectItem>
                        <SelectItem value="Bold">Bold & High-Energy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Length</label>
                    <Select value={length} onValueChange={(val: any) => setLength(val)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Short">Short & Punchy</SelectItem>
                        <SelectItem value="Medium">Medium (Balanced)</SelectItem>
                        <SelectItem value="Detailed">Detailed & In-Depth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Custom Highlights or Keywords (Optional)
                  </label>
                  <Input
                    placeholder="e.g. solid wood, zero-squeak, 5-year warranty, living room"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Primary CTA: Generate */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !currentProduct}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs h-10 shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>

            {/* Right Column: Live Output Studio & Actions */}
            <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              {activeResult ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground truncate max-w-[320px]">
                          {activeResult.title}
                        </h3>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {activeResult.contentType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Product: <span className="font-medium text-foreground">{activeResult.productName}</span> • Tone: {activeResult.tone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <QualityScoreBadge score={activeResult.qualityScore} checks={activeResult.qualityChecks} />
                    </div>
                  </div>

                  {/* Formatted Content Sections */}
                  <Tabs defaultValue="story" className="space-y-3">
                    <TabsList className="bg-muted/40 p-1 rounded-lg h-8 gap-1">
                      <TabsTrigger value="story" className="text-xs py-1 px-2.5">
                        Story & Description
                      </TabsTrigger>
                      <TabsTrigger value="bullets" className="text-xs py-1 px-2.5">
                        Feature Bullets
                      </TabsTrigger>
                      <TabsTrigger value="specs" className="text-xs py-1 px-2.5">
                        Specs & Care
                      </TabsTrigger>
                      <TabsTrigger value="seo" className="text-xs py-1 px-2.5">
                        SEO Metadata
                      </TabsTrigger>
                    </TabsList>

                    {/* Story & Description Tab */}
                    <TabsContent value="story" className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                          Hero Tagline / Headline
                        </label>
                        <Input
                          value={activeResult.generatedContent.productTitle || activeResult.title}
                          onChange={(e) => {
                            const updated = { ...activeResult.generatedContent, productTitle: e.target.value };
                            saveDraft(activeResult.id, updated);
                            setActiveResult({ ...activeResult, generatedContent: updated, editedContent: updated });
                          }}
                          className="text-xs font-semibold h-9"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                          Full Product Story / Narrative
                        </label>
                        <Textarea
                          rows={6}
                          value={activeResult.generatedContent.fullDescription || activeResult.generatedContent.story || activeResult.generatedContent.detailedDescription || ''}
                          onChange={(e) => {
                            const updated = { ...activeResult.generatedContent, fullDescription: e.target.value };
                            saveDraft(activeResult.id, updated);
                            setActiveResult({ ...activeResult, generatedContent: updated, editedContent: updated });
                          }}
                          className="text-xs leading-relaxed"
                        />
                      </div>
                    </TabsContent>

                    {/* Feature Bullets Tab */}
                    <TabsContent value="bullets" className="space-y-2 pt-1">
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                        High-Converting Product Bullets
                      </label>
                      <Textarea
                        rows={6}
                        value={
                          Array.isArray(activeResult.generatedContent.keyFeatures)
                            ? activeResult.generatedContent.keyFeatures.join('\n• ')
                            : Array.isArray(activeResult.generatedContent.bulletPoints)
                            ? activeResult.generatedContent.bulletPoints.join('\n• ')
                            : ''
                        }
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').map((l) => l.replace(/^•\s*/, '').trim()).filter(Boolean);
                          const updated = { ...activeResult.generatedContent, keyFeatures: lines };
                          saveDraft(activeResult.id, updated);
                          setActiveResult({ ...activeResult, generatedContent: updated, editedContent: updated });
                        }}
                        className="text-xs font-mono"
                      />
                    </TabsContent>

                    {/* Specs & Care Tab */}
                    <TabsContent value="specs" className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                          Craftsmanship & Materials Care
                        </label>
                        <Textarea
                          rows={4}
                          value={activeResult.generatedContent.materialsCare || activeResult.generatedContent.careInstructions || 'Wipe with soft damp cloth. Avoid harsh abrasive cleaners.'}
                          onChange={(e) => {
                            const updated = { ...activeResult.generatedContent, materialsCare: e.target.value };
                            saveDraft(activeResult.id, updated);
                            setActiveResult({ ...activeResult, generatedContent: updated, editedContent: updated });
                          }}
                          className="text-xs"
                        />
                      </div>
                    </TabsContent>

                    {/* SEO Metadata Tab */}
                    <TabsContent value="seo" className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                          SEO Meta Title (Storefront & Google Search)
                        </label>
                        <Input
                          value={activeResult.generatedContent.seoMetaTitle || `${activeResult.productName} | JODO`}
                          onChange={(e) => {
                            const updated = { ...activeResult.generatedContent, seoMetaTitle: e.target.value };
                            saveDraft(activeResult.id, updated);
                            setActiveResult({ ...activeResult, generatedContent: updated, editedContent: updated });
                          }}
                          className="text-xs h-9"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                          SEO Meta Description
                        </label>
                        <Textarea
                          rows={3}
                          value={activeResult.generatedContent.seoMetaDescription || ''}
                          onChange={(e) => {
                            const updated = { ...activeResult.generatedContent, seoMetaDescription: e.target.value };
                            saveDraft(activeResult.id, updated);
                            setActiveResult({ ...activeResult, generatedContent: updated, editedContent: updated });
                          }}
                          className="text-xs"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Action Bar */}
                  <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const fullText = [
                            activeResult.title,
                            '',
                            activeResult.generatedContent.fullDescription || '',
                            '',
                            'Key Features:',
                            Array.isArray(activeResult.generatedContent.keyFeatures)
                              ? activeResult.generatedContent.keyFeatures.map((f: string) => `• ${f}`).join('\n')
                              : '',
                          ].join('\n');
                          handleCopyText(fullText);
                        }}
                        className="text-xs h-9 gap-1.5"
                      >
                        {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {hasCopied ? 'Copied' : 'Copy All Text'}
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          saveDraft(activeResult.id, activeResult.generatedContent);
                          toast.success('Draft saved successfully to library!');
                        }}
                        className="text-xs h-9"
                      >
                        Save as Draft
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePublishDirect(activeResult)}
                        disabled={isPublishing}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-9 font-semibold gap-1.5 shadow-sm"
                      >
                        {isPublishing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            1-Click Publish to Product
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-muted-foreground space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">No content generated yet</h4>
                  <p className="text-xs max-w-sm mx-auto">
                    Select a product on the left and click <strong>"Generate with AI"</strong> to preview your ready-to-publish copy here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ========================================================
            TAB 2: ALL CONTENT & DRAFTS
            ======================================================== */}
        <TabsContent value="library" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drafts, products, SKU..."
                  value={searchLibrary}
                  onChange={(e) => setSearchLibrary(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={libraryTypeFilter} onValueChange={setLibraryTypeFilter}>
                  <SelectTrigger className="h-9 text-xs w-[160px]">
                    <SelectValue placeholder="All Formats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Formats</SelectItem>
                    <SelectItem value="product_description">Product Description</SelectItem>
                    <SelectItem value="listing_copy">Marketplace Listing</SelectItem>
                    <SelectItem value="campaign_content">Campaign & Social</SelectItem>
                    <SelectItem value="catalogue_content">Lookbook / Catalogue</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={libraryStatusFilter} onValueChange={setLibraryStatusFilter}>
                  <SelectTrigger className="h-9 text-xs w-[140px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Changes Requested">Changes Requested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Table */}
            <div className="border border-border/80 rounded-lg overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Title / Product</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Tone</th>
                    <th className="py-2.5 px-3">Quality Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Updated</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredLibraryItems.length > 0 ? (
                    filteredLibraryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-foreground text-xs hover:underline cursor-pointer" onClick={() => {
                            setActiveResult(item);
                            setActiveTab('studio');
                          }}>
                            {item.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {item.productName} • {item.sku || 'No SKU'}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-[10px]">
                            {item.contentType.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 font-medium text-foreground">
                          {item.tone}
                        </td>

                        <td className="py-3 px-3">
                          <QualityScoreBadge score={item.qualityScore} checks={item.qualityChecks} />
                        </td>

                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              item.status === 'Published'
                                ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                                : item.status === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                : item.status === 'Pending Review'
                                ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-muted-foreground text-[11px]">
                          {item.updatedAt}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              title="Edit in Studio"
                              onClick={() => {
                                setActiveResult(item);
                                setActiveTab('studio');
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              title="Review Details"
                              onClick={() => {
                                setSelectedItemForModal(item);
                                setIsReviewModalOpen(true);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              title="Publish directly"
                              onClick={() => handlePublishDirect(item)}
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-500"
                              title="Delete"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this draft?')) {
                                  deleteItem(item.id);
                                  toast.success('Draft deleted');
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No drafts found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================
            TAB 3: REVIEW & APPROVALS
            ======================================================== */}
        <TabsContent value="review" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-foreground">Review & Approvals Queue</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review copy drafts submitted by the team before pushing live to the storefront catalog.
              </p>
            </div>

            <div className="space-y-3">
              {reviewQueueItems.length > 0 ? (
                reviewQueueItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-border bg-background/50 hover:bg-muted/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{item.title}</span>
                        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Product: <span className="font-semibold text-foreground">{item.productName}</span> • Submitted by {item.submittedBy || 'Author'} on {item.submittedAt || item.updatedAt}
                      </p>
                      {item.reviewNotes && (
                        <p className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20 mt-2 font-mono">
                          Reviewer Note: "{item.reviewNotes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItemForModal(item);
                          setIsReviewModalOpen(true);
                        }}
                        className="text-xs h-8"
                      >
                        Inspect & Edit
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          approveContent(item.id, 'Admin User');
                          handlePublishDirect(item);
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 font-semibold"
                      >
                        Approve & Publish
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-semibold text-foreground">Review Queue is All Clear</h4>
                  <p className="text-xs">There are no drafts awaiting review at this moment.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ========================================================
            TAB 4: PUBLISHED TO STORE
            ======================================================== */}
        <TabsContent value="published" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-foreground">Live Published Content</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Content successfully synchronized with active products in your storefront.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border bg-background/50 hover:border-purple-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate">{item.productName}</span>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-500 border-purple-500/20">
                      Live in CMS
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {item.generatedContent.fullDescription || item.generatedContent.story || 'Product copy live on storefront.'}
                  </p>

                  <div className="pt-2 border-t flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      Published: {item.publishedAt || item.updatedAt}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/products')}
                      className="text-xs text-primary hover:underline h-7 p-0"
                    >
                      Open in Products <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ========================================================
            TAB 5: ANALYTICS & ACTIVITY
            ======================================================== */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Content Share */}
            <div className="lg:col-span-6 bg-card rounded-xl border p-6 shadow-sm space-y-4">
              <div className="border-b pb-3 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Content Generated by Type</h3>
                <span className="text-xs text-muted-foreground">Distribution</span>
              </div>

              <div className="space-y-4 pt-1">
                {[
                  { type: 'Product Descriptions', percentage: 45, count: 112, color: 'bg-primary' },
                  { type: 'Marketplace Listings', percentage: 25, count: 62, color: 'bg-blue-500' },
                  { type: 'Catalogue Content', percentage: 18, count: 45, color: 'bg-amber-500' },
                  { type: 'Campaign Ads & Social', percentage: 12, count: 29, color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{item.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.count} assets</span>
                        <span className="font-bold text-foreground">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="lg:col-span-6 bg-card rounded-xl border p-6 shadow-sm space-y-4">
              <div className="border-b pb-3 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground">Recent AI Activity Log</h3>
                <span className="text-xs text-muted-foreground">Audit Trail</span>
              </div>

              <div className="space-y-3">
                {activities.slice(0, 5).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-lg border border-border/40 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{act.activity}</p>
                        <span className="text-[11px] text-muted-foreground mt-0.5 block">
                          by {act.user}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{act.date} {act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Modal Dialog */}
      <ReviewDetailModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        item={selectedItemForModal}
        onApprove={(id) => {
          approveContent(id, 'Admin User');
          toast.success('Approved content');
        }}
        onRequestChanges={(id, feedback) => {
          requestChanges(id, feedback);
          toast.warning('Changes requested');
        }}
        onReject={(id, reason) => {
          rejectContent(id, reason);
          toast.error('Rejected content');
        }}
      />
    </div>
  );
}

export default function AiContentHubPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-center text-muted-foreground">Loading AI Studio...</div>}>
      <AiContentHubInner />
    </React.Suspense>
  );
}
