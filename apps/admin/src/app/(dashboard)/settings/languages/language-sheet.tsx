'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
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

export const ALL_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' },
];

const languageSchema = z.object({
  code: z.string().min(1, 'Please select a language'),
});

type LanguageFormValues = z.infer<typeof languageSchema>;

interface LanguageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingLanguages: any[];
  defaultLanguage: any;
  onAdd: (values: any) => void;
}

export function LanguageSheet({
  open,
  onOpenChange,
  existingLanguages,
  defaultLanguage,
  onAdd,
}: LanguageSheetProps) {
  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      code: '',
    },
  });

  const availableLanguages = ALL_LANGUAGES.filter(
    (lang) =>
      lang.code !== defaultLanguage?.code &&
      !existingLanguages.some((existing) => existing.code === lang.code)
  );

  function onSubmit(values: LanguageFormValues) {
    const selected = ALL_LANGUAGES.find((l) => l.code === values.code);
    if (selected) {
      onAdd({
        code: selected.code,
        name: selected.name,
        isPublished: false,
      });
      onOpenChange(false);
      form.reset({ code: '' });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle>Add Language</SheetTitle>
          <SheetDescription>
            Choose a language to add to your store. You can translate your content and publish it when ready.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
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
                      {availableLanguages.map((lang) => (
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

            <SheetFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={availableLanguages.length === 0}>
                Add
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
