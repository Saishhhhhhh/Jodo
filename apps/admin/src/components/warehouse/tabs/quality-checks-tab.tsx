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
import { Search, Plus, ClipboardCheck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useWarehouseStore, QualityCheckItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';

interface QualityChecksTabProps {
  onOpenRecordQC: (item?: QualityCheckItem) => void;
}

export function QualityChecksTab({ onOpenRecordQC }: QualityChecksTabProps) {
  const { qualityChecks } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredData = useMemo(() => {
    return qualityChecks.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productionOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inspector.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [qualityChecks, searchTerm, statusFilter]);

  const getStatusBadge = (status: QualityCheckItem['status']) => {
    switch (status) {
      case 'Passed':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Passed</Badge>;
      case 'Partially Passed':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Partially Passed</Badge>;
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none">In Progress</Badge>;
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>;
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
              placeholder="Search QC ID, product, inspector, order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="All QC Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All QC Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Passed">Passed</SelectItem>
              <SelectItem value="Partially Passed">Partially Passed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => onOpenRecordQC()} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Record Inspection
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>QC ID</TableHead>
              <TableHead>Production Order</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Passed</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead className="text-right">Damaged</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>QC Date</TableHead>
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
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.productionOrder}
                  </TableCell>
                  <TableCell className="font-medium text-xs text-foreground">
                    {item.product}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.manufacturer}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {formatNumber(item.received)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs text-green-600 dark:text-green-400">
                    {formatNumber(item.passed)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-amber-600 dark:text-amber-400">
                    {formatNumber(item.failed)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-destructive">
                    {formatNumber(item.damaged)}
                  </TableCell>
                  <TableCell className="text-xs">{item.inspector}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.qcDate}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => onOpenRecordQC(item)}
                    >
                      <ClipboardCheck className="h-3.5 w-3.5" /> Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="h-28 text-center text-xs text-muted-foreground">
                  No quality check records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} quality inspection logs
      </div>
    </div>
  );
}
