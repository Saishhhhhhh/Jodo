'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Settings, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TemplatesPage() {
  const templates = [
    { id: 1, name: 'Customer Onboarding', department: 'Sales', tasksCount: 6, description: 'Standard process for onboarding a new enterprise customer.' },
    { id: 2, name: 'Monthly Review', department: 'Operations', tasksCount: 4, description: 'End of month operational review checklist.' },
    { id: 3, name: 'New Employee Setup', department: 'HR', tasksCount: 12, description: 'IT and HR setup for new hires.' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Reusable task structures for recurring workflows.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {templates.map(template => (
          <Card key={template.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge variant="outline">{template.department}</Badge>
              </div>
              <CardTitle className="text-lg mt-4">{template.name}</CardTitle>
              <CardDescription className="line-clamp-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground font-medium">{template.tasksCount} tasks in flow</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
