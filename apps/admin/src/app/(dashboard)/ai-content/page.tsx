'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  Globe,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Timer,
  Layers,
  FileEdit,
  BookOpen,
  ShoppingBag,
  Megaphone,
} from 'lucide-react';
import { useAiContentStore } from '@/stores/ai-content';
import { QuickContentGenerator } from '@/components/ai-content/quick-content-generator';

export default function AiContentDashboardPage() {
  const router = useRouter();
  const { getKpis, activities, setActiveFilterStatus } = useAiContentStore();
  const kpis = getKpis();

  const handleKpiClick = (status: string) => {
    setActiveFilterStatus(status);
    if (status === 'Pending Review') {
      router.push('/ai-content/review-approval');
    } else if (status === 'Published' || status === 'Approved') {
      router.push('/ai-content/published');
    } else {
      router.push('/ai-content/drafts');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AI Content Generation
            </h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              JODO AI Atelier
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate, review, approve and publish AI-assisted product and marketing content.
          </p>
        </div>

        <Link href="/ai-content/product-descriptions">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            + Generate Content
          </Button>
        </Link>
      </div>

      {/* KPI Cards (Section 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Generated */}
        <div
          onClick={() => handleKpiClick('all')}
          className="bg-card border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Generated</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.totalGenerated}</div>
          <span className="text-[11px] text-muted-foreground mt-1 block">All drafts & live copy</span>
        </div>

        {/* Drafts */}
        <div
          onClick={() => handleKpiClick('Draft')}
          className="bg-card border rounded-xl p-5 shadow-sm hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.drafts}</div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">Needs review / edit</span>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => handleKpiClick('Pending Review')}
          className="bg-card border rounded-xl p-5 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.pendingReview}</div>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">Awaiting manager sign-off</span>
        </div>

        {/* Approved */}
        <div
          onClick={() => handleKpiClick('Approved')}
          className="bg-card border rounded-xl p-5 shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.approved}</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Ready to Publish to CMS</span>
        </div>

        {/* Published */}
        <div
          onClick={() => handleKpiClick('Published')}
          className="bg-card border rounded-xl p-5 shadow-sm hover:border-purple-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{kpis.published}</div>
          <span className="text-[11px] text-purple-600 font-medium mt-1 block">Live in CMS / Storefront</span>
        </div>
      </div>

      {/* Quick Content Generator (Section 3) */}
      <QuickContentGenerator />

      {/* Analytics & Content Distribution (Section 20) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Content Generated by Type breakdown */}
        <div className="lg:col-span-6 bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-sm text-foreground">Content Generated by Type</h3>
            <span className="text-xs text-muted-foreground">Portfolio Share</span>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { type: 'Product Description', percentage: 45, count: 112, color: 'bg-primary' },
              { type: 'Catalogue Content', percentage: 20, count: 50, color: 'bg-amber-500' },
              { type: 'Listing Copy', percentage: 20, count: 50, color: 'bg-blue-500' },
              { type: 'Campaign Content', percentage: 15, count: 36, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{item.count} items</span>
                    <span className="font-bold text-foreground">{item.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Supporting Metrics (Section 20) */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t text-xs">
            <div className="p-3 bg-muted/20 rounded-lg">
              <span className="text-muted-foreground block text-[11px]">Generated This Week</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block flex items-center gap-1">
                42 <TrendingUp className="w-3 h-3 text-emerald-500" />
              </span>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg">
              <span className="text-muted-foreground block text-[11px]">Approval Rate</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block flex items-center gap-1">
                94.2% <Percent className="w-3 h-3" />
              </span>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg">
              <span className="text-muted-foreground block text-[11px]">Avg Review Time</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block flex items-center gap-1">
                2.4h <Timer className="w-3 h-3 text-blue-500" />
              </span>
            </div>
          </div>
        </div>

        {/* Recent AI Content Activity (Section 21) */}
        <div className="lg:col-span-6 bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-sm text-foreground">Recent AI Content Activity</h3>
            <Link href="/ai-content/drafts" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {activities.slice(0, 5).map((act) => {
              const isGen = act.type === 'generated';
              const isPub = act.type === 'published';
              const isAppr = act.type === 'approved';

              return (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isPub
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : isAppr
                          ? 'bg-purple-500/10 text-purple-600'
                          : isGen
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      {isPub ? (
                        <Globe className="w-3 h-3" />
                      ) : isAppr ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground leading-snug">{act.activity}</p>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block">
                        by {act.user}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground shrink-0">
                    <span>{act.date}</span>
                    <span className="block">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
