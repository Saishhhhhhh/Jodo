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
import { useWarehouseStore, ProductionOrderItem } from '@/stores/warehouse';
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
  const [quantity, setQuantity] = useState('1000');
  const [rawMaterials, setRawMaterials] = useState('');
  const [plannedStart, setPlannedStart] = useState('');
  const [plannedCompletion, setPlannedCompletion] = useState('');
  const [priority, setPriority] = useState<ProductionOrderItem['priority']>('High');
  const [destinationWarehouse, setDestinationWarehouse] = useState('Central Hub - BLR');
  const [assignedManager, setAssignedManager] = useState('Production Lead');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !sku || !manufacturer || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    addProductionOrder({
      product,
      sku,
      manufacturer,
      quantity: parseInt(quantity, 10) || 1,
      rawMaterialRequirement: rawMaterials || 'Standard Bill of Materials (BOM)',
      plannedStartDate: plannedStart || today,
      plannedCompletionDate: plannedCompletion || '25 Sep 2026',
      priority,
      destinationWarehouse,
      assignedManager,
      notes,
    });

    toast.success('Production order scheduled successfully');
    onOpenChange(false);

    setProduct('');
    setSku('');
    setManufacturer('');
    setQuantity('1000');
    setRawMaterials('');
    setPlannedStart('');
    setPlannedCompletion('');
    setNotes('');
  };

  const handleProductSelect = (selectedSku: string) => {
    const item = stock.find((s) => s.sku === selectedSku);
    if (item) {
      setSku(item.sku);
      setProduct(item.product);
      setDestinationWarehouse(item.warehouse);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Schedule Production Order</SheetTitle>
          <SheetDescription>
            Commission a batch run with a contract manufacturer, allocate materials, and set completion gates.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="prod-sku-select">Quick-Select SKU from Catalog</Label>
            <Select value={sku} onValueChange={handleProductSelect}>
              <SelectTrigger id="prod-sku-select">
                <SelectValue placeholder="Choose product" />
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
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-mfg">Contract Manufacturer *</Label>
              <Select value={manufacturer} onValueChange={setManufacturer}>
                <SelectTrigger id="prod-mfg">
                  <SelectValue placeholder="Assign factory" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name} ({m.averageLeadTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-priority">Priority</Label>
              <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                <SelectTrigger id="prod-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-raw">Raw Material Requirement (BOM)</Label>
            <Input
              id="prod-raw"
              placeholder="e.g. 1,400m 12oz Denim + 6,000 Rivets"
              value={rawMaterials}
              onChange={(e) => setRawMaterials(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-start">Planned Start Date</Label>
              <Input
                id="prod-start"
                placeholder="e.g. 10 Sep 2026"
                value={plannedStart}
                onChange={(e) => setPlannedStart(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-completion">Planned Completion *</Label>
              <Input
                id="prod-completion"
                placeholder="e.g. 28 Sep 2026"
                value={plannedCompletion}
                onChange={(e) => setPlannedCompletion(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-wh">Destination Hub</Label>
              <Select value={destinationWarehouse} onValueChange={setDestinationWarehouse}>
                <SelectTrigger id="prod-wh">
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
              <Label htmlFor="prod-mgr">Assigned Manager</Label>
              <Input
                id="prod-mgr"
                value={assignedManager}
                onChange={(e) => setAssignedManager(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-notes">Special Production Notes</Label>
            <Textarea
              id="prod-notes"
              placeholder="e.g. Extra stone wash cycle requested. Pre-shrink fabric before cut."
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
            <Button type="submit">Schedule Production Run</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
