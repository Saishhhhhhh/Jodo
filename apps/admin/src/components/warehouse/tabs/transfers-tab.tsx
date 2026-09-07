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
import { Search, Plus, ArrowRight, PackageCheck } from 'lucide-react';
import { useWarehouseStore, TransferItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface TransfersTabProps {
  onOpenCreate: () => void;
}

export function TransfersTab({ onOpenCreate }: TransfersTabProps) {
  const { transfers, receiveTransfer } = useWarehouseStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return transfers.filter((item) => {
      return (
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fromWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.toWarehouse.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [transfers, searchTerm]);

  const handleReceive = (item: TransferItem) => {
    receiveTransfer(item.id);
    toast.success(`Transfer ${item.id} received at ${item.toWarehouse}`);
  };

  const getStatusBadge = (status: TransferItem['status']) => {
    switch (status) {
      case 'Received':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Received</Badge>;
      case 'In Transit':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">In Transit</Badge>;
      case 'Approved':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none">Approved</Badge>;
      case 'Requested':
        return <Badge variant="secondary">Requested</Badge>;
      case 'Draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search transfer ID, warehouse, product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Button onClick={onOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New Transfer
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer ID</TableHead>
              <TableHead>From Warehouse</TableHead>
              <TableHead>To Warehouse</TableHead>
              <TableHead>Product & SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Transfer Date</TableHead>
              <TableHead>Expected Arrival</TableHead>
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
                  <TableCell className="text-xs">{item.fromWarehouse}</TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      {item.toWarehouse}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{item.product}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                    {formatNumber(item.quantity)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.transferDate}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.expectedArrival}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    {item.status === 'In Transit' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleReceive(item)}
                      >
                        <PackageCheck className="h-3.5 w-3.5" /> Receive
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
                  No transfers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} inter-warehouse transfers
      </div>
    </div>
  );
}
