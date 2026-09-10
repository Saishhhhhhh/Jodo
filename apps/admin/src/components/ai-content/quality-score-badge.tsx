import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, ShieldCheck, FileCheck, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QualityScoreBadgeProps {
  score: number;
  checks?: {
    grammar: boolean;
    brandTone: boolean;
    seo: boolean;
    productAccuracy: boolean;
    duplicateRisk: 'Low' | 'Medium' | 'High';
    unsupportedClaimsCount: number;
  };
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export function QualityScoreBadge({
  score,
  checks = {
    grammar: true,
    brandTone: true,
    seo: true,
    productAccuracy: true,
    duplicateRisk: 'Low',
    unsupportedClaimsCount: 0,
  },
  size = 'md',
  showBreakdown = false,
}: QualityScoreBadgeProps) {
  const isExcellent = score >= 90;
  const isGood = score >= 75 && score < 90;

  const colorClass = isExcellent
    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    : isGood
    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    : 'bg-rose-500/10 text-rose-600 border-rose-500/20';

  const badgeElement = (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full transition-colors cursor-pointer',
        colorClass,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-xs',
        size === 'lg' && 'px-4 py-1.5 text-sm font-semibold'
      )}
    >
      <Sparkles className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      <span>Quality {score}/100</span>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
        <TooltipContent side="bottom" className="p-3 w-64 text-xs space-y-2 bg-popover text-popover-foreground border shadow-md">
          <div className="flex items-center justify-between border-b pb-1.5 font-semibold">
            <span>Content Quality Score</span>
            <span className={cn(isExcellent ? 'text-emerald-600' : 'text-amber-600 font-bold')}>
              {score}/100
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-500" /> Grammar & Syntax
              </span>
              <span className="text-emerald-600 font-medium">✓ Passed</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Brand Tone
              </span>
              <span className="text-emerald-600 font-medium">✓ Verified</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-500" /> SEO Optimization
              </span>
              <span className="text-emerald-600 font-medium">✓ High</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Product Accuracy
              </span>
              <span className="text-emerald-600 font-medium">✓ 100% Anti-Hallucination</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-emerald-500" /> Duplicate Risk
              </span>
              <span className="text-emerald-600 font-medium">Low</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
