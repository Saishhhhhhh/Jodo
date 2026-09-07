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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWarehouseStore, ProcurementItem } from '@/stores/warehouse';
import { toast } from 'sonner';

interface CreateProcurementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProcurementDrawer({ open, onOpenChange }: CreateProcurementDrawerProps) {
  const { addProcurement, stock, manufacturers, procurements } = useWarehouseStore();

  const [supplier, setSupplier] = useState('');
  const [product, setProduct] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProcurementItem['category']>('Raw Materials');
  const [quantity, setQuantity] = useState('1000');
  const [unitCost, setUnitCost] = useState('250');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [warehouse, setWarehouse] = useState('Central Hub - BLR');
  const [owner, setOwner] = useState('Procurement Admin');
  const [notes, setNotes] = useState('');

  const totalCost = (parseInt(quantity, 10) || 0) * (parseFloat(unitCost) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !product || !sku || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const poNumber = `PO-2026-0${90 + procurements.length}`;
    const orderDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    addProcurement({
      supplier,
      product,
      sku,
      category,
      quantityOrdered: parseInt(quantity, 10) || 1,
      unitCost: parseFloat(unitCost) || 0,
      totalCost,
      purchaseOrderNumber: poNumber,
      orderDate,
      expectedDeliveryDate: expectedDelivery || '14 days',
      destinationWarehouse: warehouse,
      procurementOwner: owner,
      notes,
    });

    toast.success(`Procurement PO ${poNumber} created successfully`);
    onOpenChange(false);

    setSupplier('');
    setProduct('');
    setSku('');
    setQuantity('1000');
    setUnitCost('250');
    setExpectedDelivery('');
    setNotes('');
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
            Raise a purchase order for raw materials, finished products, packaging or trims.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
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
                <SelectItem value="Highland Knits Global">Highland Knits Global</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Procurement Category *</Label>
            <Select value={category} onValueChange={(val: any) => setCategory(val)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                <SelectItem value="Packaging">Packaging</SelectItem>
                <SelectItem value="Hardware & Trims">Hardware & Trims</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-select">Select Catalog SKU (Optional)</Label>
            <Select value={sku} onValueChange={handleProductSelect}>
              <SelectTrigger id="product-select">
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
            <Label htmlFor="product-name">Product / Material Name *</Label>
            <Input
              id="product-name"
              placeholder="e.g. Organic Cotton Jersey Fabric"
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
                placeholder="FAB-ORG-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity Ordered *</Label>
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
              <Label htmlFor="unit-cost">Unit Cost (₹) *</Label>
              <Input
                id="unit-cost"
                type="number"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Total PO Cost (Auto)</Label>
              <div className="h-9 px-3 rounded-md border bg-muted/40 flex items-center font-mono font-bold text-foreground">
                ₹{totalCost.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="delivery">Expected Delivery Date *</Label>
              <Input
                id="delivery"
                placeholder="e.g. 25 Sep 2026"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="warehouse">Destination Hub *</Label>
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="owner">Procurement Owner</Label>
            <Input
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes / Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Fast-track road delivery. Include lab inspection certificate."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            <Button type="submit">Raise PO & Schedule</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
