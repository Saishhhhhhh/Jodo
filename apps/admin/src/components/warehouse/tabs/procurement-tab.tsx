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
import {
  Search,
  Plus,
  MoreHorizontal,
  PackageCheck,
  Eye,
  Filter,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { useWarehouseStore, ProcurementItem } from '@/stores/warehouse';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface ProcurementTabProps {
  onOpenCreate: () => void;
}

export function ProcurementTab({ onOpenCreate }: ProcurementTabProps) {
  const { procurements, receiveProcurementStock } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');

  // Receive stock prompt / action
  const handleReceiveStock = (item: ProcurementItem) => {
    if (item.pending <= 0) {
      toast.info('All units have already been received for this order');
      return;
    }
    const input = window.prompt(
      `Receive stock for ${item.product} (${item.id})\nPending units: ${item.pending}\nEnter quantity to receive:`,
      item.pending.toString()
    );
    if (!input) return;
    const qty = parseInt(input, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }
    receiveProcurementStock(item.id, qty);
    toast.success(`Received ${qty} units of ${item.sku} at ${item.warehouse}`);
  };

  const filteredData = useMemo(() => {
    return procurements.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchWarehouse = warehouseFilter === 'ALL' || item.warehouse === warehouseFilter;

      return matchSearch && matchStatus && matchWarehouse;
    });
  }, [procurements, searchTerm, statusFilter, warehouseFilter]);

  const getStatusBadge = (status: ProcurementItem['status']) => {
    switch (status) {
      case 'Delivered':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Delivered</Badge>;
      case 'Partially Received':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none">Partially Received</Badge>;
      case 'In Transit':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">In Transit</Badge>;
      case 'Delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      case 'Pending Approval':
        return <Badge variant="secondary">Pending Approval</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="flex items-center gap-2 w-full sm:w-72 bg-card rounded-md border px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search by ID, supplier, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Partially Received">Partially Received</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
            </SelectContent>
          </Select>

          {/* Warehouse Filter */}
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Warehouses</SelectItem>
              <SelectItem value="Central Hub - BLR">Central Hub - BLR</SelectItem>
              <SelectItem value="North DC - DEL">North DC - DEL</SelectItem>
              <SelectItem value="West DC - BOM">West DC - BOM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New Procurement
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Procurement ID</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Product & SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Pending</TableHead>
              <TableHead>Expected Delivery</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-semibold text-xs text-foreground">
                    {item.id}
                  </TableCell>
                  <TableCell className="font-medium text-xs">{item.supplier}</TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{item.product}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {formatNumber(item.quantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-green-600 dark:text-green-400">
                    {formatNumber(item.received)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatNumber(item.pending)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.expectedDelivery}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{item.warehouse}</TableCell>
                  <TableCell className="text-right font-mono font-medium text-xs">
                    {formatCurrency(item.amount, 'INR')}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleReceiveStock(item)}>
                          <PackageCheck className="mr-2 h-4 w-4 text-green-600" />
                          Receive Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(`Procurement details for ${item.id}\nSupplier: ${item.supplier}\nAmount: ₹${item.amount.toLocaleString()}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-28 text-center text-xs text-muted-foreground">
                  No procurement orders found matching current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing {filteredData.length} of {procurements.length} procurement orders
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled className="h-7 text-xs">
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled className="h-7 text-xs">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
