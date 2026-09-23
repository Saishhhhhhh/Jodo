import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { InventoryItem } from '../models/InventoryItem';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Reservation } from '../models/Reservation';
import { sendSuccess, sendError } from '../utils/response';
import { InteraktService } from '../services/interakt';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';

const router = Router();

router.use(requireAuth);

router.get('/intelligence', async (req, res, next) => {
  try {
    // 1. Get all inventory items with basic product details
    const inventory = await InventoryItem.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).lean();

    const products = await Product.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).select('title sku imageUrl').lean();
    
    const productMap = new Map(products.map(p => [p.sku, p]));

    // 2. Calculate 30-day sales velocity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await Order.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      createdAt: { $gte: thirtyDaysAgo },
      paymentStatus: 'paid'
    }).lean();

    const skuSales: Record<string, number> = {};
    const skuCommittedBreakdown: Record<string, number> = {}; // Count pending items

    for (const order of recentOrders) {
      for (const item of order.items) {
        if (!item.sku) continue;
        
        // Sales velocity
        skuSales[item.sku] = (skuSales[item.sku] || 0) + item.quantity;

        // Committed / Reserved calculation (if order is unfulfilled)
        if (order.fulfillmentStatus === 'unfulfilled' || order.fulfillmentStatus === 'partially_fulfilled') {
          skuCommittedBreakdown[item.sku] = (skuCommittedBreakdown[item.sku] || 0) + item.quantity;
        }
      }
    }

    // Include active reservations
    const activeReservations = await Reservation.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      status: 'active'
    }).lean();

    for (const resv of activeReservations) {
      skuCommittedBreakdown[resv.sku] = (skuCommittedBreakdown[resv.sku] || 0) + resv.reservedQuantity;
    }

    // 3. Merge data to create intelligence insights
    const intelligence = inventory.map(item => {
      const product = productMap.get(item.sku);
      const soldLast30Days = skuSales[item.sku] || 0;
      const actualCommitted = skuCommittedBreakdown[item.sku] || 0;
      
      // We rely on actualCommitted from active orders to explain the 'committed' value
      // Even if item.committed in DB might drift, actualCommitted is real-time.

      // Velocity: Units sold per day on average
      const dailyVelocity = soldLast30Days / 30;
      
      // Demand Signal
      let demandSignal = 'Cold';
      if (soldLast30Days > 20) demandSignal = 'Hot';
      else if (soldLast30Days > 5) demandSignal = 'Steady';

      // Suggested Reorder Quantity (Target: 30 days buffer)
      const targetStock = Math.ceil(dailyVelocity * 30);
      let suggestedReorder = 0;
      
      if (item.available < targetStock) {
        suggestedReorder = targetStock - item.available;
      }
      
      // If demand is hot, pad the reorder by 20%
      if (demandSignal === 'Hot' && suggestedReorder > 0) {
        suggestedReorder = Math.ceil(suggestedReorder * 1.2);
      }

      const totalCommitted = Math.max(
        item.committed || 0,
        item.reservedStock || 0,
        skuCommittedBreakdown[item.sku] || 0
      );
      const onHand = item.onHand || (item.available || 0) + (item.committed || 0);
      const computedAvailable = typeof item.available === 'number' && item.available > 0
        ? item.available
        : Math.max(0, onHand - totalCommitted);

      const threshold = item.lowStockThreshold || item.reorderLevel || 10;
      let computedStatus = item.status;
      if (computedAvailable <= 0) {
        computedStatus = 'out_of_stock';
      } else if (computedAvailable <= threshold) {
        computedStatus = 'low_stock';
      } else {
        computedStatus = 'in_stock';
      }

      return {
        _id: item._id,
        sku: item.sku,
        product: product ? { title: product.title, imageUrl: product.imageUrl } : null,
        available: computedAvailable,
        committed: totalCommitted,
        actualCommitted: totalCommitted, // Used for tooltip explaining reserved stock
        lowStockThreshold: threshold,
        status: computedStatus,
        soldLast30Days,
        dailyVelocity: dailyVelocity.toFixed(2),
        demandSignal,
        suggestedReorder,
      };
    });

    // Sort by highest suggested reorder first
    intelligence.sort((a, b) => b.suggestedReorder - a.suggestedReorder);

    sendSuccess(res, intelligence);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const inventory = await InventoryItem.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 }).lean();

    // Fetch all products to match by SKU
    const products = await Product.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).select('title sku imageUrl category vendor').lean();

    const productMap = new Map(products.map(p => [p.sku, p]));

    const inventoryWithProducts = inventory.map(item => {
      const product = productMap.get(item.sku);
      return {
        ...item,
        product: product ? {
          title: product.title,
          imageUrl: product.imageUrl,
          category: product.category,
          vendor: product.vendor,
        } : null
      };
    });

    sendSuccess(res, inventoryWithProducts);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { available, committed, lowStockThreshold } = req.body;

    const item = await InventoryItem.findOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!item) {
      return sendError(res, 'Inventory item not found', 404);
    }

    const previousAvailable = item.available;
    const previousThreshold = item.lowStockThreshold;

    if (available !== undefined) item.available = parseInt(available, 10);
    if (committed !== undefined) item.committed = parseInt(committed, 10);
    if (lowStockThreshold !== undefined) item.lowStockThreshold = parseInt(lowStockThreshold, 10);

    // Recalculate totals
    item.onHand = item.available + item.committed;

    // Transition stock status
    if (item.available === 0) {
      item.status = 'out_of_stock';
    } else if (item.available < item.lowStockThreshold) {
      item.status = 'low_stock';
    } else {
      item.status = 'in_stock';
    }

    await item.save();

    // Trigger alert if it just crossed the threshold downwards
    if (previousAvailable >= previousThreshold && item.available < item.lowStockThreshold) {
      const admin = await User.findById(req.auth!.sub);
      const tenant = await Tenant.findById(req.auth!.tenantId);
      
      const interaktKey = (tenant as any)?.settings?.interaktApiKey;
      if (admin?.phone && interaktKey) {
        // Run in background to avoid blocking response
        InteraktService.sendTemplateMessage(
          interaktKey,
          admin.phone,
          'low_stock_alert', 
          'en',
          [item.sku, item.available.toString(), item.lowStockThreshold.toString()]
        ).catch(e => console.error('Failed to send stock alert:', e));
      }
    }

    sendSuccess(res, item, 'Inventory updated successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
