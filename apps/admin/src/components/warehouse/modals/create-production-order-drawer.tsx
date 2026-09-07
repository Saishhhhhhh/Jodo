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

interface CreateProductionOrderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductionOrderDrawer({
  open,
  onOpenChange,
}: CreateProductionOrderDrawerProps) {
  const { addProductionOrder, manufacturers, stock } = useWarehouseStore();

  const [product, setProduct] = useState('');
  const [sku, setSku] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [orderedQty, setOrderedQty] = useState('1000');
  const [expectedCompletion, setExpectedCompletion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !sku || !manufacturer || !orderedQty) {
      toast.error('Please fill in all required fields');
      return;
    }

    addProductionOrder({
      product,
      sku,
      manufacturer,
      orderedQty: parseInt(orderedQty, 10) || 1,
      expectedCompletion: expectedCompletion || '30 Sep 2026',
    });

    toast.success('Production order scheduled successfully');
    onOpenChange(false);

    setProduct('');
    setSku('');
    setManufacturer('');
    setOrderedQty('1000');
    setExpectedCompletion('');
  };

  const handleProductSelect = (selectedSku: string) => {
    const item = stock.find((s) => s.sku === selectedSku);
    if (item) {
      setSku(item.sku);
      setProduct(item.product);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Production Order</SheetTitle>
          <SheetDescription>
            Commission a new production run with a partner manufacturer.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="prod-sku-select">Select Catalog SKU</Label>
            <Select value={sku} onValueChange={handleProductSelect}>
              <SelectTrigger id="prod-sku-select">
                <SelectValue placeholder="Quick-select from catalog" />
              </SelectTrigger>
              <SelectContent>
                {stock.map((s) => (
                  <SelectItem key={s.id} value={s.sku}>
                    {s.product} ({s.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Product Name *</Label>
            <Input
              id="prod-name"
              placeholder="e.g. Classic Denim Jacket"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-sku">SKU Code *</Label>
              <Input
                id="prod-sku"
                placeholder="JKT-DNM-003"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-qty">Batch Quantity *</Label>
              <Input
                id="prod-qty"
                type="number"
                min="1"
                value={orderedQty}
                onChange={(e) => setOrderedQty(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-mfg">Manufacturer *</Label>
            <Select value={manufacturer} onValueChange={setManufacturer}>
              <SelectTrigger id="prod-mfg">
                <SelectValue placeholder="Assign manufacturer" />
              </SelectTrigger>
              <SelectContent>
                {manufacturers.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name} ({m.leadTime} lead, {m.qualityRating}★)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-completion">Expected Completion *</Label>
            <Input
              id="prod-completion"
              placeholder="e.g. 28 Sep 2026"
              value={expectedCompletion}
              onChange={(e) => setExpectedCompletion(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Schedule Order</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
