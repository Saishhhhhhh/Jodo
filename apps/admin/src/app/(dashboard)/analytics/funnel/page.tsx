'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Users, CheckCircle2, ShoppingBag, CreditCard, Truck } from 'lucide-react';

const STAGE_ICONS = [Users, Filter, ShoppingBag, CreditCard, Truck];

export default function AnalyticsFunnelPage() {
  const { data: funnelRes, isLoading } = useQuery({
    queryKey: ['analytics', 'funnel'],
    queryFn: async () => {
      const res = await analyticsApi.funnel();
      return res.data?.data;
    },
  });

  const stages = funnelRes?.stages || [];

  return (
    <div className="p-6 animate-fade-in space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversion Funnel</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          End-to-end customer journey from initial lead inquiry to delivery.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          stages.map((stageItem: any, idx: number) => {
            const Icon = STAGE_ICONS[idx % STAGE_ICONS.length];
            return (
              <Card key={idx} className="border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Stage {idx + 1}
                      </div>
                      <h3 className="text-base font-semibold text-foreground">
                        {stageItem.stage}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{stageItem.count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Volume</div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-sm font-bold text-primary">{stageItem.rate}</div>
                      <div className="text-xs text-muted-foreground">Conversion</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
