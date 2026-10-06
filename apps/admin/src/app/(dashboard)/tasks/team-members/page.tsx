'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { CreateTeamMemberModal } from '@/components/tasks/create-team-member-modal';
import { EditTeamMemberModal } from '@/components/tasks/edit-team-member-modal';
import { TasksHeaderNav } from '@/components/tasks/tasks-header-nav';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, MoreHorizontal, Pencil, Trash2, Power, UserCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function TeamMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit modal state
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/team-members');
      setMembers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch team members', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleToggleStatus = async (member: any) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      await apiClient.patch(`/admin/team-members/${member._id || member.id}`, { status: newStatus });
      toast.success(`Member marked as ${newStatus}`);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update member status');
    }
  };

  const handleDeleteMember = async (member: any) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete team member "${member.name}" (${member.memberId})?`);
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/admin/team-members/${member._id || member.id}`);
      toast.success(`Team member ${member.name} deleted`);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete team member');
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.memberId?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-theme(spacing.16))]">
      {/* Top 2 Buttons: Tasks & Team Members */}
      <div className="shrink-0 flex items-center justify-between border-b pb-4">
        <div>
          <TasksHeaderNav />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tasks/team-members/create">
            <Button size="sm" className="text-xs font-semibold shadow-xs">
              <Plus className="w-4 h-4 mr-1.5" /> Create Team Member
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage task-only team member accounts, roles, and status.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search team members..." 
            className="pl-9 text-xs" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-border sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground py-3">Member ID</TableHead>
                <TableHead className="text-xs text-muted-foreground py-3">Name</TableHead>
                <TableHead className="text-xs text-muted-foreground py-3">Team</TableHead>
                <TableHead className="text-xs text-muted-foreground py-3">Module Access</TableHead>
                <TableHead className="text-xs text-muted-foreground py-3">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground py-3 text-center">Assigned Tasks</TableHead>
                <TableHead className="text-xs text-muted-foreground py-3 text-center">Completed</TableHead>
                <TableHead className="text-xs text-muted-foreground py-3 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading team members...
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No team members found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((m) => (
                  <TableRow key={m._id || m.id} className="hover:bg-muted/10">
                    <TableCell className="font-mono text-xs">{m.memberId}</TableCell>
                    <TableCell className="font-medium text-xs">
                      {m.name}
                      {m.email && <div className="text-[11px] text-muted-foreground font-normal">{m.email}</div>}
                    </TableCell>
                    <TableCell className="text-xs">
                      {m.permissions?.[0] || 'Sales'}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {(m.moduleAccess && m.moduleAccess.length > 0 ? m.moduleAccess : ['tasks']).slice(0, 3).map((mod: string) => (
                          <Badge key={mod} variant="outline" className="text-[10px] px-1.5 py-0 capitalize bg-muted/40 font-normal">
                            {mod}
                          </Badge>
                        ))}
                        {(m.moduleAccess?.length || 1) > 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                            +{m.moduleAccess.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.status === 'active' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                        {m.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium font-mono text-xs">
                      {m.stats?.total || 0}
                    </TableCell>
                    <TableCell className="text-center text-green-500 font-medium font-mono text-xs">
                      {m.stats?.completed || 0}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open Actions Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingMember(m);
                              setEditModalOpen(true);
                            }}
                            className="text-xs cursor-pointer gap-2"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit Member</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(m)}
                            className="text-xs cursor-pointer gap-2"
                          >
                            <Power className="h-3.5 w-3.5" />
                            <span>{m.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleDeleteMember(m)}
                            className="text-xs cursor-pointer gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Member</span>
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
      </div>

      {/* Edit Member Modal */}
      <EditTeamMemberModal
        member={editingMember}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdated={fetchMembers}
      />
    </div>
  );
}
