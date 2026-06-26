import { Router, Request, Response } from 'express';
import { requireAuth, requireTenant } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import mongoose from 'mongoose';

const router = Router();

// Apply auth to all dashboard routes
router.use(requireAuth, requireTenant);

/**
 * GET /api/admin/dashboard/summary
 * Returns key metrics for the dashboard
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const storeId = new mongoose.Types.ObjectId(req.auth!.storeId);

    // Import models lazily to avoid circular deps
    const { default: Order } = await import('../models/Order').catch(() => ({ default: null }));

    // In Phase 0, we return mock dashboard data since Order/Product models aren't built yet
    // These will be replaced with real aggregations in Phase 2+
    const mockData = {
      totalRevenue: {
        label: 'Total Revenue',
        value: 0,
        change: 0,
        trend: 'flat' as const,
        format: 'currency' as const,
        currency: 'INR',
      },
      netRevenue: {
        label: 'Net Revenue',
        value: 0,
        change: 0,
        trend: 'flat' as const,
        format: 'currency' as const,
        currency: 'INR',
      },
      ordersToday: {
        label: 'Orders Today',
        value: 0,
        change: 0,
        trend: 'flat' as const,
        format: 'number' as const,
      },
      averageOrderValue: {
        label: 'Avg Order Value',
        value: 0,
        change: 0,
        trend: 'flat' as const,
        format: 'currency' as const,
        currency: 'INR',
      },
      conversionRate: {
        label: 'Conversion Rate',
        value: 0,
        change: 0,
        trend: 'flat' as const,
        format: 'percentage' as const,
      },
      pendingFulfillments: {
        label: 'Pending Fulfillments',
        value: 0,
        change: 0,
        trend: 'flat' as const,
        format: 'number' as const,
      },
      lowStockProducts: {
        label: 'Low Stock Products',
        value: 0,
        change: 0,
        trend: 'flat' as const,
        format: 'number' as const,
      },
      returnedOrders: {
        label: 'Returns',
        value: 0,
        change: 0,
        trend: 'flat' as const,
        format: 'number' as const,
      },
      recentOrders: [],
      salesByDay: generateMockSalesData(),
    };

    void tenantId;
    void storeId;

    sendSuccess(res, mockData);
  } catch (err) {
    console.error(err);
    sendError(res, 'Failed to fetch dashboard data');
  }
});

function generateMockSalesData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      revenue: 0,
      orders: 0,
    });
  }
  return data;
}

export default router;
