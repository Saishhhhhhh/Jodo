'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Task, useTasksStore } from '@/stores/tasks';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  return (
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
            <TableHead className="text-xs text-zinc-400 py-3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t: any) => (
            <TableRow key={t._id || t.id} onClick={() => router.push(`/tasks/${t._id || t.id}`)} className="cursor-pointer hover:bg-muted/10">
              <TableCell className="text-xs text-muted-foreground font-mono">{(t._id || t.id).toString().slice(-6)}</TableCell>
              <TableCell className="font-medium text-sm">
                {t.title}
                <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">{t.description}</div>
              </TableCell>
              <TableCell className="text-sm">{t.assignedTo?.name || t.assignedTo || 'Unassigned'}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
              </TableCell>
              <TableCell>
                <div onClick={(e) => e.stopPropagation()}>
                  <Select 
                    value={t.status} 
                    onValueChange={(val) => {
                      if (val !== t.status) {
                        useTasksStore.getState().updateTask(t._id || t.id, { status: val });
                      }
                    }}
                  >
                    <SelectTrigger className={`h-7 text-[10px] w-[110px] ${t.status === 'Completed' || t.status === 'Closed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : t.status === 'Blocked' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-secondary text-secondary-foreground'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Blocked">Hold (Blocked)</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
              <TableCell className={`text-sm ${new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed' ? 'text-red-400' : ''}`}>
                {format(new Date(t.dueDate), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this task?')) {
                      useTasksStore.getState().deleteTask(t._id || t.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
