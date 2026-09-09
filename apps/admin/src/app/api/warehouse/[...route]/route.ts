import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const path = route.join('/');

  if (path === 'kpi') {
    return NextResponse.json({
      success: true,
      data: {
        pipelineOrders: 4,
        activeManufacturers: 8,
        unitsInProduction: 8450,
        pendingQC: 6,
        availableStock: 19430,
        readyForFulfilment: 14,
      },
    });
  }

  if (path === 'pipeline') {
    return NextResponse.json({
      success: true,
      data: {
        procurement: 3,
        production: 5,
        qualityCheck: 4,
        warehouseStock: 12,
        fulfilmentReadiness: 8,
        shipped: 42,
      },
    });
  }

  if (path.startsWith('inventory/') && path.endsWith('/history')) {
    const sku = path.split('/')[1];
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'MOV-101',
          date: '2026-10-12 14:30',
          type: 'Production Inward',
          quantity: 250,
          balanceAfter: 1450,
          referenceId: 'PO-2026-88',
          performedBy: 'Inspector Rahul S',
          sku,
        },
      ],
    });
  }

  return NextResponse.json({
    success: true,
    data: [],
    message: `Warehouse route /api/warehouse/${path} reached`,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const path = route.join('/');
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    data: { id: `WH-${Date.now()}`, ...body },
    message: `Warehouse action at /api/warehouse/${path} executed successfully`,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const path = route.join('/');
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    data: { ...body, updatedAt: new Date().toISOString() },
    message: `Warehouse update at /api/warehouse/${path} executed successfully`,
  });
}
