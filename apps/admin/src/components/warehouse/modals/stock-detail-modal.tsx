'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, ArrowDownRight, ArrowUpRight, Clock, SlidersHorizontal, ArrowLeftRight, CheckCircle } from 'lucide-react';
import { useWarehouseStore, StockItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';

interface StockDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStockItem: StockItem | null;
  onOpenAdjust?: (item: StockItem) => void;
  onOpenTransfer?: () => void;
}

export function StockDetailModal({
  open,
  onOpenChange,
  selectedStockItem,
  onOpenAdjust,
  onOpenTransfer,
}: StockDetailModalProps) {
  const { stockMovements } = useWarehouseStore();

  if (!selectedStockItem) return null;

  // Filter movements for this SKU or product
  const movements = stockMovements.filter(
    (m) =>
      m.sku === selectedStockItem.sku ||
      m.product.toLowerCase().includes(selectedStockItem.product.toLowerCase())
  );

  const getStatusBadge = (status: StockItem['status']) => {
    switch (status) {
      case 'Healthy':
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 border-none">Healthy</Badge>;
      case 'Low Stock':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Low Stock</Badge>;
      case 'Critical':
      case 'Out of Stock':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'Receipt':
        return <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5">Receipt</Badge>;
      case 'Dispatch':
        return <Badge variant="outline" className="text-blue-600 border-blue-500/30 bg-blue-500/5">Dispatch</Badge>;
      case 'Reservation':
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5">Reservation</Badge>;
      case 'Adjustment':
        return <Badge variant="outline" className="text-purple-600 border-purple-500/30 bg-purple-500/5">Adjustment</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span>{selectedStockItem.product}</span>
                {getStatusBadge(selectedStockItem.status)}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs mt-1">
                SKU: {selectedStockItem.sku} • Warehouse: {selectedStockItem.warehouse}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {onOpenAdjust && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenAdjust(selectedStockItem);
                  }}
                >
                  <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Adjust
                </Button>
              )}
              {onOpenTransfer && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenTransfer();
                  }}
                >
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" /> Transfer
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Inventory Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          <div className="p-3 bg-muted/40 rounded-lg border">
            <span className="text-[11px] text-muted-foreground">Stock in Hand</span>
            <div className="font-mono font-bold text-lg text-foreground mt-0.5">
              {formatNumber(selectedStockItem.stockInHand)}
            </div>
            <span className="text-[10px] text-muted-foreground">Total physical count</span>
          </div>

          <div className="p-3 bg-muted/40 rounded-lg border">
            <span className="text-[11px] text-muted-foreground">Reserved for Orders</span>
            <div className="font-mono font-bold text-lg text-amber-500 mt-0.5">
              {formatNumber(selectedStockItem.reserved)}
            </div>
            <span className="text-[10px] text-muted-foreground">Committed orders</span>
          </div>

          <div className="p-3 bg-muted/40 rounded-lg border">
            <span className="text-[11px] text-muted-foreground">Available Stock</span>
            <div className="font-mono font-bold text-lg text-emerald-500 mt-0.5">
              {formatNumber(selectedStockItem.available)}
            </div>
            <span className="text-[10px] text-muted-foreground">OnHand - Reserved</span>
          </div>

          <div className="p-3 bg-muted/40 rounded-lg border">
            <span className="text-[11px] text-muted-foreground">Incoming Stock</span>
            <div className="font-mono font-bold text-lg text-blue-500 mt-0.5">
              {formatNumber(selectedStockItem.incoming)}
            </div>
            <span className="text-[10px] text-muted-foreground">Reorder level: {selectedStockItem.reorderLevel}</span>
          </div>
        </div>

        {/* Section 16: Stock Movement History */}
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Stock Movement History
            </h4>
            <span className="text-[11px] text-muted-foreground">{movements.length} audit entries</span>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px]">Date & Time</TableHead>
                  <TableHead className="text-[11px]">Transaction</TableHead>
                  <TableHead className="text-[11px]">Reference</TableHead>
                  <TableHead className="text-[11px] text-right">In (+)</TableHead>
                  <TableHead className="text-[11px] text-right">Out (-)</TableHead>
                  <TableHead className="text-[11px] text-right">New Balance</TableHead>
                  <TableHead className="text-[11px]">Warehouse</TableHead>
                  <TableHead className="text-[11px]">Updated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground text-xs">
                      No stock movements recorded for this item yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((mov) => (
                    <TableRow key={mov.id} className="text-xs">
                      <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {mov.dateTime}
                      </TableCell>
                      <TableCell>{getMovementBadge(mov.movementType)}</TableCell>
                      <TableCell className="font-mono text-xs">{mov.referenceId}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {mov.qtyIn > 0 ? `+${mov.qtyIn}` : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-rose-600 dark:text-rose-400">
                        {mov.qtyOut > 0 ? `-${mov.qtyOut}` : '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {mov.newStock}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{mov.warehouse}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{mov.performedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
