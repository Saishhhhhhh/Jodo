'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { CreateTeamMemberModal } from '@/components/tasks/create-team-member-modal';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Users2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function TeamMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/team-members');
      setMembers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch team members', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.memberId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in flex flex-col h-[calc(100vh-theme(spacing.16))]">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage task-only team member accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateTeamMemberModal onCreated={fetchMembers} />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search team members..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-zinc-800 rounded-xl overflow-hidden bg-card">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader className="bg-muted/30 border-b border-zinc-800 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs text-zinc-400 py-3">Member ID</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3">Name</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3">Team</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3">Status</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3 text-center">Assigned Tasks</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3 text-center">Completed</TableHead>
                <TableHead className="text-xs text-zinc-400 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading team members...
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No team members found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((m) => (
                  <TableRow key={m._id} className="hover:bg-muted/10">
                    <TableCell className="font-mono text-xs">{m.memberId}</TableCell>
                    <TableCell className="font-medium">
                      {m.name}
                      {m.email && <div className="text-xs text-muted-foreground font-normal">{m.email}</div>}
                    </TableCell>
                    <TableCell>
                      {m.permissions?.[0] || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.status === 'active' ? 'success' : 'secondary'} className="text-[10px] capitalize">
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {m.stats?.total || 0}
                    </TableCell>
                    <TableCell className="text-center text-green-500 font-medium">
                      {m.stats?.completed || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
