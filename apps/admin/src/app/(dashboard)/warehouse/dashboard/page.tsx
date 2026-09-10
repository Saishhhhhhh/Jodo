'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WarehouseDashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/warehouse');
  }, [router]);

  return <div className="p-6 text-sm text-muted-foreground">Redirecting to Warehouse Dashboard...</div>;
}
