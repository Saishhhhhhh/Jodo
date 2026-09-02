'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  inventoryIntelligenceApi, 
  getImageUrl 
} from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { 
  RefreshCw, 
  Package, 
  AlertCircle, 
  TrendingUp, 
  Box, 
  ArrowRightLeft,
  AlertTriangle,
  History
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function InventoryIntelligencePage() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState('30');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  
  const [activeFilters, setActiveFilters] = useState({ category: 'all', location: 'all', status: 'all' });
  
  // Queries
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['inventory-intelligence-summary'],
    queryFn: async () => {
      const res = await inventoryIntelligenceApi.summary();
      return res.data.data;
    },
  });

  const { data: stockStatus } = useQuery({
    queryKey: ['inventory-intelligence-stock-status'],
    queryFn: async () => {
      const res = await inventoryIntelligenceApi.stockStatus();
      return res.data.data;
    },
  });

  const { data: categorySummary } = useQuery({
    queryKey: ['inventory-intelligence-category-summary'],
    queryFn: async () => {
      const res = await inventoryIntelligenceApi.categorySummary();
      return res.data.data;
    },
  });

  const { data: attentionRequired, isLoading: loadingAttention } = useQuery({
    queryKey: ['inventory-intelligence-attention-required'],
    queryFn: async () => {
      const res = await inventoryIntelligenceApi.attentionRequired();
      return res.data.data;
    },
  });

  const { data: demandSignals } = useQuery({
    queryKey: ['inventory-intelligence-demand-signals'],
    queryFn: async () => {
      const res = await inventoryIntelligenceApi.demandSignals();
      return res.data.data;
    },
  });

  const { data: stockMovements } = useQuery({
    queryKey: ['inventory-intelligence-stock-movements'],
    queryFn: async () => {
      const res = await inventoryIntelligenceApi.stockMovements();
      return res.data.data;
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory-intelligence-summary'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-intelligence-stock-status'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-intelligence-category-summary'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-intelligence-attention-required'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-intelligence-demand-signals'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-intelligence-stock-movements'] });
    toast.success('Data refreshed');
  };

  const handleApplyFilters = () => {
    setActiveFilters({ category: categoryFilter, location: locationFilter, status: stockStatusFilter });
    toast.success('Filters applied');
  };

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setLocationFilter('all');
    setStockStatusFilter('all');
    setActiveFilters({ category: 'all', location: 'all', status: 'all' });
  };

  const filteredAttentionRequired = React.useMemo(() => {
    if (!attentionRequired) return [];
    return attentionRequired.filter((item: any) => {
      if (activeFilters.category !== 'all' && item.category !== activeFilters.category) return false;
      if (activeFilters.location !== 'all' && item.location !== activeFilters.location) return false;
      if (activeFilters.status !== 'all' && item.status !== activeFilters.status) return false;
      return true;
    });
  }, [attentionRequired, activeFilters]);

  const filteredDemandSignals = React.useMemo(() => {
    if (!demandSignals) return [];
    return demandSignals.filter((item: any) => {
      if (activeFilters.location !== 'all' && item.location !== activeFilters.location) return false;
      // We don't have category in demandSignals currently but we could filter by location
      return true;
    });
  }, [demandSignals, activeFilters]);

  const attentionColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'productTitle',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm truncate max-w-[200px]">{row.getValue('productTitle')}</span>
          <span className="text-xs text-muted-foreground">{row.original.sku}</span>
        </div>
      )
    },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'totalStock', header: 'Total Stock' },
    { accessorKey: 'reserved', header: 'Reserved' },
    { accessorKey: 'available', header: 'Available' },
    { accessorKey: 'reorderLevel', header: 'Reorder Level' },
    { 
      accessorKey: 'demandLevel', 
      header: 'Demand',
      cell: ({ row }) => {
        const d = row.getValue('demandLevel') as string;
        let color = 'bg-gray-100 text-gray-800';
        if (d === 'High') color = 'bg-purple-100 text-purple-800';
        if (d === 'Very High') color = 'bg-purple-200 text-purple-900 font-bold';
        if (d === 'Medium') color = 'bg-blue-100 text-blue-800';
        return <Badge className={`border-none ${color}`}>{d}</Badge>;
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => {
        const s = row.getValue('status') as string;
        let variant: 'default' | 'destructive' | 'secondary' = 'default';
        if (s === 'low_stock') variant = 'secondary';
        if (s === 'out_of_stock') variant = 'destructive';
        return <Badge variant={variant} className="capitalize">{s.replace('_', ' ')}</Badge>;
      }
    },
    { 
      accessorKey: 'recommendedAction', 
      header: 'Action',
      cell: ({ row }) => <span className="font-semibold text-xs">{row.getValue('recommendedAction')}</span>
    },
  ];

  const pieColors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  const needsAttentionCount = attentionRequired?.length || 0;
  const outOfStockCount = attentionRequired?.filter((a: any) => a.status === 'out_of_stock').length || 0;
  const lowStockCount = attentionRequired?.filter((a: any) => a.status === 'low_stock').length || 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor stock availability, reserved inventory, low-stock risks and product demand signals.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="shrink-0 gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger><SelectValue placeholder="Date Range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger><SelectValue placeholder="Product Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categorySummary?.map((cat: any) => (
                <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger><SelectValue placeholder="Warehouse/Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {summary?.locations?.map((loc: string) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Stock Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button className="w-full" onClick={handleApplyFilters}>Apply Filters</Button>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleClearFilters}>Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tracked SKUs</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-green-600">Available Stock</CardTitle>
            <Box className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.availableStock || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for sale</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-blue-600">Reserved Stock</CardTitle>
            <Box className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.reservedStock || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending orders</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-amber-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-amber-600">Low-Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{summary?.lowStockProducts || 0}</div>
            <p className="text-xs text-amber-600/80 mt-1">Reorder soon</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-red-600">Out-of-Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.outOfStockProducts || 0}</div>
            <p className="text-xs text-red-600/80 mt-1">Needs attention</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-purple-600">High-Demand</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{summary?.highDemandProducts || 0}</div>
            <p className="text-xs text-purple-600/80 mt-1">Fast moving</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {needsAttentionCount > 0 && (
        <div className="relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7 bg-red-50/50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <h5 className="mb-1 leading-none tracking-tight text-red-800 font-semibold">Inventory Alert</h5>
          <div className="text-red-700 flex items-center justify-between text-sm [&_p]:leading-relaxed">
            <span>
              {needsAttentionCount} products require attention. {lowStockCount} products are low in stock and {outOfStockCount} products are out of stock.
            </span>
            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100 bg-white">
              Review Products
            </Button>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Availability by Category</CardTitle>
            <CardDescription>Available vs Reserved and Low Stock by product category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categorySummary && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySummary}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="available" name="Available Stock" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reserved" name="Reserved Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lowStock" name="Low-Stock Items" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Stock Status Distribution</CardTitle>
            <CardDescription>Current snapshot of all tracked products</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {stockStatus && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stockStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Demand vs Stock Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Demand vs Available Stock</CardTitle>
            <CardDescription>Compare recent product demand against current stock availability</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-[350px]">
          {filteredDemandSignals && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredDemandSignals}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="title" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.substring(0, 15) + '...'} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar yAxisId="left" dataKey="demand" name="Product Demand (Units)" fill="#a855f7" barSize={20} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="available" name="Available Stock" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="reserved" name="Reserved Stock" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tables and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Products Requiring Attention</CardTitle>
            <CardDescription>Items with low stock, out of stock, or high demand risks.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <DataTable 
              columns={attentionColumns} 
              data={filteredAttentionRequired || []} 
              isLoading={loadingAttention}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>High-Demand Products</CardTitle>
              <CardDescription>Top moving products by recent velocity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDemandSignals?.slice(0, 5).map((prod: any) => (
                  <div key={prod.sku} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {prod.imageUrl ? (
                        <img src={getImageUrl(prod.imageUrl)} alt={prod.title} className="w-full h-full object-cover" />
                      ) : <Package className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{prod.title}</p>
                      <p className="text-xs text-muted-foreground truncate">Available: {prod.available} | Reserved: {prod.reserved}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {prod.demandLevel}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1 text-center">{prod.estimatedDays || '--'} days est.</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>Latest inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {stockMovements?.slice(0, 5).map((move: any) => (
                  <div key={move._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-[2px]">
                      <ArrowRightLeft className="h-3 w-3" />
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-slate-200 bg-white shadow-sm ml-4 md:ml-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs capitalize text-slate-800">{move.movementType}</span>
                        <span className="text-[10px] text-slate-500">{new Date(move.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {move.quantity > 0 ? '+' : ''}{move.quantity} units for {move.productTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
