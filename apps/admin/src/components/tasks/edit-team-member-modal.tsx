'use client';

import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface EditTeamMemberModalProps {
  member: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function EditTeamMemberModal({
  member,
  open,
  onOpenChange,
  onUpdated,
}: EditTeamMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('Sales');
  const [status, setStatus] = useState('active');
  const [newPassword, setNewPassword] = useState('');
  const [moduleAccess, setModuleAccess] = useState<string[]>(['tasks']);

  useEffect(() => {
    if (member && open) {
      setName(member.name || '');
      setMemberId(member.memberId || '');
      setEmail(member.email || '');
      setPhone(member.phone || '');
      setTeam(member.permissions?.[0] || 'Sales');
      setStatus(member.status || 'active');
      setModuleAccess(member.moduleAccess && member.moduleAccess.length > 0 ? member.moduleAccess : ['tasks']);
      setNewPassword('');
    }
  }, [member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        team,
        status,
        moduleAccess,
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      await apiClient.patch(`/admin/team-members/${member._id || member.id}`, payload);
      toast.success('Team Member updated successfully');
      onOpenChange(false);
      if (onUpdated) onUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update team member');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  const toggleModule = (modId: string) => {
    if (modId === 'tasks') return; // tasks is required
    setModuleAccess((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId]
    );
  };

  const ALL_MODULE_KEYS = [
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
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold">Edit Team Member</SheetTitle>
              <SheetDescription className="text-xs">
                Update account details, role permissions, or module access.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Member ID</Label>
            <Input value={memberId} disabled className="bg-muted text-xs font-mono" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Full Name <span className="text-destructive">*</span></Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shraddha"
              required
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. shraddha@gmail.com"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Team / Department</Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Content">Content</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Account Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Module Access Selection */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Module Access Permissions ({moduleAccess.length} Selected)
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModuleAccess(ALL_MODULE_KEYS.map((m) => m.id))}
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

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg bg-muted/20">
              {ALL_MODULE_KEYS.map((mod) => {
                const isSelected = moduleAccess.includes(mod.id);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs border text-left transition-all',
                      isSelected
                        ? 'bg-primary/10 border-primary/50 text-foreground font-medium'
                        : 'bg-background border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span>{mod.label}</span>
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        isSelected ? 'bg-primary' : 'bg-muted-foreground/30'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t">
            <Label className="text-xs font-semibold">Reset Password (Optional)</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="text-xs"
            />
            <span className="text-[10px] text-muted-foreground block">
              Enter a new password only if you want to reset their login credentials.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="text-xs font-semibold">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
