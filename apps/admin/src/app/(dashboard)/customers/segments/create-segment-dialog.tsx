'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerSegmentsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Trash2, Filter } from 'lucide-react';

interface CreateSegmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Rule = {
  field: 'totalSpent' | 'ordersCount' | 'status' | 'tags';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne' | 'contains';
  value: string;
};

export function CreateSegmentDialog({ open, onOpenChange }: CreateSegmentDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<Rule[]>([
    { field: 'totalSpent', operator: 'gte', value: '1000' }
  ]);

  const createMutation = useMutation({
    mutationFn: (data: any) => customerSegmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments-list'] });
      toast.success('Customer segment created successfully');
      onOpenChange(false);
      setName('');
      setDescription('');
      setRules([{ field: 'totalSpent', operator: 'gte', value: '1000' }]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create segment');
    },
  });

  const handleAddRule = () => {
    setRules(prev => [...prev, { field: 'ordersCount', operator: 'gte', value: '5' }]);
  };

  const handleRemoveRule = (idx: number) => {
    if (rules.length === 1) {
      toast.error('At least one filter rule is required');
      return;
    }
    setRules(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRuleChange = (idx: number, key: keyof Rule, val: any) => {
    setRules(prev => prev.map((rule, i) => {
      if (i !== idx) return rule;
      
      // If changing field, adjust default values and operators
      if (key === 'field') {
        const nextField = val as Rule['field'];
        if (nextField === 'status') {
          return { field: nextField, operator: 'eq', value: 'active' };
        } else if (nextField === 'tags') {
          return { field: nextField, operator: 'contains', value: 'wholesale' };
        } else {
          return { field: nextField, operator: 'gte', value: '100' };
        }
      }
      
      return { ...rule, [key]: val };
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    createMutation.mutate({
      name,
      description,
      rules,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-background border-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-400">
              <Filter className="h-5 w-5" />
              <DialogTitle className="text-lg font-bold">Create Customer Segment</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Define filter criteria to dynamically target customer cohorts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="segmentName" className="text-xs font-semibold text-zinc-400">Segment Name</Label>
              <Input 
                id="segmentName" 
                placeholder="e.g. VIP High Spenders" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="segmentDesc" className="text-xs font-semibold text-zinc-400">Description (Optional)</Label>
              <Input 
                id="segmentDesc" 
                placeholder="e.g. Spent ₹1,000+ and placed 5+ orders" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Rules Feed */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter Rules</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-indigo-400 hover:text-indigo-300"
                  onClick={handleAddRule}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Rule
                </Button>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center p-3 rounded-lg border border-zinc-800 bg-muted/20">
                    
                    {/* Field select */}
                    <div className="w-[150px] shrink-0">
                      <Select 
                        value={rule.field}
                        onValueChange={(val) => handleRuleChange(idx, 'field', val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="totalSpent">Total Spent</SelectItem>
                          <SelectItem value="ordersCount">Orders Placed</SelectItem>
                          <SelectItem value="status">Account Status</SelectItem>
                          <SelectItem value="tags">Customer Tag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator select */}
                    <div className="w-[110px] shrink-0">
                      <Select 
                        value={rule.operator}
                        onValueChange={(val) => handleRuleChange(idx, 'operator', val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rule.field === 'status' ? (
                            <>
                              <SelectItem value="eq">Equals</SelectItem>
                              <SelectItem value="ne">Not Equals</SelectItem>
                            </>
                          ) : rule.field === 'tags' ? (
                            <>
                              <SelectItem value="contains">Contains Tag</SelectItem>
                              <SelectItem value="ne">Does Not Contain</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="gte">&ge; (Greater/Eq)</SelectItem>
                              <SelectItem value="lte">&le; (Less/Eq)</SelectItem>
                              <SelectItem value="gt">&gt; (Greater)</SelectItem>
                              <SelectItem value="lt">&lt; (Less)</SelectItem>
                              <SelectItem value="eq">= (Equals)</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value Input */}
                    <div className="flex-1 min-w-[80px]">
                      {rule.field === 'status' ? (
                        <Select 
                          value={rule.value}
                          onValueChange={(val) => handleRuleChange(idx, 'value', val)}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : rule.field === 'tags' ? (
                        <Input 
                          type="text"
                          className="h-9 text-xs"
                          value={rule.value}
                          onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                          placeholder="e.g. wholesale"
                          required
                        />
                      ) : (
                        <Input 
                          type="number"
                          min={0}
                          className="h-9 text-xs"
                          value={rule.value}
                          onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                          required
                        />
                      )}
                    </div>

                    {/* Delete Rule button */}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-zinc-500 hover:text-rose-400 shrink-0"
                      onClick={() => handleRemoveRule(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-zinc-800 pt-4 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm">
              {createMutation.isPending ? 'Saving...' : 'Save Segment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
