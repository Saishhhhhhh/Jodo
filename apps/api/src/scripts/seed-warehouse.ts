import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Tenant } from '../models/Tenant';
import { Store } from '../models/Store';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { ProductionOrder } from '../models/ProductionOrder';
import { QualityCheck } from '../models/QualityCheck';
import { WarehouseIssue } from '../models/WarehouseIssue';
import { WarehouseInventory } from '../models/WarehouseInventory';
import { WarehouseStockMovement } from '../models/WarehouseStockMovement';

async function seedWarehouse() {
  console.log('🌱 Starting Warehouse DB seeding...');
  await connectDB();

  const tenant = await Tenant.findOne();
  const store = await Store.findOne();

  const tenantId = tenant?._id;
  const storeId = store?._id;

  // 1. Seed Production Orders (if empty)
  const prodCount = await ProductionOrder.countDocuments();
  if (prodCount === 0) {
    console.log('Seeding Production Orders with Batches...');
    await ProductionOrder.create([
      {
        tenantId,
        orderNumber: 'PRD-2026-001',
        manufacturerId: 'MFR-001',
        manufacturerName: 'Sterling Garments Ltd',
        product: 'Classic Denim Jacket',
        sku: 'JKT-DNM-003',
        quantity: 750,
        completedQuantity: 750,
        startDate: new Date('2026-08-15'),
        targetDate: new Date('2026-09-20'),
        status: 'Completed',
        stage: 'Ready for QC',
        batchNumber: 'BATCH-2026-01',
        progressPercentage: 100,
        destinationWarehouse: 'Central Hub - BLR',
      },
      {
        tenantId,
        orderNumber: 'PRD-2026-002',
        manufacturerId: 'MFR-001',
        manufacturerName: 'Sterling Garments Ltd',
        product: 'Organic Cotton T-Shirt',
        sku: 'TSH-ORG-001',
        quantity: 2500,
        completedQuantity: 2100,
        startDate: new Date('2026-08-20'),
        targetDate: new Date('2026-09-25'),
        status: 'In Production',
        stage: 'Ready for QC',
        batchNumber: 'BATCH-2026-02',
        progressPercentage: 84,
        destinationWarehouse: 'Central Hub - BLR',
      },
      {
        tenantId,
        orderNumber: 'PRD-2026-003',
        manufacturerId: 'MFR-002',
        manufacturerName: 'Vanguard Textiles Corp',
        product: 'Slim Fit Chino Trouser',
        sku: 'CHN-SLM-002',
        quantity: 1100,
        completedQuantity: 1100,
        startDate: new Date('2026-08-10'),
        targetDate: new Date('2026-09-15'),
        status: 'Completed',
        stage: 'Ready for QC',
        batchNumber: 'BATCH-2026-03',
        progressPercentage: 100,
        destinationWarehouse: 'Central Hub - BLR',
      },
      {
        tenantId,
        orderNumber: 'PRD-2026-004',
        manufacturerId: 'MFR-003',
        manufacturerName: 'Himalayan Woolcrafts',
        product: 'Merino Wool Sweater',
        sku: 'SWT-MRN-005',
        quantity: 300,
        completedQuantity: 300,
        startDate: new Date('2026-08-01'),
        targetDate: new Date('2026-09-10'),
        status: 'Completed',
        stage: 'Ready for QC',
        batchNumber: 'BATCH-2026-04',
        progressPercentage: 100,
        destinationWarehouse: 'West DC - BOM',
      },
    ]);
    console.log('✅ Production Orders seeded.');
  }

  // 2. Seed Quality Checks (if empty)
  const qcCount = await QualityCheck.countDocuments();
  if (qcCount === 0) {
    console.log('Seeding Quality Checks...');
    await QualityCheck.create([
      {
        tenantId,
        batchId: 'BATCH-2026-01',
        productionOrderId: 'PRD-2026-001',
        product: 'Classic Denim Jacket',
        sku: 'JKT-DNM-003',
        manufacturer: 'Sterling Garments Ltd',
        inspectedQty: 750,
        passedQty: 710,
        failedQty: 40,
        defectType: 'Stitching Defect',
        defectNotes: 'Minor pocket seam tension irregular on 40 units. Rework sent back to line 3.',
        checkpoints: {
          'Stitching Quality': 'Fail',
          'Color Accuracy': 'Pass',
          'Sizing Tolerance': 'Pass',
          'Fabric Defects': 'Pass',
          'Label Correctness': 'Pass',
          'Packaging Quality': 'Pass',
          'Barcode Readability': 'Pass',
        },
        inspector: 'Rahul Sharma',
        status: 'Partially Passed',
        date: new Date('2026-09-21'),
      },
      {
        tenantId,
        batchId: 'BATCH-2026-02',
        productionOrderId: 'PRD-2026-002',
        product: 'Organic Cotton T-Shirt',
        sku: 'TSH-ORG-001',
        manufacturer: 'Sterling Garments Ltd',
        inspectedQty: 2500,
        passedQty: 0,
        failedQty: 0,
        defectType: 'None',
        defectNotes: 'Awaiting bay inspection for fabric GSM sampling and shade variance check.',
        checkpoints: {},
        inspector: 'Neha Gupta',
        status: 'Pending',
        date: new Date('2026-09-24'),
      },
      {
        tenantId,
        batchId: 'BATCH-2026-03',
        productionOrderId: 'PRD-2026-003',
        product: 'Slim Fit Chino Trouser',
        sku: 'CHN-SLM-002',
        manufacturer: 'Vanguard Textiles Corp',
        inspectedQty: 1100,
        passedQty: 1050,
        failedQty: 50,
        defectType: 'Measurement Deviation',
        defectNotes: 'Waist circumference +1.5cm beyond tolerance spec on 50 units (Size 34). Quarantined.',
        checkpoints: {
          'Stitching Quality': 'Pass',
          'Color Accuracy': 'Pass',
          'Sizing Tolerance': 'Fail',
          'Fabric Defects': 'Pass',
          'Label Correctness': 'Pass',
          'Packaging Quality': 'Pass',
          'Barcode Readability': 'Pass',
        },
        inspector: 'Kavita Pillai',
        status: 'Partially Passed',
        date: new Date('2026-09-18'),
      },
      {
        tenantId,
        batchId: 'BATCH-2026-04',
        productionOrderId: 'PRD-2026-004',
        product: 'Merino Wool Sweater',
        sku: 'SWT-MRN-005',
        manufacturer: 'Himalayan Woolcrafts',
        inspectedQty: 300,
        passedQty: 180,
        failedQty: 120,
        defectType: 'Fabric Flaw',
        defectNotes: 'Knit snagging and surface pilling detected on 120 units. Supplier rejected full sub-lot.',
        checkpoints: {
          'Stitching Quality': 'Pass',
          'Color Accuracy': 'Pass',
          'Sizing Tolerance': 'Pass',
          'Fabric Defects': 'Fail',
          'Label Correctness': 'Pass',
          'Packaging Quality': 'Pass',
          'Barcode Readability': 'Pass',
        },
        inspector: 'Rahul Sharma',
        status: 'Failed',
        date: new Date('2026-09-12'),
      },
    ]);
    console.log('✅ Quality Checks seeded.');
  }

  // 3. Seed Warehouse Issues (if empty)
  const issueCount = await WarehouseIssue.countDocuments();
  if (issueCount === 0) {
    console.log('Seeding Warehouse Issues...');
    await WarehouseIssue.create([
      {
        tenantId,
        issueNumber: 'ISSUE-2026-001',
        type: 'Quality Failure',
        severity: 'Critical',
        relatedOrder: 'PRD-2026-004',
        product: 'Merino Wool Sweater',
        supplierManufacturer: 'Himalayan Woolcrafts',
        issueDescription: 'Batch BATCH-26C-12 failed QC: 120 units rejected due to surface pilling and yarn snagging.',
        reportedDate: new Date('2026-09-12'),
        assignedTo: 'Rahul Sharma',
        status: 'Open',
      },
      {
        tenantId,
        issueNumber: 'ISSUE-2026-002',
        type: 'Quality Failure',
        severity: 'Medium',
        relatedOrder: 'PRD-2026-003',
        product: 'Slim Fit Chino Trouser',
        supplierManufacturer: 'Vanguard Textiles Corp',
        issueDescription: 'Batch BATCH-26B-05 sizing tolerance deviation: 50 units quarantined for waist alteration.',
        reportedDate: new Date('2026-09-18'),
        assignedTo: 'Kavita Pillai',
        status: 'Investigating',
      },
      {
        tenantId,
        issueNumber: 'ISSUE-2026-003',
        type: 'Production Delay',
        severity: 'High',
        relatedOrder: 'PRD-2026-002',
        product: 'Organic Cotton T-Shirt',
        supplierManufacturer: 'Sterling Garments Ltd',
        issueDescription: 'Line 2 boiler failure delayed final steam finishing by 3 days.',
        reportedDate: new Date('2026-09-22'),
        assignedTo: 'Vikram Sethi',
        status: 'Open',
      },
    ]);
    console.log('✅ Warehouse Issues seeded.');
  }

  // 4. Seed Warehouse Inventory (if empty)
  const invCount = await WarehouseInventory.countDocuments();
  if (invCount === 0) {
    console.log('Seeding Warehouse Inventory...');
    await WarehouseInventory.create([
      {
        tenantId,
        warehouseId: 'WH-BLR-01',
        sku: 'JKT-DNM-003',
        product: 'Classic Denim Jacket',
        warehouseName: 'Central Hub - BLR',
        stockInHand: 710,
        reserved: 120,
        available: 590,
        incoming: 0,
        reorderLevel: 100,
        status: 'Healthy',
        lastUpdated: new Date(),
      },
      {
        tenantId,
        warehouseId: 'WH-BLR-01',
        sku: 'TSH-ORG-001',
        product: 'Organic Cotton T-Shirt',
        warehouseName: 'Central Hub - BLR',
        stockInHand: 4200,
        reserved: 850,
        available: 3350,
        incoming: 2500,
        reorderLevel: 500,
        status: 'Healthy',
        lastUpdated: new Date(),
      },
      {
        tenantId,
        warehouseId: 'WH-BLR-01',
        sku: 'CHN-SLM-002',
        product: 'Slim Fit Chino Trouser',
        warehouseName: 'Central Hub - BLR',
        stockInHand: 1050,
        reserved: 300,
        available: 750,
        incoming: 0,
        reorderLevel: 150,
        status: 'Healthy',
        lastUpdated: new Date(),
      },
      {
        tenantId,
        warehouseId: 'WH-BOM-01',
        sku: 'SWT-MRN-005',
        product: 'Merino Wool Sweater',
        warehouseName: 'West DC - BOM',
        stockInHand: 180,
        reserved: 150,
        available: 30,
        incoming: 0,
        reorderLevel: 80,
        status: 'Low Stock',
        lastUpdated: new Date(),
      },
    ]);
    console.log('✅ Warehouse Inventory seeded.');
  }

  console.log('🎉 Warehouse seeding completed successfully!');
  await disconnectDB();
}

seedWarehouse().catch((err) => {
  console.error('❌ Warehouse seeding failed:', err);
  process.exit(1);
});
