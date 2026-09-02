'use client';

import { useQuery } from '@tanstack/react-query';
import { appsApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

type AppPlugin = {
  _id: string;
  name: string;
  developer: string;
  version: string;
  status: string;
  description: string;
};

const columns: ColumnDef<AppPlugin>[] = [
  {
    accessorKey: 'name',
    header: 'App Name',
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  { accessorKey: 'developer', header: 'Developer' },
  { accessorKey: 'version', header: 'Version' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'active'
              ? 'default'
              : status === 'error'
              ? 'destructive'
              : 'secondary'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('description')}</span>,
  },
];

export default function AppsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: async () => {
      const res = await appsApi.list();
      return res.data.data;
    },
  });

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Apps & Plugins</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Extend your store with plugins</p>
        </div>
      </div>

      <DataTable columns={columns} data={data || []} isLoading={isLoading} />
    </div>
  );
}
