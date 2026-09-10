'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, useTasksStore, TaskStatus } from '@/stores/tasks';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Trash2, MessageSquare, AlertTriangle, Clock, MessageSquarePlus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusRemarkModal } from './status-remark-modal';
import { EditTaskModal } from './edit-task-modal';

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [modalInitialStatus, setModalInitialStatus] = useState<TaskStatus | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editModalTask, setEditModalTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openRemarkModal = (task: Task, newStatus?: TaskStatus) => {
    setModalTask(task);
    setModalInitialStatus(newStatus || task.status);
    setIsModalOpen(true);
  };

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
            <TableHead className="text-xs text-zinc-400 py-3 min-w-[220px]">Remark / Delay Reason</TableHead>
            <TableHead className="text-xs text-zinc-400 py-3">Due Date</TableHead>
            <TableHead className="text-xs text-zinc-400 py-3 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t: any) => {
            const taskId = t._id || t.id;
            const isDelayed = t.status === 'Blocked' || (new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed');

            return (
              <TableRow
                key={taskId}
                onClick={() => router.push(`/tasks/${taskId}`)}
                className="cursor-pointer hover:bg-muted/10 transition-colors"
              >
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {taskId.toString().slice(-6)}
                </TableCell>

                <TableCell className="font-medium text-sm">
                  <span className="hover:underline text-foreground">{t.title}</span>
                  <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                    {t.description || 'No description'}
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  {t.assignedTo?.name || t.assignedTo || 'Unassigned'}
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {t.priority}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={t.status}
                      onValueChange={(val: TaskStatus) => {
                        // Open modal to prompt for remark with the selected new status
                        openRemarkModal(t, val);
                      }}
                    >
                      <SelectTrigger
                        className={`h-7 text-[10px] w-[115px] font-medium ${
                          t.status === 'Completed' || t.status === 'Closed'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : t.status === 'Blocked'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Blocked">Hold (Blocked)</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>

                {/* Remark / Delay Reason Column */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {t.remark ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() => openRemarkModal(t)}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer group flex items-start gap-1.5 transition-all max-w-[280px] ${
                              isDelayed
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/15'
                                : 'bg-muted/40 border-border hover:bg-muted/70 text-foreground'
                            }`}
                          >
                            {isDelayed ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            ) : (
                              <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            )}
                            <div className="overflow-hidden min-w-0">
                              <p className="truncate text-xs font-medium">"{t.remark}"</p>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                <span className="truncate">
                                  {t.remarkUpdatedBy?.name || 'Employee'}
                                </span>
                                {t.remarkUpdatedAt && (
                                  <>
                                    <span>•</span>
                                    <span>{format(new Date(t.remarkUpdatedAt), 'MMM d, h:mm a')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          <p className="font-semibold mb-1">Latest Remark:</p>
                          <p className="italic">"{t.remark}"</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Click to view history or update remark
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRemarkModal(t)}
                      className="h-7 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 px-2"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Add remark</span>
                    </Button>
                  )}
                </TableCell>

                <TableCell
                  className={`text-sm ${
                    new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed'
                      ? 'text-red-400 font-medium'
                      : ''
                  }`}
                >
                  {format(new Date(t.dueDate), 'MMM d, yyyy')}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Edit Task"
                      onClick={() => {
                        setEditModalTask(t);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Update Status & Remark"
                      onClick={() => openRemarkModal(t)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500"
                      title="Delete Task"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this task?')) {
                          useTasksStore.getState().deleteTask(taskId);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}

          {tasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editModalTask}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      {/* Status and Remark Modal */}
      <StatusRemarkModal
        task={modalTask}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialStatus={modalInitialStatus}
      />
    </div>
  );
}
