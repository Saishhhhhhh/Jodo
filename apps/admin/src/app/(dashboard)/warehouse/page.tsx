'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  RotateCcw,
  Search,
  Bell,
  SlidersHorizontal,
  Calendar,
  Building,
  Filter,
} from 'lucide-react';
import { useWarehouseStore, QualityCheckItem, StockItem } from '@/stores/warehouse';
import { OverviewTab } from '@/components/warehouse/tabs/overview-tab';

// Modals / Drawers
import { CreateProcurementDrawer } from '@/components/warehouse/modals/create-procurement-drawer';
import { CreateProductionOrderDrawer } from '@/components/warehouse/modals/create-production-order-drawer';
import { AddManufacturerDrawer } from '@/components/warehouse/modals/add-manufacturer-drawer';
import { RecordQCDrawer } from '@/components/warehouse/modals/record-qc-drawer';
import { AdjustStockDialog } from '@/components/warehouse/modals/adjust-stock-dialog';
import { CreateTransferDrawer } from '@/components/warehouse/modals/create-transfer-drawer';
import { WarehouseNotificationsDrawer } from '@/components/warehouse/modals/warehouse-notifications-drawer';
import { WarehouseSearchDialog } from '@/components/warehouse/modals/warehouse-search-dialog';
import { toast } from 'sonner';

function WarehouseDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters from Section 2
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { notifications } = useWarehouseStore();
  const unreadNotifs = (notifications || []).filter((n) => !n.read).length;

  // Drawers & Dialogs
  const [isProcurementOpen, setIsProcurementOpen] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const [isManufacturerOpen, setIsManufacturerOpen] = useState(false);
  const [isQCOpen, setIsQCOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Selected item context
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);

  // If someone accessed with ?tab=procurement, redirect them to dedicated page
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabMap: Record<string, string> = {
        procurement: '/warehouse/procurement',
        manufacturers: '/warehouse/contract-manufacturers',
        'production-orders': '/warehouse/production-orders',
        'production-tracking': '/warehouse/production-tracking',
        'quality-checks': '/warehouse/quality-checks',
        stock: '/warehouse/stock-in-hand',
        fulfilment: '/warehouse/fulfilment-readiness',
        alerts: '/warehouse/delays-issues',
      };
      if (tabMap[tabParam]) {
        router.replace(tabMap[tabParam]);
      }
    }
  }, [searchParams, router]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Warehouse operational telemetry refreshed');
    }, 400);
  };

  const handleOpenAdjust = (item?: StockItem) => {
    setSelectedStockItem(item || null);
    setIsAdjustStockOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Section 2: Warehouse Header with Title, Subtitle, Filters, Refresh */}
      <div className="flex flex-col gap-4 border-b pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Warehouse</h1>
              <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
                Live Operations
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Monitor procurement, manufacturing, production, quality, inventory and fulfilment operations from one place.
            </p>
          </div>

          {/* Search, Notifications & Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Search Warehouse</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border ml-1">
                ⌘K
              </kbd>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs relative px-2.5"
              onClick={() => setIsNotifOpen(true)}
              aria-label="Alerts & Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unreadNotifs}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs px-2.5"
              onClick={handleRefresh}
              title="Refresh telemetry"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Button
              size="sm"
              className="h-9 text-xs gap-1.5"
              onClick={() => setIsProcurementOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create PO</span>
            </Button>
          </div>
        </div>

        {/* Filters Bar: Date filter, Warehouse/Location, Product/Category */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date filter */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-8 text-xs w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Today">Today</SelectItem>
                  <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                  <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                  <SelectItem value="This Month">This Month</SelectItem>
                  <SelectItem value="Custom Date Range">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location filter */}
            <div className="flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="h-8 text-xs w-[160px]">
                  <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Warehouses</SelectItem>
                  <SelectItem value="BLR">Central Hub - BLR</SelectItem>
                  <SelectItem value="DEL">North DC - DEL</SelectItem>
                  <SelectItem value="BOM">West DC - BOM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 text-xs w-[160px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                  <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                  <SelectItem value="Packaging">Packaging</SelectItem>
                  <SelectItem value="Hardware & Trims">Hardware & Trims</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => setIsProductionOpen(true)}
            >
              <Plus className="h-3 w-3" /> New Production
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              onClick={() => setIsQCOpen(true)}
            >
              <Plus className="h-3 w-3" /> Record QC
            </Button>
          </div>
        </div>
      </div>

      {/* Main Central Dashboard Sections */}
      <OverviewTab
        onOpenProcurement={() => setIsProcurementOpen(true)}
        onOpenProduction={() => setIsProductionOpen(true)}
        onOpenQC={() => setIsQCOpen(true)}
        onOpenAdjust={handleOpenAdjust}
      />

      {/* Global Modals & Drawers */}
      <CreateProcurementDrawer
        open={isProcurementOpen}
        onOpenChange={setIsProcurementOpen}
      />
      <CreateProductionOrderDrawer
        open={isProductionOpen}
        onOpenChange={setIsProductionOpen}
      />
      <AddManufacturerDrawer
        open={isManufacturerOpen}
        onOpenChange={setIsManufacturerOpen}
      />
      <RecordQCDrawer
        open={isQCOpen}
        onOpenChange={setIsQCOpen}
      />
      <CreateTransferDrawer
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
      />
      <AdjustStockDialog
        open={isAdjustStockOpen}
        onOpenChange={setIsAdjustStockOpen}
        selectedStockItem={selectedStockItem}
      />
      <WarehouseNotificationsDrawer
        open={isNotifOpen}
        onOpenChange={setIsNotifOpen}
      />
      <WarehouseSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />
    </div>
  );
}

export default function WarehousePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Warehouse Dashboard...</div>}>
      <WarehouseDashboardContent />
    </Suspense>
  );
}
