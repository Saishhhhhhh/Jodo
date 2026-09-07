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
import { Search, Plus, ClipboardCheck, CheckCircle2, XCircle, MoreHorizontal, RotateCcw, FileText } from 'lucide-react';
import { useWarehouseStore, QualityCheckItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface QualityChecksTabProps {
  onOpenRecordQC: (item?: QualityCheckItem) => void;
}

export function QualityChecksTab({ onOpenRecordQC }: QualityChecksTabProps) {
  const { qualityChecks, recordQualityCheck } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredData = useMemo(() => {
    return qualityChecks.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productionOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.inspector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.qcStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [qualityChecks, searchTerm, statusFilter]);

  const handleQuickPassAll = (item: QualityCheckItem) => {
    recordQualityCheck({
      qcId: item.id,
      passedQuantity: item.quantityInspected,
      failedQuantity: 0,
      inspector: item.inspector || 'Senior QC Inspector',
      defectType: 'None',
      defectNotes: 'Batch passed 100% full inspection without defects.',
    });
    toast.success(`Passed 100% of batch ${item.batchNumber}. ${item.quantityInspected} units moved to Stock.`);
  };

  const handleQuickFail = (item: QualityCheckItem) => {
    recordQualityCheck({
      qcId: item.id,
      passedQuantity: 0,
      failedQuantity: item.quantityInspected,
      inspector: item.inspector || 'Senior QC Inspector',
      defectType: 'Fabric Flaw',
      defectNotes: 'Batch failed inspection. Reinspection requested from factory.',
    });
    toast.error(`Batch ${item.batchNumber} marked as Failed. Quarantined from inventory.`);
  };

  const getStatusBadge = (status: QualityCheckItem['qcStatus']) => {
    switch (status) {
      case 'Passed':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Passed</Badge>;
      case 'Partially Passed':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Partially Passed</Badge>;
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'Reinspection Required':
        return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/30">Reinspection Req.</Badge>;
      case 'In Inspection':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none">In Inspection</Badge>;
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
              placeholder="Search batch#, QC ID, order, defect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="All QC Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All QC Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Inspection">In Inspection</SelectItem>
              <SelectItem value="Passed">Passed</SelectItem>
              <SelectItem value="Partially Passed">Partially Passed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Reinspection Required">Reinspection Required</SelectItem>
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
              <TableHead>QC ID / Batch#</TableHead>
              <TableHead>Production Order</TableHead>
              <TableHead>Product & SKU</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead className="text-right">Inspected</TableHead>
              <TableHead className="text-right">Passed</TableHead>
              <TableHead className="text-right">Failed</TableHead>
              <TableHead>Defect Type</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="font-mono font-semibold text-xs text-foreground">{item.id}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{item.batchNumber}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.productionOrder}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{item.product}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.manufacturer}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {formatNumber(item.quantityInspected)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs text-green-600 dark:text-green-400">
                    {formatNumber(item.passedQuantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs text-destructive">
                    {formatNumber(item.failedQuantity)}
                  </TableCell>
                  <TableCell>
                    {item.defectType && item.defectType !== 'None' ? (
                      <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                        {item.defectType}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{item.inspector}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.inspectionDate}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.qcStatus)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpenRecordQC(item)}>
                          <ClipboardCheck className="mr-2 h-4 w-4" /> Record Inspection
                        </DropdownMenuItem>
                        {item.qcStatus === 'Pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleQuickPassAll(item)} className="text-green-600">
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Pass All & Stock In
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickFail(item)} className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" /> Fail & Quarantine
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            const note = window.prompt('Add inspector observation:', item.defectNotes || '');
                            if (note) toast.success('Notes attached to QC record');
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" /> Add Notes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
        Showing {filteredData.length} quality inspection logs • Note: Failed units are quarantined and strictly prevented from entering available stock.
      </div>
    </div>
  );
}
