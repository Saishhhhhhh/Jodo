'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Languages, Plus, Trash2, Globe, Check, AlertCircle, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { storeApi } from '@/lib/api-client';
import { LanguageSheet, ALL_LANGUAGES } from './language-sheet';
import { ChangeDefaultDialog } from './change-default-dialog';

export default function SettingsLanguagesPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch store settings
  const { data: store, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      return response.data.data;
    },
  });

  const languageSettings = store?.settings?.languages || {};
  const defaultLanguage = languageSettings.defaultLanguage || { code: 'en', name: 'English' };
  const translatedLanguages: any[] = languageSettings.translatedLanguages || [];

  // Mutation to update store settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedLanguages: any) => {
      const newSettings = {
        ...(store?.settings || {}),
        languages: {
          ...(store?.settings?.languages || {}),
          ...updatedLanguages,
        },
      };
      const response = await storeApi.update({ settings: newSettings });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      toast.success('Language settings updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update language settings.');
    },
  });

  // Add translated language
  const handleAddLanguage = (newLang: any) => {
    const updated = [...translatedLanguages, newLang];
    updateSettingsMutation.mutate({
      translatedLanguages: updated,
    });
  };

  // Toggle publish status
  const handleTogglePublish = (code: string) => {
    const updated = translatedLanguages.map((lang) =>
      lang.code === code ? { ...lang, isPublished: !lang.isPublished } : lang
    );
    updateSettingsMutation.mutate({
      translatedLanguages: updated,
    });
  };

  // Delete language
  const handleDeleteLanguage = (code: string) => {
    const updated = translatedLanguages.filter((lang) => lang.code !== code);
    updateSettingsMutation.mutate({
      translatedLanguages: updated,
    });
  };

  // Change default language
  const handleChangeDefault = (newDefaultCode: string) => {
    if (newDefaultCode === defaultLanguage.code) return;

    const selectedLang = ALL_LANGUAGES.find((l) => l.code === newDefaultCode);
    if (!selectedLang) return;

    // Filter new default out of translated list and insert old default
    const filteredTranslated = translatedLanguages.filter((l) => l.code !== newDefaultCode);
    const newTranslatedList = [
      ...filteredTranslated,
      {
        code: defaultLanguage.code,
        name: defaultLanguage.name,
        isPublished: true, // Old default defaults to published
      },
    ];

    updateSettingsMutation.mutate({
      defaultLanguage: selectedLang,
      translatedLanguages: newTranslatedList,
    });
  };

  // Combine default + translated to show options for default language swap
  const getChangeDefaultOptions = () => {
    return [defaultLanguage, ...translatedLanguages];
  };

  if (isLoading) {
    return (
      <div className="p-6 w-full flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full space-y-6 animate-fade-in">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Languages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your store's default language and secondary translation languages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Default Language
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              The primary language that customers see first when they load your store.
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Storefront Default</CardTitle>
                <CardDescription>The default language for checkout, notifications, and menus.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                <RefreshCw className="mr-2 h-4 w-4" /> Change Default
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/40">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{defaultLanguage.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Code: {defaultLanguage.code}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" /> Secondary Languages
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add translations for regional storefronts to engage international customers.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">Translated Languages</CardTitle>
                <CardDescription>Languages currently in draft or published on your store.</CardDescription>
              </div>
              <Button onClick={() => setSheetOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Language
              </Button>
            </CardHeader>
            <CardContent>
              {translatedLanguages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Language</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {translatedLanguages.map((lang) => (
                      <TableRow key={lang.code}>
                        <TableCell className="font-medium">{lang.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{lang.code}</Badge>
                        </TableCell>
                        <TableCell>
                          {lang.isPublished ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleTogglePublish(lang.code)}
                          >
                            {lang.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteLanguage(lang.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg text-center bg-muted/20">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/60 mb-3" />
                  <h4 className="text-sm font-semibold">No secondary languages added</h4>
                  <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
                    Add languages to translate page layouts, products, and checkouts.
                  </p>
                  <Button onClick={() => setSheetOpen(true)} variant="outline" size="sm" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Add First Language
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LanguageSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        existingLanguages={translatedLanguages}
        defaultLanguage={defaultLanguage}
        onAdd={handleAddLanguage}
      />

      <ChangeDefaultDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        languagesList={getChangeDefaultOptions()}
        onSave={handleChangeDefault}
      />
    </div>
  );
}
