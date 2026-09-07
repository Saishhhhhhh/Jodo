'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Settings,
  PanelLeft,
  LogOut,
  User,
  HelpCircle,
  Moon,
  Sun,
  AlertTriangle,
  Package,
  CheckCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/auth';
import { useWarehouseStore } from '@/stores/warehouse';
import { getInitials } from '@/lib/utils';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const { alerts: warehouseAlerts, resolveAlert } = useWarehouseStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsApi.list({ state: 'unread' });
      return res.data.data;
    },
    refetchInterval: 60000, // Poll every minute
  });

  const activeWarehouseAlerts = useMemo(() => {
    return warehouseAlerts
      .filter((alt) => !alt.resolved)
      .map((alt) => ({
        _id: alt.id,
        title: `${alt.type}: ${alt.product}`,
        message: `${alt.reason} • Action: ${alt.recommendedAction}`,
        severity: alt.severity,
        createdAt: new Date().toISOString(),
        isWarehouse: true,
        metadata: {
          alertState: alt.severity === 'critical' ? 'CRITICAL' : 'WARNING',
          type: alt.type,
          entityId: alt.entityId,
        },
      }));
  }, [warehouseAlerts]);

  const allNotifications = useMemo(() => {
    const apiNotifs = notifications || [];
    return [...activeWarehouseAlerts, ...apiNotifs];
  }, [notifications, activeWarehouseAlerts]);

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const handleNotificationClick = (notif: any) => {
    if (notif.isWarehouse) {
      resolveAlert(notif._id);
      router.push('/warehouse');
      return;
    }
    markAsRead.mutate(notif._id);
    if (notif.type === 'inventory_alert') {
      if (notif.metadata?.alertState === 'Out of Stock') {
        router.push('/inventory?status=out_of_stock');
      } else if (notif.metadata?.alertState === 'Low Stock' || notif.metadata?.alertState === 'Critical Stock') {
        router.push('/inventory?status=low_stock');
      } else {
        router.push('/inventory');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <TooltipProvider>
      <header className="flex items-center h-14 px-4 gap-3 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 shrink-0">
        {/* Sidebar Toggle */}
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="shrink-0">
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Search (decorative in Phase 0) */}
        <button className="flex items-center gap-2.5 flex-1 max-w-sm h-8 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground hover:bg-accent/40 transition-colors text-left">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">Search...</span>
          <kbd className="hidden sm:flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
            <span>⌘</span>K
          </kbd>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {allNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {allNotifications.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">
                      {allNotifications.length}
                    </Badge>
                  )}
                </div>
                {allNotifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => markAllAsRead.mutate()} className="h-auto px-2 py-1 text-xs">
                    Mark all as read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {allNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs text-muted-foreground">You have no new notifications.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {allNotifications.map((notif: any) => (
                      <button
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className="flex flex-col gap-1 p-4 border-b hover:bg-muted/50 text-left transition-colors"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-sm line-clamp-1 flex items-center gap-2">
                            {notif.severity === 'critical' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                            {notif.severity === 'warning' && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                            {notif.severity === 'info' && <CheckCircle className="h-3 w-3 text-green-500" />}
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                        {notif.metadata?.alertState && (
                          <Badge variant="outline" className="mt-2 self-start text-[10px] uppercase">
                            {notif.metadata.alertState}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-2 border-t text-center bg-muted/20">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => router.push('/notifications')}>
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-1.5 pr-2.5 h-9">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {user?.name ? getInitials(user.name) : 'JD'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-medium leading-none">{user?.name || 'Admin'}</span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate max-w-[120px]">
                    {user?.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Docs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}
