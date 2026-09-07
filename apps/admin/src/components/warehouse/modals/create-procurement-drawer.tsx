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

interface CreateProcurementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProcurementDrawer({ open, onOpenChange }: CreateProcurementDrawerProps) {
  const { addProcurement, stock, manufacturers } = useWarehouseStore();

  const [supplier, setSupplier] = useState('');
  const [product, setProduct] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('1000');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [warehouse, setWarehouse] = useState('Central Hub - BLR');
  const [amount, setAmount] = useState('250000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !product || !sku || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    addProcurement({
      supplier,
      product,
      sku,
      quantity: parseInt(quantity, 10) || 1,
      expectedDelivery: expectedDelivery || '14 days',
      warehouse,
      amount: parseFloat(amount) || 0,
    });

    toast.success('Procurement order created successfully');
    onOpenChange(false);

    // Reset
    setSupplier('');
    setProduct('');
    setSku('');
    setQuantity('1000');
    setExpectedDelivery('');
    setAmount('250000');
  };

  const handleProductSelect = (selectedSku: string) => {
    const item = stock.find((s) => s.sku === selectedSku);
    if (item) {
      setSku(item.sku);
      setProduct(item.product);
      setWarehouse(item.warehouse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Procurement Order</SheetTitle>
          <SheetDescription>
            Initiate raw material or finished product procurement from a verified vendor.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="supplier">Supplier / Vendor *</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger id="supplier">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {manufacturers.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name} ({m.location})
                  </SelectItem>
                ))}
                <SelectItem value="Apex Fabrics Ltd">Apex Fabrics Ltd</SelectItem>
                <SelectItem value="Zenith Mill Supplies">Zenith Mill Supplies</SelectItem>
                <SelectItem value="Eastern Indigo Mills">Eastern Indigo Mills</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product">Select Existing SKU</Label>
            <Select value={sku} onValueChange={handleProductSelect}>
              <SelectTrigger id="product">
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
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              placeholder="e.g. Organic Cotton T-Shirt"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU Code *</Label>
              <Input
                id="sku"
                placeholder="TSH-ORG-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Order Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="delivery">Expected Delivery *</Label>
              <Input
                id="delivery"
                placeholder="e.g. 25 Sep 2026"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">PO Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="warehouse">Target Warehouse *</Label>
            <Select value={warehouse} onValueChange={setWarehouse}>
              <SelectTrigger id="warehouse">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Central Hub - BLR">Central Hub - BLR</SelectItem>
                <SelectItem value="North DC - DEL">North DC - DEL</SelectItem>
                <SelectItem value="West DC - BOM">West DC - BOM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Procurement</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
