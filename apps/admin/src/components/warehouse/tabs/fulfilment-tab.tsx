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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Send, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useWarehouseStore, FulfilmentItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function FulfilmentTab() {
  const { fulfilments, dispatchFulfilment } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('ALL');

  const filteredData = useMemo(() => {
    return fulfilments.filter((item) => {
      const matchSearch =
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase());

      const matchReadiness = readinessFilter === 'ALL' || item.readiness === readinessFilter;
      return matchSearch && matchReadiness;
    });
  }, [fulfilments, searchTerm, readinessFilter]);

  const handleDispatch = (item: FulfilmentItem) => {
    dispatchFulfilment(item.id);
    toast.success(`Order ${item.orderId} dispatched from ${item.warehouse}!`);
  };

  const getReadinessBadge = (readiness: FulfilmentItem['readiness']) => {
    switch (readiness) {
      case 'Ready':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Ready</Badge>;
      case 'Partially Ready':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Partially Ready</Badge>;
      case 'Waiting for Stock':
        return <Badge variant="secondary">Waiting for Stock</Badge>;
      case 'Waiting for QC':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none">Waiting for QC</Badge>;
      case 'Waiting for Production':
        return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/15 border-none">Waiting for Production</Badge>;
      case 'Blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">{readiness}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search order ID, customer, product, warehouse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={readinessFilter} onValueChange={setReadinessFilter}>
            <SelectTrigger className="w-48 h-9 text-xs">
              <SelectValue placeholder="All Readiness States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Readiness States</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="Partially Ready">Partially Ready</SelectItem>
              <SelectItem value="Waiting for Stock">Waiting for Stock</SelectItem>
              <SelectItem value="Waiting for QC">Waiting for QC</SelectItem>
              <SelectItem value="Waiting for Production">Waiting for Production</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Required Qty</TableHead>
              <TableHead className="text-right">Available Qty</TableHead>
              <TableHead className="text-right">Reserved Qty</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Readiness</TableHead>
              <TableHead>Expected Dispatch</TableHead>
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
                  <TableCell className="text-xs font-medium">{item.product}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {item.requiredQty}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatNumber(item.availableQty)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-primary font-bold">
                    {item.reservedQty}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{item.warehouse}</TableCell>
                  <TableCell>{getReadinessBadge(item.readiness)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.expectedDispatch}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.readiness === 'Ready' ? (
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleDispatch(item)}
                      >
                        <Send className="h-3 w-3" /> Dispatch
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Pending Prep</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-28 text-center text-xs text-muted-foreground">
                  No orders in fulfilment queue.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} pending fulfilment queues
      </div>
    </div>
  );
}
