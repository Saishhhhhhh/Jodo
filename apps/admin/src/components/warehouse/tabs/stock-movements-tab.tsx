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
import { Search, ArrowDownLeft, ArrowUpRight, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useWarehouseStore, StockMovementItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';

export function StockMovementsTab() {
  const { stockMovements } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');

  const filteredData = useMemo(() => {
    return stockMovements.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.performedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'ALL' || item.movementType === typeFilter;
      const matchWarehouse = warehouseFilter === 'ALL' || item.warehouse === warehouseFilter;

      return matchSearch && matchType && matchWarehouse;
    });
  }, [stockMovements, searchTerm, typeFilter, warehouseFilter]);

  const getMovementBadge = (type: StockMovementItem['movementType']) => {
    switch (type) {
      case 'Receipt':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Receipt</Badge>;
      case 'Dispatch':
        return <Badge className="bg-rose-500/10 text-rose-600 border-none">Dispatch</Badge>;
      case 'Adjustment':
        return <Badge className="bg-amber-500/10 text-amber-600 border-none">Adjustment</Badge>;
      case 'Transfer In':
        return <Badge className="bg-blue-500/10 text-blue-600 border-none">Transfer In</Badge>;
      case 'Transfer Out':
        return <Badge className="bg-purple-500/10 text-purple-600 border-none">Transfer Out</Badge>;
      case 'Reservation':
        return <Badge className="bg-orange-500/10 text-orange-600 border-none">Reservation</Badge>;
      case 'Reservation Release':
        return <Badge className="bg-teal-500/10 text-teal-600 border-none">Reservation Release</Badge>;
      case 'Return':
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-none">Return</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search movement ID, product, ref, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="All Movement Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Movement Types</SelectItem>
              <SelectItem value="Receipt">Receipt</SelectItem>
              <SelectItem value="Dispatch">Dispatch</SelectItem>
              <SelectItem value="Adjustment">Adjustment</SelectItem>
              <SelectItem value="Transfer In">Transfer In</SelectItem>
              <SelectItem value="Transfer Out">Transfer Out</SelectItem>
              <SelectItem value="Reservation">Reservation</SelectItem>
              <SelectItem value="Reservation Release">Reservation Release</SelectItem>
              <SelectItem value="Return">Return</SelectItem>
            </SelectContent>
          </Select>

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

        <span className="text-xs text-muted-foreground">
          Immutable audit trail ({filteredData.length} records)
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Movement ID</TableHead>
              <TableHead>Product & SKU</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Movement Type</TableHead>
              <TableHead>Reference ID</TableHead>
              <TableHead className="text-right">Qty In</TableHead>
              <TableHead className="text-right">Qty Out</TableHead>
              <TableHead className="text-right">Previous Stock</TableHead>
              <TableHead className="text-right">New Stock</TableHead>
              <TableHead>Performed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.dateTime}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-xs text-foreground">
                    {item.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{item.product}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{item.warehouse}</TableCell>
                  <TableCell>{getMovementBadge(item.movementType)}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.referenceId}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {item.qtyIn > 0 ? (
                      <span className="text-green-600 dark:text-green-400">+{formatNumber(item.qtyIn)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {item.qtyOut > 0 ? (
                      <span className="text-destructive">-{formatNumber(item.qtyOut)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatNumber(item.previousStock)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                    {formatNumber(item.newStock)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.performedBy}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-28 text-center text-xs text-muted-foreground">
                  No stock movements match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing {filteredData.length} of {stockMovements.length} logged stock movements
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
