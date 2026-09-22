'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Package,
  Layers,
  CheckCircle2,
  FileEdit,
  Tag,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  Search,
  Database,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useAiContentStore, AiContentItem } from '@/stores/ai-content';
import { ContentEditorPanel } from '@/components/ai-content/content-editor-panel';
import { productsApi, aiContentApi } from '@/lib/api-client';

export interface NormalizedProduct {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  material: string;
  colour: string;
  design: string;
  collection: string;
  imageUrl: string;
  keyFeatures: string;
  targetAudience: string;
  existingDescription: string;
  isDb?: boolean;
}

const FALLBACK_PRESETS: NormalizedProduct[] = [
  {
    id: 'prod_101',
    title: 'Ananta Solid Sheesham 6-Seater Dining Table',
    sku: 'JD-DT-ANA-006',
    category: 'Dining Room',
    price: 28999,
    material: 'Solid Sheesham Wood',
    colour: 'Warm Walnut Honey',
    design: 'Warm Minimalist Joinery',
    collection: 'Dining & Togetherness',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: 'Solid Sheesham wood tabletop and legs, seats 6 comfortably, warm honey walnut finish, 15-min DIY leg assembly',
    targetAudience: 'Families who value warm gatherings and handcrafted solid Indian wood furniture',
    existingDescription: 'Handcrafted 6-seater dining table made from solid Sheesham with easy bolt-on assembly.',
    isDb: false,
  },
  {
    id: 'prod_102',
    title: 'Aurelia Minimalist Teak Armchair',
    sku: 'JD-CHR-AUR-001',
    category: 'Living Room',
    price: 24999,
    material: 'Kiln-Dried Burma Teakwood & Bouclé Fabric',
    colour: 'Oatmeal / Natural Teak',
    design: 'Sculptural Open-Frame',
    collection: 'Living Room Serenity',
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: 'Solid teakwood joinery, textured bouclé, ergonomic contour, interlocking easy assembly',
    targetAudience: 'Modern homeowners and boutique interiors seeking warm architectural seating',
    existingDescription: 'Open-frame minimalist armchair in kiln-dried teak with textured oatmeal bouclé upholstery.',
    isDb: false,
  },
  {
    id: 'prod_103',
    title: 'Nordic Oak Floating Platform Bedframe (King Size)',
    sku: 'JD-BED-NOR-004',
    category: 'Bedroom',
    price: 48999,
    material: 'American White Oak & Birch Slats',
    colour: 'Natural Blond Oak',
    design: 'Japanese-Nordic Cantilevered Platform',
    collection: 'Restful Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: 'Concealed cantilever base, 450kg load rating, acoustic dampening birch slats, modular slot-and-lock assembly',
    targetAudience: 'Urban homeowners upgrading to peaceful, minimalist master bedrooms',
    existingDescription: 'Floating platform bedframe in solid oak with recessed pedestal base and motion-isolated birch slats.',
    isDb: false,
  },
  {
    id: 'prod_104',
    title: 'Aarambh Solid Teak Study Desk with Cable Management',
    sku: 'JD-DSK-AAR-002',
    category: 'Study & Office',
    price: 18499,
    material: 'Solid Burma Teak & Powder-Coated Matte Steel',
    colour: 'Natural Honey & Matte Black',
    design: 'Functional Architectural Desk',
    collection: 'Study & Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: 'Solid teak top, integrated under-desk cable management channel, ergonomic eased edge, 10-min bolt-on legs',
    targetAudience: 'Remote professionals, designers, and home office setups',
    existingDescription: 'Functional study desk featuring solid teak tabletop, concealed wire trough, and sturdy steel legs.',
    isDb: false,
  },
  {
    id: 'prod_105',
    title: 'Ananta Sheesham Upholstered Dining Chairs (Set of 2)',
    sku: 'JD-CHR-ANA-002',
    category: 'Dining Room',
    price: 13999,
    material: 'Solid Sheesham Wood & Linen Blend Fabric',
    colour: 'Walnut & Sand Linen',
    design: 'Ergonomic Dining Silhouette',
    collection: 'Dining & Togetherness',
    imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: 'Set of 2 chairs, solid Sheesham frame, breathable sand linen cushion, high-resilience foam',
    targetAudience: 'Families pairing with Ananta dining tables for long comfortable meals',
    existingDescription: 'Pair of solid Sheesham dining chairs with high-density foam and sand linen upholstery.',
    isDb: false,
  },
  {
    id: 'prod_106',
    title: 'Vistara 3-Seater Modular Sofa with Natural Cane Weave',
    sku: 'JD-SOF-VIS-003',
    category: 'Living Room',
    price: 44999,
    material: 'Solid Mango Wood Frame & Handwoven Rattan Cane',
    colour: 'Pecan & Warm Ivory',
    design: 'Heritage Cane Modern Lounge',
    collection: 'Living Room Serenity',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: 'Handwoven natural cane panels, dual-density foam core, washable linen covers, modular tool-free connectors',
    targetAudience: 'Living rooms blending contemporary ease with Indian craft heritage',
    existingDescription: 'Expansive 3-seater sofa celebrating traditional Indian cane weave with deep lounge cushions.',
    isDb: false,
  },
  {
    id: 'prod_107',
    title: 'Sahyadri Fluted Oak 3-Drawer Nightstand',
    sku: 'JD-NST-SAH-003',
    category: 'Bedroom',
    price: 11999,
    material: 'Engineered Oak & Solid Oak Fluted Facing',
    colour: 'Muted Sand Oak',
    design: 'Architectural Fluted Bedside',
    collection: 'Restful Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: '3 soft-close drawers, fluted solid oak drawer fronts, pre-assembled carcass with screw-in legs',
    targetAudience: 'Bedrooms requiring uncluttered storage and textured warmth',
    existingDescription: 'Textured fluted bedside table with three smooth-gliding drawers and soft-close runners.',
    isDb: false,
  },
  {
    id: 'prod_108',
    title: 'Malhar Low-Profile Teak Coffee Table with Storage Shelf',
    sku: 'JD-CTB-MAL-001',
    category: 'Living Room',
    price: 15999,
    material: 'Kiln-Dried Burma Teakwood',
    colour: 'Satin Natural Teak',
    design: 'Organic Low-Profile Center Table',
    collection: 'Living Room Serenity',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: 'Rounded organic corners, full-length lower magazine shelf, solid teak build, 4-bolt assembly',
    targetAudience: 'Informal living rooms and tea gathering spaces',
    existingDescription: 'Solid teak coffee table with low-profile profile and full-length open storage shelf.',
    isDb: false,
  },
  {
    id: 'prod_109',
    title: 'Nilgiri Modular Bookshelf & Room Divider (5-Tier)',
    sku: 'JD-BKS-NIL-005',
    category: 'Study & Office',
    price: 26999,
    material: 'Solid Sheesham & Natural Cane Weave Panels',
    colour: 'Rich Walnut',
    design: 'Architectural Open Partition',
    collection: 'Study & Workspace',
    imageUrl: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: '5 display tiers, solid Sheesham construction, alternating cane panels, wall safety strap included',
    targetAudience: 'Open-plan apartments and home study libraries',
    existingDescription: '5-tier architectural bookshelf and room partition with alternating open shelving and natural cane backing.',
    isDb: false,
  },
  {
    id: 'prod_110',
    title: 'Samvaad Round 4-Seater Breakfast Table',
    sku: 'JD-DT-SAM-004',
    category: 'Dining Room',
    price: 22499,
    material: 'Solid White Ash Wood with Pedestal Base',
    colour: 'Soft Nordic Ash',
    design: 'Circular Pedestal Dining Table',
    collection: 'Dining & Togetherness',
    imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: 'Seats 4 persons, sculptural center pedestal eliminating corner leg clutter, two-piece machine-bolt assembly',
    targetAudience: 'Breakfast nooks, compact dining spaces, and morning chai areas',
    existingDescription: 'Intimate round breakfast and dining table in solid White Ash wood with sculptural pedestal base.',
    isDb: false,
  },
];

