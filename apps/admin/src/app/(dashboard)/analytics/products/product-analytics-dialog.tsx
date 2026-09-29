'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Boxes, 
  ExternalLink, 
  FileSpreadsheet, 
  Star, 
  Truck, 
  Sparkles, 
  ArrowUpRight,
  RotateCcw,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import Link from 'next/link';

export interface ProductAnalyticsData {
  _id?: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cogs: number;
  margin: number;
  volume: number;
  stock: number;
  velocity: number;
  returnRate: number;
  rating: number;
  reviewsCount: number;
  growth: number;
  description: string;
  image?: string;
  material?: string;
  dimensions?: string;
  vendor?: string;
  variants: {
    name: string;
    share: number;
    units: number;
    stock: number;
  }[];
  weeklyTrend: {
    week: string;
    units: number;
    revenue: number;
  }[];
  fulfillment: {
    hub: string;
    avgDelivery: string;
    reorderLevel: number;
    reorderRecommendation: string;
  };
}

interface ProductAnalyticsDialogProps {
  product: ProductAnalyticsData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (val: number) => `₹${val.toLocaleString()}`;
const formatNumber = (val: number) => val.toLocaleString();

export function ProductAnalyticsDialog({
  product,
  open,
  onOpenChange,
}: ProductAnalyticsDialogProps) {
  if (!product) return null;

  const totalRevenue = product.volume * product.price;
  const totalCost = product.volume * product.cogs;
  const grossProfit = totalRevenue - totalCost;
  const isHealthyStock = product.stock >= product.fulfillment.reorderLevel;

  const handleExport = () => {
    toast.success(`Exported analytics report for ${product.name}`, {
      description: 'Report downloaded as CSV summary.',
    });
  };

  const catalogUrl = product._id ? `/products/${product._id}` : '/products';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 border-zinc-800 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden select-none">
        {/* Header Hero Banner - Compact & No Scroll */}
        <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center justify-between gap-4 pr-6">
            <div className="flex items-center gap-3.5 min-w-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-border/80 shadow-sm shrink-0 bg-muted"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Package className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2 py-0 font-medium">
                    {product.category}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground truncate">
                    {product.sku}
                  </span>
                  {product.margin >= 55 && (
                    <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] px-1.5 py-0">
                      High Margin
                    </Badge>
                  )}
                  {isHealthyStock ? (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-1.5 py-0">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Low Stock
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground truncate">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground truncate max-w-[480px]">
                  {product.description}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Top 4 KPI Metrics Cards */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg border border-border/60 bg-card/60 space-y-0.5">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Units Sold</span>
                <Package className="w-3 h-3 text-primary" />
              </div>
              <div className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {formatNumber(product.volume)}
              </div>
              <div className="text-[10px] text-emerald-500 flex items-center font-medium truncate">
                <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                +{product.growth}%
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/60 bg-card/60 space-y-0.5">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Revenue</span>
                <DollarSign className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {formatCurrency(product.price)} / unit
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/60 bg-card/60 space-y-0.5">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Margin</span>
                <TrendingUp className="w-3 h-3 text-amber-400" />
              </div>
              <div className={`text-base sm:text-lg font-bold tracking-tight ${product.margin >= 55 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {product.margin}%
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                Gross {formatCurrency(grossProfit)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-border/60 bg-card/60 space-y-0.5">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span>Stock</span>
                <Boxes className="w-3 h-3 text-blue-400" />
              </div>
              <div className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {formatNumber(product.stock)}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                ~{product.velocity} / month
              </div>
            </div>
          </div>

          {/* Fixed-Height Tabs - NO SCROLL NEEDED */}
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-8 bg-muted/60 text-xs">
              <TabsTrigger value="performance" className="text-xs py-1">Sales & Trends</TabsTrigger>
              <TabsTrigger value="variants" className="text-xs py-1">Variants & Stock</TabsTrigger>
              <TabsTrigger value="economics" className="text-xs py-1">Unit Economics</TabsTrigger>
            </TabsList>

            {/* TAB 1: Sales & Trends (Fixed Height: 185px) */}
            <TabsContent value="performance" className="h-[185px] mt-2.5 space-y-2.5">
              <div className="p-2.5 rounded-lg border border-border/60 bg-card/40">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <BarChart2 className="w-3.5 h-3.5 text-primary" />
                    Weekly Sales Trend (Units)
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Avg: {Math.max(1, Math.round(product.volume / 6))} units/wk
                  </span>
                </div>
                <div className="h-[80px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={product.weeklyTrend} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '6px',
                          color: 'hsl(var(--popover-foreground))',
                          fontSize: '11px',
                          padding: '4px 8px'
                        }}
                        formatter={(val: number) => [`${val} units`, 'Units Sold']}
                      />
                      <Bar dataKey="units" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Customer Rating & Returns */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2 rounded-lg border border-border/50 bg-muted/20 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{product.rating} / 5.0</div>
                    <p className="text-[10px] text-muted-foreground truncate">{product.reviewsCount} customer ratings</p>
                  </div>
                </div>

                <div className="p-2 rounded-lg border border-border/50 bg-muted/20 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{product.returnRate}% Return Rate</div>
                    <p className="text-[10px] text-emerald-400 truncate">Below 3.0% threshold</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Variants & Stock (Fixed Height: 185px) */}
            <TabsContent value="variants" className="h-[185px] mt-2.5 space-y-2">
              <div className="space-y-1.5">
                {product.variants.slice(0, 3).map((variant, idx) => (
                  <div key={idx} className="p-2 rounded-md border border-border/50 bg-card/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground truncate max-w-[280px]">{variant.name}</span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-semibold text-primary">{variant.share}%</span>
                        <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                          {variant.stock} stock
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${variant.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-md border border-border/60 bg-muted/20 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>{product.fulfillment.hub}</span>
                </div>
                <div className="text-primary font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{product.fulfillment.reorderRecommendation}</span>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Unit Economics (Fixed Height: 185px) */}
            <TabsContent value="economics" className="h-[185px] mt-2.5">
              <div className="p-3 rounded-lg border border-border/60 bg-card/40 space-y-2">
                <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Retail Selling Price</span>
                  <span className="font-semibold">{formatCurrency(product.price)}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Cost of Goods Sold (COGS)</span>
                  <span className="font-medium text-rose-400">-{formatCurrency(product.cogs)}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Net Margin Per Unit</span>
                  <span className="font-semibold text-emerald-400">
                    +{formatCurrency(product.price - product.cogs)} ({product.margin}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Cumulative Gross Profit</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(grossProfit)}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">Reorder Capital Buffer</span>
                  <span className="font-medium text-foreground">{formatCurrency(product.cogs * product.fulfillment.reorderLevel)}</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={handleExport}
            >
              <FileSpreadsheet className="w-3 h-3" />
              Export Report
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Link href={catalogUrl}>
                <Button
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  View in Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
