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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, Package, RefreshCw } from 'lucide-react';
import { useWarehouseStore, StockItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';

interface StockTabProps {
  onOpenAdjust: (item: StockItem) => void;
}

export function StockTab({ onOpenAdjust }: StockTabProps) {
  const { stock } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredData = useMemo(() => {
    return stock.filter((item) => {
      const matchSearch =
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase());

      const matchWarehouse = warehouseFilter === 'ALL' || item.warehouse === warehouseFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchWarehouse && matchStatus;
    });
  }, [stock, searchTerm, warehouseFilter, statusFilter]);

  const getStatusBadge = (status: StockItem['status']) => {
    switch (status) {
      case 'Healthy':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Healthy</Badge>;
      case 'Low Stock':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Low Stock</Badge>;
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'Out of Stock':
        return <Badge variant="destructive" className="font-bold">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              placeholder="Search product, SKU, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="All Stock Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stock Levels</SelectItem>
              <SelectItem value="Healthy">Healthy</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground font-mono bg-muted/40 px-3 py-1.5 rounded-md border">
          Formula: <span className="font-semibold text-foreground">Available = In-Hand - Reserved - Hold</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead className="text-right">Stock-in-Hand</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Hold</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Incoming</TableHead>
              <TableHead className="text-right">Reorder Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-muted/60 flex items-center justify-center shrink-0 border">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-semibold text-xs text-foreground truncate max-w-[200px]">
                        {item.product}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.sku}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{item.warehouse}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                    {formatNumber(item.stockInHand)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatNumber(item.reserved)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-amber-600 dark:text-amber-400">
                    {formatNumber(item.hold)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs">
                    <span
                      className={
                        item.available <= 0
                          ? 'text-destructive font-extrabold'
                          : item.available <= item.reorderLevel
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-green-600 dark:text-green-400'
                      }
                    >
                      {formatNumber(item.available)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-blue-600 dark:text-blue-400">
                    +{formatNumber(item.incoming)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {formatNumber(item.reorderLevel)}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.updated}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => onOpenAdjust(item)}
                    >
                      <SlidersHorizontal className="h-3 w-3" /> Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="h-28 text-center text-xs text-muted-foreground">
                  No stock items match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} of {stock.length} inventory records
      </div>
    </div>
  );
}
