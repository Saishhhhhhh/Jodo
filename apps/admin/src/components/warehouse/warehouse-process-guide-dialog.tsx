'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Truck,
  Factory,
  ClipboardCheck,
  Package,
  CheckSquare,
  ArrowRight,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Boxes,
  Layers,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

interface WarehouseProcessGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateTo?: (route: string) => void;
}

export function WarehouseProcessGuideDialog({
  open,
  onOpenChange,
  onNavigateTo,
}: WarehouseProcessGuideDialogProps) {
  const steps = [
    {
      step: '01',
      title: 'Inbound Procurement',
      tag: 'Raw Materials & POs',
      icon: Truck,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      route: '/warehouse/procurement',
      what: 'You buy fabric, packaging, buttons, or ready-made products from external suppliers using Purchase Orders (PO).',
      example: 'Example: You order 2,500 meters of organic cotton from Apex Fabrics at ₹190/meter.',
      keyOutput: 'Outcome: When trucks arrive at warehouse docks, stock is marked "Received".',
    },
    {
      step: '02',
      title: 'Contract Manufacturing',
      tag: 'Production Orders & Tracking',
      icon: Factory,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      route: '/warehouse/production-orders',
      what: 'You send raw materials to partner garment factories or assembly lines with a Production Order (Work Order).',
      example: 'Example: 2,500 meters of cotton are sent to StitchCraft Mills to sew 1,000 Classic Denim Jackets.',
      keyOutput: 'Outcome: Track real-time stages (Cutting → Sewing → Ironing → Final Assembly).',
    },
    {
      step: '03',
      title: 'Quality Check (QA / QC)',
      tag: 'Tolerance Gate Audits',
      icon: ClipboardCheck,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      route: '/warehouse/quality-checks',
      what: 'Before finished goods are placed on warehouse shelves, QC inspectors test a sample lot for stitching, dimensions, and defects.',
      example: 'Example: Inspect 100 jackets: 95 pass without flaw, 5 have loose threads and are flagged for rework.',
      keyOutput: 'Outcome: Only passed units are approved for the next phase. Failed lots trigger delay alerts.',
    },
    {
      step: '04',
      title: 'Stock-in-Hand (Inventory)',
      tag: 'Shelf Bins & Reservations',
      icon: Package,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      route: '/warehouse/stock-in-hand',
      what: 'Approved products are shelved in specific warehouse facilities (BLR, BOM, DEL) and tracked across Available vs Reserved stock.',
      example: 'Example: 950 jackets placed in Bangalore Hub. When customers order online, stock is "Reserved" so it cannot be oversold.',
      keyOutput: 'Outcome: Available = Stock in Hand minus Reserved. Low stock auto-alerts when below reorder point.',
    },
    {
      step: '05',
      title: 'Fulfilment & Dispatch',
      tag: '6-Gate Readiness & Shipping',
      icon: CheckSquare,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
      route: '/warehouse/fulfilment-readiness',
      what: 'When customer orders are confirmed, the warehouse runs a 6-gate checklist before packing and printing shipping labels.',
      example: 'Example: Gate 1: Stock Available? ✓ | Gate 2: Reserved? ✓ | Gate 3: QC Cleared? ✓ | Gate 4: Packaging Ready? ✓.',
      keyOutput: 'Outcome: Courier manifest generated, packages loaded onto delivery truck, order marked "Dispatched".',
    },
  ];

  const glossaryItems = [
    {
      term: 'Purchase Order (PO)',
      meaning: 'An official commercial order sent to an outside supplier to buy raw materials or finished products.',
    },
    {
      term: 'Production Work Order (WO)',
      meaning: 'An internal order sent to a factory/tailor with raw materials to produce finished retail products.',
    },
    {
      term: 'Stock-in-Hand vs Available',
      meaning: 'Stock-in-Hand is the total physical units in the warehouse. Available is Stock-in-Hand minus units currently Reserved for pending orders.',
    },
    {
      term: 'Reorder Level',
      meaning: 'The minimum safety stock threshold. When available units drop below this number, the system triggers a "Low Stock" alert to create a new PO.',
    },
    {
      term: '6-Gate Fulfilment Readiness',
      meaning: 'A strict dispatch verification ensuring an order has stock, passed QC, correct packaging, and valid shipping labels before handing to couriers.',
    },
    {
      term: 'Inter-Warehouse Transfer',
      meaning: 'Moving inventory from one regional hub (e.g., Central Bangalore) to another (e.g., Mumbai DC) to balance customer demand.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="border-primary/40 text-primary text-[11px] font-semibold">
              <BookOpen className="h-3 w-3 mr-1" />
              Easy Operational Guide
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              Jodo Warehouse OS
            </Badge>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            How the Warehouse Module Works
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Understand the complete 5-step journey of goods — from buying raw fabric to shipping finished orders to customers.
          </DialogDescription>
        </div>

        {/* Content Tabs */}
        <div className="p-6">
          <Tabs defaultValue="pipeline" className="space-y-5">
            <TabsList className="grid grid-cols-4 w-full h-9">
              <TabsTrigger value="pipeline" className="text-xs">
                1. 5-Step Lifecycle
              </TabsTrigger>
              <TabsTrigger value="glossary" className="text-xs">
                2. Plain Glossary
              </TabsTrigger>
              <TabsTrigger value="daily-tasks" className="text-xs">
                3. Daily Workflows
              </TabsTrigger>
              <TabsTrigger value="dev-guide" className="text-xs">
                4. Developer Guide
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: 5-Step Lifecycle */}
            <TabsContent value="pipeline" className="space-y-4 pt-1">
              <div className="p-3.5 rounded-lg bg-muted/40 border text-xs text-muted-foreground flex items-center justify-between">
                <span>
                  Every item moves sequentially through these <strong>5 operational gates</strong>. Click any step to open its section.
                </span>
                <span className="font-mono text-[11px] font-semibold text-primary">01 ➔ 02 ➔ 03 ➔ 04 ➔ 05</span>
              </div>

              <div className="space-y-3">
                {steps.map((st, i) => {
                  const Icon = st.icon;
                  return (
                    <div
                      key={st.step}
                      className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${st.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-muted-foreground">
                              STEP {st.step}
                            </span>
                            <h4 className="font-bold text-sm text-foreground">{st.title}</h4>
                            <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                              {st.tag}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground/90">{st.what}</p>
                          <div className="text-[11px] text-muted-foreground font-sans bg-muted/30 p-2 rounded border border-border/50 mt-1">
                            {st.example}
                          </div>
                          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {st.keyOutput}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 shrink-0 self-end md:self-center gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        onClick={() => {
                          onOpenChange(false);
                          if (onNavigateTo) onNavigateTo(st.route);
                        }}
                      >
                        <span>Open Step {st.step}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB 2: Glossary */}
            <TabsContent value="glossary" className="space-y-3 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {glossaryItems.map((item, idx) => (
                  <Card key={idx} className="border shadow-none bg-muted/20 hover:bg-muted/40 transition-colors">
                    <CardContent className="p-3.5 space-y-1">
                      <div className="font-semibold text-xs text-primary flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{item.term}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.meaning}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: Daily Workflows */}
            <TabsContent value="daily-tasks" className="space-y-4 pt-1">
              <div className="space-y-3">
                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 font-mono text-[10px] flex items-center justify-center font-bold">1</span>
                    Scenario A: Low Stock Alert received
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    1. Go to <strong>Stock-in-Hand</strong> or click the alert on the dashboard.<br />
                    2. Click <strong>Create PO</strong> to order replenishment raw materials or finished units.<br />
                    3. Once the supplier confirms, track arrival date on <strong>Procurement</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-indigo-500/10 text-indigo-600 font-mono text-[10px] flex items-center justify-center font-bold">2</span>
                    Scenario B: Factory finishes batch of apparel
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    1. Update the order progress on <strong>Production Tracking</strong> to 100%.<br />
                    2. The system automatically creates a pending inspection in <strong>Quality Checks</strong>.<br />
                    3. Inspector tests the lot, records pass/fail count, and submits QC approval.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 font-mono text-[10px] flex items-center justify-center font-bold">3</span>
                    Scenario C: Dispatching customer orders
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                    1. Check <strong>Fulfilment Readiness</strong> — all 6 condition gates turn green.<br />
                    2. Warehouse packing team boxes the item and prints the shipping barcode.<br />
                    3. Click <strong>Dispatch Order</strong> — stock is formally deducted and handed to courier.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: Developer Guide */}
            <TabsContent value="dev-guide" className="space-y-4 pt-1">
              <div className="p-4 rounded-xl border bg-muted/20 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Code2 className="h-4 w-4 text-primary" />
                  <span>How the Code & Zustand Store Work</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  All warehouse state is cleanly centralized in <code className="px-1.5 py-0.5 bg-muted rounded font-mono text-[11px] text-foreground">stores/warehouse.ts</code> using Zustand with persistence.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="font-semibold text-foreground">Core State Collections:</div>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li><code className="font-mono text-foreground">procurements</code>: List of inbound POs with quantities & status.</li>
                    <li><code className="font-mono text-foreground">productionOrders</code>: Factory batches and current live stage.</li>
                    <li><code className="font-mono text-foreground">qualityChecks</code>: Inspection results, pass/fail counts, defect notes.</li>
                    <li><code className="font-mono text-foreground">stock</code>: Real-time inventory table (stockInHand, reserved, available).</li>
                    <li><code className="font-mono text-foreground">fulfilments</code>: 6-gate readiness verification items.</li>
                  </ul>
                </div>

                <div className="pt-2 border-t text-[11px] text-muted-foreground">
                  <strong>Easy Customization Tip:</strong> To add real backend API persistence, connect the existing store action calls to <code className="font-mono text-foreground">warehouseApi</code> in <code className="font-mono text-foreground">src/lib/api-client.ts</code>.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/20 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Need more help? Review <code className="font-mono text-foreground">FRONTEND_PAGES.md</code> section 1.10.
          </span>
          <Button size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Got it, Back to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
