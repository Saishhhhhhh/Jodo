'use client';

import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { useWarehouseStore, StockItem } from '@/stores/warehouse';
import { toast } from 'sonner';

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStockItem: StockItem | null;
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  selectedStockItem,
}: AdjustStockDialogProps) {
  const { adjustStock } = useWarehouseStore();

  const [onHandInput, setOnHandInput] = useState(0);
  const [holdInput, setHoldInput] = useState(0);
  const [reason, setReason] = useState('Periodic physical audit count');

  useEffect(() => {
    if (selectedStockItem) {
      setOnHandInput(selectedStockItem.stockInHand);
      setHoldInput(selectedStockItem.hold);
    }
  }, [selectedStockItem, open]);

  const handleSave = () => {
    if (!selectedStockItem) return;

    adjustStock(selectedStockItem.id, onHandInput, holdInput, reason);
    toast.success('Stock levels and availability recalculated');
    onOpenChange(false);
  };

  const calculatedAvailable = Math.max(
    0,
    onHandInput - (selectedStockItem?.reserved || 0) - holdInput
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock & Hold</DialogTitle>
          <DialogDescription>
            Update physical count for <span className="font-semibold">{selectedStockItem?.product}</span> (SKU: {selectedStockItem?.sku}) at <span className="font-semibold">{selectedStockItem?.warehouse}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted/40 rounded-md border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserved for Orders:</span>
              <span className="font-mono font-semibold">{selectedStockItem?.reserved || 0} units</span>
            </div>
            <div className="flex justify-between text-primary font-medium">
              <span>Formula:</span>
              <span>Available = Stock-in-Hand - Reserved - Hold</span>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t">
              <span>Resulting Available:</span>
              <span className="font-mono text-sm text-foreground">{calculatedAvailable} units</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock-on-hand">Physical Stock-in-Hand</Label>
              <Input
                id="stock-on-hand"
                type="number"
                min="0"
                value={onHandInput}
                onChange={(e) => setOnHandInput(parseInt(e.target.value, 10) || 0)}
              />
              <p className="text-[10px] text-muted-foreground">Total units in warehouse</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-hold">Hold / Damaged</Label>
              <Input
                id="stock-hold"
                type="number"
                min="0"
                value={holdInput}
                onChange={(e) => setHoldInput(parseInt(e.target.value, 10) || 0)}
              />
              <p className="text-[10px] text-muted-foreground">Quarantined from sale</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-reason">Reason for Adjustment</Label>
            <Input
              id="adjust-reason"
              placeholder="e.g. Physical inventory audit discrepancy"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
