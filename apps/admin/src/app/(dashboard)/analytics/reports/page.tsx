'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, ArrowRight, FileText, Download } from 'lucide-react';

export default function AnalyticsReportsPage() {
  return (
    <div className="p-6 animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Executive Performance Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Access automated digests, daily and weekly metrics, and AI performance reports.
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Auto-Reporting & Digest Center</CardTitle>
              <CardDescription>
                Full real-time breakdown across Sales, Leads, Inventory, Orders, and Follow-ups with AI summaries.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/80 leading-relaxed">
            All detailed operational reporting is consolidated inside the Auto-Reporting & Digest system. You can generate on-demand AI executive summaries, view granular daily and weekly comparisons, and export CSV reports.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="gap-2">
              <Link href="/reports">
                Open Auto-Reporting & Digest
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/analytics/sales">
                <FileText className="w-4 h-4" />
                View Sales Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
