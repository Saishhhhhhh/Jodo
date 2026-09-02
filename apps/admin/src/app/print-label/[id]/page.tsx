'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, storeApi } from '@/lib/api-client';
import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrintShippingLabelPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: order, isLoading: isOrderLoading } = useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const res = await ordersApi.get(id);
      return res.data.data;
    },
  });

  const { data: storeData, isLoading: isStoreLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const response = await storeApi.get();
      return response.data.data;
    },
  });

  const isLoading = isOrderLoading || isStoreLoading;

  useEffect(() => {
    if (!isLoading && order && storeData) {
      // Auto trigger print after a brief delay for assets to render
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, order, storeData]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading label for print...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-destructive">Order not found.</div>;
  }

  const storeSettings = storeData?.settings || {};
  const fulfillment = order.fulfillments?.[order.fulfillments.length - 1] || {};

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
      {/* Navigation & Actions (hidden on print) */}
      <div className="no-print max-w-lg mx-auto mb-6 flex items-center justify-between border-b pb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-black hover:bg-zinc-100">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button size="sm" onClick={() => window.print()} className="bg-black text-white hover:bg-zinc-800">
          <Printer className="h-4 w-4 mr-2" /> Print Label
        </Button>
      </div>

      {/* Label Container (standard 4" x 6" shipping label card style) */}
      <div className="max-w-md mx-auto border-4 border-black p-5 space-y-5 bg-white shadow-sm print:shadow-none print:border-4 print:p-4">
        
        {/* Header Block */}
        <div className="flex justify-between items-start border-b-2 border-black pb-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-wider uppercase">Jodo Express</h1>
            <p className="text-xs font-semibold text-zinc-600">STANDARD DOMESTIC</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{order.orderNumber}</div>
            <div className="text-xs text-zinc-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Sender & Recipient addresses in grid */}
        <div className="grid grid-cols-2 gap-4 text-xs border-b-2 border-black pb-4">
          {/* SHIP FROM (Store Return Address) */}
          <div className="space-y-1 pr-2 border-r border-zinc-300">
            <h3 className="font-bold uppercase text-zinc-500 tracking-wider">Ship From:</h3>
            <p className="font-bold">{storeData.name || 'Jodo Store'}</p>
            <p className="text-zinc-700">123 eCommerce Lane</p>
            <p className="text-zinc-700">Tech Park, Phase 2</p>
            <p className="text-zinc-700">Mumbai, MH 400001</p>
            <p className="text-zinc-700">India</p>
          </div>

          {/* SHIP TO (Customer Address) */}
          <div className="space-y-1 pl-1">
            <h3 className="font-bold uppercase text-zinc-500 tracking-wider">Ship To:</h3>
            {order.shippingAddress ? (
              <>
                <p className="font-bold">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="text-zinc-700">{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p className="text-zinc-700">{order.shippingAddress.address2}</p>}
                <p className="text-zinc-700">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </p>
                <p className="text-zinc-700">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="text-zinc-700 font-medium">T: {order.shippingAddress.phone}</p>}
              </>
            ) : (
              <p className="italic text-zinc-400">No address provided</p>
            )}
          </div>
        </div>

        {/* Tracking Details & Carrier */}
        <div className="space-y-2 border-b-2 border-black pb-4">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span>CARRIER:</span>
            <span className="uppercase text-lg font-bold">{fulfillment.carrier || 'Standard'}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm font-semibold">
            <span>TRACKING ID:</span>
            <span className="font-mono text-zinc-800">{fulfillment.trackingNumber || 'PENDING'}</span>
          </div>
        </div>

        {/* CSS-based Barcode styling */}
        <div className="flex flex-col items-center justify-center py-2 space-y-1">
          <div className="w-full h-16 flex items-stretch justify-center bg-white">
            {/* Generate structured barcode lines for visualization */}
            {[
              1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 1, 2, 1, 3, 1, 4, 2, 1, 2, 1, 3, 1, 2, 4, 1, 1, 3, 2, 1, 1, 4
            ].map((width, idx) => (
              <div
                key={idx}
                className={`w-px shrink-0 ${idx % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}
                style={{
                  width: `${width}px`,
                  marginLeft: idx > 0 ? '1px' : '0'
                }}
              />
            ))}
          </div>
          <span className="text-xs font-mono tracking-widest">{fulfillment.trackingNumber || order.orderNumber}</span>
        </div>

        {/* Item Summaries (Fulfillment manifest details) */}
        <div className="border-t-2 border-dashed border-black pt-4 text-[10px] space-y-1.5">
          <div className="flex justify-between font-bold border-b pb-1 text-zinc-600">
            <span>ITEM SUMMARY</span>
            <span>QTY</span>
          </div>
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between text-zinc-800">
              <span className="truncate max-w-[280px]">
                {item.title} <span className="font-mono text-[9px] text-zinc-500">({item.sku})</span>
              </span>
              <span className="font-bold">{item.quantity}</span>
            </div>
          ))}
        </div>
        
      </div>

      {/* Global CSS to override layouts during print */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
