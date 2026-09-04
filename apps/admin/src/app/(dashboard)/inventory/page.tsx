'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Search, Package, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, Activity, Zap } from 'lucide-react';
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
  status: string;
  soldLast30Days: number;
  dailyVelocity: string;
  demandSignal: 'Hot' | 'Steady' | 'Cold';
  suggestedReorder: number;
};

export default function InventoryIntelligencePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<IntelligenceItem | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableInput, setAvailableInput] = useState(0);
  const [committedInput, setCommittedInput] = useState(0);

  // Fetch intelligence data
  const { data: intelligenceData, isLoading } = useQuery({
    queryKey: ['inventory', 'intelligence'],
    queryFn: async () => {
      const res = await inventoryApi.intelligence();
      return res.data.data as IntelligenceItem[];
    },
  });

  // Update inventory mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, available, committed }: { id: string; available: number; committed: number }) =>
      inventoryApi.update(id, { available, committed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
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
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedItem) return;
    updateMutation.mutate({
      id: selectedItem._id,
      available: availableInput,
      committed: committedInput,
    });
  };

  // Aggregated KPIs
  const kpis = useMemo(() => {
    if (!intelligenceData) return { totalSkus: 0, outOfStock: 0, lowStock: 0, totalReserved: 0 };
    return intelligenceData.reduce(
      (acc, item) => {
        acc.totalSkus++;
        if (item.available === 0) acc.outOfStock++;
        else if (item.available < 15) acc.lowStock++;
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
    return filteredData.filter(item => item.available < 15 || item.suggestedReorder > 0);
  }, [filteredData]);

  // Shared Product Cell
  const ProductCell = ({ item }: { item: IntelligenceItem }) => (
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
        <span className="text-[11px] text-muted-foreground truncate">
          SKU: <span className="font-mono">{item.sku}</span>
        </span>
      </div>
    </div>
  );

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
              {status.replace('_', ' ')}
            </Badge>
          );
        },
      },
      { 
        accessorKey: 'available', 
        header: 'Available',
        cell: ({ row }) => <span className="font-mono font-medium">{row.getValue('available')}</span>
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
                  <span className="font-mono text-muted-foreground border-b border-dotted cursor-help">
                    {item.committed}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p><strong>{item.actualCommitted}</strong> units actively reserved in unfulfilled orders.</p>
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
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
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
          if (signal === 'Hot') return <Badge className="bg-red-100 text-red-700 border-none"><Zap className="w-3 h-3 mr-1"/> Hot</Badge>;
          if (signal === 'Steady') return <Badge className="bg-blue-100 text-blue-700 border-none"><TrendingUp className="w-3 h-3 mr-1"/> Steady</Badge>;
          return <Badge className="bg-slate-100 text-slate-700 border-none"><TrendingDown className="w-3 h-3 mr-1"/> Cold</Badge>;
        }
      },
      { 
        accessorKey: 'soldLast30Days', 
        header: '30-Day Volume',
        cell: ({ row }) => <span className="font-mono">{row.original.soldLast30Days} units</span>
      },
      { 
        accessorKey: 'dailyVelocity', 
        header: 'Velocity',
        cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.dailyVelocity} / day</span>
      },
      { 
        accessorKey: 'available', 
        header: 'Current Stock',
        cell: ({ row }) => (
          <span className={`font-mono font-medium ${row.original.available < 15 ? 'text-amber-600' : ''}`}>
            {row.original.available}
          </span>
        )
      },
      {
        accessorKey: 'suggestedReorder',
        header: 'Suggested Reorder',
        cell: ({ row }) => {
          const rec = row.original.suggestedReorder;
          if (rec === 0) return <span className="text-muted-foreground text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Healthy</span>;
          return (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center w-fit gap-1 font-mono text-sm">
              <ArrowRight className="w-3 h-3" /> +{rec}
            </Badge>
          );
        }
      },
    ],
    []
  );

  return (
    <div className="p-6 animate-fade-in space-y-8 w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Track stock levels, demand signals, and get reorder recommendations.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto md:min-w-[300px] bg-card rounded-md border px-3 py-2 shadow-sm">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Managed SKUs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{kpis.totalSkus}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{kpis.outOfStock}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Low Stock Alerts</CardTitle>
            <Activity className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">{kpis.lowStock}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Reserved (Pending Orders)</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-600">{kpis.totalReserved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Inventory</TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Demand Intel</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700">Low Stock</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="m-0 bg-card rounded-lg border shadow-sm p-4">
          <DataTable columns={allColumns} data={filteredData} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="intelligence" className="m-0 bg-card rounded-lg border shadow-sm p-4">
          <div className="mb-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <h3 className="font-semibold text-primary flex items-center gap-2"><Zap className="w-4 h-4"/> Operations Copilot</h3>
            <p className="text-sm text-primary/80 mt-1">Recommendations are calculated to ensure you maintain a 30-day stock buffer based on recent sales velocity. Hot items automatically receive a 20% safety padding.</p>
          </div>
          <DataTable columns={intelligenceColumns} data={filteredData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="alerts" className="m-0 bg-card rounded-lg border shadow-sm p-4 border-amber-500/20">
          <DataTable columns={intelligenceColumns} data={lowStockData} isLoading={isLoading} />
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
                <Label htmlFor="committed">Reserved Quantity</Label>
                <Input
                  id="committed"
                  type="number"
                  min="0"
                  value={committedInput}
                  onChange={(e) => setCommittedInput(parseInt(e.target.value, 10) || 0)}
                />
                <p className="text-[10px] text-amber-600 font-medium">Auto-calculated: {selectedItem?.actualCommitted} currently in pending orders.</p>
              </div>
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
// Import CheckCircle2 here to fix missing import
import { CheckCircle2 } from 'lucide-react';
