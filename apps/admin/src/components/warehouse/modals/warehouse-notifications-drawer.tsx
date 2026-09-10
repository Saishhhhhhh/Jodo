'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  AlertTriangle,
  Package,
  Truck,
  Factory,
  ClipboardCheck,
  CheckSquare,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useWarehouseStore, WarehouseNotificationItem } from '@/stores/warehouse';

interface WarehouseNotificationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WarehouseNotificationsDrawer({
  open,
  onOpenChange,
}: WarehouseNotificationsDrawerProps) {
  const router = useRouter();
  const { notifications, dismissNotification, markAllNotificationsRead } = useWarehouseStore();

  const getNotificationIcon = (type: WarehouseNotificationItem['type']) => {
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return <Package className="h-4 w-4 text-destructive" />;
      case 'po_delayed':
      case 'stock_received':
        return <Truck className="h-4 w-4 text-amber-500" />;
      case 'prod_delayed':
      case 'prod_completed':
      case 'mfg_delayed':
        return <Factory className="h-4 w-4 text-primary" />;
      case 'qc_failed':
      case 'qc_waiting':
        return <ClipboardCheck className="h-4 w-4 text-destructive" />;
      case 'fulfilment_ready':
        return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: WarehouseNotificationItem['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="text-[10px]">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px]">Warning</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">Info</Badge>;
    }
  };

  const handleNavigate = (link?: string) => {
    if (link) {
      onOpenChange(false);
      router.push(link);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between pr-4">
            <SheetTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>Warehouse Operational Alerts</span>
            </SheetTitle>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={markAllNotificationsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
          <SheetDescription className="text-xs">
            Real-time supply chain trigger notifications, delay alerts & quality escalations.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 py-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs space-y-2">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500/60" />
              <p>All warehouse operations clear. No unhandled alerts.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-lg border transition-all text-xs space-y-2 ${
                  !notif.read ? 'bg-muted/40 border-primary/20' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-muted">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground text-xs leading-none">
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-muted-foreground">{notif.timestamp}</span>
                    </div>
                  </div>
                  {getSeverityBadge(notif.severity)}
                </div>

                <p className="text-muted-foreground text-xs leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => dismissNotification(notif.id)}
                  >
                    Dismiss
                  </Button>
                  {notif.link && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleNavigate(notif.link)}
                    >
                      <ExternalLink className="mr-1 h-3 w-3" /> View Order
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
