'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Package,
  TrendingUp,
  Box
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('All');
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications-all'],
    queryFn: async () => {
      // By default the API returns unread/read/dismissed unless state='all'
      // If they click 'Resolved', we'd need to pass state='resolved'
      const params: any = {};
      if (filter === 'Resolved') {
        params.state = 'resolved';
      } else {
        params.state = 'all';
      }
      const res = await notificationsApi.list(params);
      return res.data.data;
    },
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-all'] });
    }
  });

  const dismiss = useMutation({
    mutationFn: (id: string) => notificationsApi.dismiss(id),
    onSuccess: () => {
      toast.success('Notification dismissed');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-all'] });
    }
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-all'] });
    }
  });

  const filters = ['All', 'Low Stock', 'Critical', 'Out of Stock', 'High Demand', 'Reservations', 'Resolved'];

  const filteredNotifications = React.useMemo(() => {
    if (!notifications) return [];
    if (filter === 'All' || filter === 'Resolved') return notifications;
    
    return notifications.filter((n: any) => {
      if (filter === 'Low Stock' && n.metadata?.alertState === 'Low Stock') return true;
      if (filter === 'Critical' && n.metadata?.alertState === 'Critical Stock') return true;
      if (filter === 'Out of Stock' && n.metadata?.alertState === 'Out of Stock') return true;
      if (filter === 'High Demand' && n.metadata?.demandLevel && ['High', 'Very High'].includes(n.metadata.demandLevel)) return true;
      if (filter === 'Reservations' && n.type === 'reservation_alert') return true;
      return false;
    });
  }, [notifications, filter]);

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your inventory alerts and system notifications.
          </p>
        </div>
        <Button onClick={() => markAllAsRead.mutate()} variant="outline">
          Mark all as read
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap pb-2">
        {filters.map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="rounded-full"
          >
            {f}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-sm text-muted-foreground">You don't have any notifications matching this filter.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notif: any) => (
                <div 
                  key={notif._id} 
                  className={`p-4 flex gap-4 transition-colors hover:bg-muted/30 ${notif.state === 'unread' ? 'bg-primary/5' : ''}`}
                >
                  <div className="shrink-0 pt-1">
                    {notif.severity === 'critical' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : notif.severity === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold text-sm ${notif.state === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-4">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {/* Metadata Badges */}
                    {notif.metadata && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {notif.metadata.sku && (
                          <Badge variant="secondary" className="text-[10px] font-mono"><Package className="h-3 w-3 mr-1"/> {notif.metadata.sku}</Badge>
                        )}
                        {notif.metadata.location && (
                          <Badge variant="secondary" className="text-[10px]"><Box className="h-3 w-3 mr-1"/> {notif.metadata.location}</Badge>
                        )}
                        {notif.metadata.alertState && (
                          <Badge variant="outline" className="text-[10px] uppercase border-primary/20 text-primary">{notif.metadata.alertState}</Badge>
                        )}
                        {notif.metadata.demandLevel && ['High', 'Very High'].includes(notif.metadata.demandLevel) && (
                          <Badge variant="outline" className="text-[10px] uppercase border-purple-200 text-purple-700 bg-purple-50">
                            <TrendingUp className="h-3 w-3 mr-1" /> High Demand
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {notif.state === 'unread' && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead.mutate(notif._id)} className="text-xs h-8">
                        Mark read
                      </Button>
                    )}
                    {notif.state !== 'dismissed' && notif.state !== 'resolved' && (
                      <Button variant="ghost" size="sm" onClick={() => dismiss.mutate(notif._id)} className="text-xs h-8 text-muted-foreground">
                        Dismiss
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
