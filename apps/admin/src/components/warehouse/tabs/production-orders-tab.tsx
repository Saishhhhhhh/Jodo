'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, MoreHorizontal, CheckCircle2, ClipboardCheck, ArrowUpRight } from 'lucide-react';
import { useWarehouseStore, ProductionOrderItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductionOrdersTabProps {
  onOpenCreate: () => void;
  onOpenQC?: () => void;
}

export function ProductionOrdersTab({ onOpenCreate, onOpenQC }: ProductionOrdersTabProps) {
  const { productionOrders, updateProductionProgress } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredData = useMemo(() => {
    return productionOrders.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [productionOrders, searchTerm, statusFilter]);

  const handleUpdateProgress = (order: ProductionOrderItem) => {
    const input = window.prompt(
      `Update produced quantity for ${order.id} (${order.product})\nCurrently produced: ${order.producedQty} / ${order.orderedQty}\nEnter new total produced quantity:`,
      order.producedQty.toString()
    );
    if (!input) return;
    const qty = parseInt(input, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    updateProductionProgress(order.id, qty);
    toast.success(`Updated produced quantity to ${qty} units for ${order.id}`);
  };

  const getStatusBadge = (status: ProductionOrderItem['status']) => {
    switch (status) {
      case 'In Production':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none">In Production</Badge>;
      case 'QC Pending':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">QC Pending</Badge>;
      case 'Completed':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Completed</Badge>;
      case 'Delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      case 'Scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              placeholder="Search order ID, product, SKU, factory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="In Production">In Production</SelectItem>
              <SelectItem value="QC Pending">QC Pending</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New Production Order
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Production Order</TableHead>
              <TableHead>Product & SKU</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead className="text-right">Ordered</TableHead>
              <TableHead className="text-right">Produced</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="text-right">QC Passed</TableHead>
              <TableHead>Expected Completion</TableHead>
              <TableHead className="w-36">Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-semibold text-xs text-foreground">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{order.product}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{order.sku}</div>
                  </TableCell>
                  <TableCell className="text-xs text-foreground">{order.manufacturer}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {formatNumber(order.orderedQty)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-xs text-green-600 dark:text-green-400">
                    {formatNumber(order.producedQty)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatNumber(order.remaining)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-foreground font-semibold">
                    {formatNumber(order.qcPassed)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {order.expectedCompletion}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-muted-foreground">Done</span>
                        <span className="font-semibold text-foreground">{order.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, order.progress))}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateProgress(order)}>
                          <ArrowUpRight className="mr-2 h-4 w-4" /> Update Output Qty
                        </DropdownMenuItem>
                        {onOpenQC && (
                          <DropdownMenuItem onClick={onOpenQC}>
                            <ClipboardCheck className="mr-2 h-4 w-4" /> Send to QC
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-28 text-center text-xs text-muted-foreground">
                  No production orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} of {productionOrders.length} production runs
      </div>
    </div>
  );
}
