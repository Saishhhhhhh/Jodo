'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaultSchema = z.object({
  code: z.string().min(1, 'Please select a language'),
});

type DefaultFormValues = z.infer<typeof defaultSchema>;

interface ChangeDefaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  languagesList: any[]; // includes current default + translated
  onSave: (code: string) => void;
}

export function ChangeDefaultDialog({
  open,
  onOpenChange,
  languagesList,
  onSave,
}: ChangeDefaultDialogProps) {
  const form = useForm<DefaultFormValues>({
    resolver: zodResolver(defaultSchema),
    defaultValues: {
      code: '',
    },
  });

  function onSubmit(values: DefaultFormValues) {
    onSave(values.code);
    onOpenChange(false);
    form.reset({ code: '' });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Change default language</DialogTitle>
          <DialogDescription>
            Choose which language is displayed by default on your store. The old default language will remain available as a translation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languagesList.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
