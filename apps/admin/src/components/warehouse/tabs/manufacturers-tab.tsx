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
import { Search, Plus, Star, Phone, Mail, MapPin } from 'lucide-react';
import { useWarehouseStore, ManufacturerItem } from '@/stores/warehouse';

interface ManufacturersTabProps {
  onOpenCreate: () => void;
}

export function ManufacturersTab({ onOpenCreate }: ManufacturersTabProps) {
  const { manufacturers } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredData = useMemo(() => {
    return manufacturers.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.products.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [manufacturers, searchTerm, statusFilter]);

  const getStatusBadge = (status: ManufacturerItem['status']) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Active</Badge>;
      case 'Under Audit':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Under Audit</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Inactive</Badge>;
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
              placeholder="Search manufacturers, products, locations..."
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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Under Audit">Under Audit</SelectItem>
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
              <TableHead>Contact Info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capabilities & Products</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead className="text-center">Quality Rating</TableHead>
              <TableHead className="text-center">Active Orders</TableHead>
              <TableHead className="text-center">Delayed</TableHead>
              <TableHead>Status</TableHead>
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
                    <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">{mfg.email}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{mfg.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {mfg.products.map((p, idx) => (
                        <span
                          key={idx}
                          className="inline-block text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{mfg.capacity}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{mfg.leadTime}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="gap-1 font-mono text-xs">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      {mfg.qualityRating.toFixed(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono font-semibold text-xs">
                    {mfg.activeOrders}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {mfg.delayedOrders > 0 ? (
                      <span className="text-destructive font-bold">{mfg.delayedOrders}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(mfg.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-28 text-center text-xs text-muted-foreground">
                  No manufacturers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} partner manufacturers
      </div>
    </div>
  );
}
