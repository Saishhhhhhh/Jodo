'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, inventoryIntelligenceApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Pencil, Search, Package, AlertTriangle, TrendingUp, TrendingDown, 
  ArrowRight, Activity, Zap, Sparkles, RefreshCw, Bot, ShieldAlert, 
  CheckCircle2, ArrowRightLeft, Users, Wrench, Lightbulb, 
  ShoppingBag, Truck, ChevronRight, AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type IntelligenceItem = {
  _id: string;
  sku: string;
  product?: { title: string; imageUrl?: string } | null;
  available: number;
  committed: number;
  actualCommitted: number;
  lowStockThreshold: number;
  status: string;
  soldLast30Days: number;
  dailyVelocity: string;
  demandSignal: 'Hot' | 'Steady' | 'Cold';
  suggestedReorder: number;
};

interface AiIntelligenceData {
  executiveSummary: string;
  healthScore: number;
  overallMetrics: {
    totalSKUs: number;
    totalOnHand: number;
    totalReserved: number;
    totalAvailable: number;
    lowStockAlertsCount: number;
    healthyStockCount: number;
  };
  salesTeam: {
    readyToPitch: Array<{
      sku: string;
      productTitle: string;
      availableStock: number;
      category?: string;
      pitchReason: string;
      targetAudience: string;
    }>;
    cautionWarnings: Array<{
      sku: string;
      productTitle: string;
      availableStock: number;
      reservedStock: number;
      warning: string;
      leadTimeBuffer: string;
    }>;
    substitutions: Array<{
      outOrLowStockSku: string;
      outOrLowStockTitle: string;
      recommendedAlternativeSku: string;
      recommendedAlternativeTitle: string;
      pitchPitch: string;
    }>;
    talkingPoints: string[];
  };
  operationsTeam: {
    criticalReorders: Array<{
      sku: string;
      productTitle: string;
      currentStock: number;
      reservedStock: number;
      availableStock: number;
      reorderLevel: number;
      suggestedPOQty: number;
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      justification: string;
    }>;
    warehousePriorities: string[];
    stockoutRisks: Array<{
      sku: string;
      productTitle: string;
      estimatedDaysToStockout: string | number;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
      notes: string;
    }>;
    actionPlan: string[];
  };
  analyzedAt: string;
  modelUsed: string;
}

