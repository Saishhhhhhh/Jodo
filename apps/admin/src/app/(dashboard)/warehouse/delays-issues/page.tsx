'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  MoreHorizontal,
  Clock,
  Filter,
  Plus,
  Truck,
  Factory,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react';
import { useWarehouseStore, WarehouseIssueItem } from '@/stores/warehouse';
import { toast } from 'sonner';

function DelaysIssuesPageContent() {
  const { issues, addIssue, updateIssueStatus, assignIssue } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Issue Modal
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [relatedOrderInput, setRelatedOrderInput] = useState('');
  const [typeInput, setTypeInput] = useState<WarehouseIssueItem['type']>('Production Delay');
  const [productInput, setProductInput] = useState('');
  const [supplierInput, setSupplierInput] = useState('');
  const [issueDescInput, setIssueDescInput] = useState('');
  const [expectedDateInput, setExpectedDateInput] = useState('');
  const [severityInput, setSeverityInput] = useState<WarehouseIssueItem['severity']>('High');
  const [assignedToInput, setAssignedToInput] = useState('Rahul Sharma');

  const issueList = issues || [];

  const totalDelays = issueList.length;
  const criticalIssues = issueList.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved').length;
  const prodDelays = issueList.filter((i) => i.type === 'Production Delay' && i.status !== 'Resolved').length;
  const procDelays = issueList.filter((i) => i.type === 'Procurement Delay' && i.status !== 'Resolved').length;
  const resolvedIssues = issueList.filter((i) => i.status === 'Resolved').length;

  const filteredIssues = useMemo(() => {
    return issueList.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.relatedOrder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierManufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.issue.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = typeFilter === 'ALL' || item.type === typeFilter;
      const matchSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      return matchSearch && matchType && matchSeverity && matchStatus;
    });
  }, [issueList, searchTerm, typeFilter, severityFilter, statusFilter]);

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInput || !issueDescInput) {
      toast.error('Please enter product and issue details');
      return;
    }

    addIssue({
      relatedOrder: relatedOrderInput || 'MANUAL-ESC',
      type: typeInput,
      product: productInput,
      supplierManufacturer: supplierInput || 'Internal / In-transit',
      issue: issueDescInput,
      expectedDate: expectedDateInput || 'Pending Confirmation',
      daysDelayed: 1,
      severity: severityInput,
      assignedTo: assignedToInput,
      status: 'Open',
    });

    toast.success('New warehouse issue logged and alert notified on Dashboard');
    setIsNewIssueOpen(false);
    setProductInput('');
    setIssueDescInput('');
  };

  const getSeverityBadge = (severity: WarehouseIssueItem['severity']) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="destructive" className="text-[10px]">Critical</Badge>;
      case 'High':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]">High</Badge>;
      case 'Medium':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Low</Badge>;
    }
  };

  const getStatusBadge = (status: WarehouseIssueItem['status']) => {
    switch (status) {
      case 'Resolved':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">Resolved</Badge>;
      case 'Investigating':
        return <Badge className="bg-blue-500/10 text-blue-600 border-none text-[10px]">Investigating</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">Open</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/warehouse" className="hover:text-foreground transition-colors">
              Warehouse
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Delays & Issues</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Delays & Escalations</h1>
            <Badge variant="destructive" className="text-xs font-mono">
              Operational Exception Log
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor supplier delays, factory breakdowns, material shortages and QC rejections. Automatically flagged when delivery dates pass.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setIsNewIssueOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Log Issue</span>
          </Button>
        </div>
      </div>

      {/* Top 5 Summary Cards per Section 12 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">Total Delays & Issues</span>
            <div className="font-mono font-bold text-xl text-foreground">{totalDelays}</div>
            <span className="text-[10px] text-muted-foreground">Recorded occurrences</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-destructive">Critical Issues</span>
            <div className="font-mono font-bold text-xl text-destructive">{criticalIssues}</div>
            <span className="text-[10px] text-muted-foreground">Require immediate action</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-amber-500">Production Delays</span>
            <div className="font-mono font-bold text-xl text-amber-500">{prodDelays}</div>
            <span className="text-[10px] text-muted-foreground">Factory floor halts</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-blue-500">Procurement Delays</span>
            <div className="font-mono font-bold text-xl text-blue-500">{procDelays}</div>
            <span className="text-[10px] text-muted-foreground">Inbound raw goods</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-emerald-500">Resolved Issues</span>
            <div className="font-mono font-bold text-xl text-emerald-500">{resolvedIssues}</div>
            <span className="text-[10px] text-muted-foreground">Closed escalations</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by ID, order, product, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 text-xs w-[150px]">
              <SelectValue placeholder="Issue Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="Procurement Delay">Procurement Delay</SelectItem>
              <SelectItem value="Production Delay">Production Delay</SelectItem>
              <SelectItem value="Material Shortage">Material Shortage</SelectItem>
              <SelectItem value="Quality Failure">Quality Failure</SelectItem>
              <SelectItem value="Manufacturer Issue">Manufacturer Issue</SelectItem>
              <SelectItem value="Transportation Delay">Transportation Delay</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Severities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Investigating">Investigating</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table per Section 12 */}
      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-[11px]">Issue ID</TableHead>
              <TableHead className="text-[11px]">Related Order</TableHead>
              <TableHead className="text-[11px]">Type</TableHead>
              <TableHead className="text-[11px]">Product</TableHead>
              <TableHead className="text-[11px]">Supplier / Manufacturer</TableHead>
              <TableHead className="text-[11px]">Issue & Cause</TableHead>
              <TableHead className="text-[11px]">Expected Date</TableHead>
              <TableHead className="text-[11px] text-right">Days Delayed</TableHead>
              <TableHead className="text-[11px]">Severity</TableHead>
              <TableHead className="text-[11px]">Assigned To</TableHead>
              <TableHead className="text-[11px]">Status</TableHead>
              <TableHead className="text-[11px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-10 text-xs text-muted-foreground">
                  No issues or delays matching your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredIssues.map((issue) => (
                <TableRow key={issue.id} className="text-xs hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-semibold text-foreground text-xs">{issue.id}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{issue.relatedOrder}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">{issue.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{issue.product}</TableCell>
                  <TableCell className="text-muted-foreground">{issue.supplierManufacturer}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground" title={issue.issue}>
                    {issue.issue}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{issue.expectedDate}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-destructive">
                    +{issue.daysDelayed}d
                  </TableCell>
                  <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{issue.assignedTo}</TableCell>
                  <TableCell>{getStatusBadge(issue.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {issue.status !== 'Resolved' && (
                          <DropdownMenuItem
                            onClick={() => {
                              updateIssueStatus(issue.id, 'Resolved', 'Resolved by warehouse operations lead');
                              toast.success(`Marked issue ${issue.id} as Resolved`);
                            }}
                            className="text-emerald-600"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Resolved
                          </DropdownMenuItem>
                        )}
                        {issue.status === 'Open' && (
                          <DropdownMenuItem
                            onClick={() => {
                              updateIssueStatus(issue.id, 'Investigating');
                              toast.info(`Issue ${issue.id} set to Investigating`);
                            }}
                          >
                            <Clock className="mr-2 h-4 w-4" /> Move to Investigating
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            const newOwner = window.prompt('Reassign issue to:', issue.assignedTo);
                            if (newOwner) {
                              assignIssue(issue.id, newOwner);
                              toast.success(`Assigned ${issue.id} to ${newOwner}`);
                            }
                          }}
                        >
                          <UserCheck className="mr-2 h-4 w-4" /> Reassign Owner
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Log Issue Dialog */}
      <Dialog open={isNewIssueOpen} onOpenChange={setIsNewIssueOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Log Warehouse Escalation / Issue</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record a delay or supplier breakdown. Flags critical alerts onto the main dashboard.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateIssue} className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="issue-order">Related Order / Ref</Label>
                <Input
                  id="issue-order"
                  placeholder="e.g. PRD-2026-004"
                  value={relatedOrderInput}
                  onChange={(e) => setRelatedOrderInput(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="issue-type">Issue Type *</Label>
                <Select value={typeInput} onValueChange={(val: any) => setTypeInput(val)}>
                  <SelectTrigger id="issue-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Procurement Delay">Procurement Delay</SelectItem>
                    <SelectItem value="Production Delay">Production Delay</SelectItem>
                    <SelectItem value="Material Shortage">Material Shortage</SelectItem>
                    <SelectItem value="Quality Failure">Quality Failure</SelectItem>
                    <SelectItem value="Manufacturer Issue">Manufacturer Issue</SelectItem>
                    <SelectItem value="Transportation Delay">Transportation Delay</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="issue-product">Product *</Label>
              <Input
                id="issue-product"
                placeholder="e.g. Merino Wool Sweater"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="issue-supplier">Supplier / Manufacturer</Label>
              <Input
                id="issue-supplier"
                placeholder="e.g. Himalayan Woolcrafts"
                value={supplierInput}
                onChange={(e) => setSupplierInput(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="issue-severity">Severity *</Label>
                <Select value={severityInput} onValueChange={(val: any) => setSeverityInput(val)}>
                  <SelectTrigger id="issue-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="issue-assigned">Assigned To</Label>
                <Input
                  id="issue-assigned"
                  value={assignedToInput}
                  onChange={(e) => setAssignedToInput(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="issue-desc">Issue Description & Root Cause *</Label>
              <Textarea
                id="issue-desc"
                placeholder="Describe what occurred, impact on delivery, and mitigation action."
                rows={3}
                value={issueDescInput}
                onChange={(e) => setIssueDescInput(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewIssueOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Submit Escalation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DelaysIssuesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Delays & Issues...</div>}>
      <DelaysIssuesPageContent />
    </Suspense>
  );
}
