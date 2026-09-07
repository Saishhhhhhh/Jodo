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
  RotateCcw,
  CheckSquare,
  AlertTriangle,
  ReceiptText,
  Calendar,
} from 'lucide-react';
import { useWarehouseStore, QualityCheckItem, StockItem } from '@/stores/warehouse';

// Tabs
import { OverviewTab } from '@/components/warehouse/tabs/overview-tab';
import { ProcurementTab } from '@/components/warehouse/tabs/procurement-tab';
import { ManufacturersTab } from '@/components/warehouse/tabs/manufacturers-tab';
import { ProductionOrdersTab } from '@/components/warehouse/tabs/production-orders-tab';
import { ProductionTrackingTab } from '@/components/warehouse/tabs/production-tracking-tab';
import { QualityChecksTab } from '@/components/warehouse/tabs/quality-checks-tab';
import { StockTab } from '@/components/warehouse/tabs/stock-tab';
import { IncomingStockTab } from '@/components/warehouse/tabs/incoming-stock-tab';
import { ReservationsTab } from '@/components/warehouse/tabs/reservations-tab';
import { TransfersTab } from '@/components/warehouse/tabs/transfers-tab';
import { FulfilmentTab } from '@/components/warehouse/tabs/fulfilment-tab';
import { AlertsTab } from '@/components/warehouse/tabs/alerts-tab';
import { StockMovementsTab } from '@/components/warehouse/tabs/stock-movements-tab';

// Modals
import { CreateProcurementDrawer } from '@/components/warehouse/modals/create-procurement-drawer';
import { CreateProductionOrderDrawer } from '@/components/warehouse/modals/create-production-order-drawer';
import { AddManufacturerDrawer } from '@/components/warehouse/modals/add-manufacturer-drawer';
import { RecordQCDrawer } from '@/components/warehouse/modals/record-qc-drawer';
import { AdjustStockDialog } from '@/components/warehouse/modals/adjust-stock-dialog';
import { CreateTransferDrawer } from '@/components/warehouse/modals/create-transfer-drawer';

const TAB_CONFIG = [
  { id: 'overview', label: 'Overview', icon: Boxes },
  { id: 'procurement', label: 'Procurement', icon: Truck },
  { id: 'manufacturers', label: 'Manufacturers', icon: Building },
  { id: 'production-orders', label: 'Production Orders', icon: Factory },
  { id: 'production-tracking', label: 'Production Tracking', icon: Activity },
  { id: 'quality-checks', label: 'Quality Checks', icon: ClipboardCheck },
  { id: 'stock', label: 'Stock', icon: Package },
  { id: 'incoming-stock', label: 'Incoming Stock', icon: Truck },
  { id: 'reservations', label: 'Reservations', icon: CheckSquare },
  { id: 'transfers', label: 'Transfers', icon: RotateCcw },
  { id: 'fulfilment', label: 'Fulfilment', icon: Package },
  { id: 'delays-alerts', label: 'Delays & Alerts', icon: AlertTriangle },
  { id: 'stock-movements', label: 'Stock Movements', icon: ReceiptText },
];

