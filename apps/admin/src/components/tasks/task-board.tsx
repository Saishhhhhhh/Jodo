'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, useTasksStore, TaskStatus } from '@/stores/tasks';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Trash2, MessageSquare, AlertTriangle, Clock, MessageSquarePlus, Pencil, Paperclip, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { StatusRemarkModal } from './status-remark-modal';
import { EditTaskModal } from './edit-task-modal';
import { TaskCard } from './task-card';

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const deleteTask = useTasksStore(state => state.deleteTask);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [modalInitialStatus, setModalInitialStatus] = useState<TaskStatus | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editModalTask, setEditModalTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openRemarkModal = (task: Task, newStatus?: TaskStatus) => {
    setModalTask(task);
    setModalInitialStatus(newStatus || (task.status as TaskStatus));
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* View Mode Switcher Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>

        <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border text-xs">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-xl text-muted-foreground text-xs space-y-2">
          <p className="font-semibold text-sm text-foreground">No tasks found</p>
          <p>No tasks match the active filters.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onEdit={(t) => {
                setEditModalTask(t);
                setIsEditModalOpen(true);
              }}
              onDelete={async (id) => {
                if (confirm('Are you sure you want to delete this task?')) {
                  await deleteTask(id);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-border">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs text-muted-foreground py-3 px-3 w-[75px]">Task ID</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 min-w-[140px]">Title</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 w-[130px]">Assigned To</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 w-[85px]">Priority</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 w-[130px]">Status</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 min-w-[160px] max-w-[220px]">Remark / Delay Reason</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 w-[110px]">Due Date</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 w-[100px]">Comments</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 w-[100px]">Attachments</TableHead>
            <TableHead className="text-xs text-muted-foreground py-3 px-3 text-right w-[115px] sticky right-0 bg-muted/95 backdrop-blur-sm z-20 border-l border-border/40 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.15)]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((t: any) => {
            const taskId = t._id || t.id;
            const isDelayed = t.status === 'Blocked' || (new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed');
            const rawAssignee = t.assignedTo?.name || (typeof t.assignedTo === 'string' && !/^[0-9a-fA-F]{24}$/.test(t.assignedTo) ? t.assignedTo : 'Unassigned');

            return (
              <TableRow
                key={taskId}
                onClick={() => router.push(`/tasks/${taskId}`)}
                className={`cursor-pointer transition-colors group ${
                  isDelayed ? 'bg-red-500/[0.03] hover:bg-red-500/[0.06] border-red-500/20' : 'hover:bg-muted/20 border-border/40'
                }`}
              >
                <TableCell className="text-xs text-muted-foreground font-mono py-2.5 px-3">
                  {taskId.toString().slice(-6)}
                </TableCell>

                <TableCell className="font-medium text-sm py-2.5 px-3 max-w-[200px]">
                  <span className="hover:underline text-foreground block truncate">{t.title}</span>
                  <div className="text-xs text-muted-foreground truncate max-w-[180px] mt-0.5">
                    {t.description || 'No description'}
                  </div>
                </TableCell>

                <TableCell className="text-sm py-2.5 px-3">
                  <div className="flex items-center gap-2 max-w-[130px]">
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                        {getInitials(rawAssignee)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground truncate">{rawAssignee}</span>
                  </div>
                </TableCell>

                <TableCell className="py-2.5 px-3">
                  <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                    {t.priority}
                  </Badge>
                </TableCell>

                <TableCell className="py-2.5 px-3">
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
                <TableCell className="py-2.5 px-3 max-w-[220px]" onClick={(e) => e.stopPropagation()}>
                  {t.remark ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            onClick={() => openRemarkModal(t)}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer group/remark flex items-start gap-1.5 transition-all max-w-[220px] ${
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
                  className={`text-sm py-2.5 px-3 whitespace-nowrap ${
                    new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed'
                      ? 'text-red-400 font-medium'
                      : ''
                  }`}
                >
                  {format(new Date(t.dueDate), 'MMM d, yyyy')}
                </TableCell>

                <TableCell className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.comments?.length || 0}</span>
                  </div>
                </TableCell>

                <TableCell className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{t.attachments?.length || 0}</span>
                  </div>
                </TableCell>

                <TableCell className="text-right py-2.5 px-3 sticky right-0 bg-card group-hover:bg-muted/30 transition-colors z-20 border-l border-border/40 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      title="Edit Task"
                      onClick={() => {
                        setEditModalTask(t);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      title="Update Status & Remark"
                      onClick={() => openRemarkModal(t)}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-500"
                      title="Delete Task"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this task?')) {
                          useTasksStore.getState().deleteTask(taskId);
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  )}

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
