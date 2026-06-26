'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import type { DashboardMetric } from '@jodo/shared';

interface MetricCardProps {
  metric?: DashboardMetric;
  icon?: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({ metric, icon: Icon, isLoading, className }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metric) return null;

  const formattedValue = (() => {
    const v = typeof metric.value === 'number' ? metric.value : 0;
    if (metric.format === 'currency') return formatCurrency(v, metric.currency);
    if (metric.format === 'percentage') return formatPercentage(v);
    return formatNumber(v);
  })();

  const TrendIcon =
    metric.trend === 'up'
      ? TrendingUp
      : metric.trend === 'down'
        ? TrendingDown
        : Minus;

  const trendColor =
    metric.trend === 'up'
      ? 'text-green-500 dark:text-green-400'
      : metric.trend === 'down'
        ? 'text-red-500 dark:text-red-400'
        : 'text-muted-foreground';

  return (
    <Card className={cn('overflow-hidden group metric-glow cursor-default', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
              {metric.label}
            </p>
            <p className="text-2xl font-bold tracking-tight mt-1.5 text-foreground">
              {formattedValue}
            </p>
            {typeof metric.change === 'number' && (
              <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trendColor)}>
                <TrendIcon className="h-3.5 w-3.5" />
                <span>
                  {metric.change > 0 ? '+' : ''}
                  {metric.change.toFixed(1)}% vs last period
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="shrink-0 rounded-lg p-2.5 bg-primary/10 text-primary transition-all group-hover:bg-primary/15 group-hover:scale-110 duration-200">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
