'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

export function CreateTeamMemberModal({ children, onCreated }: { children?: React.ReactNode; onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('Sales');
  const [status, setStatus] = useState('active');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [moduleAccess, setModuleAccess] = useState<string[]>(['tasks']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !memberId || !password) return;
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/admin/team-members', {
        name,
        memberId,
        email,
        phone,
        team,
        status,
        password,
        moduleAccess,
      });
      
      toast.success('Team Member created successfully');
      setOpen(false);
      
      // reset
      setName('');
      setMemberId('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      
      if (onCreated) onCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Create Team Member
          </Button>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">Create Team Member</SheetTitle>
            <SheetDescription>
              Create a task-only account for a team member.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Full Name <span className="text-red-500">*</span></Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Rahul Kumar"
              />
            </div>

            <div className="space-y-2">
              <Label>Member ID <span className="text-red-500">*</span></Label>
              <Input
                value={memberId}
                onChange={e => setMemberId(e.target.value.toUpperCase())}
                required
                placeholder="e.g. TM001"
              />
            </div>

            <div className="space-y-2">
              <Label>Email (Optional)</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rahul@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone (Optional)</Label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91..."
              />
            </div>

            <div className="space-y-2">
              <Label>Team</Label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors cursor-pointer"
              >
                {['Sales', 'Operations', 'Warehouse', 'Content', 'Support', 'Follow-up', 'Finance'].map((t) => (
                  <option key={t} value={t} className="bg-popover text-popover-foreground">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors cursor-pointer"
              >
                <option value="active" className="bg-popover text-popover-foreground">Active</option>
                <option value="inactive" className="bg-popover text-popover-foreground">Inactive</option>
              </select>
            </div>

            {/* Module Access Selection */}
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Module Access ({moduleAccess.length} Selected)
                </Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setModuleAccess([
                        'tasks',
                        'dashboard',
                        'store',
                        'orders',
                        'customers',
                        'leads',
                        'warehouse',
                        'ai-content',
                        'marketing',
                        'whatsapp',
                        'content',
                        'blog',
                        'analytics',
                        'settings',
                      ])
                    }
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={() => setModuleAccess(['tasks'])}
                    className="text-[11px] text-muted-foreground hover:underline"
                  >
                    Tasks Only
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1.5 border rounded-lg bg-muted/20">
                {[
                  { id: 'tasks', label: 'Tasks' },
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'store', label: 'Store & Products' },
                  { id: 'orders', label: 'Orders' },
                  { id: 'customers', label: 'Customers' },
                  { id: 'leads', label: 'CRM / Leads' },
                  { id: 'warehouse', label: 'Warehouse' },
                  { id: 'ai-content', label: 'AI Content' },
                  { id: 'marketing', label: 'Marketing' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'content', label: 'Site Content' },
                  { id: 'blog', label: 'Blog & FAQs' },
                  { id: 'analytics', label: 'Analytics' },
                  { id: 'settings', label: 'Settings' },
                ].map((mod) => {
                  const isChecked = moduleAccess.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        if (mod.id === 'tasks') return;
                        setModuleAccess((prev) =>
                          prev.includes(mod.id)
                            ? prev.filter((m) => m !== mod.id)
                            : [...prev, mod.id]
                        );
                      }}
                      className={`flex items-center justify-between px-2 py-1 rounded text-[11px] border text-left transition-colors ${
                        isChecked
                          ? 'bg-primary/10 border-primary/50 text-foreground font-medium'
                          : 'bg-background border-border text-muted-foreground'
                      }`}
                    >
                      <span className="truncate">{mod.label}</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ml-1.5 ${
                          isChecked ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <Label>Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create Team Member'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
