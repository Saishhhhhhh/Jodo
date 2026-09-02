import cron from 'node-cron';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Customer } from '../models/Customer';
import { InventoryItem } from '../models/InventoryItem';
import { Reservation } from '../models/Reservation';
import { NotificationService } from './NotificationService';

const Report = mongoose.model('Report');

// Function to generate the actual report
async function generateReport(type: 'daily' | 'weekly') {
  console.log(`Generating ${type} report...`);
  try {
    const to = new Date();
    const from = new Date();
    if (type === 'daily') {
      from.setDate(from.getDate() - 1);
    } else {
      from.setDate(from.getDate() - 7);
    }

    // In a multi-tenant system, we might need to iterate over all tenants and stores.
    // For this demonstration, we'll fetch distinct storeIds and generate reports for them.
    const storeIds = await Order.distinct('storeId');

    for (const storeId of storeIds) {
      const orderSample = await Order.findOne({ storeId });
      if (!orderSample) continue;

      const tenantId = orderSample.tenantId;
      const baseFilter = {
        storeId,
        tenantId,
        createdAt: { $gte: from, $lte: to }
      };

      const salesAgg = await Order.aggregate([
        { $match: { ...baseFilter, status: { $ne: 'draft' } } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]);
      const sales = salesAgg[0] || { totalRevenue: 0, count: 0 };

      const quotationsCount = await Order.countDocuments({ ...baseFilter, status: 'draft' });

      const ordersAgg = await Order.aggregate([
        { $match: { ...baseFilter, status: { $ne: 'draft' } } },
        { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
      ]);
      const ordersByStatus = ordersAgg.reduce((acc: any, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      const leadsCount = await Customer.countDocuments(baseFilter);

      const inventoryAgg = await InventoryItem.aggregate([
        { $match: { storeId, tenantId } },
        { $group: { _id: null, totalQuantity: { $sum: "$available" }, count: { $sum: 1 } } }
      ]);
      const inventory = inventoryAgg[0] || { totalQuantity: 0, count: 0 };

      const data = {
        sales: { totalRevenue: sales.totalRevenue, totalOrders: sales.count },
        leads: { total: leadsCount },
        inventory: { totalItems: inventory.count, totalQuantity: inventory.totalQuantity },
        quotations: { total: quotationsCount },
        orders: { total: sales.count, byStatus: ordersByStatus },
        supportCases: { total: 0, open: 0, resolved: 0 },
        followUps: { pending: 0, overdue: 0 }
      };

      const report = new Report({
        tenantId,
        storeId,
        name: `Automated ${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        type,
        dateRange: { from, to },
        status: 'completed',
        data
      });
      await report.save();
    }
    console.log(`${type} reports generated successfully.`);
  } catch (error) {
    console.error(`Error generating ${type} report:`, error);
  }
}

export function initCronJobs() {
  // Daily report every day at 8:00 AM (Asia/Kolkata)
  cron.schedule('0 8 * * *', () => {
    generateReport('daily');
  }, {
    timezone: 'Asia/Kolkata'
  });

  // Weekly report every Monday at 8:00 AM (Asia/Kolkata)
  cron.schedule('0 8 * * 1', () => {
    generateReport('weekly');
  }, {
    timezone: 'Asia/Kolkata'
  });

  // Hourly background inventory check for missed conditions & expiring reservations
  cron.schedule('0 * * * *', async () => {
    console.log('Running background inventory notification checks...');
    try {
      // Find all expiring reservations (e.g. expiring within 24 hours)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const expiring = await Reservation.find({
        status: 'active',
        expiryDate: { $lte: tomorrow, $gte: new Date() }
      }).populate('productId', 'title sku');
      
      for (const res of expiring) {
        // Here we can trigger the NotificationService or inline
        // Assuming NotificationService.checkExpiringReservation(res) exists, or do it here:
        const prod: any = res.productId;
        await mongoose.model('Notification').create({
          tenantId: res.tenantId,
          storeId: res.storeId,
          type: 'inventory_alert',
          title: 'Reservation Expiring Soon',
          message: `Reservation of ${res.reservedQuantity} units for ${prod?.title || res.sku} will expire on ${res.expiryDate?.toLocaleDateString()}`,
          severity: 'warning',
          state: 'unread',
          targetRoles: ['admin', 'operations', 'sales'],
          metadata: {
            sku: res.sku,
            referenceType: res.referenceType,
            referenceId: res.referenceId,
            alertState: 'Reservation Expiring'
          }
        });
      }
      
      // We could also loop over all inventory items, but that's heavy.
      // We rely on the save hook for instant updates, and this cron is just a safety net for edge cases
      // if we wanted to fully scan.
    } catch (err) {
      console.error('Error in background notification check:', err);
    }
  });
}
