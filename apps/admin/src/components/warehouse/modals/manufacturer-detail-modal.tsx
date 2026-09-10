'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Factory,
  ArrowRight,
} from 'lucide-react';
import { useWarehouseStore, ManufacturerItem } from '@/stores/warehouse';
import { Progress } from '@/components/ui/progress';

interface ManufacturerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manufacturer: ManufacturerItem | null;
  onAssignProduction?: (mfg: ManufacturerItem) => void;
}

export function ManufacturerDetailModal({
  open,
  onOpenChange,
  manufacturer,
  onAssignProduction,
}: ManufacturerDetailModalProps) {
  const { productionOrders, qualityChecks, alerts } = useWarehouseStore();

  if (!manufacturer) return null;

  const activeOrders = productionOrders.filter(
    (p) => p.manufacturer === manufacturer.name && p.status !== 'Completed' && p.status !== 'Cancelled'
  );
  const completedOrders = productionOrders.filter(
    (p) => p.manufacturer === manufacturer.name && p.status === 'Completed'
  );
  const mfgQCs = qualityChecks.filter((q) => q.manufacturer === manufacturer.name);
  const mfgAlerts = alerts.filter(
    (a) => a.responsibleParty === manufacturer.name || a.product.includes(manufacturer.name)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <span>{manufacturer.name}</span>
                <Badge
                  className={
                    manufacturer.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 border-none'
                      : 'bg-amber-500/10 text-amber-600 border-none'
                  }
                >
                  {manufacturer.status}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {manufacturer.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {manufacturer.phone}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {manufacturer.email}</span>
              </DialogDescription>
            </div>
            {onAssignProduction && (
              <Button
                size="sm"
                className="text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onAssignProduction(manufacturer);
                }}
              >
                <Factory className="mr-1.5 h-3.5 w-3.5" /> Assign Order
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          <div className="p-3 bg-muted/30 rounded-lg border text-xs">
            <span className="text-muted-foreground">Quality Performance</span>
            <div className="flex items-center gap-1 mt-1 font-bold text-base text-foreground font-mono">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{manufacturer.qualityRating} / 5.0</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{mfgQCs.length} QC audits logged</span>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border text-xs">
            <span className="text-muted-foreground">Average Lead Time</span>
            <div className="font-bold text-base text-foreground font-mono mt-1">
              {manufacturer.averageLeadTime}
            </div>
            <span className="text-[10px] text-muted-foreground">OTD Rate: {manufacturer.onTimeDeliveryRate}%</span>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border text-xs">
            <span className="text-muted-foreground">Capacity Utilization</span>
            <div className="font-bold text-base text-foreground font-mono mt-1">
              {manufacturer.currentUtilization}%
            </div>
            <Progress value={manufacturer.currentUtilization} className="h-1.5 mt-1" />
          </div>

          <div className="p-3 bg-muted/30 rounded-lg border text-xs">
            <span className="text-muted-foreground">Contact Representative</span>
            <div className="font-bold text-sm text-foreground mt-1 truncate">
              {manufacturer.contactPerson}
            </div>
            <span className="text-[10px] text-muted-foreground">Primary Bay Liaison</span>
          </div>
        </div>

        {/* Current Active Production Orders */}
        <div className="space-y-2 mt-2">
          <h4 className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Active Production Orders ({activeOrders.length})</span>
            <span className="text-[11px] text-muted-foreground">{manufacturer.activeProductionOrders} planned capacity slots</span>
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px]">Order ID</TableHead>
                  <TableHead className="text-[11px]">Product</TableHead>
                  <TableHead className="text-[11px] text-right">Quantity</TableHead>
                  <TableHead className="text-[11px]">Progress</TableHead>
                  <TableHead className="text-[11px]">Expected</TableHead>
                  <TableHead className="text-[11px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-xs text-muted-foreground">
                      No active production orders currently running at this factory.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeOrders.map((order) => (
                    <TableRow key={order.id} className="text-xs">
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell className="font-medium text-foreground">{order.product}</TableCell>
                      <TableCell className="text-right font-mono">{order.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={order.progress} className="w-16 h-1.5" />
                          <span className="text-[11px] font-mono">{order.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">{order.plannedCompletionDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Delay & Quality Alert History */}
        {mfgAlerts.length > 0 && (
          <div className="space-y-2 mt-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> Recorded Delays & Issues ({mfgAlerts.length})
            </h4>
            <div className="space-y-1.5">
              {mfgAlerts.map((alt) => (
                <div key={alt.id} className="p-2.5 rounded-lg border bg-destructive/5 text-xs flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{alt.type}: {alt.product}</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">{alt.reason}</div>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">+{alt.daysDelayed}d delay</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
