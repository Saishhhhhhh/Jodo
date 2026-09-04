'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, useTasksStore } from '@/stores/tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LayoutList, Kanban, Clock, MessageSquare, Paperclip } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const router = useRouter();
  
  const updateTask = useTasksStore(state => state.updateTask);

  const COLUMNS = ['Pending', 'In Progress', 'Blocked', 'Completed', 'Closed'] as const;

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="bg-muted p-1 rounded-lg inline-flex">
            <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')}>
              <LayoutList className="w-4 h-4 mr-2" /> List
            </Button>
            <Button variant={view === 'kanban' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('kanban')}>
              <Kanban className="w-4 h-4 mr-2" /> Kanban
            </Button>
          </div>
        </div>
        
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs text-zinc-400 py-3">Task ID</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3">Title</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3">Assigned To</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3">Priority</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3">Status</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3">Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(t => (
                <TableRow key={t.id} onClick={() => router.push(`/tasks/${t.id}`)} className="cursor-pointer hover:bg-muted/10">
                  <TableCell className="text-xs text-muted-foreground font-mono">{t.id}</TableCell>
                  <TableCell className="font-medium text-sm">
                    {t.title}
                    <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">{t.description}</div>
                  </TableCell>
                  <TableCell className="text-sm">{t.assignedTo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'Completed' || t.status === 'Closed' ? 'success' : t.status === 'Blocked' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-sm ${new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed' ? 'text-red-400' : ''}`}>
                    {format(new Date(t.dueDate), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-end shrink-0">
        <div className="bg-muted p-1 rounded-lg inline-flex">
          <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('list')}>
            <LayoutList className="w-4 h-4 mr-2" /> List
          </Button>
          <Button variant={view === 'kanban' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('kanban')}>
            <Kanban className="w-4 h-4 mr-2" /> Kanban
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4 h-full">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col} className="w-80 flex flex-col bg-muted/20 rounded-xl border border-border/50">
                <div className="p-3 border-b border-border/50 flex items-center justify-between bg-muted/10 rounded-t-xl">
                  <h3 className="font-semibold text-sm">{col}</h3>
                  <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
                </div>
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {colTasks.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => router.push(`/tasks/${t.id}`)}
                      className="bg-card border border-border p-3 rounded-lg shadow-sm hover:border-primary/50 cursor-pointer transition-colors space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] mb-1">{t.priority}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{t.id}</span>
                      </div>
                      <p className="text-sm font-medium leading-tight">{t.title}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className={new Date(t.dueDate) < new Date() ? 'text-red-400 font-medium' : ''}>
                            {format(new Date(t.dueDate), 'MMM d')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.checklist.length > 0 && (
                            <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5"/> {t.checklist.filter(c=>c.completed).length}/{t.checklist.length}</span>
                          )}
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]" title={t.assignedTo}>
                            {t.assignedTo.charAt(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
