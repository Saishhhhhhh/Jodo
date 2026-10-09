'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Factory,
  ClipboardCheck,
  Package,
  CheckSquare,
  ArrowRight,
  ChevronRight,
  Plus,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useWarehouseStore } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';

interface WarehouseLifecycleFlowProps {
  onOpenProcurement?: () => void;
  onOpenProduction?: () => void;
  onOpenQC?: () => void;
  onOpenAdjust?: () => void;
  onOpenProcessGuide?: () => void;
}

export function WarehouseLifecycleFlow({
  onOpenProcurement,
  onOpenProduction,
  onOpenQC,
  onOpenAdjust,
  onOpenProcessGuide,
}: WarehouseLifecycleFlowProps) {
  const router = useRouter();
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const {
    procurements,
    productionOrders,
    qualityChecks,
    stock,
    fulfilments,
    manufacturers,
  } = useWarehouseStore();

  // Metrics for each stage
  const activePOs = procurements.filter((p) => p.status !== 'Received' && p.status !== 'Cancelled');
  const poInTransit = procurements.filter((p) => p.status === 'In Transit');
  const activeBatches = productionOrders.filter((p) => p.status === 'In Production' || p.status === 'Scheduled');
  const unitsInProduction = activeBatches.reduce((acc, o) => acc + (o.quantity - o.completedQuantity), 0);
  const pendingQC = qualityChecks.filter((q) => q.qcStatus === 'Pending' || q.qcStatus === 'In Inspection');
  const passedQCLast30 = qualityChecks.filter((q) => q.qcStatus === 'Passed').length;
  const totalStockUnits = stock.reduce((acc, s) => acc + s.stockInHand, 0);
  const availableStockUnits = stock.reduce((acc, s) => acc + s.available, 0);
  const reservedStockUnits = stock.reduce((acc, s) => acc + s.reserved, 0);
  const lowStockCount = stock.filter((s) => s.available <= s.reorderLevel).length;
  const readyFulfilments = fulfilments.filter(
    (f) => f.finalStatus === 'Ready for Fulfilment' || f.finalStatus === 'Almost Ready'
  );
  const dispatchedToday = fulfilments.filter((f) => f.finalStatus === 'Dispatched').length;

  const stages = [
    {
      id: 'procurement',
      step: '01',
      title: 'Inbound Procurement',
      subtitle: 'Raw Materials & POs',
      icon: Truck,
      color: 'blue',
      badge: `${activePOs.length} Active POs`,
      highlight: `${poInTransit.length} In Transit`,
      route: '/warehouse/procurement',
      description: 'Order raw fabrics, trims, and finished goods from suppliers. Stock enters the warehouse at the dock.',
      primaryActionLabel: '+ Create Purchase Order',
      onPrimaryAction: onOpenProcurement,
      metrics: [
        { label: 'Active POs', value: activePOs.length },
        { label: 'Shipments in Transit', value: poInTransit.length },
        { label: 'Total Inbound Value', value: '₹14.8L' },
      ],
      quickTip: 'Tip: When vendor trucks arrive at the unloading bay, open Procurement to mark goods as Received.',
    },
    {
      id: 'manufacturing',
      step: '02',
      title: 'Factory Production',
      subtitle: 'Work Orders & Assembly',
      icon: Factory,
      color: 'indigo',
      badge: `${activeBatches.length} Active Runs`,
      highlight: `${formatNumber(unitsInProduction)} units`,
      route: '/warehouse/production-orders',
      description: 'Send materials to contract manufacturers or assembly lines. Track cutting, sewing, and assembly in real time.',
      primaryActionLabel: '+ New Work Order',
      onPrimaryAction: onOpenProduction,
      metrics: [
        { label: 'Active Batches', value: activeBatches.length },
        { label: 'Units Under Production', value: formatNumber(unitsInProduction) },
        { label: 'Contract Factories', value: manufacturers.length },
      ],
      quickTip: 'Tip: Use Production Tracking to see live stages (Cutting → Sewing → Ironing → Final Packing).',
    },
    {
      id: 'quality',
      step: '03',
      title: 'Quality Assurance',
      subtitle: 'Batch Inspection Gates',
      icon: ClipboardCheck,
      color: 'amber',
      badge: `${pendingQC.length} Pending QC`,
      highlight: `${passedQCLast30} Passed Recently`,
      route: '/warehouse/quality-checks',
      description: 'Strict gatekeeper audit. Technicians inspect random sample items for defects before clearing them for storage.',
      primaryActionLabel: '+ Record QC Check',
      onPrimaryAction: onOpenQC,
      metrics: [
        { label: 'Batches Awaiting QC', value: pendingQC.length },
        { label: 'QC Pass Rate', value: '96.4%' },
        { label: 'Tolerance Gates', value: '6 Checkpoints' },
      ],
      quickTip: 'Tip: Products cannot enter stock or be sold until they pass this quality gate.',
    },
    {
      id: 'inventory',
      step: '04',
      title: 'Stock-in-Hand',
      subtitle: 'Shelf Bins & Balances',
      icon: Package,
      color: 'emerald',
      badge: `${formatNumber(availableStockUnits)} Available`,
      highlight: `${lowStockCount} Low Stock`,
      route: '/warehouse/stock-in-hand',
      description: 'Physical inventory placed on warehouse racks across hubs. Balances on-hand vs reserved for online orders.',
      primaryActionLabel: '+ Adjust Stock',
      onPrimaryAction: onOpenAdjust,
      metrics: [
        { label: 'Total On-Hand', value: formatNumber(totalStockUnits) },
        { label: 'Available for Sale', value: formatNumber(availableStockUnits) },
        { label: 'Reserved for Orders', value: formatNumber(reservedStockUnits) },
      ],
      quickTip: 'Tip: Available = On-Hand minus Reserved. When Available drops below Reorder Level, order more in Step 01.',
    },
    {
      id: 'fulfilment',
      step: '05',
      title: 'Order Fulfilment',
      subtitle: 'Pick, Pack & Dispatch',
      icon: CheckSquare,
      color: 'teal',
      badge: `${readyFulfilments.length} Ready to Ship`,
      highlight: `${dispatchedToday} Dispatched Today`,
      route: '/warehouse/fulfilment-readiness',
      description: 'Verify 6 fulfilment conditions before shipping: inventory confirmed, QC cleared, boxed, and labelled for couriers.',
      primaryActionLabel: 'View Fulfilment Queue',
      onPrimaryAction: () => router.push('/warehouse/fulfilment-readiness'),
      metrics: [
        { label: 'Orders Ready to Ship', value: readyFulfilments.length },
        { label: 'Condition Gates', value: '6 Complete' },
        { label: 'Dispatched Today', value: dispatchedToday },
      ],
      quickTip: 'Tip: Once packaged and courier barcode is affixed, click "Dispatch" to deduct inventory and notify customer.',
    },
  ];

  const currentStage = stages[activeStageIndex];
  const CurrentIcon = currentStage.icon;

  return (
    <Card className="border shadow-sm overflow-hidden bg-gradient-to-b from-card to-muted/20">
      <CardHeader className="pb-3 border-b bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>The Warehouse Operational Journey</span>
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                5 Simple Steps
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Click any stage below to inspect what happens, see live counts, or take quick actions.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenProcessGuide && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5 border-primary/30 hover:bg-primary/10 text-primary"
                onClick={onOpenProcessGuide}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>How Warehouse Works Guide</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Visual 5-Step Pipeline Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {stages.map((st, index) => {
            const IconComponent = st.icon;
            const isSelected = index === activeStageIndex;

            return (
              <div
                key={st.id}
                onClick={() => setActiveStageIndex(index)}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                    : 'border-border/60 bg-card hover:bg-muted/40 hover:border-border'
                }`}
              >
                {/* Step number and Icon */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    STEP {st.step}
                  </span>
                  <div
                    className={`p-1 rounded-md transition-colors ${
                      isSelected
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-primary'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="my-2.5">
                  <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                    {st.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {st.subtitle}
                  </div>
                </div>

                {/* Badge / highlight */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-foreground/90 font-mono truncate">
                    {st.badge}
                  </span>
                  <ChevronRight
                    className={`h-3 w-3 transition-transform ${
                      isSelected
                        ? 'text-primary translate-x-0.5'
                        : 'text-muted-foreground/50 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Spotlight Box */}
        <div className="p-4 sm:p-5 rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                <CurrentIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">
                    Step {currentStage.step} Spotlight
                  </Badge>
                  <h3 className="font-bold text-sm sm:text-base text-foreground">
                    {currentStage.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                  {currentStage.description}
                </p>
              </div>
            </div>

            {/* Stage Actions */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {currentStage.onPrimaryAction && (
                <Button
                  size="sm"
                  className="text-xs h-8 gap-1.5 shadow-sm"
                  onClick={currentStage.onPrimaryAction}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{currentStage.primaryActionLabel}</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1"
                onClick={() => router.push(currentStage.route)}
              >
                <span>Open {currentStage.title}</span>
                <ExternalLink className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </div>

          {/* Quick Metrics for this stage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50">
            {currentStage.metrics.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-muted/30 border border-border/40">
                <div className="text-[10px] text-muted-foreground font-medium">{m.label}</div>
                <div className="font-mono font-bold text-sm sm:text-base text-foreground mt-0.5">
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Helper tip for beginners */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-primary/5 border border-primary/10 p-2.5 rounded-lg">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{currentStage.quickTip}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