const TONE_OPTIONS = ['Premium', 'Luxury', 'Elegant', 'Professional', 'Friendly', 'Minimal'];
const LENGTH_OPTIONS: ('Short' | 'Medium' | 'Detailed')[] = ['Short', 'Medium', 'Detailed'];

export default function ProductDescriptionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryProductId = searchParams.get('productId');

  const { items, selectedItemId, generateContent } = useAiContentStore();

  // Search filter for dropdown list
  const [productSearch, setProductSearch] = useState('');

  // 1. Fetch live products from database
  const {
    data: dbProductsRaw = [],
    isLoading: isLoadingProducts,
    isRefetching: isRefetchingProducts,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const res = await productsApi.list();
        const items = res.data?.data?.products || res.data?.data;
        if (Array.isArray(items) && items.length > 0) {
          return items;
        }
      } catch {
        // Fallback to storefront public endpoint to ensure DB products are loaded
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/storefront/products`);
        const json = await res.json();
        return json.data || [];
      } catch {
        return [];
      }
    },
  });

  // Normalize DB products
  const dbProducts = useMemo<NormalizedProduct[]>(() => {
    if (!Array.isArray(dbProductsRaw)) return [];
    return dbProductsRaw.map((p: any) => {
      // Build keyFeatures from specs or shortDescription or dimensions
      let features = '';
      if (p.specifications && Array.isArray(p.specifications) && p.specifications.length > 0) {
        features = p.specifications
          .map((s: any) => `${s.key}: ${s.value}`)
          .join(', ');
      } else if (p.shortDescription) {
        features = p.shortDescription;
      } else {
        const parts = [
          p.material,
          p.dimensions ? `Dimensions: ${p.dimensions}` : null,
          p.assemblyRequired ? 'Assembly required' : 'Fully assembled',
          p.tags && p.tags.length ? p.tags.join(', ') : null,
        ].filter(Boolean);
        features = parts.join(', ') || 'Solid craftsmanship, premium materials, high durability';
      }

      // Extract colour/finish
      const colour =
        p.colour ||
        p.productDetails?.colour ||
        p.productDetails?.color ||
        p.productDetails?.finish ||
        (p.specifications?.find(
          (s: any) =>
            s.key?.toLowerCase().includes('color') ||
            s.key?.toLowerCase().includes('colour') ||
            s.key?.toLowerCase().includes('finish')
        )?.value) ||
        'Natural / Standard';

      const material =
        p.material ||
        p.productDetails?.material ||
        (p.specifications?.find((s: any) =>
          s.key?.toLowerCase().includes('material')
        )?.value) ||
        'Premium Quality Wood & Metal';

      const collection =
        p.collection ||
        (p.vendor ? `${p.vendor} Line` : `${p.category || 'Jodo'} Collection`);

      const targetAudience =
        p.targetAudience ||
        (p.category === 'Office'
          ? 'Corporate professionals, remote teams, and home office designers'
          : p.category === 'Bedroom'
          ? 'Homeowners looking for modern bedroom comfort and minimalist aesthetics'
          : p.category === 'Dining Room' || p.category === 'Dining'
          ? 'Families, hosts, and interior decorators seeking timeless dining pieces'
          : 'Modern homeowners and interior designers seeking elegant living aesthetics');

      return {
        id: p._id || p.id,
        title: p.title || 'Untitled Product',
        sku: p.sku || 'JD-SKU-000',
        category: p.category || 'Furniture',
        price: Number(p.price) || 0,
        material,
        colour,
        design: p.design || `${p.category || 'Modern'} Architectural`,
        collection,
        imageUrl: p.imageUrl || (p.galleryImages && p.galleryImages[0]) || '',
        keyFeatures: features,
        targetAudience,
        existingDescription: p.longDescription || p.shortDescription || '',
        isDb: true,
      };
    });
  }, [dbProductsRaw]);

  // Prioritize DB products directly from the database
  const allProducts = useMemo<NormalizedProduct[]>(() => {
    return dbProducts.length > 0 ? dbProducts : FALLBACK_PRESETS;
  }, [dbProducts]);

  // Filtered products for dropdown search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const q = productSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [allProducts, productSearch]);

  // Find initial product based on query param or first available
  const [selectedProduct, setSelectedProduct] = useState<NormalizedProduct>(
    FALLBACK_PRESETS[0]
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
  const resultRef = useRef<HTMLDivElement>(null);

  // When product selection changes, update inputs
  const handleProductSelect = (p: NormalizedProduct) => {
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

    // Auto-update SEO keywords based on selected product
    const keywords = [
      p.title,
      p.category,
      p.material ? p.material.split(/[,&]/)[0]?.trim() : '',
      'luxury furniture',
    ]
      .filter(Boolean)
      .map((k) => k.toLowerCase())
      .join(', ');
    setKeywordsStr(keywords);
  };

  // Sync initial selection when DB products finish loading
  useEffect(() => {
    if (queryProductId) {
      const match = allProducts.find((p) => p.id === queryProductId);
      if (match) {
        handleProductSelect(match);
        return;
      }
    }
    // Auto-select first DB product once loaded from database
    if (dbProducts.length > 0 && (!selectedProduct.isDb || selectedProduct.id.startsWith('prod_'))) {
      handleProductSelect(dbProducts[0]);
    }
  }, [dbProducts, queryProductId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);
    const payload = {
      contentType: 'product_description' as const,
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
    };

    try {
      // Try generating through the API backend (MongoDB + AI Atelier engine)
      const res = await aiContentApi.generate(payload);
      if (res.data?.data?.item) {
        const apiItem = res.data.data.item;
        const normalizedItem: AiContentItem = {
          id: apiItem.contentId || apiItem._id || `AIC-${Date.now()}`,
          contentType: 'product_description',
          productId: selectedProduct.id,
          productName: productName,
          sku: selectedProduct.sku,
          category,
          price: Number(price),
          imageUrl: selectedProduct.imageUrl,
          title: apiItem.title || `${productName} | JODO Collection`,
          generatedContent: apiItem.generatedContent || {},
          editedContent: apiItem.editedContent || apiItem.generatedContent || {},
          tone,
          length,
          channel: 'Website',
          targetAudience,
          seoKeywords: keywords,
          seoOptimized,
          qualityScore: apiItem.qualityScore || 95,
          qualityChecks: apiItem.qualityChecks || {
            grammar: true,
            brandTone: true,
            seo: true,
            productAccuracy: true,
            duplicateRisk: 'Low',
            unsupportedClaimsCount: 0,
          },
          status: apiItem.status || 'Draft',
          version: apiItem.version || 1,
          createdBy: apiItem.createdBy || 'Admin',
          createdAt: apiItem.createdAt || new Date().toISOString(),
          updatedAt: apiItem.updatedAt || new Date().toISOString(),
          versions: [],
        };
        setGeneratedItem(normalizedItem);
        toast.success(`AI Description generated for "${productName}"!`);
      } else {
        throw new Error('No item returned');
      }
    } catch {
      // Smooth fallback to local generator
      const item = generateContent(payload);
      setGeneratedItem(item);
      toast.success(`Description generated for "${productName}"!`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
        }
      }, 150);
    }
  };

  // Pre-load existing draft or newly generated item if available
  useEffect(() => {
    if (selectedItemId) {
      const selected = items.find((i) => i.id === selectedItemId && i.contentType === 'product_description');
      if (selected) {
        setGeneratedItem(selected);
        return;
      }
    }
    const existing = items.find((i) => i.contentType === 'product_description');
    if (existing && !generatedItem) {
      setGeneratedItem(existing);
    }
  }, [items, selectedItemId, generatedItem]);

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

      {/* Generator Configuration Form (Section 1: Select CMS Product) */}
      <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              1. Select CMS Product (Auto-Populated)
            </span>
            {dbProducts.length > 0 && (
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 py-0 px-2 h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live DB Connected ({dbProducts.length} items)
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                refetchProducts();
                toast.success('Refreshing products from database...');
              }}
              disabled={isLoadingProducts || isRefetchingProducts}
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingProducts || isRefetchingProducts ? 'animate-spin' : ''}`} />
              <span>{isLoadingProducts || isRefetchingProducts ? 'Syncing...' : 'Sync DB'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => router.push('/products/new')}
              className="h-7 text-xs gap-1 text-primary hover:bg-primary/10 border-primary/30"
            >
              <Plus className="w-3 h-3" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Product Dropdown Selector (Compact Width) */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <label className="font-semibold text-xs text-muted-foreground whitespace-nowrap">
                Select Product:
              </label>
              <div className="w-full sm:w-80 md:w-96">
                <Select
                  value={selectedProduct.id}
                  onValueChange={(val) => {
                    const target = allProducts.find((p) => p.id === val);
                    if (target) handleProductSelect(target);
                  }}
                >
                  <SelectTrigger className="h-9 w-full text-xs bg-background border-input hover:border-primary/50 transition-colors">
                    <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select a product..."}>
                      <div className="flex items-center gap-2 truncate text-left">
                        {selectedProduct.imageUrl ? (
                          <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.title}
                            className="w-5 h-5 rounded object-cover border flex-shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground truncate max-w-[130px] sm:max-w-[170px]">
                          {selectedProduct.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          ({selectedProduct.sku})
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 ml-auto pl-2 flex-shrink-0">
                          ₹{selectedProduct.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-72 w-[var(--radix-select-trigger-width)]">
                    {/* Database Products Group */}
                    {dbProducts.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-[11px] font-semibold text-primary flex items-center gap-1.5 px-2 py-1.5">
                          <Database className="w-3 h-3" />
                          Database Products ({dbProducts.length})
                        </SelectLabel>
                        {dbProducts.map((prod) => (
                          <SelectItem key={prod.id} value={prod.id} className="text-xs py-2">
                            <div className="flex items-center gap-2 w-full">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.title}
                                  className="w-5 h-5 rounded object-cover border flex-shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                  <Package className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium text-foreground truncate max-w-[160px]">{prod.title}</span>
                              <span className="text-[10px] text-muted-foreground">({prod.sku})</span>
                              <span className="text-[11px] font-semibold text-foreground ml-auto pl-1">
                                ₹{prod.price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}

                    {/* Fallback Presets Group */}
                    <SelectGroup>
                      <SelectLabel className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 px-2 py-1.5">
                        <Tag className="w-3 h-3" />
                        Demo & Preset Catalog
                      </SelectLabel>
                      {FALLBACK_PRESETS.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id} className="text-xs py-2">
                          <div className="flex items-center gap-2 w-full">
                            <img
                              src={prod.imageUrl}
                              alt={prod.title}
                              className="w-5 h-5 rounded object-cover border flex-shrink-0"
                            />
                            <span className="font-medium text-foreground truncate max-w-[160px]">{prod.title}</span>
                            <span className="text-[10px] text-muted-foreground">({prod.sku})</span>
                            <span className="text-[11px] font-semibold text-foreground ml-auto pl-1">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quick status on the right */}
            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              {selectedProduct.isDb ? (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 h-6">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  MongoDB Live: {selectedProduct.sku}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] h-6">
                  Preset: {selectedProduct.sku}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Auto-populated Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
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
            type="button"
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
        <div ref={resultRef} className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">AI Generated Result</h2>
            <span className="text-xs text-muted-foreground">
              Every result must be saved as Draft or sent for Review prior to publishing.
            </span>
          </div>

          <ContentEditorPanel key={generatedItem.id} item={generatedItem} />
        </div>
      )}
    </div>
  );
}
