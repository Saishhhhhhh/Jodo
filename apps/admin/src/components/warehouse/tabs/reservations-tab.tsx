'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, RotateCcw, CheckCircle } from 'lucide-react';
import { useWarehouseStore, ReservationItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function ReservationsTab() {
  const { reservations, releaseReservation } = useWarehouseStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return reservations.filter((item) => {
      return (
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [reservations, searchTerm]);

  const handleRelease = (item: ReservationItem) => {
    releaseReservation(item.id);
    toast.success(`Released reservation for ${item.orderId} back to available stock.`);
  };

  const getStatusBadge = (status: ReservationItem['status']) => {
    switch (status) {
      case 'Allocated':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Allocated</Badge>;
      case 'Partially Reserved':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Partially Reserved</Badge>;
      case 'Backordered':
        return <Badge variant="destructive">Backordered</Badge>;
      case 'Released':
        return <Badge variant="secondary">Released</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search order ID, customer, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filteredData.length} order allocations tracked
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product & SKU</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead className="text-right">Required Qty</TableHead>
              <TableHead className="text-right">Reserved Qty</TableHead>
              <TableHead className="text-right">Available Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-semibold text-xs text-foreground">
                    {item.orderId}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">
                    {item.customer}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{item.product}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{item.warehouse}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {item.requiredQty}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-primary">
                    {item.reservedQty}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatNumber(item.available)}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    {item.status === 'Allocated' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleRelease(item)}
                      >
                        <RotateCcw className="h-3 w-3" /> Release
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-28 text-center text-xs text-muted-foreground">
                  No reservations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} stock reservations
      </div>
    </div>
  );
}
