'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWarehouseStore } from '@/stores/warehouse';
import { toast } from 'sonner';

interface CreateTransferDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTransferDrawer({ open, onOpenChange }: CreateTransferDrawerProps) {
  const { addTransfer, stock } = useWarehouseStore();

  const [fromWarehouse, setFromWarehouse] = useState('Central Hub - BLR');
  const [toWarehouse, setToWarehouse] = useState('North DC - DEL');
  const [sku, setSku] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [expectedArrival, setExpectedArrival] = useState('');

  const handleProductSelect = (selectedSku: string) => {
    const item = stock.find((s) => s.sku === selectedSku);
    if (item) {
      setSku(item.sku);
      setProduct(item.product);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouse === toWarehouse) {
      toast.error('Origin and destination warehouses cannot be the same');
      return;
    }
    if (!product || !sku || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    addTransfer({
      fromWarehouse,
      toWarehouse,
      product,
      sku,
      quantity: parseInt(quantity, 10) || 1,
      expectedArrival: expectedArrival || '3 days',
    });

    toast.success('Warehouse transfer initiated');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transfer Stock</SheetTitle>
          <SheetDescription>
            Move inventory between regional distribution centers and hubs.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="from-wh">From Warehouse *</Label>
              <Select value={fromWarehouse} onValueChange={setFromWarehouse}>
                <SelectTrigger id="from-wh">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Central Hub - BLR">Central Hub - BLR</SelectItem>
                  <SelectItem value="North DC - DEL">North DC - DEL</SelectItem>
                  <SelectItem value="West DC - BOM">West DC - BOM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="to-wh">To Warehouse *</Label>
              <Select value={toWarehouse} onValueChange={setToWarehouse}>
                <SelectTrigger id="to-wh">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Central Hub - BLR">Central Hub - BLR</SelectItem>
                  <SelectItem value="North DC - DEL">North DC - DEL</SelectItem>
                  <SelectItem value="West DC - BOM">West DC - BOM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trf-sku-select">Select Product SKU *</Label>
            <Select value={sku} onValueChange={handleProductSelect}>
              <SelectTrigger id="trf-sku-select">
                <SelectValue placeholder="Choose SKU to move" />
              </SelectTrigger>
              <SelectContent>
                {stock.map((s) => (
                  <SelectItem key={s.id} value={s.sku}>
                    {s.product} ({s.sku}) — Avail: {s.available}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trf-qty">Transfer Quantity *</Label>
              <Input
                id="trf-qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trf-arr">Expected Arrival *</Label>
              <Input
                id="trf-arr"
                placeholder="e.g. 10 Sep 2026"
                value={expectedArrival}
                onChange={(e) => setExpectedArrival(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Dispatch Transfer</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
