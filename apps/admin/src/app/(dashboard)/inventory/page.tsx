'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryIntelligenceApi, inventoryApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  AlertTriangle, 
  Search, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Pencil
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface InventoryItemData {
  _id: string;
  productName: string;
  sku: string;
  imageUrl?: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface InventorySummaryData {
  totalSkus: number;
  outOfStock: number;
  lowStock: number;
  totalReserved: number;
}

interface CriticalItem {
  sku: string;
  productName?: string;
  reason: string;
  recommendation: string;
}

interface AiInsightsData {
  summary: string;
  criticalItems: CriticalItem[];
  recommendations: string[];
}

export default function InventoryIntelligencePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItemData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableInput, setAvailableInput] = useState(0);
  const [thresholdInput, setThresholdInput] = useState(10);

  // 1. Fetch real CMS/database inventory data & any cached AI analysis
  const { data: fullData, isLoading, refetch } = useQuery({
    queryKey: ['inventory', 'data'],
    queryFn: async () => {
      const res = await inventoryIntelligenceApi.data();
      return res.data.data as {
        summary: InventorySummaryData;
        items: InventoryItemData[];
        latestAiInsights?: AiInsightsData | null;
      };
    },
  });

  const summary = fullData?.summary || { totalSkus: 0, outOfStock: 0, lowStock: 0, totalReserved: 0 };
  const items = fullData?.items || [];
  const initialAi = fullData?.latestAiInsights || null;

  // Local state for AI insights (initialized with cached or updated on manual click)
  const [aiInsights, setAiInsights] = useState<AiInsightsData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync initial cached insights if not yet set
  React.useEffect(() => {
    if (initialAi && !aiInsights) {
      setAiInsights(initialAi);
    }
  }, [initialAi, aiInsights]);

  // 2. AI Analysis Mutation
  const aiMutation = useMutation({
    mutationFn: async () => {
      setAiError(null);
      const res = await inventoryIntelligenceApi.generateAiAnalysis();
      return res.data.data as AiInsightsData;
    },
    onSuccess: (data) => {
      setAiInsights(data);
      setAiError(null);
      toast.success('Inventory analysis complete');
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.message || 'Unable to generate inventory insights. Please try again.';
      setAiError(errorMsg);
      toast.error('Unable to generate inventory insights. Please try again.');
    },
  });

  // 3. Update stock levels mutation (Edit Dialog)
  const updateMutation = useMutation({
    mutationFn: ({ id, available, lowStockThreshold }: { id: string; available: number; lowStockThreshold: number }) =>
      inventoryApi.update(id, { available, lowStockThreshold }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsDialogOpen(false);
      refetch();
      toast.success('Stock levels updated');
    },
    onError: () => {
      toast.error('Failed to update stock');
    },
  });

  const handleEditClick = (item: InventoryItemData) => {
    setSelectedItem(item);
    setAvailableInput(item.availableStock);
    setThresholdInput(item.reorderLevel || 10);
    setIsDialogOpen(true);
  };

  const handleSaveStock = () => {
    if (!selectedItem) return;
    updateMutation.mutate({
      id: selectedItem._id,
      available: availableInput,
      lowStockThreshold: thresholdInput,
    });
  };

  // Filtered inventory items based on search
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.sku.toLowerCase().includes(term) ||
        item.productName.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  // Table Columns
  const columns: ColumnDef<InventoryItemData>[] = [
    {
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <span className="font-semibold text-sm truncate">{item.productName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('sku')}</span>,
    },
    {
      accessorKey: 'totalStock',
      header: 'Total Stock',
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('totalStock')}</span>,
    },
    {
      accessorKey: 'reservedStock',
      header: 'Reserved',
      cell: ({ row }) => {
        const val = row.getValue('reservedStock') as number;
        return (
          <span className={`font-mono text-sm ${val > 0 ? 'text-blue-500 font-semibold' : 'text-muted-foreground'}`}>
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: 'availableStock',
      header: 'Available',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-bold text-foreground">
          {row.getValue('availableStock')}
        </span>
      ),
    },
    {
      accessorKey: 'reorderLevel',
      header: 'Reorder Level',
      cell: ({ row }) => <span className="font-mono text-sm text-muted-foreground">{row.getValue('reorderLevel')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (status === 'Out of Stock') {
          return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
        }
        if (status === 'Low Stock') {
          return (
            <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
              Low Stock
            </Badge>
          );
        }
        return (
          <Badge variant="default" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-none">
            In Stock
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => handleEditClick(row.original)}
          title="Adjust Stock"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6 w-full max-w-[1600px] mx-auto">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor stock availability, low-stock items, reserved stock and AI-powered inventory insights.
          </p>
        </div>

        <Button
          onClick={() => aiMutation.mutate()}
          disabled={aiMutation.isPending}
          className="shrink-0 gap-2 font-medium"
        >
          {aiMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing inventory...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze Inventory
            </>
          )}
        </Button>
      </div>

      {/* 2. STOCK SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{summary.totalSkus}</div>
            <p className="text-xs text-muted-foreground mt-1">Total managed products</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{summary.outOfStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Available stock = 0</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">{summary.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Below reorder level</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Reserved Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-600">{summary.totalReserved}</div>
            <p className="text-xs text-muted-foreground mt-1">Reserved for pending orders</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. SEARCH & CONTROLS ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search product or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filteredItems.length} of {items.length} products
        </div>
      </div>

      {/* 4. SIMPLE STOCK TABLE */}
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <DataTable columns={columns} data={filteredItems} isLoading={isLoading} />
      </div>

      {/* 5. AI INVENTORY INSIGHTS SECTION */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">AI Inventory Insights</h2>
          </div>
          {aiInsights && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => aiMutation.mutate()}
              disabled={aiMutation.isPending}
              className="text-xs h-8 gap-1.5"
            >
              {aiMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Re-analyze
            </Button>
          )}
        </div>

        {/* Loading State */}
        {aiMutation.isPending && (
          <Card className="border-dashed p-8 text-center bg-muted/20">
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Analyzing inventory...</p>
              <p className="text-xs text-muted-foreground">Evaluating stock risks and generating recommendations.</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {aiError && !aiMutation.isPending && (
          <Card className="border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Unable to generate inventory insights. Please try again.</span>
          </Card>
        )}

        {/* Initial Empty State (if no analysis yet) */}
        {!aiInsights && !aiMutation.isPending && !aiError && (
          <Card className="border-dashed p-8 text-center bg-muted/10">
            <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
              <Sparkles className="h-8 w-8 text-muted-foreground/60 mb-1" />
              <p className="text-sm font-medium text-foreground">No inventory insights generated yet</p>
              <p className="text-xs text-muted-foreground">
                Click &quot;Analyze Inventory&quot; to review stock risks, low-stock items, and actionable recommendations.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5 text-xs"
                onClick={() => aiMutation.mutate()}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Analyze Inventory
              </Button>
            </div>
          </Card>
        )}

        {/* Results View */}
        {aiInsights && !aiMutation.isPending && (
          <div className="space-y-4">
            {/* Overall Summary */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Overall Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {aiInsights.summary}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Critical Stock Items */}
              <Card className="shadow-sm border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Critical Stock Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.criticalItems && aiInsights.criticalItems.length > 0 ? (
                    aiInsights.criticalItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-muted/30 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">
                            {item.productName || item.sku}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {item.sku}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          <strong>Reason:</strong> {item.reason}
                        </p>
                        <p className="text-foreground/90 flex items-center gap-1 text-[11px] font-medium pt-0.5">
                          <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                          <span><strong>Action:</strong> {item.recommendation}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No critical stock risks identified.</p>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="shadow-sm border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {aiInsights.recommendations && aiInsights.recommendations.length > 0 ? (
                    aiInsights.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-foreground leading-relaxed">{rec}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No specific recommendations at this time.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Stock Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Update stock levels for <span className="font-semibold">{selectedItem?.productName}</span> ({selectedItem?.sku}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="available">Available Quantity</Label>
                <Input
                  id="available"
                  type="number"
                  min="0"
                  value={availableInput}
                  onChange={(e) => setAvailableInput(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Reorder Level</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reserved Stock (Read-only)</Label>
              <Input
                type="number"
                value={selectedItem?.reservedStock || 0}
                disabled
              />
              <p className="text-[10px] text-muted-foreground">Reserved by pending orders/quotations in the database.</p>
            </div>

            <div className="rounded-lg bg-muted p-3 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Calculated Total Stock:</span>
              <span className="font-bold text-sm font-mono">{availableInput + (selectedItem?.reservedStock || 0)} units</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStock} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
