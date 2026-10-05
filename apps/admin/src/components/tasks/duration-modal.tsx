'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { useTasksStore, Task } from '@/stores/tasks';

interface DurationModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DurationModal({ task, isOpen, onClose }: DurationModalProps) {
  const updateDuration = useTasksStore((state) => state.updateDuration);
  const toggleTimer = useTasksStore((state) => state.toggleTimer);
  const updateTask = useTasksStore((state) => state.updateTask);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      const totalSecs = task.loggedDuration || 0;
      setHours(Math.floor(totalSecs / 3600));
      setMinutes(Math.floor((totalSecs % 3600) / 60));
      setSeconds(totalSecs % 60);
      setNote(task.remark || '');
    }
  }, [task, isOpen]);

  if (!task) return null;

  const handleSave = async () => {
    const totalSeconds = Math.max(0, Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0));
    setIsSubmitting(true);
    try {
      const taskId = (task._id || task.id);
      await updateDuration(taskId, totalSeconds);
      if (note && note !== task.remark) {
        await updateTask(taskId, { remark: note.trim() });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMinutes = (mins: number) => {
    const currentTotal = Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0);
    const newTotal = Math.max(0, currentTotal + mins * 60);
    setHours(Math.floor(newTotal / 3600));
    setMinutes(Math.floor((newTotal % 3600) / 60));
    setSeconds(newTotal % 60);
  };

  const resetDuration = () => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Log Work Time</span>
          </div>
          <DialogTitle className="text-lg font-bold leading-snug">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Team members can update their logged time and work duration here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Live Timer Status bar */}
          <div className="p-3 rounded-lg bg-muted/50 border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${task.timerRunning ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {task.timerRunning ? 'Timer is currently RUNNING' : 'Timer is currently STOPPED'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {task.timerRunning ? 'Tracking your active working session' : 'Click to start or pause stopwatch'}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={task.timerRunning ? 'destructive' : 'default'}
              onClick={async () => {
                await toggleTimer(task._id || task.id);
              }}
              className="text-xs h-8 px-3 gap-1.5 font-medium"
            >
              {task.timerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Timer
                </>
              )}
            </Button>
          </div>

          {/* Duration Input Grid */}
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">
              Total Logged Duration
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Hours</span>
                <Input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-center text-lg font-mono h-11"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Minutes</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-mono h-11"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Seconds</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-mono h-11"
                />
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Quick add:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMinutes(15)}
              className="text-[11px] h-7 px-2"
            >
              +15m
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMinutes(30)}
              className="text-[11px] h-7 px-2"
            >
              +30m
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMinutes(60)}
              className="text-[11px] h-7 px-2"
            >
              +1 hour
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetDuration}
              className="text-[11px] h-7 px-2 text-muted-foreground hover:text-destructive ml-auto"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>

          {/* Work notes */}
          <div>
            <Label className="text-xs font-semibold text-foreground mb-1.5 block">
              Session Note / Progress Remark (Optional)
            </Label>
            <Input
              placeholder="e.g. Worked on deliverables and QA verification..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="text-xs h-9 px-4 font-semibold"
          >
            {isSubmitting ? 'Saving...' : 'Save Duration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
