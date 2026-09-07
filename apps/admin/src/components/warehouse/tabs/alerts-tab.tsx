'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  Search,
  ShieldAlert,
  Truck,
  RotateCcw,
  Factory,
  ClipboardCheck,
} from 'lucide-react';
import { useWarehouseStore, DelayAlertItem } from '@/stores/warehouse';
import { toast } from 'sonner';

interface AlertsTabProps {
  onTabChange: (tab: string) => void;
}

export function AlertsTab({ onTabChange }: AlertsTabProps) {
  const { alerts, resolveAlert } = useWarehouseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alt) => {
      const matchSearch =
        alt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'ALL' || alt.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [alerts, searchTerm, typeFilter]);

  const handleAction = (alt: DelayAlertItem) => {
    switch (alt.type) {
      case 'Out of Stock':
      case 'Low Stock':
        onTabChange('stock');
        break;
      case 'Production Delay':
        onTabChange('production-orders');
        break;
      case 'QC Failure':
        onTabChange('quality-checks');
        break;
      case 'Procurement Delay':
        onTabChange('procurement');
        break;
      case 'Incoming Shipment Delay':
        onTabChange('incoming-stock');
        break;
      case 'Transfer Delay':
      case 'Fulfilment Risk':
        onTabChange('transfers');
        break;
      default:
        resolveAlert(alt.id);
        toast.success(`Alert acknowledged: ${alt.title}`);
    }
  };

  const getTypeIcon = (type: DelayAlertItem['type']) => {
    switch (type) {
      case 'Low Stock':
      case 'Out of Stock':
        return <Package className="h-4 w-4 text-destructive" />;
      case 'Production Delay':
        return <Factory className="h-4 w-4 text-amber-500" />;
      case 'QC Failure':
        return <ClipboardCheck className="h-4 w-4 text-destructive" />;
      case 'Procurement Delay':
      case 'Incoming Shipment Delay':
        return <Truck className="h-4 w-4 text-amber-500" />;
      case 'Transfer Delay':
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case 'Fulfilment Risk':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
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
              placeholder="Search alerts, SKUs, vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-56 h-9 text-xs">
              <SelectValue placeholder="All Alert Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Alert Categories</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              <SelectItem value="Production Delay">Production Delay</SelectItem>
              <SelectItem value="Procurement Delay">Procurement Delay</SelectItem>
              <SelectItem value="QC Failure">QC Failure</SelectItem>
              <SelectItem value="Incoming Shipment Delay">Incoming Shipment Delay</SelectItem>
              <SelectItem value="Transfer Delay">Transfer Delay</SelectItem>
              <SelectItem value="Fulfilment Risk">Fulfilment Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-muted-foreground">
          {filteredAlerts.filter((a) => !a.resolved).length} unresolved alerts
        </span>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alt) => (
            <Card
              key={alt.id}
              className={`transition-all border ${
                alt.resolved ? 'opacity-60 bg-muted/20' : 'bg-card'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        alt.severity === 'critical'
                          ? 'bg-destructive/10'
                          : alt.severity === 'warning'
                          ? 'bg-amber-500/10'
                          : 'bg-primary/10'
                      }`}
                    >
                      {getTypeIcon(alt.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {alt.title}
                        </span>
                        <Badge
                          variant={alt.severity === 'critical' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {alt.type}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Ref: {alt.entityId}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {alt.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                        <Clock className="h-3 w-3" /> Reported {alt.timestamp}
                        {alt.resolved && (
                          <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1 ml-2">
                            <CheckCircle2 className="h-3 w-3" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!alt.resolved ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            resolveAlert(alt.id);
                            toast.success('Alert marked as resolved');
                          }}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleAction(alt)}
                        >
                          {alt.actionText} <ExternalLink className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Archived
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-xs text-muted-foreground">
              No delays or operational alerts found matching current filters.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
