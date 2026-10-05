'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Pencil,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  History,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw
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
import { Checkbox } from '@/components/ui/checkbox';
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
  priorityTier?: 1 | 2 | 3 | 4;
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

interface StockHistoryEntry {
  _id: string;
  sku: string;
  movementType: string;
  action?: string;
  previousQuantity?: number;
  adjustmentQuantity?: number;
  newQuantity?: number;
  reason?: string;
  updatedBy?: { name?: string; email?: string } | string;
  adminName?: string;
  createdAt: string;
}

type StatusFilterType = 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'RESERVED_ONLY';
type SortByType = 'DEFAULT' | 'STOCK_ASC' | 'STOCK_DESC' | 'MOST_RESERVED';
type AdjustmentActionType = 'ADD_STOCK' | 'REMOVE_STOCK' | 'SET_STOCK' | 'UPDATE_REORDER_LEVEL';

const ADJUSTMENT_REASONS = [
  'New Stock Received',
  'Damaged Product',
  'Returned Product',
  'Stock Correction',
  'Warehouse Adjustment',
  'Other',
];

export default function InventoryIntelligencePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL');
  const [sortBy, setSortBy] = useState<SortByType>('DEFAULT');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Stock Adjustment Modal State
  const [selectedItem, setSelectedItem] = useState<InventoryItemData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adjustmentAction, setAdjustmentAction] = useState<AdjustmentActionType>('ADD_STOCK');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [reasonCategory, setReasonCategory] = useState<string>('New Stock Received');
  const [customReason, setCustomReason] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // AI & Table Selection State
  const [isInsightsOpen, setIsInsightsOpen] = useState(true);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const insightsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // 1. Fetch real inventory data from backend API
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

  // Local state for AI insights
  const [aiInsights, setAiInsights] = useState<AiInsightsData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync initial cached insights if available
  useEffect(() => {
    if (initialAi && !aiInsights) {
      setAiInsights(initialAi);
    }
  }, [initialAi, aiInsights]);

  // 2. Fetch recent audit history for selected item in modal
  const { data: skuHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['inventory', 'history', selectedItem?.sku],
    queryFn: async () => {
      if (!selectedItem?.sku) return [];
      const res = await inventoryApi.history(selectedItem.sku);
      return (res.data.data || []) as StockHistoryEntry[];
    },
    enabled: !!selectedItem?.sku && isDialogOpen,
  });

  // 3. AI Analysis Mutation
  const aiMutation = useMutation({
    mutationFn: async () => {
      setAiError(null);
      const res = await inventoryIntelligenceApi.generateAiAnalysis();
      return res.data.data as AiInsightsData;
    },
    onSuccess: (data) => {
      setAiInsights(data);
      setAiError(null);
      setIsInsightsOpen(true);
      toast.success('Inventory analysis complete');
    },
    onError: (err: any) => {
      const errorMsg =
        err?.response?.data?.message ||
        'Inventory data is available, but AI insights could not be generated. Please try again.';
      setAiError(errorMsg);
      toast.error('Unable to generate inventory insights. Please try again.');
    },
  });

  const handleAnalyze = () => {
    setIsInsightsOpen(true);
    aiMutation.mutate(undefined, {
      onSuccess: () => {
        insightsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      },
    });
  };

  // 4. Stock Adjustment Mutation (Section 6 & 7)
  const adjustMutation = useMutation({
    mutationFn: async ({
      sku,
      action,
      quantity,
      reason,
    }: {
      sku: string;
      action: AdjustmentActionType;
      quantity: number;
      reason: string;
    }) => {
      return inventoryApi.adjust({ sku, action, quantity, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsDialogOpen(false);
      refetch();
      toast.success('Stock adjusted successfully');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to adjust stock. Please check quantities.';
      toast.error(msg);
    },
  });

  const handleOpenAdjustModal = (item: InventoryItemData) => {
    setSelectedItem(item);
    setAdjustmentAction('ADD_STOCK');
    setQuantityInput(1);
    setReasonCategory('New Stock Received');
    setCustomReason('');
    setShowHistory(false);
    setIsDialogOpen(true);
  };

  const handleConfirmAdjust = () => {
    if (!selectedItem) return;
    if (quantityInput < 0 || isNaN(quantityInput)) {
      toast.error('Quantity must be a non-negative number');
      return;
    }

    const finalReason = reasonCategory === 'Other' && customReason.trim()
      ? customReason.trim()
      : reasonCategory;

    adjustMutation.mutate({
      sku: selectedItem.sku,
      action: adjustmentAction,
      quantity: quantityInput,
      reason: finalReason,
    });
  };

  // Section 11: Critical Item Actions
  const handleSelectCriticalProduct = (criticalItem: CriticalItem) => {
    const found = items.find(
      (i) =>
        i.sku?.toLowerCase() === criticalItem.sku?.toLowerCase() ||
        (criticalItem.productName && i.productName?.toLowerCase() === criticalItem.productName?.toLowerCase())
    );

    if (found) {
      handleOpenAdjustModal(found);
      toast.success(`Selected ${found.productName} (${found.sku})`);
    } else {
      setSearchTerm(criticalItem.sku || criticalItem.productName || '');
      toast.info(`Filtered inventory list to ${criticalItem.productName || criticalItem.sku}`);
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFindInTable = (sku: string, name?: string) => {
    setSearchTerm(sku || name || '');
    setStatusFilter('ALL');
    setPage(1);
    toast.info(`Filtered inventory table to ${sku || name}`);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Section 4: Clickable Dashboard Summary Cards
  const handleSummaryCardClick = (type: StatusFilterType) => {
    if (statusFilter === type && type !== 'ALL') {
      setStatusFilter('ALL');
    } else {
      setStatusFilter(type);
    }
    setPage(1);
  };

  // Section 5: Filtered, Sorted and Paginated Items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.sku.toLowerCase().includes(term) ||
          item.productName.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter === 'IN_STOCK') {
      result = result.filter((i) => i.status === 'In Stock');
    } else if (statusFilter === 'LOW_STOCK') {
      result = result.filter((i) => i.status === 'Low Stock');
    } else if (statusFilter === 'OUT_OF_STOCK') {
      result = result.filter((i) => i.status === 'Out of Stock');
    } else if (statusFilter === 'RESERVED_ONLY') {
      result = result.filter((i) => i.reservedStock > 0);
    }

    // Sorting
    if (sortBy === 'STOCK_ASC') {
      result.sort((a, b) => a.availableStock - b.availableStock);
    } else if (sortBy === 'STOCK_DESC') {
      result.sort((a, b) => b.availableStock - a.availableStock);
    } else if (sortBy === 'MOST_RESERVED') {
      result.sort((a, b) => b.reservedStock - a.reservedStock);
    }

    return result;
  }, [items, searchTerm, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(startIdx, startIdx + pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  // Calculated Preview for Adjustment Modal
  const previewState = useMemo(() => {
    if (!selectedItem) return null;
    const currentOnHand = selectedItem.totalStock || 0;
    const currentReserved = selectedItem.reservedStock || 0;
    const currentReorder = selectedItem.reorderLevel || 10;
    const qty = Math.max(0, quantityInput || 0);

    let nextOnHand = currentOnHand;
    let nextReorder = currentReorder;
    let isValid = true;
    let errorMsg = '';

    if (adjustmentAction === 'ADD_STOCK') {
      nextOnHand = currentOnHand + qty;
    } else if (adjustmentAction === 'REMOVE_STOCK') {
      if (qty > currentOnHand) {
        isValid = false;
        errorMsg = `Cannot remove ${qty} units. Only ${currentOnHand} total units exist.`;
      } else if (currentOnHand - qty < currentReserved) {
        isValid = false;
        errorMsg = `Cannot remove ${qty} units. ${currentReserved} units are currently reserved for pending orders.`;
      }
      nextOnHand = Math.max(0, currentOnHand - qty);
    } else if (adjustmentAction === 'SET_STOCK') {
      if (qty < currentReserved) {
        isValid = false;
        errorMsg = `Cannot set total stock to ${qty}. ${currentReserved} units are reserved for pending orders.`;
      }
      nextOnHand = qty;
    } else if (adjustmentAction === 'UPDATE_REORDER_LEVEL') {
      nextReorder = qty;
    }

    const nextAvailable = Math.max(0, nextOnHand - currentReserved);
    let nextStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (nextAvailable <= 0) nextStatus = 'Out of Stock';
    else if (nextAvailable <= nextReorder) nextStatus = 'Low Stock';

    return {
      nextOnHand,
      nextReserved: currentReserved,
      nextAvailable,
      nextReorder,
      nextStatus,
      isValid,
      errorMsg,
    };
  }, [selectedItem, adjustmentAction, quantityInput]);

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;

  // Table Columns
  const columns: ColumnDef<InventoryItemData>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all products"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate">{item.productName}</span>
              {item.priorityTier === 1 && (
                <span className="text-[10px] font-semibold text-destructive uppercase tracking-wide">
                  Urgent Backorder Risk
                </span>
              )}
            </div>
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
      cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.getValue('totalStock')}</span>,
    },
    {
      accessorKey: 'reservedStock',
      header: 'Reserved',
      cell: ({ row }) => {
        const val = row.getValue('reservedStock') as number;
        return (
          <span className={`font-mono text-sm ${val > 0 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-muted-foreground'}`}>
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: 'availableStock',
      header: 'Available',
      cell: ({ row }) => {
        const val = row.getValue('availableStock') as number;
        return (
          <span className={`font-mono text-sm font-bold ${val <= 0 ? 'text-destructive' : 'text-foreground'}`}>
            {val}
          </span>
        );
      },
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
      header: 'Action',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium hover:bg-primary hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenAdjustModal(row.original);
          }}
          title="Adjust Stock"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Adjust</span>
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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/inventory/intelligence')}
            className="gap-2 text-xs h-9"
          >
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>Demand Analytics</span>
          </Button>

          <Button
            onClick={handleAnalyze}
            disabled={aiMutation.isPending}
            className="shrink-0 gap-2 font-medium text-xs h-9"
          >
            {aiMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing inventory...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {aiInsights ? 'Re-analyze' : 'Analyze Inventory'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. STOCK SUMMARY CARDS (CLICKABLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL SKUs */}
        <Card
          onClick={() => handleSummaryCardClick('ALL')}
          className={`shadow-sm cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'ALL' ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{summary.totalSkus}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter === 'ALL' ? 'Showing all products' : 'Click to show all products'}
            </p>
          </CardContent>
        </Card>
        
        {/* OUT OF STOCK */}
        <Card
          onClick={() => handleSummaryCardClick('OUT_OF_STOCK')}
          className={`shadow-sm border-destructive/20 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'OUT_OF_STOCK' ? 'ring-2 ring-destructive ring-offset-2' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{summary.outOfStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter === 'OUT_OF_STOCK' ? 'Filtered: Available = 0' : 'Click to filter Out of Stock'}
            </p>
          </CardContent>
        </Card>
        
        {/* LOW STOCK */}
        <Card
          onClick={() => handleSummaryCardClick('LOW_STOCK')}
          className={`shadow-sm border-amber-500/20 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'LOW_STOCK' ? 'ring-2 ring-amber-500 ring-offset-2' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">{summary.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter === 'LOW_STOCK' ? 'Filtered: Below reorder level' : 'Click to filter Low Stock'}
            </p>
          </CardContent>
        </Card>

        {/* RESERVED STOCK */}
        <Card
          onClick={() => handleSummaryCardClick('RESERVED_ONLY')}
          className={`shadow-sm border-blue-500/20 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === 'RESERVED_ONLY' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Reserved Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-600">{summary.totalReserved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusFilter === 'RESERVED_ONLY' ? 'Filtered: Active reservations' : 'Click to filter reserved items'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. AI INVENTORY INTELLIGENCE INSIGHTS (ABOVE SIDE) */}
      <div ref={insightsRef} className="space-y-4 scroll-mt-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">AI Stock Intelligence</h2>
                {aiInsights && !aiMutation.isPending && (
                  <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
                    Analysis Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Automated inventory risk evaluation, reorder alerts, and replenishment actions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiInsights && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsInsightsOpen(!isInsightsOpen)}
                className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground"
              >
                {isInsightsOpen ? (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>Expand Insights</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            )}

            <Button
              variant={aiInsights ? "outline" : "default"}
              size="sm"
              onClick={handleAnalyze}
              disabled={aiMutation.isPending}
              className="text-xs h-8 gap-1.5"
            >
              {aiMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {aiInsights ? 'Re-analyze' : 'Analyze Inventory'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {aiMutation.isPending && (
          <Card className="border border-primary/30 p-6 text-center bg-primary/5 shadow-xs animate-pulse">
            <div className="flex flex-col items-center justify-center gap-2.5">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">Analyzing inventory with AI...</p>
              <p className="text-xs text-muted-foreground">Evaluating stock risks, order demand, and reorder levels across all SKUs.</p>
            </div>
          </Card>
        )}

        {/* Error State with Section 13 Failure Handling */}
        {aiError && !aiMutation.isPending && (
          <Card className="border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold text-xs sm:text-sm">AI Analysis Notice</p>
                <p className="text-xs text-muted-foreground">{aiError}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleAnalyze} className="h-8 text-xs shrink-0 gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Retry Analysis
            </Button>
          </Card>
        )}

        {/* Initial Prompt State (before analysis) */}
        {!aiInsights && !aiMutation.isPending && !aiError && (
          <Card className="border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-background p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">No stock intelligence generated yet</p>
                  <p className="text-xs text-muted-foreground">
                    Click &quot;Analyze Inventory&quot; to detect low-stock risks, assess reserved quantities, and receive automated purchase recommendations.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAnalyze}
                className="gap-1.5 shrink-0 text-xs font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Analyze Inventory
              </Button>
            </div>
          </Card>
        )}

        {/* Results View */}
        {aiInsights && !aiMutation.isPending && isInsightsOpen && (
          <div className="space-y-4 animate-fade-in">
            {/* Overall Summary */}
            <Card className="shadow-xs border-primary/20 bg-muted/20">
              <CardHeader className="pb-2 pt-3.5">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Overall Stock Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3.5">
                <p className="text-sm leading-relaxed text-foreground font-normal">
                  {aiInsights.summary}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Critical Stock Items (Section 10 & 11) */}
              <Card className="shadow-xs border-amber-500/25">
                <CardHeader className="pb-2 pt-3.5">
                  <CardTitle className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Critical Stock Items ({aiInsights.criticalItems?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {aiInsights.criticalItems && aiInsights.criticalItems.length > 0 ? (
                    aiInsights.criticalItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectCriticalProduct(item)}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/40 hover:border-amber-500/40 space-y-2 text-xs shadow-2xs cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.productName || item.sku}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                            {item.sku}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-[11px]">
                          <strong className="text-foreground/80">Issue:</strong> {item.reason}
                        </p>
                        <p className="text-foreground flex items-center gap-1.5 text-[11px] font-medium pt-0.5">
                          <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                          <span><strong className="text-primary">Recommendation:</strong> {item.recommendation}</span>
                        </p>

                        <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-border/50">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFindInTable(item.sku, item.productName);
                            }}
                            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            <Search className="w-3 h-3 mr-1" />
                            Find in Table
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCriticalProduct(item);
                            }}
                            className="h-6 px-2.5 text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Select &amp; Adjust
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      Inventory looks healthy. No critical stock issues detected.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card className="shadow-xs border-emerald-500/25">
                <CardHeader className="pb-2 pt-3.5">
                  <CardTitle className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Recommended Actions ({aiInsights.recommendations?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {aiInsights.recommendations && aiInsights.recommendations.length > 0 ? (
                    aiInsights.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-card border text-xs shadow-2xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-foreground leading-relaxed font-medium">{rec}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">No specific recommendations at this time.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 4. SEARCH, FILTER & SORT ROW */}
      <div ref={tableRef} className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="flex items-center gap-2 w-full sm:w-72 bg-card rounded-md border px-3 py-1.5 shadow-2xs">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-card border rounded-md px-2.5 py-1.5 text-xs shadow-2xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilterType);
                setPage(1);
              }}
              className="bg-transparent text-xs outline-none cursor-pointer text-foreground font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="RESERVED_ONLY">Reserved Stock Only</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 bg-card border rounded-md px-2.5 py-1.5 text-xs shadow-2xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByType)}
              className="bg-transparent text-xs outline-none cursor-pointer text-foreground font-medium"
            >
              <option value="DEFAULT">Default Order</option>
              <option value="STOCK_ASC">Stock: Low &rarr; High</option>
              <option value="STOCK_DESC">Stock: High &rarr; Low</option>
              <option value="MOST_RESERVED">Most Reserved</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'ALL' || sortBy !== 'DEFAULT') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setSortBy('DEFAULT');
                setPage(1);
              }}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground shrink-0">
          Showing {filteredAndSortedItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
          {Math.min(currentPage * pageSize, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
        </div>
      </div>

      {/* 5. INVENTORY DATA TABLE */}
      <div className="bg-card rounded-lg border shadow-sm p-4 space-y-3">
        {selectedCount > 0 && (
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between text-xs animate-fade-in">
            <span className="font-semibold text-primary">
              {selectedCount} product{selectedCount > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs bg-background"
                onClick={() => setRowSelection({})}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={paginatedItems}
          isLoading={isLoading}
          onRowClick={(item) => handleOpenAdjustModal(item)}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />

        {/* Empty state */}
        {!isLoading && filteredAndSortedItems.length === 0 && (
          <div className="p-8 text-center space-y-2">
            <Package className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-semibold text-foreground">No inventory products found.</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or active filters.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredAndSortedItems.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent border rounded px-1.5 py-0.5 text-xs outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. PROFESSIONAL STOCK ADJUSTMENT MODAL (SECTION 6 & 7) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Stock Adjustment</DialogTitle>
            <DialogDescription className="text-xs">
              Adjust inventory quantities, update reorder thresholds, and generate an audit record for{' '}
              <span className="font-semibold text-foreground">{selectedItem?.productName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Snapshot Cards */}
            <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-muted/40 border">
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Total</span>
                <span className="font-mono text-sm font-bold text-foreground">{selectedItem?.totalStock ?? 0}</span>
              </div>
              <div className="text-center border-l">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Reserved</span>
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                  {selectedItem?.reservedStock ?? 0}
                </span>
              </div>
              <div className="text-center border-l">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Available</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {selectedItem?.availableStock ?? 0}
                </span>
              </div>
              <div className="text-center border-l">
                <span className="text-[10px] text-muted-foreground block uppercase font-medium">Reorder</span>
                <span className="font-mono text-sm font-bold text-muted-foreground">
                  {selectedItem?.reorderLevel ?? 10}
                </span>
              </div>
            </div>

            {/* Action Type Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Adjustment Action</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'ADD_STOCK', label: 'Add Stock' },
                  { id: 'REMOVE_STOCK', label: 'Remove Stock' },
                  { id: 'SET_STOCK', label: 'Set Stock' },
                  { id: 'UPDATE_REORDER_LEVEL', label: 'Reorder Level' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setAdjustmentAction(act.id as AdjustmentActionType)}
                    className={`py-2 px-1 text-center rounded-md border text-[11px] font-medium transition-all ${
                      adjustmentAction === act.id
                        ? 'bg-primary text-white border-primary font-semibold shadow-xs'
                        : 'bg-card hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <Label htmlFor="adjust-qty" className="text-xs font-semibold">
                {adjustmentAction === 'ADD_STOCK' && 'Quantity to Add'}
                {adjustmentAction === 'REMOVE_STOCK' && 'Quantity to Remove'}
                {adjustmentAction === 'SET_STOCK' && 'New Total Quantity'}
                {adjustmentAction === 'UPDATE_REORDER_LEVEL' && 'New Reorder Level'}
              </Label>
              <Input
                id="adjust-qty"
                type="number"
                min="0"
                value={quantityInput}
                onChange={(e) => setQuantityInput(parseInt(e.target.value, 10) || 0)}
                className="h-9 font-mono"
              />
            </div>

            {/* Reason Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reason for Adjustment</Label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full h-9 rounded-md border bg-card px-3 text-xs outline-none text-foreground"
              >
                {ADJUSTMENT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Reason Field */}
            {reasonCategory === 'Other' && (
              <div className="space-y-1.5 animate-fade-in">
                <Label htmlFor="custom-reason" className="text-xs font-semibold">
                  Specify Reason
                </Label>
                <Input
                  id="custom-reason"
                  placeholder="Enter specific warehouse or accounting reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {/* Calculated Preview Box */}
            {previewState && (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  previewState.isValid ? 'bg-muted/30 border-border' : 'bg-destructive/10 border-destructive/30'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">Calculated Outcome:</span>
                  <Badge
                    variant={
                      previewState.nextStatus === 'Out of Stock'
                        ? 'destructive'
                        : previewState.nextStatus === 'Low Stock'
                        ? 'secondary'
                        : 'default'
                    }
                    className="text-[10px] h-5"
                  >
                    {previewState.nextStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">New Total</span>
                    <strong className="text-foreground">{previewState.nextOnHand} units</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Reserved</span>
                    <strong className="text-blue-600">{previewState.nextReserved} units</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">New Available</span>
                    <strong className="text-foreground">{previewState.nextAvailable} units</strong>
                  </div>
                </div>

                {!previewState.isValid && (
                  <div className="flex items-center gap-1.5 text-destructive text-[11px] pt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{previewState.errorMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* Audit History Toggle & View (Section 7) */}
            <div className="pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
              >
                <History className="h-3.5 w-3.5" />
                <span>{showHistory ? 'Hide Audit Log' : 'View SKU Audit Log'}</span>
                {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>

              {showHistory && (
                <div className="mt-2 p-2 rounded-md border bg-muted/20 space-y-2 max-h-40 overflow-y-auto animate-fade-in">
                  {isHistoryLoading ? (
                    <div className="text-center py-2 text-muted-foreground">Loading audit records...</div>
                  ) : skuHistory.length > 0 ? (
                    skuHistory.map((h, i) => (
                      <div key={i} className="text-[11px] border-b pb-1.5 last:border-b-0 space-y-0.5">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="font-semibold text-foreground">{h.movementType || h.action}</span>
                          <span className="font-mono text-[10px]">
                            {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span>
                            {h.previousQuantity !== undefined && h.newQuantity !== undefined ? (
                              <>
                                {h.previousQuantity} &rarr; <strong>{h.newQuantity}</strong> units
                              </>
                            ) : (
                              `Qty: ${h.adjustmentQuantity || 0}`
                            )}
                          </span>
                          <span className="italic text-muted-foreground truncate max-w-[200px]">{h.reason || 'Manual Adjustment'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-muted-foreground text-center py-2 italic">
                      No previous audit history recorded for this SKU.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmAdjust}
              disabled={Boolean(adjustMutation.isPending || (previewState && !previewState.isValid))}
              className="text-xs font-semibold"
            >
              {adjustMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
