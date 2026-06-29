'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Search, Eye, Filter, Calendar, Terminal } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { auditLogsApi } from '@/lib/api-client';

export default function SettingsAuditlogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch audit logs
  const { data: logsResponse, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await auditLogsApi.list();
      return response.data.data;
    },
  });

  const logs: any[] = logsResponse || [];

  // Filter logs based on search and selected options
  const filteredLogs = logs.filter((log) => {
    const actionMatch = log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        log.resourceType?.toLowerCase().includes(searchTerm.toLowerCase());
    const actorMatch = actorFilter === 'all' || log.actorType === actorFilter;
    const resourceMatch = resourceFilter === 'all' || log.resourceType === resourceFilter;
    
    return actionMatch && actorMatch && resourceMatch;
  });

  // Extract unique resource types for filter dropdown
  const uniqueResources = Array.from(new Set(logs.map((l) => l.resourceType))).filter(Boolean);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const openDetails = (log: any) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 w-full flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View security-critical system actions, configuration updates, and staff sessions.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action or resource..."
            className="pl-8 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto gap-3 items-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filter by:
          </div>
          
          <Select value={actorFilter} onValueChange={setActorFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Actor Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actors</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="api_key">API Key</SelectItem>
            </SelectContent>
          </Select>

          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              {uniqueResources.map((res: any) => (
                <SelectItem key={res} value={res}>
                  {res}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/60" />
                        {formatDateTime(log.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-[10px] bg-primary/10 text-primary hover:bg-primary/15 border-none">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      {log.resourceType}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium">{log.actorUserId?.name || 'System'}</span>
                        {log.actorUserId?.email && (
                          <span className="block text-[10px] text-muted-foreground">{log.actorUserId.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.ip || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDetails(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ShieldAlert className="h-8 w-8 text-muted-foreground/60 mb-3" />
              <h4 className="text-sm font-semibold">No audit logs found</h4>
              <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
                No logs match your current filter settings or search query.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" /> Audit Details
            </DialogTitle>
            <DialogDescription>
              Technical details and comparison data for this security action.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 border rounded-lg bg-muted/30">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Action</span>
                  <span className="font-mono font-medium text-primary">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Actor</span>
                  <span className="font-medium">
                    {selectedLog.actorUserId?.name || 'System'} ({selectedLog.actorType})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Resource</span>
                  <span className="font-medium">{selectedLog.resourceType} ({selectedLog.resourceId || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Timestamp</span>
                  <span className="font-medium">{formatDateTime(selectedLog.createdAt)}</span>
                </div>
                <div className="col-span-2 border-t pt-2">
                  <span className="text-muted-foreground block text-[10px] uppercase font-semibold">User Agent</span>
                  <span className="text-muted-foreground truncate block">{selectedLog.userAgent || 'N/A'}</span>
                </div>
              </div>

              {(Object.keys(selectedLog.before || {}).length > 0 || Object.keys(selectedLog.after || {}).length > 0) && (
                <div className="space-y-2">
                  <span className="font-semibold text-sm">State Comparison</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground">Before changes</span>
                      <pre className="p-3 border rounded-lg bg-card overflow-x-auto text-[10px] font-mono leading-relaxed max-h-[220px]">
                        {JSON.stringify(selectedLog.before, null, 2)}
                      </pre>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-green-600">After changes</span>
                      <pre className="p-3 border border-green-500/20 rounded-lg bg-green-500/5 text-green-700 dark:text-green-400 overflow-x-auto text-[10px] font-mono leading-relaxed max-h-[220px]">
                        {JSON.stringify(selectedLog.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
