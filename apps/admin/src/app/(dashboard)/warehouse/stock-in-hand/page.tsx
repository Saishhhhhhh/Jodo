'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Boxes, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { StockTab } from '@/components/warehouse/tabs/stock-tab';
import { AdjustStockDialog } from '@/components/warehouse/modals/adjust-stock-dialog';
import { CreateTransferDrawer } from '@/components/warehouse/modals/create-transfer-drawer';
import { StockDetailModal } from '@/components/warehouse/modals/stock-detail-modal';
import { StockItem } from '@/stores/warehouse';

function StockInHandPageContent() {
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedStockForAdjust, setSelectedStockForAdjust] = useState<StockItem | undefined>(undefined);

  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStockForDetail, setSelectedStockForDetail] = useState<StockItem | null>(null);

  const handleOpenAdjust = (item?: StockItem) => {
    setSelectedStockForAdjust(item);
    setIsAdjustOpen(true);
  };

  const handleOpenTransfer = () => {
    setIsTransferOpen(true);
  };

  const handleViewHistory = (item: StockItem) => {
    setSelectedStockForDetail(item);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/warehouse" className="hover:text-foreground transition-colors">
              Warehouse
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Stock-in-Hand</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Stock-in-Hand</h1>
            <Badge variant="outline" className="text-xs font-mono">
              Live Inventory & Bin Levels
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor real-time physical, reserved, and available stock across distribution hubs. Auto-flag low-stock SKUs and audit movement transactions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => handleOpenAdjust()} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Stock Adjustment</span>
          </Button>
          <Button onClick={handleOpenTransfer} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>Transfer Stock</span>
          </Button>
        </div>
      </div>

      <StockTab
        onOpenAdjust={handleOpenAdjust}
        onOpenTransfer={handleOpenTransfer}
        onViewHistory={handleViewHistory}
      />

      <AdjustStockDialog
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        item={selectedStockForAdjust}
      />

      <CreateTransferDrawer
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
      />

      <StockDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        selectedStockItem={selectedStockForDetail}
        onOpenAdjust={handleOpenAdjust}
        onOpenTransfer={handleOpenTransfer}
      />
    </div>
  );
}

export default function StockInHandPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Stock-in-Hand...</div>}>
      <StockInHandPageContent />
    </Suspense>
  );
}