export default function WarehousePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  const { alerts } = useWarehouseStore();
  const unresolvedAlertCount = alerts.filter((a) => !a.resolved).length;

  // Drawer / Dialog states
  const [isProcurementOpen, setIsProcurementOpen] = useState(false);
  const [isProductionOpen, setIsProductionOpen] = useState(false);
  const [isManufacturerOpen, setIsManufacturerOpen] = useState(false);
  const [isQCOpen, setIsQCOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);

  // Context for child dialogs
  const [selectedQC, setSelectedQC] = useState<QualityCheckItem | null>(null);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);

  useEffect(() => {
    if (tabParam && TAB_CONFIG.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`/warehouse?tab=${tabId}`, { scroll: false });
  };

  const handleOpenQC = (item?: QualityCheckItem) => {
    setSelectedQC(item || null);
    setIsQCOpen(true);
  };

  const handleOpenAdjust = (item: StockItem) => {
    setSelectedStockItem(item);
    setIsAdjustStockOpen(true);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Page Header (Matching existing JODO Admin structure) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Warehouse</h1>
            <Badge variant="outline" className="text-xs font-mono">
              Live Operations
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage procurement, manufacturers, production, quality checks, inventory and fulfilment operations.
          </p>
        </div>

        {/* Action button on right */}
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsProcurementOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Procurement
          </Button>
        </div>
      </div>

      {/* Internal Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabSelect} className="space-y-4">
        <div className="border-b border-border/80 pb-1">
          <TabsList className="inline-flex h-auto w-full justify-start gap-1 bg-transparent p-0 overflow-x-auto scrollbar-none flex-nowrap">
            {TAB_CONFIG.map((t) => {
              const isAlertTab = t.id === 'delays-alerts';
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border border-transparent whitespace-nowrap transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:shadow-sm hover:text-foreground text-muted-foreground"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{t.label}</span>
                  {isAlertTab && unresolvedAlertCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-1 h-4 min-w-[16px] px-1 text-[9px] font-bold rounded-full justify-center"
                    >
                      {unresolvedAlertCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
          <OverviewTab
            onTabChange={handleTabSelect}
            onOpenProcurement={() => setIsProcurementOpen(true)}
            onOpenProduction={() => setIsProductionOpen(true)}
            onOpenQC={() => handleOpenQC()}
            onOpenTransfer={() => setIsTransferOpen(true)}
          />
        </TabsContent>

        {/* Tab 2: Procurement */}
        <TabsContent value="procurement" className="mt-0 focus-visible:outline-none">
          <ProcurementTab onOpenCreate={() => setIsProcurementOpen(true)} />
        </TabsContent>

        {/* Tab 3: Manufacturers */}
        <TabsContent value="manufacturers" className="mt-0 focus-visible:outline-none">
          <ManufacturersTab onOpenCreate={() => setIsManufacturerOpen(true)} />
        </TabsContent>

        {/* Tab 4: Production Orders */}
        <TabsContent value="production-orders" className="mt-0 focus-visible:outline-none">
          <ProductionOrdersTab
            onOpenCreate={() => setIsProductionOpen(true)}
            onOpenQC={() => handleOpenQC()}
          />
        </TabsContent>

        {/* Tab 5: Production Tracking */}
        <TabsContent value="production-tracking" className="mt-0 focus-visible:outline-none">
          <ProductionTrackingTab />
        </TabsContent>

        {/* Tab 6: Quality Checks */}
        <TabsContent value="quality-checks" className="mt-0 focus-visible:outline-none">
          <QualityChecksTab onOpenRecordQC={handleOpenQC} />
        </TabsContent>

        {/* Tab 7: Stock */}
        <TabsContent value="stock" className="mt-0 focus-visible:outline-none">
          <StockTab onOpenAdjust={handleOpenAdjust} />
        </TabsContent>

        {/* Tab 8: Incoming Stock */}
        <TabsContent value="incoming-stock" className="mt-0 focus-visible:outline-none">
          <IncomingStockTab />
        </TabsContent>

        {/* Tab 9: Reservations */}
        <TabsContent value="reservations" className="mt-0 focus-visible:outline-none">
          <ReservationsTab />
        </TabsContent>

        {/* Tab 10: Transfers */}
        <TabsContent value="transfers" className="mt-0 focus-visible:outline-none">
          <TransfersTab onOpenCreate={() => setIsTransferOpen(true)} />
        </TabsContent>

        {/* Tab 11: Fulfilment */}
        <TabsContent value="fulfilment" className="mt-0 focus-visible:outline-none">
          <FulfilmentTab />
        </TabsContent>

        {/* Tab 12: Delays & Alerts */}
        <TabsContent value="delays-alerts" className="mt-0 focus-visible:outline-none">
          <AlertsTab onTabChange={handleTabSelect} />
        </TabsContent>

        {/* Tab 13: Stock Movements */}
        <TabsContent value="stock-movements" className="mt-0 focus-visible:outline-none">
          <StockMovementsTab />
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
