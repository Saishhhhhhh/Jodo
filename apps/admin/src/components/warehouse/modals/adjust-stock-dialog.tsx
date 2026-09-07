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
  const [reason, setReason] = useState('Periodic physical inventory audit');

  useEffect(() => {
    if (selectedStockItem) {
      setOnHandInput(selectedStockItem.stockInHand);
    }
  }, [selectedStockItem, open]);

  const handleSave = () => {
    if (!selectedStockItem) return;

    adjustStock(selectedStockItem.id, onHandInput, reason);
    toast.success(`Adjusted ${selectedStockItem.product} stock to ${onHandInput} units. Stock movement audit entry logged.`);
    onOpenChange(false);
  };

  const currentOnHand = selectedStockItem?.stockInHand || 0;
  const reserved = selectedStockItem?.reserved || 0;
  const calculatedAvailable = Math.max(0, onHandInput - reserved);
  const difference = onHandInput - currentOnHand;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock Level</DialogTitle>
          <DialogDescription>
            Record physical inventory adjustment for <span className="font-semibold text-foreground">{selectedStockItem?.product}</span> ({selectedStockItem?.sku}) at <span className="font-semibold text-foreground">{selectedStockItem?.warehouse}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="p-3 bg-muted/40 rounded-lg border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Stock in Hand:</span>
              <span className="font-mono font-semibold">{currentOnHand} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reserved for Orders:</span>
              <span className="font-mono font-semibold text-amber-500">{reserved} units</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-[11px] pt-0.5">
              <span>Formula:</span>
              <span className="font-medium text-foreground">Available = Stock-in-Hand - Reserved</span>
            </div>
            <div className="flex justify-between font-bold pt-1.5 border-t">
              <span>Resulting Available Stock:</span>
              <span className={`font-mono text-sm ${calculatedAvailable <= 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                {calculatedAvailable} units
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock-on-hand">New Counted Stock-in-Hand</Label>
            <Input
              id="stock-on-hand"
              type="number"
              min="0"
              value={onHandInput}
              onChange={(e) => setOnHandInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Physical count in warehouse</span>
              <span className={`font-medium ${difference > 0 ? 'text-emerald-400' : difference < 0 ? 'text-rose-400' : 'text-muted-foreground'}`}>
                {difference > 0 ? `+${difference}` : difference} units difference
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-reason">Reason for Adjustment / Audit Reference</Label>
            <Input
              id="adjust-reason"
              placeholder="e.g. Physical inventory cycle count / Damaged goods written off"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">An immutable stock movement and audit trail entry will be recorded.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save Adjustment & Log Audit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
