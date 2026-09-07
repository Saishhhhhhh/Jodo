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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Star, MapPin, Eye, Factory, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { useWarehouseStore, ManufacturerItem } from '@/stores/warehouse';

interface ManufacturersTabProps {
  onOpenCreate: () => void;
}

export function ManufacturersTab({ onOpenCreate }: ManufacturersTabProps) {
  const { manufacturers, productionOrders, qualityChecks } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMfg, setSelectedMfg] = useState<ManufacturerItem | null>(null);

  const filteredData = useMemo(() => {
    return manufacturers.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.productCategories.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [manufacturers, searchTerm, statusFilter]);

  const getStatusBadge = (status: ManufacturerItem['status']) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Active</Badge>;
      case 'At Capacity':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">At Capacity</Badge>;
      case 'Temporarily Unavailable':
        return <Badge variant="destructive">Unavailable</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Orders and QC history for selected manufacturer
  const mfgOrders = selectedMfg
    ? productionOrders.filter((p) => p.manufacturer.toLowerCase().includes(selectedMfg.name.toLowerCase()))
    : [];
  const mfgQCs = selectedMfg
    ? qualityChecks.filter((q) => q.manufacturer.toLowerCase().includes(selectedMfg.name.toLowerCase()))
    : [];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search contract manufacturers, location, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="At Capacity">At Capacity</SelectItem>
              <SelectItem value="Temporarily Unavailable">Unavailable</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Manufacturer
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capabilities</TableHead>
              <TableHead>Capacity & Utilization</TableHead>
              <TableHead>Avg Lead Time</TableHead>
              <TableHead className="text-center">Quality</TableHead>
              <TableHead className="text-center">On-Time %</TableHead>
              <TableHead className="text-center">Active Orders</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((mfg) => (
                <TableRow key={mfg.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="font-semibold text-xs text-foreground">{mfg.name}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{mfg.id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-foreground">{mfg.contactPerson}</div>
                    <div className="text-[11px] text-muted-foreground">{mfg.phone}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{mfg.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {mfg.productCategories.map((p, idx) => (
                        <span
                          key={idx}
                          className="inline-block text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-mono font-medium">{mfg.productionCapacity}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-16 bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            mfg.currentUtilization >= 90 ? 'bg-destructive' : 'bg-primary'
                          }`}
                          style={{ width: `${mfg.currentUtilization}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {mfg.currentUtilization}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{mfg.averageLeadTime}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="gap-1 font-mono text-xs">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      {mfg.qualityRating.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono font-semibold text-xs text-green-600 dark:text-green-400">
                    {mfg.onTimeDeliveryRate}%
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-xs text-foreground">
                    {mfg.activeProductionOrders}
                  </TableCell>
                  <TableCell>{getStatusBadge(mfg.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setSelectedMfg(mfg)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-28 text-center text-xs text-muted-foreground">
                  No contract manufacturers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} contract manufacturers
      </div>

      {/* Manufacturer Details Sheet */}
      {selectedMfg && (
        <Sheet open={Boolean(selectedMfg)} onOpenChange={() => setSelectedMfg(null)}>
          <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-primary" />
                {selectedMfg.name}
              </SheetTitle>
              <SheetDescription>
                ID: {selectedMfg.id} • Located in {selectedMfg.location}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Performance Cards */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-muted/40 rounded-lg border">
                  <span className="text-[10px] uppercase text-muted-foreground block">Quality Rating</span>
                  <span className="text-base font-bold font-mono text-amber-500 flex items-center justify-center gap-1 mt-0.5">
                    <Star className="h-4 w-4 fill-amber-400" /> {selectedMfg.qualityRating.toFixed(1)}
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border">
                  <span className="text-[10px] uppercase text-muted-foreground block">On-Time Rate</span>
                  <span className="text-base font-bold font-mono text-green-600 dark:text-green-400 mt-0.5 block">
                    {selectedMfg.onTimeDeliveryRate}%
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg border">
                  <span className="text-[10px] uppercase text-muted-foreground block">Utilization</span>
                  <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                    {selectedMfg.currentUtilization}%
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider block">
                  Key Contact
                </span>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Person:</span>
                  <span className="font-medium text-foreground">{selectedMfg.contactPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-mono">{selectedMfg.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{selectedMfg.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Capacity:</span>
                  <span className="font-mono">{selectedMfg.productionCapacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard Lead Time:</span>
                  <span>{selectedMfg.averageLeadTime}</span>
                </div>
              </div>

              {/* Active & Historical Production Orders */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Production Runs ({mfgOrders.length})
                </span>
                {mfgOrders.length > 0 ? (
                  mfgOrders.map((ord) => (
                    <div key={ord.id} className="p-2.5 rounded-lg border bg-muted/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-foreground">{ord.id}</span>
                        <p className="text-muted-foreground text-[11px]">{ord.product}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold">{ord.completedQuantity} / {ord.quantity}</span>
                        <Badge variant="outline" className="text-[9px] ml-2">
                          {ord.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No current active runs.</p>
                )}
              </div>

              {/* Quality History */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Recent Quality Inspections ({mfgQCs.length})
                </span>
                {mfgQCs.length > 0 ? (
                  mfgQCs.map((qc) => (
                    <div key={qc.id} className="p-2.5 rounded-lg border bg-muted/10 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold">{qc.id} ({qc.batchNumber})</span>
                        <Badge
                          variant={qc.qcStatus === 'Passed' ? 'default' : 'secondary'}
                          className="text-[9px]"
                        >
                          {qc.qcStatus}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        Inspected: {qc.quantityInspected} • Passed: {qc.passedQuantity} • Failed: {qc.failedQuantity}
                      </p>
                      {qc.defectNotes && (
                        <p className="text-[10px] text-muted-foreground italic">&ldquo;{qc.defectNotes}&rdquo;</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No recorded QC reports.</p>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
