'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Ruler,
  Weight,
  Box,
  Eye,
  Smartphone,
  FileBox,
  X,
  ArrowLeft,
  GitCompareArrows,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useMemo } from 'react';

function hasRealModel(product: { model: { glbUrl: string } }) {
  return (
    product.model.glbUrl &&
    !product.model.glbUrl.endsWith('/') &&
    product.model.glbUrl !== '/models/' &&
    product.model.glbUrl !== '/models'
  );
}

interface ComparisonRowProps {
  label: string;
  icon: React.ReactNode;
  values: (string | React.ReactNode)[];
}

function ComparisonRow({ label, icon, values }: ComparisonRowProps) {
  return (
    <div className="grid gap-2 py-3 px-4" style={{ gridTemplateColumns: '140px repeat(var(--cols, 1), 1fr)' }}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
        {icon}
        {label}
      </div>
      {values.map((val, i) => (
        <div key={i} className="flex items-center justify-center text-sm text-center min-w-0">
          {val}
        </div>
      ))}
    </div>
  );
}

export default function ProductComparison() {
  const { compareList, allProducts, toggleCompare, clearCompare, viewProduct, navigateTo } = useAppStore();

  const comparisonProducts = useMemo(() => {
    return compareList
      .map(slug => allProducts.find(p => p.slug === slug))
      .filter(Boolean) as NonNullable<ReturnType<typeof allProducts.find>>[];
  }, [compareList, allProducts]);

  const cols = comparisonProducts.length;

  if (compareList.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Button variant="ghost" onClick={() => navigateTo('products')} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>

        <Card className="max-w-lg mx-auto border-dashed border-2">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <GitCompareArrows className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Product Comparison</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add at least 2 products to compare (max 3)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:border-emerald-800">
                {compareList.length}/3 selected
              </Badge>
            </div>
            <Button variant="outline" onClick={() => navigateTo('products')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigateTo('products')} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-emerald-600" />
              Compare Products
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparing {cols} products side by side
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearCompare} className="gap-2">
          <X className="h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>

      {/* Comparison Table */}
      <Card className="overflow-hidden border-border/40">
        <div
          className="overflow-x-auto"
          style={{ '--cols': cols } as React.CSSProperties}
        >
          {/* Product Headers */}
          <div
            className="grid gap-2 p-4 bg-muted/30 border-b border-border/40"
            style={{ gridTemplateColumns: '140px repeat(var(--cols, 1), 1fr)' }}
          >
            <div />
            {comparisonProducts.map((product) => (
              <motion.div
                key={product.slug}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-border/40 bg-background cursor-pointer"
                  onClick={() => viewProduct(product.slug, product)}
                >
                  <img
                    src={product.model.posterUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-center min-w-0 w-full">
                  <p className="text-sm font-semibold line-clamp-2">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{product.sku}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCompare(product.slug)}
                  className="h-7 text-xs text-destructive hover:text-destructive gap-1"
                >
                  <X className="h-3 w-3" />
                  Remove
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-border/40">
            <ComparisonRow
              label="Category"
              icon={<Box className="h-3.5 w-3.5" />}
              values={comparisonProducts.map(p => (
                <Badge key={p.slug} variant="outline" className="text-xs">{p.category}</Badge>
              ))}
            />
            <ComparisonRow
              label="Price"
              icon={<span className="text-sm">₹</span>}
              values={comparisonProducts.map(p =>
                p.price ? (
                  <span key={p.slug} className="font-bold text-base">₹{p.price.toLocaleString()}</span>
                ) : (
                  <span key={p.slug} className="text-xs text-emerald-600 font-medium">Enquiry Only</span>
                )
              )}
            />
            <ComparisonRow
              label="Dimensions"
              icon={<Ruler className="h-3.5 w-3.5" />}
              values={comparisonProducts.map(p => (
                <div key={p.slug} className="text-xs space-y-1">
                  <p className="font-mono">
                    {p.dimensions.width}×{p.dimensions.height}×{p.dimensions.depth}
                  </p>
                  <p className="text-muted-foreground">{p.dimensions.unit}</p>
                </div>
              ))}
            />
            <ComparisonRow
              label="Weight"
              icon={<Weight className="h-3.5 w-3.5" />}
              values={comparisonProducts.map(p =>
                p.weight ? (
                  <span key={p.slug}>{p.weight} kg</span>
                ) : (
                  <span key={p.slug} className="text-muted-foreground">—</span>
                )
              )}
            />
            <ComparisonRow
              label="File Size"
              icon={<FileBox className="h-3.5 w-3.5" />}
              values={comparisonProducts.map(p =>
                p.model.fileSizeMb ? (
                  <span key={p.slug} className="text-xs font-mono">
                    {p.model.fileSizeMb > 1 ? `${p.model.fileSizeMb} MB` : `${(p.model.fileSizeMb * 1024).toFixed(0)} KB`}
                  </span>
                ) : (
                  <span key={p.slug} className="text-muted-foreground">—</span>
                )
              )}
            />
            <ComparisonRow
              label="3D Model"
              icon={<Box className="h-3.5 w-3.5" />}
              values={comparisonProducts.map(p =>
                hasRealModel(p) ? (
                  <Badge key={p.slug} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" /> Real GLB
                  </Badge>
                ) : (
                  <Badge key={p.slug} variant="outline" className="gap-1 text-xs text-muted-foreground">
                    <XCircle className="h-3 w-3" /> Placeholder
                  </Badge>
                )
              )}
            />
            <ComparisonRow
              label="AR Support"
              icon={<Smartphone className="h-3.5 w-3.5" />}
              values={comparisonProducts.map(p =>
                hasRealModel(p) ? (
                  <Badge key={p.slug} className="bg-emerald-600 text-white gap-1 text-xs">
                    <Eye className="h-3 w-3" /> Supported
                  </Badge>
                ) : (
                  <Badge key={p.slug} variant="outline" className="gap-1 text-xs text-muted-foreground">
                    <XCircle className="h-3 w-3" /> Not Available
                  </Badge>
                )
              )}
            />
          </div>

          {/* Action Row */}
          <div
            className="grid gap-2 p-4 bg-muted/30 border-t border-border/40"
            style={{ gridTemplateColumns: '140px repeat(var(--cols, 1), 1fr)' }}
          >
            <div />
            {comparisonProducts.map(p => (
              <Button
                key={p.slug}
                size="sm"
                onClick={() => viewProduct(p.slug, p)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm"
              >
                View Details
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
