'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { UploadCloud, Trash2, Copy, FileIcon, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { mediaApi } from '@/lib/api-client';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const res = await mediaApi.list();
      return res.data.data;
    },
  });

  const mediaList = mediaData || [];

  const uploadMutation = useMutation({
    mutationFn: (data: any) => mediaApi.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload file');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success('File deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete file');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        uploadMutation.mutate({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          base64Data: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const columns: ColumnDef<any>[] = [
    { 
      accessorKey: 'url', 
      header: 'Preview',
      cell: ({ row }) => {
        const mimeType = row.getValue('mimeType') as string;
        const url = row.getValue('url') as string;
        
        return (
          <div className="w-12 h-12 relative rounded bg-muted flex items-center justify-center overflow-hidden border">
            {mimeType?.startsWith('image/') ? (
              <img src={url} alt={row.original.filename} className="w-full h-full object-cover" />
            ) : (
              <FileIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
        );
      }
    },
    { 
      accessorKey: 'filename', 
      header: 'File Name',
      cell: ({ row }) => <span className="font-medium text-sm truncate max-w-[200px] block">{row.getValue('filename')}</span>
    },
    {
      accessorKey: 'mimeType',
      header: 'Type',
      cell: ({ row }) => <span className="text-xs text-muted-foreground uppercase">{((row.getValue('mimeType') as string) || '').split('/')[1] || 'FILE'}</span>
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => <span className="text-sm whitespace-nowrap">{formatBytes(row.getValue('size'))}</span>
    },
    {
      accessorKey: 'createdAt',
      header: 'Uploaded',
      cell: ({ row }) => <span className="text-sm whitespace-nowrap">{new Date(row.getValue('createdAt')).toLocaleDateString()}</span>
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => {
              navigator.clipboard.writeText(row.original.url);
              toast.success('URL copied to clipboard');
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => deleteMutation.mutate(row.original._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your images, videos, and files</p>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*,application/pdf"
          onChange={handleFileChange}
        />
        
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
          <UploadCloud className="mr-2 h-4 w-4" />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={mediaList} 
        isLoading={isLoading} 
      />
    </div>
  );
}
