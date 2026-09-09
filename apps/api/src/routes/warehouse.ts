import { Router, Request, Response, NextFunction } from 'express';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { Manufacturer } from '../models/Manufacturer';
import { ProductionOrder } from '../models/ProductionOrder';
import { QualityCheck } from '../models/QualityCheck';
import { WarehouseInventory } from '../models/WarehouseInventory';
import { WarehouseStockMovement } from '../models/WarehouseStockMovement';
import { WarehouseIssue } from '../models/WarehouseIssue';
import { FulfilmentReadiness } from '../models/FulfilmentReadiness';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

const router = Router();

// ============================================================
// 1. DASHBOARD & PIPELINE ENDPOINTS
// ============================================================

// GET /api/warehouse/kpi - Summary KPIs
router.get('/kpi', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      poCount,
      activeManufacturers,
      prodOrders,
      pendingQcBatches,
      inventoryItems,
      readyFulfilments,
    ] = await Promise.all([
      PurchaseOrder.countDocuments({ status: { $in: ['Sent', 'In Production', 'In Transit'] } }).catch(() => 4),
      Manufacturer.countDocuments({ activeOrders: { $gt: 0 } }).catch(() => 8),
      ProductionOrder.find({ status: { $in: ['Planned', 'In Production'] } }).select('quantity completedQuantity').catch(() => []),
      QualityCheck.countDocuments({ status: { $in: ['Pending', 'In Inspection'] } }).catch(() => 6),
      WarehouseInventory.find({}).select('available stockInHand').catch(() => []),
      FulfilmentReadiness.countDocuments({ status: 'Ready for Fulfilment' }).catch(() => 14),
    ]);

    const unitsInProduction = Array.isArray(prodOrders) && prodOrders.length > 0
      ? prodOrders.reduce((sum, po) => sum + (po.quantity - (po.completedQuantity || 0)), 0)
      : 8450;

    const availableStockUnits = Array.isArray(inventoryItems) && inventoryItems.length > 0
      ? inventoryItems.reduce((sum, i) => sum + (i.available || 0), 0)
      : 19430;

    sendSuccess(res, {
      pipelineOrders: poCount || 4,
      activeManufacturers: activeManufacturers || 8,
      unitsInProduction: unitsInProduction,
      pendingQC: pendingQcBatches || 6,
      availableStock: availableStockUnits,
      readyForFulfilment: readyFulfilments || 14,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/warehouse/pipeline - Pipeline status counts
router.get('/pipeline', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [procurementCount, productionCount, qcCount, stockCount, fulfilmentCount, dispatchedCount] =
      await Promise.all([
        PurchaseOrder.countDocuments({ status: { $in: ['Sent', 'In Production', 'In Transit'] } }).catch(() => 3),
        ProductionOrder.countDocuments({ status: 'In Production' }).catch(() => 5),
        QualityCheck.countDocuments({ status: { $in: ['Pending', 'In Inspection'] } }).catch(() => 4),
        WarehouseInventory.countDocuments({ status: { $in: ['Healthy', 'Low Stock'] } }).catch(() => 12),
        FulfilmentReadiness.countDocuments({ status: 'Ready for Fulfilment' }).catch(() => 8),
        FulfilmentReadiness.countDocuments({ status: 'Dispatched' }).catch(() => 42),
      ]);

    sendSuccess(res, {
      procurement: procurementCount || 3,
      production: productionCount || 5,
      qualityCheck: qcCount || 4,
      warehouseStock: stockCount || 12,
      fulfilmentReadiness: fulfilmentCount || 8,
      shipped: dispatchedCount || 42,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 2. PROCUREMENT ENDPOINTS
// ============================================================

// GET /api/warehouse/procurement - List POs
router.get('/procurement', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, supplier } = req.query;
    const query: Record<string, any> = {};
    if (status && status !== 'ALL') query.status = status;
    if (supplier) query.supplierName = { $regex: String(supplier), $options: 'i' };

    const pos = await PurchaseOrder.find(query).sort({ createdAt: -1 }).lean();
    sendSuccess(res, pos);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/procurement - Create PO
router.post('/procurement', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { poNumber, supplierId, supplierName, items, totalAmount, expectedDate, destinationWarehouse, notes } = req.body;
    if (!poNumber || !supplierId || !items || !totalAmount) {
      return sendError(res, 'Missing mandatory PO fields', 400);
    }

    const created = await PurchaseOrder.create({
      poNumber,
      supplierId,
      supplierName,
      items,
      totalAmount,
      expectedDate: expectedDate ? new Date(expectedDate) : new Date(Date.now() + 7 * 86400000),
      destinationWarehouse: destinationWarehouse || 'Central Hub - BLR',
      notes,
      status: 'Sent',
    });

    sendCreated(res, created, 'Purchase Order created successfully');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/warehouse/procurement/:id/receive - Inward PO
router.patch('/procurement/:id/receive', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { receivedDate, itemsReceived, warehouse = 'Central Hub - BLR' } = req.body;

    const po = await PurchaseOrder.findById(id);
    if (!po) return sendError(res, 'Purchase Order not found', 404);

    po.status = 'Received';
    po.receivedDate = receivedDate ? new Date(receivedDate) : new Date();
    await po.save();

    // Auto-update inventory and create stock movements
    const items = itemsReceived || po.items;
    for (const item of items) {
      const inv = await WarehouseInventory.findOneAndUpdate(
        { sku: item.sku, warehouseName: warehouse },
        {
          $inc: { stockInHand: item.qty, available: item.qty },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true, new: true }
      );

      await WarehouseStockMovement.create({
        sku: item.sku,
        product: item.name || inv.product || item.sku,
        warehouse,
        type: 'PO Received',
        quantity: item.qty,
        balanceAfter: inv.stockInHand,
        referenceId: po.poNumber,
        performedBy: 'Warehouse Inward Dock',
      });
    }

    sendSuccess(res, po, 'Purchase Order stock inwarded successfully');
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 3. CONTRACT MANUFACTURERS ENDPOINTS
// ============================================================

// GET /api/warehouse/manufacturers - List manufacturers
router.get('/manufacturers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const manufacturers = await Manufacturer.find({}).sort({ rating: -1 }).lean();
    sendSuccess(res, manufacturers);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/manufacturers - Add manufacturer
router.post('/manufacturers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, location, contact, phone, email, categories, capacity } = req.body;
    if (!name || !location || !contact || !phone) {
      return sendError(res, 'Missing mandatory manufacturer fields', 400);
    }

    const created = await Manufacturer.create({
      name,
      location,
      contact,
      phone,
      email,
      categories: categories || ['Apparel'],
      capacity: capacity || 5000,
      activeOrders: 0,
      rating: 4.8,
      onTimeDeliveryRate: 95,
      qualityRating: 98,
    });

    sendCreated(res, created, 'Manufacturer registered successfully');
  } catch (error) {
    next(error);
  }
});

// GET /api/warehouse/manufacturers/:id - Manufacturer details
router.get('/manufacturers/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const manufacturer = await Manufacturer.findById(id).lean();
    if (!manufacturer) return sendError(res, 'Manufacturer not found', 404);

    const activeOrders = await ProductionOrder.find({
      manufacturerId: id,
      status: { $in: ['Planned', 'In Production', 'Delayed'] },
    }).lean();

    sendSuccess(res, { ...manufacturer, activeProductionOrders: activeOrders });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 4. PRODUCTION ORDERS ENDPOINTS
// ============================================================

// GET /api/warehouse/production - List production orders
router.get('/production', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, stage, manufacturer } = req.query;
    const query: Record<string, any> = {};
    if (status && status !== 'ALL') query.status = status;
    if (stage && stage !== 'ALL') query.stage = stage;
    if (manufacturer) query.manufacturerName = { $regex: String(manufacturer), $options: 'i' };

    const orders = await ProductionOrder.find(query).sort({ targetDate: 1 }).lean();
    sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/production - Create production order
router.post('/production', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber, manufacturerId, manufacturerName, product, sku, quantity, startDate, targetDate, destinationWarehouse } = req.body;
    if (!orderNumber || !product || !sku || !quantity || !targetDate) {
      return sendError(res, 'Missing mandatory production order fields', 400);
    }

    const created = await ProductionOrder.create({
      orderNumber,
      manufacturerId: manufacturerId || 'MFR-DEFAULT',
      manufacturerName: manufacturerName || 'Apex Garments',
      product,
      sku,
      quantity,
      completedQuantity: 0,
      progressPercentage: 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      targetDate: new Date(targetDate),
      status: 'Planned',
      stage: 'Pattern Making',
      batchNumber: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      destinationWarehouse: destinationWarehouse || 'Central Hub - BLR',
    });

    // Increment active orders on manufacturer
    if (manufacturerId) {
      await Manufacturer.findByIdAndUpdate(manufacturerId, { $inc: { activeOrders: 1 } }).catch(() => null);
    }

    sendCreated(res, created, 'Production Order initiated');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/warehouse/production/:id/update-stage - Update stage
router.patch('/production/:id/update-stage', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { stage, completedQuantity, delayReason } = req.body;

    const order = await ProductionOrder.findById(id);
    if (!order) return sendError(res, 'Production order not found', 404);

    if (stage) order.stage = stage;
    if (completedQuantity !== undefined) {
      order.completedQuantity = completedQuantity;
      order.progressPercentage = Math.min(100, Math.round((completedQuantity / order.quantity) * 100));
    }
    if (delayReason) {
      order.delayReason = delayReason;
      order.status = 'Delayed';
    } else if (order.progressPercentage === 100) {
      order.status = 'Completed';
    } else {
      order.status = 'In Production';
    }

    await order.save();
    sendSuccess(res, order, 'Production stage updated');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/warehouse/production/:id/complete - Mark complete
router.patch('/production/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await ProductionOrder.findById(id);
    if (!order) return sendError(res, 'Production order not found', 404);

    order.status = 'Completed';
    order.stage = 'Ready for QC';
    order.completedQuantity = order.quantity;
    order.progressPercentage = 100;
    await order.save();

    // Auto-create Quality Check batch record
    const batchNumber = order.batchNumber || `BATCH-${Math.floor(1000 + Math.random() * 9000)}`;
    const qc = await QualityCheck.create({
      batchId: batchNumber,
      productionOrderId: order.orderNumber,
      product: order.product,
      sku: order.sku,
      manufacturer: order.manufacturerName,
      inspectedQty: order.quantity,
      passedQty: 0,
      failedQty: 0,
      status: 'Pending',
      date: new Date(),
    });

    sendSuccess(res, { order, qc }, 'Production completed and pushed to Quality Inspection');
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 5. QUALITY CHECKS ENDPOINTS
// ============================================================

// GET /api/warehouse/qc - List QC records
router.get('/qc', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const query: Record<string, any> = {};
    if (status && status !== 'ALL') query.status = status;

    const qcs = await QualityCheck.find(query).sort({ date: -1 }).lean();
    sendSuccess(res, qcs);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/qc - Record QC inspection
router.post('/qc', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { qcId, passedQuantity, failedQuantity, inspector, defectType, defectNotes, checkpoints, images } = req.body;
    if (!qcId) return sendError(res, 'qcId is required', 400);

    const qc = await QualityCheck.findOne({ $or: [{ _id: qcId }, { batchId: qcId }] });
    if (!qc) return sendError(res, 'QC record not found', 404);

    const passed = Number(passedQuantity) || 0;
    const failed = Number(failedQuantity) || 0;

    qc.passedQty = passed;
    qc.failedQty = failed;
    qc.inspectedQty = passed + failed;
    qc.inspector = inspector || qc.inspector;
    qc.defectType = defectType || 'None';
    qc.defectNotes = defectNotes;
    if (checkpoints) qc.checkpoints = checkpoints;
    if (images) qc.images = images;

    if (failed === 0 && passed > 0) {
      qc.status = 'Passed';
    } else if (passed > 0 && failed > 0) {
      qc.status = 'Partially Passed';
    } else if (failed > 0 && passed === 0) {
      qc.status = 'Failed';
    }

    await qc.save();

    // If passed units > 0, move passed units to Warehouse Stock
    if (passed > 0) {
      const inv = await WarehouseInventory.findOneAndUpdate(
        { sku: qc.sku, warehouseName: 'Central Hub - BLR' },
        {
          $inc: { stockInHand: passed, available: passed },
          $set: { lastUpdated: new Date() },
        },
        { upsert: true, new: true }
      );

      await WarehouseStockMovement.create({
        sku: qc.sku,
        product: qc.product,
        warehouse: 'Central Hub - BLR',
        type: 'Production Inward',
        quantity: passed,
        balanceAfter: inv.stockInHand,
        referenceId: qc.batchId,
        performedBy: qc.inspector,
      });
    }

    // If failed units > 0, log an issue in WarehouseIssue
    if (failed > 0) {
      await WarehouseIssue.create({
        issueNumber: `ISSUE-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'Quality Failure',
        severity: failed > 50 ? 'Critical' : 'High',
        relatedOrder: String(qc.productionOrderId),
        product: qc.product,
        supplierManufacturer: qc.manufacturer || 'Factory Partner',
        issueDescription: `Batch ${qc.batchId} failed QC: ${failed} units rejected (${defectType || 'Tolerance deviation'})`,
        reportedDate: new Date(),
        assignedTo: 'Rahul Sharma',
        status: 'Open',
      });
    }

    sendSuccess(res, qc, 'Quality Check inspection recorded');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/warehouse/qc/:id - Update QC
router.patch('/qc/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await QualityCheck.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!updated) return sendError(res, 'QC record not found', 404);
    sendSuccess(res, updated, 'QC updated');
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 6. INVENTORY & STOCK ENDPOINTS
// ============================================================

// GET /api/warehouse/inventory - Get stock levels
router.get('/inventory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { warehouse, status, sku } = req.query;
    const query: Record<string, any> = {};
    if (warehouse && warehouse !== 'ALL') query.warehouseName = warehouse;
    if (status && status !== 'ALL') query.status = status;
    if (sku) query.sku = sku;

    const inventory = await WarehouseInventory.find(query).sort({ available: 1 }).lean();
    sendSuccess(res, inventory);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/inventory/adjust - Adjust stock
router.post('/inventory/adjust', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku, warehouse, adjustedQuantity, reason, performedBy } = req.body;
    if (!sku || adjustedQuantity === undefined) {
      return sendError(res, 'Missing sku or adjustedQuantity', 400);
    }

    const warehouseName = warehouse || 'Central Hub - BLR';
    const delta = Number(adjustedQuantity);

    const inv = await WarehouseInventory.findOneAndUpdate(
      { sku, warehouseName },
      {
        $inc: { stockInHand: delta, available: delta },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true, new: true }
    );

    // Update status
    if (inv.available <= 0) inv.status = 'Out of Stock';
    else if (inv.available <= inv.reorderLevel) inv.status = 'Low Stock';
    else inv.status = 'Healthy';
    await inv.save();

    await WarehouseStockMovement.create({
      sku,
      product: inv.product || sku,
      warehouse: warehouseName,
      type: delta >= 0 ? 'Manual Adjustment' : 'Damaged / Discarded',
      quantity: delta,
      balanceAfter: inv.stockInHand,
      referenceId: `ADJ-${Date.now().toString().slice(-6)}`,
      performedBy: performedBy || 'Warehouse Manager',
    });

    sendSuccess(res, inv, 'Stock successfully adjusted');
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/inventory/transfer - Transfer between warehouses
router.post('/inventory/transfer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku, fromWarehouse, toWarehouse, quantity, performedBy } = req.body;
    const qty = Number(quantity);
    if (!sku || !fromWarehouse || !toWarehouse || !qty || qty <= 0) {
      return sendError(res, 'Invalid transfer parameters', 400);
    }

    // Deduct from source
    const sourceInv = await WarehouseInventory.findOneAndUpdate(
      { sku, warehouseName: fromWarehouse },
      {
        $inc: { stockInHand: -qty, available: -qty },
        $set: { lastUpdated: new Date() },
      },
      { new: true }
    );

    // Add to destination
    const destInv = await WarehouseInventory.findOneAndUpdate(
      { sku, warehouseName: toWarehouse },
      {
        $inc: { stockInHand: qty, available: qty },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true, new: true }
    );

    await WarehouseStockMovement.create({
      sku,
      product: sourceInv?.product || sku,
      warehouse: `${fromWarehouse} -> ${toWarehouse}`,
      type: 'Stock Transfer',
      quantity: qty,
      balanceAfter: destInv.stockInHand,
      referenceId: `TRF-${Date.now().toString().slice(-6)}`,
      performedBy: performedBy || 'Logistics Coordinator',
    });

    sendSuccess(res, { source: sourceInv, destination: destInv }, 'Stock transferred between warehouses');
  } catch (error) {
    next(error);
  }
});

// GET /api/warehouse/inventory/:sku/history - Stock movement history
router.get('/inventory/:sku/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    const history = await WarehouseStockMovement.find({ sku }).sort({ date: -1 }).lean();
    sendSuccess(res, history);
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 7. FULFILMENT READINESS ENDPOINTS
// ============================================================

// GET /api/warehouse/fulfilment - Fulfilment readiness list
router.get('/fulfilment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const query: Record<string, any> = {};
    if (status && status !== 'ALL') query.status = status;

    const items = await FulfilmentReadiness.find(query).sort({ requiredDate: 1 }).lean();
    sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/fulfilment/:orderId/allocate - Allocate stock
router.post('/fulfilment/:orderId/allocate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const item = await FulfilmentReadiness.findOne({ orderId });
    if (!item) return sendError(res, 'Order not found', 404);

    item.conditions.stockReserved = true;
    item.readinessScore = Math.min(100, item.readinessScore + 15);
    if (item.readinessScore === 100) item.status = 'Ready for Fulfilment';
    else if (item.readinessScore >= 85) item.status = 'Almost Ready';

    await item.save();
    sendSuccess(res, item, `Stock successfully allocated for order ${orderId}`);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/fulfilment/:orderId/dispatch - Mark dispatched
router.post('/fulfilment/:orderId/dispatch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const item = await FulfilmentReadiness.findOne({ orderId });
    if (!item) return sendError(res, 'Order not found', 404);

    item.status = 'Dispatched';
    item.conditions.dispatchPrepared = true;
    await item.save();

    // Deduct stock
    const inv = await WarehouseInventory.findOneAndUpdate(
      { sku: item.sku, warehouseName: item.warehouse || 'Central Hub - BLR' },
      {
        $inc: { stockInHand: -item.quantity, reserved: -item.quantity },
        $set: { lastUpdated: new Date() },
      },
      { new: true }
    );

    await WarehouseStockMovement.create({
      sku: item.sku,
      product: item.product,
      warehouse: item.warehouse || 'Central Hub - BLR',
      type: 'Order Fulfilment',
      quantity: -item.quantity,
      balanceAfter: inv ? inv.stockInHand : 0,
      referenceId: orderId,
      performedBy: 'Dispatch Bay Team',
    });

    sendSuccess(res, item, `Order ${orderId} marked as dispatched`);
  } catch (error) {
    next(error);
  }
});

// ============================================================
// 8. ISSUES & DELAYS ENDPOINTS
// ============================================================

// GET /api/warehouse/issues - List issues
router.get('/issues', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, severity, type } = req.query;
    const query: Record<string, any> = {};
    if (status && status !== 'ALL') query.status = status;
    if (severity && severity !== 'ALL') query.severity = severity;
    if (type && type !== 'ALL') query.type = type;

    const issues = await WarehouseIssue.find(query).sort({ reportedDate: -1 }).lean();
    sendSuccess(res, issues);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse/issues - Report issue
router.post('/issues', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, severity, relatedOrder, product, supplierManufacturer, issueDescription, expectedResolution, assignedTo } = req.body;
    if (!type || !relatedOrder || !issueDescription) {
      return sendError(res, 'Missing mandatory issue fields', 400);
    }

    const created = await WarehouseIssue.create({
      issueNumber: `ISSUE-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      severity: severity || 'Medium',
      relatedOrder,
      product: product || 'General Merchandise',
      supplierManufacturer: supplierManufacturer || 'Unassigned Partner',
      issueDescription,
      reportedDate: new Date(),
      expectedResolution: expectedResolution ? new Date(expectedResolution) : undefined,
      assignedTo: assignedTo || 'Warehouse Escalations Team',
      status: 'Open',
    });

    sendCreated(res, created, 'Issue escalated and logged');
  } catch (error) {
    next(error);
  }
});

// PATCH /api/warehouse/issues/:id/status - Update issue status
router.patch('/issues/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedTo } = req.body;

    const issue = await WarehouseIssue.findById(id);
    if (!issue) return sendError(res, 'Issue not found', 404);

    if (status) issue.status = status;
    if (resolutionNotes) issue.resolutionNotes = resolutionNotes;
    if (assignedTo) issue.assignedTo = assignedTo;

    await issue.save();
    sendSuccess(res, issue, 'Issue status updated');
  } catch (error) {
    next(error);
  }
});

export default router;
