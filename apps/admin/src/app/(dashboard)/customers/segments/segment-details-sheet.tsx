'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerSegmentsApi } from '@/lib/api-client';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, DollarSign, RotateCcw } from 'lucide-react';

interface SegmentDetailsSheetProps {
  segment: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SegmentDetailsSheet({ segment, open, onOpenChange }: SegmentDetailsSheetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['segments', segment?._id],
    queryFn: async () => {
      const res = await customerSegmentsApi.get(segment._id);
      return res.data.data; // { segment, customers }
    },
    enabled: !!segment?._id && open,
  });

  if (!segment) return null;

  const customers = data?.customers || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto border-l border-zinc-800 bg-background p-0">
        
        {/* Header Block */}
        <div className="p-6 border-b border-zinc-800 bg-muted/20">
          <SheetHeader className="space-y-1">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Users className="h-5 w-5" />
              <SheetTitle className="text-xl font-bold tracking-tight">{segment.name}</SheetTitle>
            </div>
            {segment.description && (
              <SheetDescription className="text-xs text-muted-foreground">
                {segment.description}
              </SheetDescription>
            )}
          </SheetHeader>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-sm">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Cohort Size</span>
            <span className="font-extrabold text-lg text-indigo-400">{isLoading ? '...' : `${customers.length} Members`}</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Matching Customers</h4>

            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground animate-pulse">Loading segment members...</div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 py-12 rounded-xl text-center">
                <Users className="h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-sm font-semibold">No customers match</p>
                <p className="text-xs text-zinc-500 max-w-[250px] mt-1">No customer profiles currently satisfy this segment's filter rules.</p>
              </div>
            ) : (
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-card">
                <Table>
                  <TableHeader className="bg-muted/30 border-b border-zinc-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs text-zinc-400">Customer</TableHead>
                      <TableHead className="text-xs text-zinc-400">Status</TableHead>
                      <TableHead className="text-xs text-zinc-400 text-right">Orders</TableHead>
                      <TableHead className="text-xs text-zinc-400 text-right">Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((cust: any) => (
                      <TableRow key={cust._id} className="hover:bg-muted/10 border-b border-zinc-800/60 last:border-0">
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm leading-snug">{cust.firstName} {cust.lastName}</p>
                            <p className="text-[10px] text-muted-foreground leading-normal font-mono">{cust.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cust.status === 'active' ? 'default' : 'secondary'} className="text-[10px] py-0 px-1.5 capitalize">
                            {cust.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-sm">{cust.ordersCount}</TableCell>
                        <TableCell className="text-right font-bold text-sm text-emerald-400">{formatCurrency(cust.totalSpent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
