'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  Package,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import { useAiContentStore, AiContentItem } from '@/stores/ai-content';
import { ContentEditorPanel } from '@/components/ai-content/content-editor-panel';

const CATALOGUE_PRODUCTS_POOL = [
  { id: 'cat_01', title: 'Solstice Marble & Brass Dining Table', sku: 'JD-DNG-012', category: 'Dining', collection: 'Monumental Mineralia', price: 89999, material: 'Italian Carrara Marble' },
  { id: 'cat_02', title: 'Aurelia Minimalist Teak Armchair', sku: 'JD-CHR-001', category: 'Living Room', collection: 'Scandinavian Serenity', price: 24999, material: 'Burma Teak & Boucle' },
  { id: 'cat_03', title: 'Nordic Oak Floating Bedframe', sku: 'JD-BED-004', category: 'Bedroom', collection: 'Kyoto-Nordic Archive', price: 48999, material: 'American White Oak' },
  { id: 'cat_04', title: 'Komorebi Hand-Woven Cane Credenza', sku: 'JD-STG-008', category: 'Storage', collection: 'Botanical Modern', price: 38500, material: 'Ashwood & Natural Cane' },
  { id: 'cat_05', title: 'Zenith Fluted Marble Coffee Table', sku: 'JD-TBL-019', category: 'Living Room', collection: 'Monumental Mineralia', price: 32000, material: 'Black Marquina Marble' },
  { id: 'cat_06', title: 'Elysian Brass & Linen Pendant Chandelier', sku: 'JD-LGT-007', category: 'Lighting', collection: 'Luminous Brass', price: 18500, material: 'Hand-Spun Brass' },
];

export default function CatalogueContentPage() {
  const { items, generateContent } = useAiContentStore();

  const [selectedIds, setSelectedIds] = useState<string[]>(['cat_01', 'cat_02']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [collectionIntro, setCollectionIntro] = useState<string>('Monumental Mineralia Master Collection');

  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkGeneratedCount, setBulkGeneratedCount] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Active preview item
  const [activeItem, setActiveItem] = useState<AiContentItem | null>(
    items.find((i) => i.contentType === 'catalogue_content') || items[0] || null
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === CATALOGUE_PRODUCTS_POOL.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(CATALOGUE_PRODUCTS_POOL.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerateCatalogue = () => {
    setIsBulkGenerating(true);
    setTimeout(() => {
      let firstGenerated: AiContentItem | null = null;
      selectedIds.forEach((id) => {
        const prod = CATALOGUE_PRODUCTS_POOL.find((p) => p.id === id);
        if (prod) {
          const newItem = generateContent({
            contentType: 'catalogue_content',
            product: {
              id: prod.id,
              title: prod.title,
              sku: prod.sku,
              category: prod.category,
              price: prod.price,
              material: prod.material,
              collection: prod.collection,
            },
            tone: 'Luxury',
            length: 'Detailed',
          });
          if (!firstGenerated) firstGenerated = newItem;
        }
      });

      if (firstGenerated) {
        setActiveItem(firstGenerated);
      }
      setBulkGeneratedCount(selectedIds.length);
      setIsBulkGenerating(false);
      toast.success(`Generated ${selectedIds.length} catalogue draft(s)!`);
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
        }
      }, 150);
    }, 900);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Catalogue Content
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              Bulk Architecture Generator
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate publication-ready product titles, specifications, care instructions, and collection introductions.
          </p>
        </div>

        <Badge variant="secondary" className="text-xs self-start sm:self-auto px-3 py-1">
          {selectedIds.length} Products Selected
        </Badge>
      </div>

      {/* Product Selection Table with Bulk Support (Section 6) */}
      <div className="bg-card rounded-xl border p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select Products for Catalogue Generation
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="h-7 text-xs px-2.5"
            >
              {selectedIds.length === CATALOGUE_PRODUCTS_POOL.length ? 'Deselect All' : 'Select All (Bulk)'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Supports batch processing up to 50 items simultaneously
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATALOGUE_PRODUCTS_POOL.map((p) => {
            const isChecked = selectedIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleSelectOne(p.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <Checkbox checked={isChecked} onCheckedChange={() => toggleSelectOne(p.id)} className="mt-0.5" />
                <div className="space-y-1 text-xs flex-1">
                  <div className="font-semibold text-foreground line-clamp-1">{p.title}</div>
                  <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                    <span>{p.sku}</span>
                    <span className="font-semibold text-emerald-600">₹{p.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground pt-1 border-t flex items-center justify-between">
                    <span>{p.category}</span>
                    <span className="font-medium text-foreground">{p.material}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t gap-3">
          <span className="text-xs text-muted-foreground">
            Generates specs, material details, care guidelines, and collection briefs.
          </span>
          <Button
            type="button"
            onClick={handleGenerateCatalogue}
            disabled={selectedIds.length === 0 || isBulkGenerating}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm font-semibold text-xs px-6"
          >
            <Sparkles className={`w-4 h-4 ${isBulkGenerating ? 'animate-spin' : ''}`} />
            {isBulkGenerating
              ? `Generating ${selectedIds.length} Catalogue Drafts...`
              : `Generate Catalogue Content (${selectedIds.length})`}
          </Button>
        </div>
      </div>

      {bulkGeneratedCount && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Successfully generated {bulkGeneratedCount} catalogue drafts. Review individual results below.</span>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[10px]">
            Saved as Drafts
          </Badge>
        </div>
      )}

      {/* Individual Result Preview & Editor */}
      {activeItem && (
        <div ref={resultRef} className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Catalogue Specification & Copy</h2>
            <span className="text-xs text-muted-foreground">
              Reviewing: {activeItem.productName} ({activeItem.id})
            </span>
          </div>

          <ContentEditorPanel key={activeItem.id} item={activeItem} />
        </div>
      )}
    </div>
  );
}