export default function InventoryIntelligencePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<IntelligenceItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [aiTeamTab, setAiTeamTab] = useState<'sales' | 'operations'>('sales');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableInput, setAvailableInput] = useState(0);
  const [committedInput, setCommittedInput] = useState(0);
  const [thresholdInput, setThresholdInput] = useState(15);

  // Fetch standard intelligence data
  const { data: intelligenceData, isLoading } = useQuery({
    queryKey: ['inventory', 'intelligence'],
    queryFn: async () => {
      const res = await inventoryApi.intelligence();
      return res.data.data as IntelligenceItem[];
    },
  });

  // Fetch AI intelligence data (GPT-4o-mini)
  const { data: aiData, isLoading: loadingAi, refetch: refetchAi } = useQuery({
    queryKey: ['inventory', 'ai-analysis'],
    queryFn: async () => {
      const res = await inventoryIntelligenceApi.aiAnalysis();
      return res.data.data as AiIntelligenceData;
    },
    staleTime: 60 * 1000,
  });

  // Trigger AI generation mutation (GPT-4o-mini)
  const aiMutation = useMutation({
    mutationFn: async () => {
      const res = await inventoryIntelligenceApi.generateAiAnalysis();
      return res.data.data as AiIntelligenceData;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['inventory', 'ai-analysis'], data);
      toast.success('Live AI stock analysis generated with GPT-4o-mini!');
    },
    onError: (err: any) => {
      toast.error('Failed to generate AI analysis: ' + (err.response?.data?.message || err.message));
    }
  });

  // Update inventory mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, available, committed, lowStockThreshold }: { id: string; available: number; committed: number; lowStockThreshold: number }) =>
      inventoryApi.update(id, { available, committed, lowStockThreshold }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'ai-analysis'] });
      setIsDialogOpen(false);
      toast.success('Stock levels updated successfully');
    },
    onError: () => {
      toast.error('Failed to update stock levels');
    },
  });

  const handleEditClick = (item: IntelligenceItem) => {
    setSelectedItem(item);
    setAvailableInput(item.available);
    setCommittedInput(item.committed);
    setThresholdInput(item.lowStockThreshold || 15);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedItem) return;
    updateMutation.mutate({
      id: selectedItem._id,
      available: availableInput,
      committed: committedInput,
      lowStockThreshold: thresholdInput,
    });
  };

  const handleRestock = (item: IntelligenceItem | { _id?: string; sku: string; suggestedReorder?: number; suggestedPOQty?: number; available?: number; committed?: number }) => {
    const qty = (item as any).suggestedPOQty || (item as any).suggestedReorder;
    if (!qty) {
      toast.info('No reorder quantity specified');
      return;
    }

    // Find the item in intelligenceData if _id is missing
    const found = intelligenceData?.find(i => i.sku === item.sku);
    const targetId = item._id || found?._id;
    if (!targetId) {
      toast.error('Could not find inventory record for SKU: ' + item.sku);
      return;
    }

    const currentAvail = found ? found.available : (item.available || 0);
    const newAvailable = currentAvail + qty;
    
    updateMutation.mutate({
      id: targetId,
      available: newAvailable,
      committed: found ? found.committed : 0,
      lowStockThreshold: found?.lowStockThreshold || 15,
    });
    toast.info(`Restocking +${qty} units for SKU ${item.sku}...`);
  };

  // Aggregated KPIs
  const kpis = useMemo(() => {
    if (!intelligenceData) return { totalSkus: 0, outOfStock: 0, lowStock: 0, totalReserved: 0 };
    return intelligenceData.reduce(
      (acc, item) => {
        acc.totalSkus++;
        if (item.available === 0) acc.outOfStock++;
        else if (item.available < (item.lowStockThreshold || 15)) acc.lowStock++;
        acc.totalReserved += item.committed;
        return acc;
      },
      { totalSkus: 0, outOfStock: 0, lowStock: 0, totalReserved: 0 }
    );
  }, [intelligenceData]);

  // Filtered lists based on search
  const filteredData = useMemo(() => {
    if (!intelligenceData) return [];
    return intelligenceData.filter(
      (item) =>
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.product?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [intelligenceData, searchTerm]);

  // Low Stock subset
  const lowStockData = useMemo(() => {
    return filteredData.filter(item => item.available < (item.lowStockThreshold || 15) || item.suggestedReorder > 0);
  }, [filteredData]);

  // Shared Product Cell with AI Intelligence indicator
  const ProductCell = ({ item }: { item: IntelligenceItem }) => {
    const isPitchReady = aiData?.salesTeam?.readyToPitch?.some(p => p.sku === item.sku);
    const isCaution = aiData?.salesTeam?.cautionWarnings?.some(p => p.sku === item.sku);
    const isCriticalReorder = aiData?.operationsTeam?.criticalReorders?.some(p => p.sku === item.sku);

    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {item.product?.imageUrl ? (
            <img src={item.product.imageUrl} alt={item.product.title} className="h-full w-full object-cover" />
          ) : (
            <Package className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm truncate">{item.product?.title || 'Unknown Product'}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-muted-foreground truncate">
              SKU: <span className="font-mono">{item.sku}</span>
            </span>
            {isPitchReady && (
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Pitch Ready
              </span>
            )}
            {isCaution && (
              <span className="text-[10px] font-medium text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> High Reservations
              </span>
            )}
            {isCriticalReorder && !isCaution && (
              <span className="text-[10px] font-medium text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                <ShieldAlert className="w-2.5 h-2.5 text-rose-600" /> Reorder Needed
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Standard Columns (All Inventory)
  const allColumns = useMemo<ColumnDef<IntelligenceItem>[]>(
    () => [
      {
        accessorKey: 'product',
        header: 'Product',
        cell: ({ row }) => <ProductCell item={row.original} />,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          let badgeVariant: 'default' | 'secondary' | 'outline' = 'secondary';
          let customClass = '';

          if (status === 'in_stock') {
            badgeVariant = 'default';
            customClass = 'bg-green-500/10 text-green-600 border-none';
          } else if (status === 'low_stock') {
            badgeVariant = 'secondary';
            customClass = 'bg-amber-500/10 text-amber-600 border-none';
          } else if (status === 'out_of_stock') {
            badgeVariant = 'outline';
            customClass = 'bg-destructive/10 text-destructive border-none';
          }

          return (
            <Badge variant={badgeVariant} className={`text-xs capitalize font-medium ${customClass}`}>
              {status.replace(/_/g, ' ')}
            </Badge>
          );
        },
      },
      { 
        accessorKey: 'available', 
        header: 'Available',
        cell: ({ row }) => <span className="font-mono font-medium text-sm">{row.getValue('available')}</span>
      },
      { 
        accessorKey: 'committed', 
        header: 'Reserved',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`font-mono text-sm border-b border-dotted cursor-help ${item.committed > 0 ? 'text-blue-500 font-semibold' : 'text-muted-foreground'}`}>
                    {item.committed}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p><strong>{item.actualCommitted || item.committed}</strong> units actively reserved in pending quotes & orders.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
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
    ],
    [aiData]
  );

  // Intelligence Columns (Demand & Reordering)
  const intelligenceColumns = useMemo<ColumnDef<IntelligenceItem>[]>(
    () => [
      {
        accessorKey: 'product',
        header: 'Product',
        cell: ({ row }) => <ProductCell item={row.original} />,
      },
      {
        accessorKey: 'demandSignal',
        header: 'Demand Signal',
        cell: ({ row }) => {
          const signal = row.original.demandSignal;
          if (signal === 'Hot') return <Badge className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-none"><Zap className="w-3 h-3 mr-1"/> Hot</Badge>;
          if (signal === 'Steady') return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-none"><TrendingUp className="w-3 h-3 mr-1"/> Steady</Badge>;
          return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-none"><TrendingDown className="w-3 h-3 mr-1"/> Cold</Badge>;
        }
      },
      { 
        accessorKey: 'available', 
        header: 'Available',
        cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('available')}</span>
      },
      { 
        accessorKey: 'committed', 
        header: 'Reserved',
        cell: ({ row }) => (
          <span className={`font-mono ${row.original.committed > 0 ? 'text-blue-500 font-semibold' : 'text-muted-foreground'}`}>
            {row.original.committed}
          </span>
        )
      },
      { 
        accessorKey: 'suggestedReorder', 
        header: 'Recommended PO',
        cell: ({ row }) => {
          const reorder = row.getValue('suggestedReorder') as number;
          if (reorder === 0) return <span className="text-muted-foreground text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Optimal</span>;
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">+{reorder}</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                onClick={() => handleRestock(row.original)}
              >
                Restock
              </Button>
            </div>
          );
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => handleEditClick(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      }
    ],
    [aiData]
  );

  return (
    <div className="p-6 animate-fade-in space-y-6 w-full max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Inventory Intelligence</h1>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 gap-1 text-xs font-semibold py-0.5">
              <Sparkles className="w-3 h-3 text-purple-600" />
              GPT-4o-mini Powered
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track real-time stock availability, reservation locks, low-stock alerts, and demand signals for sales & operations.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              aiMutation.mutate();
              setActiveTab('ai-intelligence');
            }}
            disabled={aiMutation.isPending}
            className="gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm font-medium"
          >
            <Sparkles className={`h-4 w-4 ${aiMutation.isPending ? 'animate-spin' : ''}`} />
            {aiMutation.isPending ? 'Analyzing Stocks (GPT-4o-mini)...' : 'Run AI Copilot (GPT-4o-mini)'}
          </Button>

          <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[280px] bg-card rounded-md border px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Product or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Managed SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{kpis.totalSkus}</div>
            <p className="text-xs text-muted-foreground mt-1">100% catalog mapped to warehouse</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{kpis.outOfStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Zero immediate fulfillment blocks</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Low Stock Alerts</CardTitle>
            <Activity className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">{kpis.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Below safety reorder threshold</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Reserved (Pending Orders)</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-600">{kpis.totalReserved}</div>
            <p className="text-xs text-muted-foreground mt-1">Locked in orders & quotations</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Intelligence Briefing Banner (GPT-4o-mini) */}
      {aiData && (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent shadow-sm">
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-600/10 flex items-center justify-center text-purple-600 font-bold">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base tracking-tight">AI Inventory Executive Briefing</h3>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-none text-xs">
                    {aiData.modelUsed || 'gpt-4o-mini'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Analyzed at {new Date(aiData.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Live CMS Data
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-background/80 border rounded-lg px-3 py-1.5">
                <span className="text-xs text-muted-foreground font-medium">Stock Health Score:</span>
                <span className={`font-mono font-bold text-sm ${aiData.healthScore >= 80 ? 'text-emerald-600' : aiData.healthScore >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {aiData.healthScore}/100
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => aiMutation.mutate()}
                disabled={aiMutation.isPending}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${aiMutation.isPending ? 'animate-spin' : ''}`} />
                Refresh AI
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm leading-relaxed text-foreground/90 bg-background/60 p-3 rounded-lg border">
              {aiData.executiveSummary}
            </p>

            {/* Quick Action Summary Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => { setActiveTab('ai-intelligence'); setAiTeamTab('sales'); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span><strong>{aiData.salesTeam?.readyToPitch?.length || 0}</strong> SKUs Ready to Pitch</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveTab('ai-intelligence'); setAiTeamTab('sales'); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span><strong>{aiData.salesTeam?.cautionWarnings?.length || 0}</strong> Sales Cautions (High Reserved)</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveTab('ai-intelligence'); setAiTeamTab('operations'); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span><strong>{aiData.operationsTeam?.criticalReorders?.length || 0}</strong> Critical Reorders</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>

              <button
                onClick={() => { setActiveTab('ai-intelligence'); setAiTeamTab('sales'); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 text-xs font-medium transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span><strong>{aiData.salesTeam?.substitutions?.length || 0}</strong> Smart Substitutions</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="all">All Inventory</TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Demand Intel</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-950/60 dark:data-[state=active]:text-amber-400">Low Stock</TabsTrigger>
            <TabsTrigger value="ai-intelligence" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-950/60 dark:data-[state=active]:text-purple-300 font-semibold gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 inline" /> AI Sales & Ops
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Tab 1: All Inventory */}
        <TabsContent value="all" className="m-0 bg-card rounded-lg border shadow-sm p-4">
          <DataTable columns={allColumns} data={filteredData} isLoading={isLoading} />
        </TabsContent>
        
        {/* Tab 2: Demand Intel */}
        <TabsContent value="intelligence" className="m-0 bg-card rounded-lg border shadow-sm p-4">
          <div className="mb-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <h3 className="font-semibold text-primary flex items-center gap-2"><Zap className="w-4 h-4"/> Operations Copilot</h3>
            <p className="text-sm text-primary/80 mt-1">Recommendations are calculated to ensure you maintain a 30-day stock buffer based on recent sales velocity. Hot items automatically receive a 20% safety padding.</p>
          </div>
          <DataTable columns={intelligenceColumns} data={filteredData} isLoading={isLoading} />
        </TabsContent>

        {/* Tab 3: Low Stock Alerts */}
        <TabsContent value="alerts" className="m-0 bg-card rounded-lg border shadow-sm p-4 border-amber-500/20">
          <DataTable columns={intelligenceColumns} data={lowStockData} isLoading={isLoading} />
        </TabsContent>

        {/* Tab 4: AI Sales & Operations Intelligence (GPT-4o-mini) */}
        <TabsContent value="ai-intelligence" className="m-0 space-y-6">
          {/* Sub-navigation for Sales Team vs Operations Team */}
          <div className="flex items-center justify-between bg-card p-3 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                variant={aiTeamTab === 'sales' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAiTeamTab('sales')}
                className="gap-2 font-medium"
              >
                <Users className="w-4 h-4" />
                Sales Team Hub
              </Button>
              <Button
                variant={aiTeamTab === 'operations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAiTeamTab('operations')}
                className="gap-2 font-medium"
              >
                <Wrench className="w-4 h-4" />
                Operations & Warehouse Hub
              </Button>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span>Model: <strong className="font-mono text-foreground">{aiData?.modelUsed || 'gpt-4o-mini'}</strong></span>
            </div>
          </div>

          {/* VIEW A: SALES TEAM HUB */}
          {aiTeamTab === 'sales' && (
            <div className="space-y-6">
              {/* Ready to Pitch Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-lg tracking-tight">Ready to Pitch (High Stock Availability)</h3>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                    Safe for Immediate Dispatch
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiData?.salesTeam?.readyToPitch?.map((item) => (
                    <Card key={item.sku} className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base font-semibold">{item.productTitle}</CardTitle>
                            <span className="text-xs font-mono text-muted-foreground">{item.sku}</span>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-mono text-xs">
                            {item.availableStock} Available
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="bg-muted/50 p-2.5 rounded-md">
                          <strong className="text-foreground block mb-1">Sales Pitch Rationale:</strong>
                          <p className="text-muted-foreground leading-relaxed">{item.pitchReason}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Target: <strong className="text-foreground">{item.targetAudience}</strong></span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Do-Not-Overpromise Caution Warnings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-amber-500/10 text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-lg tracking-tight">Do-Not-Overpromise Warnings (High Reservations & Low Stock)</h3>
                  </div>
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5">
                    Verify Before Quoting
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiData?.salesTeam?.cautionWarnings?.map((item) => (
                    <Card key={item.sku} className="border-amber-500/30 bg-amber-500/5 shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-base font-semibold text-amber-900 dark:text-amber-200">{item.productTitle}</CardTitle>
                            <span className="text-xs font-mono text-muted-foreground">{item.sku}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs text-amber-700 border-amber-500/40">
                              {item.availableStock} Available
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono text-xs">
                              {item.reservedStock} Reserved
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="bg-background/80 p-2.5 rounded-md border border-amber-500/20">
                          <strong className="text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" /> Sales Guidance:
                          </strong>
                          <p className="text-foreground/90 leading-relaxed">{item.warning}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground bg-background/50 p-2 rounded">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Delivery Buffer: <strong className="text-foreground">{item.leadTimeBuffer}</strong></span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Substitutions & Talking Points */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Substitutions */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                      Smart Product Substitutions
                    </CardTitle>
                    <CardDescription>
                      If a requested item is low or locked in reservations, steer clients to these in-stock alternatives.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    {aiData?.salesTeam?.substitutions?.map((sub, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                        <div className="flex items-center justify-between gap-2 font-medium">
                          <span className="text-rose-600 dark:text-rose-400">{sub.outOrLowStockTitle}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{sub.recommendedAlternativeTitle}</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed italic bg-background p-2 rounded border">
                          "{sub.pitchPitch}"
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Talking Points */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Customer Communication Talking Points
                    </CardTitle>
                    <CardDescription>
                      Empower sales reps with clear expectations on delivery schedules.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs">
                    {aiData?.salesTeam?.talkingPoints?.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-foreground/90 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* VIEW B: OPERATIONS & WAREHOUSE HUB */}
          {aiTeamTab === 'operations' && (
            <div className="space-y-6">
              {/* Critical Reorders Table */}
              <Card className="border-rose-500/20 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        Critical Reorders & Purchase Order Recommendations
                      </CardTitle>
                      <CardDescription>
                        Items breaching safety thresholds with suggested replenishment quantities.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 text-muted-foreground border-y">
                        <tr>
                          <th className="p-3">SKU & Product</th>
                          <th className="p-3">On Hand</th>
                          <th className="p-3">Reserved</th>
                          <th className="p-3">Available</th>
                          <th className="p-3">Reorder Point</th>
                          <th className="p-3">Suggested PO</th>
                          <th className="p-3">Priority</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {aiData?.operationsTeam?.criticalReorders?.map((reorder) => (
                          <tr key={reorder.sku} className="hover:bg-muted/30">
                            <td className="p-3">
                              <div className="font-semibold text-foreground">{reorder.productTitle}</div>
                              <span className="font-mono text-muted-foreground text-[11px]">{reorder.sku}</span>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{reorder.justification}</p>
                            </td>
                            <td className="p-3 font-mono font-medium">{reorder.currentStock}</td>
                            <td className="p-3 font-mono text-blue-500 font-semibold">{reorder.reservedStock}</td>
                            <td className="p-3 font-mono font-bold text-rose-600">{reorder.availableStock}</td>
                            <td className="p-3 font-mono text-muted-foreground">{reorder.reorderLevel}</td>
                            <td className="p-3 font-mono font-bold text-amber-600 text-sm">+{reorder.suggestedPOQty}</td>
                            <td className="p-3">
                              <Badge className={reorder.priority === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}>
                                {reorder.priority}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-medium"
                                onClick={() => handleRestock({ sku: reorder.sku, suggestedPOQty: reorder.suggestedPOQty, available: reorder.availableStock })}
                              >
                                Restock PO
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Warehouse Priorities & Action Plan */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Warehouse Priorities */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      Warehouse Immediate Priorities
                    </CardTitle>
                    <CardDescription>
                      Action items for floor staff, packing bays, and reservation dispatch.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs">
                    {aiData?.operationsTeam?.warehousePriorities?.map((priority, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-foreground leading-relaxed">{priority}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Operations Action Plan */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-purple-600" />
                      Procurement & Operations Action Plan
                    </CardTitle>
                    <CardDescription>
                      Step-by-step resolution plan for supply chain managers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs">
                    {aiData?.operationsTeam?.actionPlan?.map((plan, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <ArrowRight className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <span className="text-foreground leading-relaxed">{plan}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Stockout Risk Estimates */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Stockout Risk Projections
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {aiData?.operationsTeam?.stockoutRisks?.map((risk) => (
                    <div key={risk.sku} className="p-3 rounded-lg border bg-muted/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground truncate">{risk.productTitle}</span>
                        <Badge variant="outline" className={risk.riskLevel === 'CRITICAL' ? 'text-rose-600 border-rose-300' : 'text-amber-600 border-amber-300'}>
                          {risk.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-mono text-[11px]">SKU: {risk.sku}</p>
                      <div className="text-xs font-medium text-foreground pt-1">
                        Est. Run Rate: <strong className="text-rose-600">{risk.estimatedDaysToStockout}</strong>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{risk.notes}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Update inventory levels for <span className="font-semibold">{selectedItem?.product?.title || 'product'}</span> (SKU: {selectedItem?.sku}).
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
                <p className="text-[10px] text-muted-foreground">Available to sell online</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Low Stock Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(parseInt(e.target.value, 10) || 0)}
                />
                <p className="text-[10px] text-muted-foreground">Alert when stock drops below this</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="committed">Reserved Quantity</Label>
              <Input
                id="committed"
                type="number"
                min="0"
                value={committedInput}
                onChange={(e) => setCommittedInput(parseInt(e.target.value, 10) || 0)}
                disabled
              />
              <p className="text-[10px] text-amber-600 font-medium">Auto-calculated: {selectedItem?.actualCommitted} currently in pending orders.</p>
            </div>

            <div className="rounded-lg bg-muted p-3 mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">New Calculated On-Hand:</span>
              <span className="font-bold text-sm font-mono">{availableInput + committedInput} total units</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
