'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Boxes,
  Truck,
  Building,
  Factory,
  Activity,
  ClipboardCheck,
  Package,
  CheckSquare,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useWarehouseStore, QualityCheckItem, StockItem } from '@/stores/warehouse';

// The 8 Refined Primary Tabs
import { OverviewTab } from '@/components/warehouse/tabs/overview-tab';
import { ProcurementTab } from '@/components/warehouse/tabs/procurement-tab';
import { ManufacturersTab } from '@/components/warehouse/tabs/manufacturers-tab';
import { ProductionOrdersTab } from '@/components/warehouse/tabs/production-orders-tab';
import { ProductionTrackingTab } from '@/components/warehouse/tabs/production-tracking-tab';
import { QualityChecksTab } from '@/components/warehouse/tabs/quality-checks-tab';
import { StockTab } from '@/components/warehouse/tabs/stock-tab';
import { FulfilmentTab } from '@/components/warehouse/tabs/fulfilment-tab';

// Modals / Drawers
import { CreateProcurementDrawer } from '@/components/warehouse/modals/create-procurement-drawer';
import { CreateProductionOrderDrawer } from '@/components/warehouse/modals/create-production-order-drawer';
import { AddManufacturerDrawer } from '@/components/warehouse/modals/add-manufacturer-drawer';
import { RecordQCDrawer } from '@/components/warehouse/modals/record-qc-drawer';
import { AdjustStockDialog } from '@/components/warehouse/modals/adjust-stock-dialog';
import { CreateTransferDrawer } from '@/components/warehouse/modals/create-transfer-drawer';

const PRIMARY_TABS = [
  { id: 'overview', label: 'Overview', icon: Boxes },
  { id: 'procurement', label: 'Procurement', icon: Truck },
  { id: 'manufacturers', label: 'Manufacturers', icon: Building },
  { id: 'production-orders', label: 'Production Orders', icon: Factory },
  { id: 'production-tracking', label: 'Production Tracking', icon: Activity },
  { id: 'quality-checks', label: 'Quality Checks', icon: ClipboardCheck },
  { id: 'stock', label: 'Stock', icon: Package },
  { id: 'fulfilment', label: 'Fulfilment', icon: CheckSquare },
];

export default function WarehousePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [stockSubView, setStockSubView] = useState('stock-in-hand');

  const { alerts, qualityChecks } = useWarehouseStore();
  const criticalAlertCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;
  const qcPendingCount = qualityChecks.filter((q) => q.qcStatus === 'Pending').length;

  // Drawers & Dialogs
  const [isProcurementOpen, setIsProcurementOpen] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const [isManufacturerOpen, setIsManufacturerOpen] = useState(false);
  const [isQCOpen, setIsQCOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);

  // Selected item contexts
  const [selectedQC, setSelectedQC] = useState<QualityCheckItem | null>(null);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);

  useEffect(() => {
    if (tabParam && PRIMARY_TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabSelect = (tabId: string, subView?: string) => {
    // If targeted a sub-view inside stock (like incoming-stock or transfers)
    if (tabId === 'stock' && subView) {
      setStockSubView(subView);
    }
    setActiveTab(tabId);
    router.replace(`/warehouse?tab=${tabId}`, { scroll: false });
  };

  const handleOpenQC = (item?: QualityCheckItem) => {
    setSelectedQC(item || null);
    setIsQCOpen(true);
  };

  const handleOpenAdjust = (item?: StockItem) => {
    setSelectedStockItem(item || null);
    setIsAdjustStockOpen(true);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header (Consistent with JODO Admin Panel) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Warehouse</h1>
            <Badge variant="outline" className="text-xs font-mono">
              Live Operations
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Supply Chain Management – Track procurement, contract manufacturers, production orders, production status, delays, quality checks, stock-in-hand and fulfilment readiness.
          </p>
        </div>

        {/* Action button on right */}
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setIsProcurementOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Procurement
          </Button>
        </div>
      </div>

      {/* Exactly 8 Clean Primary Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => handleTabSelect(val)} className="space-y-4">
        <div className="border-b border-border/80 pb-1">
          <TabsList className="inline-flex h-auto w-full justify-start gap-1.5 bg-transparent p-0 overflow-x-auto scrollbar-none flex-nowrap">
            {PRIMARY_TABS.map((t) => {
              const Icon = t.icon;
              const isQC = t.id === 'quality-checks';
              const isOverview = t.id === 'overview';

              return (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md border border-transparent whitespace-nowrap transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:shadow-sm hover:text-foreground text-muted-foreground"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.label}</span>
                  {isOverview && criticalAlertCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-0.5 h-4 min-w-[16px] px-1 text-[9px] font-bold rounded-full justify-center"
                    >
                      {criticalAlertCount}
                    </Badge>
                  )}
                  {isQC && qcPendingCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 h-4 min-w-[16px] px-1 text-[9px] font-semibold rounded-full justify-center"
                    >
                      {qcPendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* 1. Overview */}
        <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
          <OverviewTab
            onTabChange={handleTabSelect}
            onOpenProcurement={() => setIsProcurementOpen(true)}
            onOpenProduction={() => setIsProductionOpen(true)}
            onOpenQC={() => handleOpenQC()}
            onOpenTransfer={() => setIsTransferOpen(true)}
            onOpenAdjust={handleOpenAdjust}
          />
        </TabsContent>

        {/* 2. Procurement */}
        <TabsContent value="procurement" className="mt-0 focus-visible:outline-none">
          <ProcurementTab onOpenCreate={() => setIsProcurementOpen(true)} />
        </TabsContent>

        {/* 3. Manufacturers */}
        <TabsContent value="manufacturers" className="mt-0 focus-visible:outline-none">
          <ManufacturersTab onOpenCreate={() => setIsManufacturerOpen(true)} />
        </TabsContent>

        {/* 4. Production Orders */}
        <TabsContent value="production-orders" className="mt-0 focus-visible:outline-none">
          <ProductionOrdersTab
            onOpenCreate={() => setIsProductionOpen(true)}
            onOpenQC={() => handleOpenQC()}
          />
        </TabsContent>

        {/* 5. Production Tracking */}
        <TabsContent value="production-tracking" className="mt-0 focus-visible:outline-none">
          <ProductionTrackingTab />
        </TabsContent>

        {/* 6. Quality Checks */}
        <TabsContent value="quality-checks" className="mt-0 focus-visible:outline-none">
          <QualityChecksTab onOpenRecordQC={handleOpenQC} />
        </TabsContent>

        {/* 7. Stock (Consolidated single module with all stock sub-functions) */}
        <TabsContent value="stock" className="mt-0 focus-visible:outline-none">
          <StockTab
            onOpenAdjust={handleOpenAdjust}
            onOpenTransfer={() => setIsTransferOpen(true)}
            initialSubView={stockSubView}
          />
        </TabsContent>

        {/* 8. Fulfilment (Dedicated readiness analysis & gating) */}
        <TabsContent value="fulfilment" className="mt-0 focus-visible:outline-none">
          <FulfilmentTab />
        </TabsContent>
      </Tabs>

      {/* Drawers & Dialogs */}
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
        selectedQC={selectedQC}
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
    </div>
  );
}
