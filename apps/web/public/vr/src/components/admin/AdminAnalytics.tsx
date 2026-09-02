'use client';

import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  QrCode,
  Eye,
  Smartphone,
  MessageCircle,
  RefreshCw,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

interface AnalyticsData {
  totalScans: number;
  totalPageViews: number;
  totalARClicks: number;
  totalEnquiries: number;
  deviceBreakdown: { device: string; count: number }[];
  productScans: { slug: string; count: number }[];
  eventBreakdown: { event: string; count: number }[];
  recentEvents: {
    id: string;
    slug: string | null;
    eventType: string;
    deviceType: string;
    timestamp: string;
  }[];
}

export default function AdminAnalytics() {
  const { navigateTo } = useAppStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchAnalytics);
  }, [fetchAnalytics]);

  const statCards = data
    ? [
        { label: 'QR Scans', value: data.totalScans, icon: QrCode, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { label: 'Page Views', value: data.totalPageViews, icon: Eye, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
        { label: 'AR Clicks', value: data.totalARClicks, icon: Smartphone, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
        { label: 'Enquiries', value: data.totalEnquiries, icon: MessageCircle, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigateTo('admin')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="mt-1 text-muted-foreground">Track QR scans, AR usage, and engagement</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Device Breakdown */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data && data.deviceBreakdown.length > 0 ? (
              <div className="space-y-3">
                {data.deviceBreakdown.map((d) => {
                  const total = data.deviceBreakdown.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                  return (
                    <div key={d.device} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize font-medium">{d.device || 'Unknown'}</span>
                        <span className="text-muted-foreground">{d.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No device data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Event Breakdown */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Event Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data && data.eventBreakdown.length > 0 ? (
              <div className="space-y-3">
                {data.eventBreakdown.map((e) => {
                  const maxCount = Math.max(...data.eventBreakdown.map(x => x.count));
                  const pct = maxCount > 0 ? Math.round((e.count / maxCount) * 100) : 0;
                  return (
                    <div key={e.event} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{e.event.replace(/_/g, ' ')}</span>
                        <span className="text-muted-foreground">{e.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No event data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Scans Table */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Top Products by QR Scans
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : data && data.productScans.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Product Slug</TableHead>
                  <TableHead className="text-right">Scans</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.productScans.map((p, i) => (
                  <TableRow key={p.slug}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">/{p.slug}</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{p.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No scan data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : data && data.recentEvents.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Device</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentEvents.slice(0, 20).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {event.eventType.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.slug ? `/${event.slug}` : '—'}
                      </TableCell>
                      <TableCell className="capitalize text-xs">{event.deviceType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No events recorded yet</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
