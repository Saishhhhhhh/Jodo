'use client';

import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWarehouseStore, ProcurementItem } from '@/stores/warehouse';
import { warehouseApi } from '@/lib/api-client';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { Pencil, Info, CheckCircle2, AlertTriangle, Truck, Clock, XCircle, RotateCcw } from 'lucide-react';

interface EditProcurementDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ProcurementItem | null;
}

function parseToInputDate(dateStr?: string): string {
  if (!dateStr || dateStr.toLowerCase().includes('flexible') || dateStr.toLowerCase().includes('tbd')) {
    return '';
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}

export function EditProcurementDrawer({ open, onOpenChange, item }: EditProcurementDrawerProps) {
  const { updateProcurement, manufacturers, stock } = useWarehouseStore();

  const [supplier, setSupplier] = useState('');
  const [product, setProduct] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProcurementItem['category']>('Raw Materials');
  const [quantity, setQuantity] = useState('1000');
  const [unitCost, setUnitCost] = useState('250');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [warehouse, setWarehouse] = useState('Central Hub - BLR');
  const [owner, setOwner] = useState('Procurement Admin');
  const [status, setStatus] = useState<ProcurementItem['status']>('PO Raised');
  const [notes, setNotes] = useState('');

  // Sync state when selected item changes
  useEffect(() => {
    if (item) {
      setSupplier(item.supplier || '');
      setProduct(item.product || '');
      setSku(item.sku || '');
      setCategory(item.category || 'Raw Materials');
      setQuantity(item.quantityOrdered ? item.quantityOrdered.toString() : '1000');
      setUnitCost(item.unitCost ? item.unitCost.toString() : '0');
      setExpectedDelivery(parseToInputDate(item.expectedDeliveryDate));
      setWarehouse(item.destinationWarehouse || 'Central Hub - BLR');
      setOwner(item.procurementOwner || 'Procurement Admin');
      setStatus(item.status || 'PO Raised');
      setNotes(item.notes || '');
    }
  }, [item]);

  if (!item) return null;

  const parsedQty = parseInt(quantity, 10) || 0;
  const parsedUnitCost = parseFloat(unitCost) || 0;
  const totalCost = parsedQty * parsedUnitCost;
  const alreadyReceived = item.quantityReceived || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier || !product || !sku || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parsedQty <= 0) {
      toast.error('Quantity ordered must be greater than 0');
      return;
    }

    if (alreadyReceived > 0 && parsedQty < alreadyReceived) {
      toast.error(
        `Quantity ordered cannot be less than already received quantity (${alreadyReceived} units)`
      );
      return;
    }

    let formattedDelivery = item.expectedDeliveryDate;
    if (expectedDelivery && expectedDelivery.trim()) {
      try {
        const parts = expectedDelivery.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          formattedDelivery = d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        } else {
          formattedDelivery = expectedDelivery;
        }
      } catch {
        formattedDelivery = expectedDelivery;
      }
    }

    const updatePayload = {
      supplier,
      product,
      sku,
      category,
      quantityOrdered: parsedQty,
      unitCost: parsedUnitCost,
      totalCost,
      destinationWarehouse: warehouse,
      expectedDeliveryDate: formattedDelivery,
      procurementOwner: owner,
      status,
      notes,
    };

    // Update in Zustand local store
    updateProcurement(item.id, updatePayload);

    // Also attempt backend API call gracefully
    try {
      await warehouseApi.updateProcurement(item.id, updatePayload);
    } catch {
      // Backend may be running or simulated; store is already updated
    }

    toast.success(`Purchase Order ${item.purchaseOrderNumber || item.id} updated successfully`);
    onOpenChange(false);
  };

  const handleProductSelect = (selectedSku: string) => {
    const matched = stock.find((s) => s.sku === selectedSku);
    if (matched) {
      setSku(matched.sku);
      setProduct(matched.product);
      setWarehouse(matched.warehouse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold">Edit Purchase Order</SheetTitle>
              <SheetDescription className="text-xs">
                PO: <span className="font-mono font-medium text-foreground">{item.purchaseOrderNumber || item.id}</span> • Ordered on {item.orderDate}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Notice if stock has already been received */}
        {alreadyReceived > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                Inward Receipts Recorded
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Already received <span className="font-bold text-foreground font-mono">{formatNumber(alreadyReceived)}</span> of{' '}
                <span className="font-bold text-foreground font-mono">{formatNumber(item.quantityOrdered)}</span> units.
                Ordered quantity cannot be lowered below received amount.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="edit-supplier">Supplier / Vendor *</Label>
            <Select value={supplier} onValueChange={setSupplier}>
              <SelectTrigger id="edit-supplier">
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
                <SelectItem value="Sterling Garments Ltd">Sterling Garments Ltd</SelectItem>
                <SelectItem value="Veda Silk & Linens">Veda Silk & Linens</SelectItem>
                <SelectItem value="Vanguard Textiles Corp">Vanguard Textiles Corp</SelectItem>
                <SelectItem value="Himalayan Woolcrafts">Himalayan Woolcrafts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-category">Procurement Category *</Label>
            <Select value={category} onValueChange={(val: any) => setCategory(val)}>
              <SelectTrigger id="edit-category">
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
            <Label htmlFor="edit-product-select">Select Catalog SKU (Optional Autofill)</Label>
            <Select value={sku} onValueChange={handleProductSelect}>
              <SelectTrigger id="edit-product-select">
                <SelectValue placeholder="Autofill from catalog" />
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
            <Label htmlFor="edit-product-name">Product / Material Name *</Label>
            <Input
              id="edit-product-name"
              placeholder="e.g. Organic Cotton Jersey Fabric"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-sku">SKU Code *</Label>
              <Input
                id="edit-sku"
                placeholder="FAB-ORG-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-quantity">Quantity Ordered *</Label>
              <Input
                id="edit-quantity"
                type="number"
                min={alreadyReceived > 0 ? alreadyReceived : 1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-unit-cost">Unit Cost (₹) *</Label>
              <Input
                id="edit-unit-cost"
                type="number"
                min="0"
                step="any"
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
              <Label htmlFor="edit-status">Status *</Label>
              <Select value={status} onValueChange={(val: ProcurementItem['status']) => setStatus(val)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="PO Raised">PO Raised</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-warehouse">Destination Hub *</Label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger id="edit-warehouse">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Central Hub - BLR">Central Hub - BLR</SelectItem>
                  <SelectItem value="North DC - DEL">North DC - DEL</SelectItem>
                  <SelectItem value="West DC - BOM">West DC - BOM</SelectItem>
                  <SelectItem value="South Facility - CHN">South Facility - CHN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-delivery">Expected Delivery Date</Label>
              <Input
                id="edit-delivery"
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-owner">Procurement Owner</Label>
              <Input
                id="edit-owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Notes / Special Instructions</Label>
            <Textarea
              id="edit-notes"
              placeholder="e.g. Expedited road delivery. Include lab quality certificate."
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
            <Button type="submit" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Save Changes
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
