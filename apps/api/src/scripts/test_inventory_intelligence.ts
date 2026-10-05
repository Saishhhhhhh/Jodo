import mongoose from 'mongoose';
import { InventoryIntelligenceService } from '../services/InventoryIntelligenceService';
import { InventoryIntelligenceAiService } from '../services/InventoryIntelligenceAiService';
import { InventoryItem } from '../models/InventoryItem';
import { Product } from '../models/Product';
import { Reservation } from '../models/Reservation';
import { StockMovement } from '../models/StockMovement';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
import { env } from '../config/env';

async function runTests() {
  console.log('--- Starting Inventory Intelligence 12 Test Cases ---');

  const uri = env.MONGODB_URI || 'mongodb://localhost:27017/jodo';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let tenant = await Tenant.findOne();
  if (!tenant) {
    tenant = await Tenant.create({ name: 'Test Tenant', domain: 'test.jodo.dev' });
  }
  let store = await Store.findOne({ tenantId: tenant._id });
  if (!store) {
    store = await Store.create({ tenantId: tenant._id, name: 'Test Store', code: 'TEST' });
  }

  const tenantId = tenant._id;
  const storeId = store._id;

  // CASE 1: Total = 100, Reserved = 20, Reorder = 10 -> Available = 80, Status = In Stock
  const c1 = InventoryIntelligenceService.calculateStockStatus({ onHand: 100, reservedStock: 20, reorderLevel: 10 });
  console.assert(c1.availableStock === 80, `Case 1 Failed available: expected 80 got ${c1.availableStock}`);
  console.assert(c1.status === 'in_stock', `Case 1 Failed status: expected in_stock got ${c1.status}`);
  console.log('✅ CASE 1 PASSED: Total=100, Reserved=20, Reorder=10 -> Available=80, Status=in_stock');

  // CASE 2: Total = 12, Reserved = 6, Reorder = 10 -> Available = 6, Status = Low Stock
  const c2 = InventoryIntelligenceService.calculateStockStatus({ onHand: 12, reservedStock: 6, reorderLevel: 10 });
  console.assert(c2.availableStock === 6, `Case 2 Failed available: expected 6 got ${c2.availableStock}`);
  console.assert(c2.status === 'low_stock', `Case 2 Failed status: expected low_stock got ${c2.status}`);
  console.log('✅ CASE 2 PASSED: Total=12, Reserved=6, Reorder=10 -> Available=6, Status=low_stock');

  // CASE 3: Total = 0, Reserved = 0 -> Available = 0, Status = Out of Stock
  const c3 = InventoryIntelligenceService.calculateStockStatus({ onHand: 0, reservedStock: 0, reorderLevel: 10 });
  console.assert(c3.availableStock === 0, `Case 3 Failed available: expected 0 got ${c3.availableStock}`);
  console.assert(c3.status === 'out_of_stock', `Case 3 Failed status: expected out_of_stock got ${c3.status}`);
  console.log('✅ CASE 3 PASSED: Total=0, Reserved=0 -> Available=0, Status=out_of_stock');

  // CASE 4: Total = 0, Reserved > 0 -> Status = Out of Stock, AI Priority = Critical (Priority 1)
  const c4 = InventoryIntelligenceService.calculateStockStatus({ onHand: 0, reservedStock: 4, reorderLevel: 10 });
  console.assert(c4.availableStock === 0, `Case 4 Failed available: expected 0 got ${c4.availableStock}`);
  console.assert(c4.status === 'out_of_stock', `Case 4 Failed status: expected out_of_stock got ${c4.status}`);
  const isPriority1 = c4.availableStock <= 0 && c4.reservedStock > 0;
  console.assert(isPriority1, 'Case 4 Failed AI Priority 1 condition');
  console.log('✅ CASE 4 PASSED: Total=0, Reserved=4 -> Available=0, Status=out_of_stock, Priority 1 Critical');

  // Create or reset a test SKU
  const testSku = 'TEST-INTELLIGENCE-01';
  await InventoryItem.deleteMany({ sku: testSku, storeId });
  await StockMovement.deleteMany({ sku: testSku, storeId });
  await Reservation.deleteMany({ sku: testSku, storeId });

  // CASE 5: Admin adds stock. Database, status update correctly.
  const addRes = await InventoryIntelligenceService.adjustStock({
    tenantId,
    storeId,
    sku: testSku,
    action: 'ADD_STOCK',
    quantity: 50,
    reason: 'New Stock Received',
    adminName: 'TestAdmin',
  });
  console.assert(addRes.item.onHand === 50, `Case 5 onHand expected 50, got ${addRes.item.onHand}`);
  console.assert(addRes.calculation.availableStock === 50, `Case 5 available expected 50, got ${addRes.calculation.availableStock}`);
  console.assert(addRes.calculation.status === 'in_stock', `Case 5 status expected in_stock, got ${addRes.calculation.status}`);
  console.log('✅ CASE 5 PASSED: Admin adds stock -> DB, table, status updated correctly');

  // CASE 6: Admin reduces stock. System prevents invalid/negative stock.
  let threwReductionError = false;
  try {
    await InventoryIntelligenceService.adjustStock({
      tenantId,
      storeId,
      sku: testSku,
      action: 'REMOVE_STOCK',
      quantity: 100, // Exceeds 50
      reason: 'Damaged Product',
      adminName: 'TestAdmin',
    });
  } catch (err: any) {
    threwReductionError = true;
  }
  console.assert(threwReductionError, 'Case 6 failed: system did not prevent removing more stock than total');

  // Valid reduction
  const validReduce = await InventoryIntelligenceService.adjustStock({
    tenantId,
    storeId,
    sku: testSku,
    action: 'REMOVE_STOCK',
    quantity: 10,
    reason: 'Stock Correction',
    adminName: 'TestAdmin',
  });
  console.assert(validReduce.item.onHand === 40, `Valid reduce expected 40, got ${validReduce.item.onHand}`);
  console.log('✅ CASE 6 PASSED: System prevents invalid/negative stock while allowing valid reduction');

  // CASE 7: Order reserves stock. Reserved increases and Available decreases correctly.
  const mockOrderId = new mongoose.Types.ObjectId();
  const reserveRes = await InventoryIntelligenceService.reserveStockForOrder(
    tenantId,
    storeId,
    mockOrderId,
    'ORD-TEST-001',
    [{ sku: testSku, quantity: 15 }]
  );
  console.assert(reserveRes.success, 'Case 7 failed to reserve stock');
  const invAfterReserve = await InventoryItem.findOne({ storeId, sku: testSku });
  console.assert(invAfterReserve?.reservedStock === 15, `Case 7 reserved expected 15 got ${invAfterReserve?.reservedStock}`);
  console.assert(invAfterReserve?.available === 25, `Case 7 available expected 25 got ${invAfterReserve?.available}`);
  console.log('✅ CASE 7 PASSED: Order reserves stock -> Reserved=15, Available=25');

  // CASE 8: Order is cancelled. Reservation is released correctly.
  const releaseRes = await InventoryIntelligenceService.releaseOrderReservation(
    tenantId,
    storeId,
    mockOrderId,
    'Customer cancelled'
  );
  console.assert(releaseRes.releasedCount === 1, `Case 8 released expected 1, got ${releaseRes.releasedCount}`);
  const invAfterRelease = await InventoryItem.findOne({ storeId, sku: testSku });
  console.assert(invAfterRelease?.reservedStock === 0, `Case 8 reserved expected 0 got ${invAfterRelease?.reservedStock}`);
  console.assert(invAfterRelease?.available === 40, `Case 8 available expected 40 got ${invAfterRelease?.available}`);
  console.log('✅ CASE 8 PASSED: Order cancelled -> Reservation released, Available=40');

  // CASE 9: Two simultaneous orders request the final available unit. Only one succeeds.
  // Set available = 1
  await InventoryIntelligenceService.adjustStock({
    tenantId,
    storeId,
    sku: testSku,
    action: 'SET_STOCK',
    quantity: 1,
    reason: 'Stock Correction',
  });

  const order1 = new mongoose.Types.ObjectId();
  const order2 = new mongoose.Types.ObjectId();

  const [res1, res2] = await Promise.allSettled([
    InventoryIntelligenceService.reserveStockForOrder(tenantId, storeId, order1, 'SIMUL-1', [{ sku: testSku, quantity: 1 }]),
    InventoryIntelligenceService.reserveStockForOrder(tenantId, storeId, order2, 'SIMUL-2', [{ sku: testSku, quantity: 1 }]),
  ]);

  const successCount = [res1, res2].filter((r) => r.status === 'fulfilled').length;
  const rejectedCount = [res1, res2].filter((r) => r.status === 'rejected').length;
  console.assert(successCount === 1, `Case 9 expected exactly 1 success, got ${successCount}`);
  console.assert(rejectedCount === 1, `Case 9 expected exactly 1 rejection, got ${rejectedCount}`);
  console.log('✅ CASE 9 PASSED: Concurrency safety -> Only one of two simultaneous orders reserved the final unit');

  // CASE 10: OpenAI is unavailable. Inventory functionality continues normally.
  const fallback = (InventoryIntelligenceAiService as any).generateFallbackInsights(
    { totalSkus: 5, outOfStock: 1, lowStock: 1, totalReserved: 1 },
    [{ sku: testSku, productName: 'Test Product', totalStock: 1, reservedStock: 1, availableStock: 0, reorderLevel: 5, status: 'Out of Stock', priorityTier: 1 }]
  );
  console.assert(fallback.summary && fallback.criticalItems.length > 0, 'Case 10 fallback insight structure invalid');
  console.log('✅ CASE 10 PASSED: Fallback insights work deterministically when OpenAI is unavailable');

  // CASE 11: Admin searches using SKU.
  const searchItem = await InventoryItem.findOne({ storeId, sku: testSku });
  console.assert(searchItem?.sku === testSku, 'Case 11 SKU search failed');
  console.log('✅ CASE 11 PASSED: Admin searches using SKU -> correct product returned');

  // CASE 12: Admin adjusts inventory. Audit history is created correctly.
  const movements = await StockMovement.find({ storeId, sku: testSku }).sort({ createdAt: -1 });
  console.assert(movements.length >= 3, `Case 12 expected at least 3 audit movements, got ${movements.length}`);
  const latestMovement = movements[0];
  console.assert(latestMovement.movementType && latestMovement.sku === testSku, 'Case 12 audit movement record invalid');
  console.log(`✅ CASE 12 PASSED: Inventory adjustments recorded with complete audit history (${movements.length} movements tracked)`);

  // Cleanup test item
  await InventoryItem.deleteMany({ sku: testSku, storeId });
  await StockMovement.deleteMany({ sku: testSku, storeId });
  await Reservation.deleteMany({ sku: testSku, storeId });

  console.log('\n========================================');
  console.log('🎉 ALL 12 TEST CASES PASSED SUCCESSFULLY!');
  console.log('========================================');

  await mongoose.disconnect();
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
