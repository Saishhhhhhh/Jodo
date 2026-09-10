'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Truck,
  Factory,
  Package,
  Building,
  ClipboardCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useWarehouseStore } from '@/stores/warehouse';

interface WarehouseSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WarehouseSearchDialog({
  open,
  onOpenChange,
}: WarehouseSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const {
    procurements,
    productionOrders,
    qualityChecks,
    stock,
    manufacturers,
    issues,
  } = useWarehouseStore();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const items: Array<{
      category: string;
      id: string;
      title: string;
      subtitle: string;
      badge: string;
      link: string;
      icon: any;
    }> = [];

    // Purchase Orders (PO Number, Supplier, Material, SKU)
    procurements.forEach((p) => {
      if (
        p.id.toLowerCase().includes(q) ||
        p.purchaseOrderNumber.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        p.product.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      ) {
        items.push({
          category: 'Purchase Orders',
          id: p.id,
          title: `${p.purchaseOrderNumber} — ${p.product}`,
          subtitle: `Supplier: ${p.supplier} • Qty: ${p.quantityOrdered} • ${p.destinationWarehouse}`,
          badge: p.status,
          link: '/warehouse/procurement',
          icon: Truck,
        });
      }
    });

    // Production Orders (Production Order, Product, SKU, Manufacturer)
    productionOrders.forEach((prd) => {
      if (
        prd.id.toLowerCase().includes(q) ||
        prd.product.toLowerCase().includes(q) ||
        prd.sku.toLowerCase().includes(q) ||
        prd.manufacturer.toLowerCase().includes(q)
      ) {
        items.push({
          category: 'Production Orders',
          id: prd.id,
          title: `${prd.id} — ${prd.product}`,
          subtitle: `Manufacturer: ${prd.manufacturer} • ${prd.completedQuantity}/${prd.quantity} units (${prd.progress}%)`,
          badge: prd.status,
          link: '/warehouse/production-orders',
          icon: Factory,
        });
      }
    });

    // Quality Checks (Batch, QC ID, Product, Inspector)
    qualityChecks.forEach((qc) => {
      if (
        qc.id.toLowerCase().includes(q) ||
        qc.batchNumber.toLowerCase().includes(q) ||
        qc.product.toLowerCase().includes(q) ||
        qc.inspector.toLowerCase().includes(q)
      ) {
        items.push({
          category: 'Quality Inspections',
          id: qc.id,
          title: `${qc.id} — Batch ${qc.batchNumber} (${qc.product})`,
          subtitle: `Inspector: ${qc.inspector} • Inspected: ${qc.quantityInspected} units`,
          badge: qc.qcStatus,
          link: '/warehouse/quality-checks',
          icon: ClipboardCheck,
        });
      }
    });

    // Stock-in-Hand (Product, SKU, Warehouse)
    stock.forEach((stk) => {
      if (
        stk.product.toLowerCase().includes(q) ||
        stk.sku.toLowerCase().includes(q) ||
        stk.warehouse.toLowerCase().includes(q)
      ) {
        items.push({
          category: 'Inventory & Stock',
          id: stk.id,
          title: `${stk.product} (${stk.sku})`,
          subtitle: `Warehouse: ${stk.warehouse} • Available: ${stk.available} • OnHand: ${stk.stockInHand}`,
          badge: stk.status,
          link: '/warehouse/stock-in-hand',
          icon: Package,
        });
      }
    });

    // Manufacturers
    manufacturers.forEach((mfg) => {
      if (
        mfg.name.toLowerCase().includes(q) ||
        mfg.location.toLowerCase().includes(q) ||
        mfg.contactPerson.toLowerCase().includes(q)
      ) {
        items.push({
          category: 'Contract Manufacturers',
          id: mfg.id,
          title: mfg.name,
          subtitle: `Location: ${mfg.location} • Active Orders: ${mfg.activeProductionOrders} • Lead: ${mfg.averageLeadTime}`,
          badge: mfg.status,
          link: '/warehouse/contract-manufacturers',
          icon: Building,
        });
      }
    });

    return items.slice(0, 10);
  }, [query, procurements, productionOrders, qualityChecks, stock, manufacturers]);

  const handleSelect = (link: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <span>Search Warehouse & Supply Chain</span>
          </DialogTitle>
          <div className="pt-2">
            <Input
              placeholder="Search PO Number, Production Order, SKU, Batch, Manufacturer, Warehouse..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 text-xs"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Type a PO Number (e.g. PO-2026), SKU (JKT-DNM), Batch (BATCH-26), or Manufacturer name to jump directly to the record.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No warehouse records matching <span className="font-semibold text-foreground">"{query}"</span>.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={`${item.category}-${item.id}-${idx}`}
                    onClick={() => handleSelect(item.link)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-muted text-foreground shrink-0">
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground truncate">{item.title}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">({item.category})</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant="outline" className="text-[10px]">{item.badge}</Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
