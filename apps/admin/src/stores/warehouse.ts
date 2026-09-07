import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProcurementItem {
  id: string;
  supplier: string;
  product: string;
  sku: string;
  quantity: number;
  received: number;
  pending: number;
  expectedDelivery: string;
  warehouse: string;
  amount: number;
  status: 'In Transit' | 'Partially Received' | 'Delivered' | 'Pending Approval' | 'Delayed';
}

export interface ManufacturerItem {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  products: string[];
  capacity: string;
  leadTime: string;
  qualityRating: number;
  activeOrders: number;
  delayedOrders: number;
  status: 'Active' | 'Under Audit' | 'Inactive';
}

export interface ProductionOrderItem {
  id: string;
  product: string;
  sku: string;
  manufacturer: string;
  orderedQty: number;
  producedQty: number;
  remaining: number;
  qcPassed: number;
  expectedCompletion: string;
  progress: number;
  status: 'Scheduled' | 'In Production' | 'QC Pending' | 'Completed' | 'Delayed';
}

export interface ProductionTrackingStage {
  name: string;
  completed: boolean;
  current?: boolean;
  date?: string;
}

export interface ProductionTrackingItem {
  id: string;
  orderId: string;
  product: string;
  manufacturer: string;
  ordered: number;
  produced: number;
  remaining: number;
  productionPercent: number;
  expectedDate: string;
  currentStatus: string;
  currentStage: string;
  stages: ProductionTrackingStage[];
}

export interface QualityCheckItem {
  id: string;
  productionOrder: string;
  product: string;
  manufacturer: string;
  received: number;
  passed: number;
  failed: number;
  damaged: number;
  inspector: string;
  qcDate: string;
  status: 'Pending' | 'In Progress' | 'Passed' | 'Partially Passed' | 'Failed';
  notes?: string;
}

export interface StockItem {
  id: string;
  product: string;
  sku: string;
  warehouse: string;
  stockInHand: number;
  reserved: number;
  hold: number;
  available: number;
  incoming: number;
  reorderLevel: number;
  status: 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';
  updated: string;
}

export interface IncomingStockItem {
  id: string;
  referenceId: string;
  source: 'Purchase Order' | 'Production Transfer' | 'Customer Return' | 'Inter-facility';
  supplierManufacturer: string;
  product: string;
  sku: string;
  quantity: number;
  expectedArrival: string;
  warehouse: string;
  status: 'In Transit' | 'Customs Clearance' | 'Dock Arrived' | 'Receiving' | 'Delayed';
}

export interface ReservationItem {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  sku: string;
  warehouse: string;
  requiredQty: number;
  reservedQty: number;
  available: number;
  status: 'Allocated' | 'Partially Reserved' | 'Backordered' | 'Released';
}

export interface TransferItem {
  id: string;
  fromWarehouse: string;
  toWarehouse: string;
  product: string;
  sku: string;
  quantity: number;
  transferDate: string;
  expectedArrival: string;
  status: 'Requested' | 'Dispatched' | 'In Transit' | 'Received' | 'Cancelled';
}

export interface FulfilmentItem {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  requiredQty: number;
  availableQty: number;
  reservedQty: number;
  warehouse: string;
  readiness: 'Ready' | 'Partially Ready' | 'Waiting for Stock' | 'Waiting for QC' | 'Waiting for Production' | 'Blocked';
  expectedDispatch: string;
}

export interface DelayAlertItem {
  id: string;
  type:
    | 'Low Stock'
    | 'Out of Stock'
    | 'Production Delay'
    | 'Procurement Delay'
    | 'QC Failure'
    | 'Incoming Shipment Delay'
    | 'Transfer Delay'
    | 'Fulfilment Risk';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  entityId: string;
  timestamp: string;
  actionText: string;
  resolved: boolean;
}

export interface StockMovementItem {
  id: string;
  dateTime: string;
  product: string;
  sku: string;
  warehouse: string;
  movementType: 'Receipt' | 'Dispatch' | 'Adjustment' | 'Transfer In' | 'Transfer Out' | 'QC Rejection' | 'Reservation';
  reference: string;
  qtyIn: number;
  qtyOut: number;
  previousStock: number;
  newStock: number;
  performedBy: string;
}

export interface WarehouseState {
  // Collections
  procurements: ProcurementItem[];
  manufacturers: ManufacturerItem[];
  productionOrders: ProductionOrderItem[];
  productionTracking: ProductionTrackingItem[];
  qualityChecks: QualityCheckItem[];
  stock: StockItem[];
  incomingStock: IncomingStockItem[];
  reservations: ReservationItem[];
  transfers: TransferItem[];
  fulfilments: FulfilmentItem[];
  alerts: DelayAlertItem[];
  stockMovements: StockMovementItem[];

  // Computed overview metrics
  getOverviewMetrics: () => {
    totalStock: number;
    availableStock: number;
    reservedStock: number;
    incomingStock: number;
    underProduction: number;
    qcPending: number;
    delayedOrders: number;
    fulfilmentReady: number;
  };

  // Actions
  addProcurement: (data: Omit<ProcurementItem, 'id' | 'received' | 'pending' | 'status'>) => void;
  receiveProcurementStock: (id: string, qty: number) => void;
  addManufacturer: (data: Omit<ManufacturerItem, 'id' | 'activeOrders' | 'delayedOrders'>) => void;
  addProductionOrder: (data: Omit<ProductionOrderItem, 'id' | 'producedQty' | 'remaining' | 'qcPassed' | 'progress' | 'status'>) => void;
  updateProductionProgress: (orderId: string, producedQty: number, nextStage?: string) => void;
  recordQC: (data: { qcId: string; passed: number; failed: number; damaged: number; inspector: string; notes?: string }) => void;
  addQualityCheck: (data: Omit<QualityCheckItem, 'id' | 'status' | 'qcDate'>) => void;
  adjustStock: (id: string, newOnHand: number, newHold: number, reason: string) => void;
  addIncomingStock: (data: Omit<IncomingStockItem, 'id'>) => void;
  receiveIncomingAtDock: (id: string) => void;
  releaseReservation: (id: string) => void;
  addTransfer: (data: Omit<TransferItem, 'id' | 'status' | 'transferDate'>) => void;
  receiveTransfer: (id: string) => void;
  dispatchFulfilment: (id: string) => void;
  resolveAlert: (id: string) => void;
  addStockMovement: (movement: Omit<StockMovementItem, 'id' | 'dateTime'>) => void;
}

// Initial realistic dataset
const initialProcurements: ProcurementItem[] = [
  {
    id: 'PRC-2026-089',
    supplier: 'Apex Fabrics Ltd',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    quantity: 2000,
    received: 1200,
    pending: 800,
    expectedDelivery: '12 Sep 2026',
    warehouse: 'Central Hub - BLR',
    amount: 480000,
    status: 'Partially Received',
  },
  {
    id: 'PRC-2026-090',
    supplier: 'Vanguard Textiles Corp',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    quantity: 1000,
    received: 0,
    pending: 1000,
    expectedDelivery: '18 Sep 2026',
    warehouse: 'West DC - BOM',
    amount: 920000,
    status: 'In Transit',
  },
  {
    id: 'PRC-2026-091',
    supplier: 'Zenith Mill Supplies',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    quantity: 1500,
    received: 1500,
    pending: 0,
    expectedDelivery: '04 Sep 2026',
    warehouse: 'North DC - DEL',
    amount: 675000,
    status: 'Delivered',
  },
  {
    id: 'PRC-2026-092',
    supplier: 'Highland Knits Global',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    quantity: 800,
    received: 0,
    pending: 800,
    expectedDelivery: '05 Sep 2026',
    warehouse: 'North DC - DEL',
    amount: 720000,
    status: 'Delayed',
  },
  {
    id: 'PRC-2026-093',
    supplier: 'Eastern Indigo Mills',
    product: 'Premium Linen Shirt',
    sku: 'SHT-LIN-007',
    quantity: 1200,
    received: 0,
    pending: 1200,
    expectedDelivery: '25 Sep 2026',
    warehouse: 'Central Hub - BLR',
    amount: 540000,
    status: 'Pending Approval',
  },
];

const initialManufacturers: ManufacturerItem[] = [
  {
    id: 'MFG-001',
    name: 'Vanguard Textiles Corp',
    contactPerson: 'Arunav Singhal',
    phone: '+91 98201 44521',
    email: 'arunav@vanguardtextiles.in',
    location: 'Surat, Gujarat',
    products: ['Denim Jackets', 'Chino Trousers', 'Twills'],
    capacity: '60,000 units/month',
    leadTime: '14 days',
    qualityRating: 4.8,
    activeOrders: 3,
    delayedOrders: 0,
    status: 'Active',
  },
  {
    id: 'MFG-002',
    name: 'Sterling Garments Ltd',
    contactPerson: 'Pooja Deshmukh',
    phone: '+91 97652 11980',
    email: 'contact@sterlinggarments.com',
    location: 'Tirupur, Tamil Nadu',
    products: ['Cotton T-Shirts', 'Polos', 'Hoodies'],
    capacity: '120,000 units/month',
    leadTime: '10 days',
    qualityRating: 4.9,
    activeOrders: 4,
    delayedOrders: 1,
    status: 'Active',
  },
  {
    id: 'MFG-003',
    name: 'Himalayan Woolcrafts',
    contactPerson: 'Vikram Thakur',
    phone: '+91 94180 33410',
    email: 'orders@himalayanwool.co.in',
    location: 'Ludhiana, Punjab',
    products: ['Wool Sweaters', 'Cardigans', 'Thermal Knits'],
    capacity: '25,000 units/month',
    leadTime: '21 days',
    qualityRating: 4.6,
    activeOrders: 2,
    delayedOrders: 1,
    status: 'Active',
  },
  {
    id: 'MFG-004',
    name: 'Kaveri Silk & Linens',
    contactPerson: 'Suresh Nambiar',
    phone: '+91 98450 78233',
    email: 'info@kaverisilks.com',
    location: 'Bengaluru, Karnataka',
    products: ['Linen Shirts', 'Silk Scarves', 'Resort Wear'],
    capacity: '35,000 units/month',
    leadTime: '18 days',
    qualityRating: 4.4,
    activeOrders: 1,
    delayedOrders: 0,
    status: 'Under Audit',
  },
];

const initialProductionOrders: ProductionOrderItem[] = [
  {
    id: 'PRD-2026-001',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    manufacturer: 'Sterling Garments Ltd',
    orderedQty: 1000,
    producedQty: 750,
    remaining: 250,
    qcPassed: 710,
    expectedCompletion: '18 Sep 2026',
    progress: 75,
    status: 'In Production',
  },
  {
    id: 'PRD-2026-002',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    manufacturer: 'Sterling Garments Ltd',
    orderedQty: 2500,
    producedQty: 2500,
    remaining: 0,
    qcPassed: 2420,
    expectedCompletion: '08 Sep 2026',
    progress: 100,
    status: 'QC Pending',
  },
  {
    id: 'PRD-2026-003',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    manufacturer: 'Vanguard Textiles Corp',
    orderedQty: 1800,
    producedQty: 1100,
    remaining: 700,
    qcPassed: 1050,
    expectedCompletion: '22 Sep 2026',
    progress: 61,
    status: 'In Production',
  },
  {
    id: 'PRD-2026-004',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    manufacturer: 'Himalayan Woolcrafts',
    orderedQty: 1200,
    producedQty: 300,
    remaining: 900,
    qcPassed: 280,
    expectedCompletion: '10 Sep 2026',
    progress: 25,
    status: 'Delayed',
  },
  {
    id: 'PRD-2026-005',
    product: 'Premium Linen Shirt',
    sku: 'SHT-LIN-007',
    manufacturer: 'Kaveri Silk & Linens',
    orderedQty: 1500,
    producedQty: 0,
    remaining: 1500,
    qcPassed: 0,
    expectedCompletion: '30 Sep 2026',
    progress: 0,
    status: 'Scheduled',
  },
];

const initialProductionTracking: ProductionTrackingItem[] = [
  {
    id: 'TRK-001',
    orderId: 'PRD-2026-001',
    product: 'Classic Denim Jacket',
    manufacturer: 'Sterling Garments Ltd',
    ordered: 1000,
    produced: 750,
    remaining: 250,
    productionPercent: 75,
    expectedDate: '18 Sep 2026',
    currentStatus: 'Stitching & Assembly Phase',
    currentStage: 'Assembly & Sewing',
    stages: [
      { name: 'Raw Materials Sourced', completed: true, date: '28 Aug 2026' },
      { name: 'Cutting & Pattern Layout', completed: true, date: '02 Sep 2026' },
      { name: 'Assembly & Sewing', completed: false, current: true, date: 'Est. 14 Sep' },
      { name: 'Finishing & Pressing', completed: false, date: 'Est. 16 Sep' },
      { name: 'Ready for QC', completed: false, date: 'Est. 18 Sep' },
    ],
  },
  {
    id: 'TRK-002',
    orderId: 'PRD-2026-002',
    product: 'Organic Cotton T-Shirt',
    manufacturer: 'Sterling Garments Ltd',
    ordered: 2500,
    produced: 2500,
    remaining: 0,
    productionPercent: 100,
    expectedDate: '08 Sep 2026',
    currentStatus: 'Batch Completed — Awaiting QC',
    currentStage: 'Ready for QC',
    stages: [
      { name: 'Raw Materials Sourced', completed: true, date: '15 Aug 2026' },
      { name: 'Cutting & Pattern Layout', completed: true, date: '22 Aug 2026' },
      { name: 'Assembly & Sewing', completed: true, date: '30 Aug 2026' },
      { name: 'Finishing & Pressing', completed: true, date: '05 Sep 2026' },
      { name: 'Ready for QC', completed: false, current: true, date: 'Pending Now' },
    ],
  },
  {
    id: 'TRK-003',
    orderId: 'PRD-2026-003',
    product: 'Slim Fit Chino Trouser',
    manufacturer: 'Vanguard Textiles Corp',
    ordered: 1800,
    produced: 1100,
    remaining: 700,
    productionPercent: 61,
    expectedDate: '22 Sep 2026',
    currentStatus: 'Fabric Assembly Line 2',
    currentStage: 'Assembly & Sewing',
    stages: [
      { name: 'Raw Materials Sourced', completed: true, date: '24 Aug 2026' },
      { name: 'Cutting & Pattern Layout', completed: true, date: '01 Sep 2026' },
      { name: 'Assembly & Sewing', completed: false, current: true, date: 'Est. 16 Sep' },
      { name: 'Finishing & Pressing', completed: false, date: 'Est. 20 Sep' },
      { name: 'Ready for QC', completed: false, date: 'Est. 22 Sep' },
    ],
  },
  {
    id: 'TRK-004',
    orderId: 'PRD-2026-004',
    product: 'Merino Wool Sweater',
    manufacturer: 'Himalayan Woolcrafts',
    ordered: 1200,
    produced: 300,
    remaining: 900,
    productionPercent: 25,
    expectedDate: '10 Sep 2026',
    currentStatus: 'Yarn Dyeing Delayed (Re-ordered dye lots)',
    currentStage: 'Raw Materials',
    stages: [
      { name: 'Raw Materials Sourced', completed: false, current: true, date: 'Delayed: 12 Sep' },
      { name: 'Cutting & Pattern Layout', completed: false, date: 'Est. 18 Sep' },
      { name: 'Assembly & Sewing', completed: false, date: 'Est. 24 Sep' },
      { name: 'Finishing & Pressing', completed: false, date: 'Est. 28 Sep' },
      { name: 'Ready for QC', completed: false, date: 'Est. 30 Sep' },
    ],
  },
];

const initialQualityChecks: QualityCheckItem[] = [
  {
    id: 'QC-2026-112',
    productionOrder: 'PRD-2026-001',
    product: 'Classic Denim Jacket',
    manufacturer: 'Sterling Garments Ltd',
    received: 750,
    passed: 710,
    failed: 25,
    damaged: 15,
    inspector: 'Rahul Sharma',
    qcDate: '06 Sep 2026',
    status: 'Passed',
    notes: 'Button rivet alignment passed 98.4%. Minor seam irregularities on failed pieces.',
  },
  {
    id: 'QC-2026-113',
    productionOrder: 'PRD-2026-002',
    product: 'Organic Cotton T-Shirt',
    manufacturer: 'Sterling Garments Ltd',
    received: 2500,
    passed: 0,
    failed: 0,
    damaged: 0,
    inspector: 'Neha Kapoor',
    qcDate: '07 Sep 2026',
    status: 'Pending',
    notes: 'Lot delivered to inspection bay 4. Awaiting color fastness test.',
  },
  {
    id: 'QC-2026-114',
    productionOrder: 'PRD-2026-003',
    product: 'Slim Fit Chino Trouser',
    manufacturer: 'Vanguard Textiles Corp',
    received: 1100,
    passed: 1050,
    failed: 35,
    damaged: 15,
    inspector: 'Karthik Raja',
    qcDate: '05 Sep 2026',
    status: 'Partially Passed',
    notes: 'Zipper tension tested. 35 pieces rejected due to loose waistband stitching.',
  },
  {
    id: 'QC-2026-115',
    productionOrder: 'PRD-2026-004',
    product: 'Merino Wool Sweater',
    manufacturer: 'Himalayan Woolcrafts',
    received: 300,
    passed: 180,
    failed: 95,
    damaged: 25,
    inspector: 'Rahul Sharma',
    qcDate: '03 Sep 2026',
    status: 'Failed',
    notes: 'Severe fiber pill count failure across batch 1. Rework requested from factory.',
  },
];

// Available = Stock-in-Hand - Reserved - Hold
const initialStock: StockItem[] = [
  {
    id: 'STK-001',
    product: 'Organic Cotton T-Shirt (M / Navy)',
    sku: 'TSH-ORG-001',
    warehouse: 'Central Hub - BLR',
    stockInHand: 4200,
    reserved: 850,
    hold: 150,
    available: 3200, // 4200 - 850 - 150
    incoming: 800,
    reorderLevel: 1000,
    status: 'Healthy',
    updated: '10 mins ago',
  },
  {
    id: 'STK-002',
    product: 'Classic Denim Jacket (L / Indigo)',
    sku: 'JKT-DNM-003',
    warehouse: 'Central Hub - BLR',
    stockInHand: 1850,
    reserved: 420,
    hold: 30,
    available: 1400, // 1850 - 420 - 30
    incoming: 1000,
    reorderLevel: 500,
    status: 'Healthy',
    updated: '1 hour ago',
  },
  {
    id: 'STK-003',
    product: 'Slim Fit Chino Trouser (32 / Khaki)',
    sku: 'CHN-SLM-002',
    warehouse: 'West DC - BOM',
    stockInHand: 740,
    reserved: 390,
    hold: 50,
    available: 300, // 740 - 390 - 50
    incoming: 1500,
    reorderLevel: 450,
    status: 'Low Stock',
    updated: '25 mins ago',
  },
  {
    id: 'STK-004',
    product: 'Merino Wool Sweater (L / Charcoal)',
    sku: 'SWT-MRN-005',
    warehouse: 'North DC - DEL',
    stockInHand: 160,
    reserved: 120,
    hold: 25,
    available: 15, // 160 - 120 - 25
    incoming: 800,
    reorderLevel: 250,
    status: 'Critical',
    updated: '5 mins ago',
  },
  {
    id: 'STK-005',
    product: 'Premium Linen Shirt (M / White)',
    sku: 'SHT-LIN-007',
    warehouse: 'West DC - BOM',
    stockInHand: 0,
    reserved: 0,
    hold: 0,
    available: 0,
    incoming: 1200,
    reorderLevel: 200,
    status: 'Out of Stock',
    updated: '2 hours ago',
  },
  {
    id: 'STK-006',
    product: 'Silk Blend Scarf (Unisex / Olive)',
    sku: 'SCF-SLK-009',
    warehouse: 'Central Hub - BLR',
    stockInHand: 1420,
    reserved: 180,
    hold: 20,
    available: 1220,
    incoming: 300,
    reorderLevel: 300,
    status: 'Healthy',
    updated: '3 hours ago',
  },
  {
    id: 'STK-007',
    product: 'Leather Everyday Belt (Brown / 34)',
    sku: 'BLT-LTH-012',
    warehouse: 'North DC - DEL',
    stockInHand: 890,
    reserved: 210,
    hold: 40,
    available: 640,
    incoming: 0,
    reorderLevel: 350,
    status: 'Healthy',
    updated: '4 hours ago',
  },
];

const initialIncomingStock: IncomingStockItem[] = [
  {
    id: 'INC-2026-045',
    referenceId: 'PO-2026-089',
    source: 'Purchase Order',
    supplierManufacturer: 'Apex Fabrics Ltd',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    quantity: 800,
    expectedArrival: '12 Sep 2026',
    warehouse: 'Central Hub - BLR',
    status: 'In Transit',
  },
  {
    id: 'INC-2026-046',
    referenceId: 'PRD-2026-001',
    source: 'Production Transfer',
    supplierManufacturer: 'Sterling Garments Ltd',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    quantity: 710,
    expectedArrival: '09 Sep 2026',
    warehouse: 'Central Hub - BLR',
    status: 'Dock Arrived',
  },
  {
    id: 'INC-2026-047',
    referenceId: 'PO-2026-090',
    source: 'Purchase Order',
    supplierManufacturer: 'Vanguard Textiles Corp',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    quantity: 1500,
    expectedArrival: '18 Sep 2026',
    warehouse: 'West DC - BOM',
    status: 'Customs Clearance',
  },
  {
    id: 'INC-2026-048',
    referenceId: 'TRF-2026-031',
    source: 'Inter-facility',
    supplierManufacturer: 'Central Hub Transfer',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    quantity: 350,
    expectedArrival: '08 Sep 2026',
    warehouse: 'North DC - DEL',
    status: 'In Transit',
  },
  {
    id: 'INC-2026-049',
    referenceId: 'RMA-9921',
    source: 'Customer Return',
    supplierManufacturer: 'BlueDart Logistics',
    product: 'Silk Blend Scarf',
    sku: 'SCF-SLK-009',
    quantity: 24,
    expectedArrival: '07 Sep 2026',
    warehouse: 'Central Hub - BLR',
    status: 'Receiving',
  },
];

const initialReservations: ReservationItem[] = [
  {
    id: 'RES-001',
    orderId: 'ORD-9821',
    customer: 'Aarav Mehta',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    warehouse: 'Central Hub - BLR',
    requiredQty: 4,
    reservedQty: 4,
    available: 3200,
    status: 'Allocated',
  },
  {
    id: 'RES-002',
    orderId: 'ORD-9825',
    customer: 'Tanvi Saxena',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    warehouse: 'Central Hub - BLR',
    requiredQty: 2,
    reservedQty: 2,
    available: 1400,
    status: 'Allocated',
  },
  {
    id: 'RES-003',
    orderId: 'ORD-9830',
    customer: 'Rohan Gupta',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    warehouse: 'North DC - DEL',
    requiredQty: 5,
    reservedQty: 5,
    available: 15,
    status: 'Allocated',
  },
  {
    id: 'RES-004',
    orderId: 'ORD-9844',
    customer: 'Priya Sharma',
    product: 'Premium Linen Shirt',
    sku: 'SHT-LIN-007',
    warehouse: 'West DC - BOM',
    requiredQty: 2,
    reservedQty: 0,
    available: 0,
    status: 'Backordered',
  },
  {
    id: 'RES-005',
    orderId: 'ORD-9852',
    customer: 'Deepak Chawla',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    warehouse: 'West DC - BOM',
    requiredQty: 3,
    reservedQty: 3,
    available: 300,
    status: 'Allocated',
  },
];

const initialTransfers: TransferItem[] = [
  {
    id: 'TRF-2026-031',
    fromWarehouse: 'Central Hub - BLR',
    toWarehouse: 'North DC - DEL',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    quantity: 350,
    transferDate: '05 Sep 2026',
    expectedArrival: '08 Sep 2026',
    status: 'In Transit',
  },
  {
    id: 'TRF-2026-032',
    fromWarehouse: 'Central Hub - BLR',
    toWarehouse: 'West DC - BOM',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    quantity: 600,
    transferDate: '06 Sep 2026',
    expectedArrival: '09 Sep 2026',
    status: 'Dispatched',
  },
  {
    id: 'TRF-2026-033',
    fromWarehouse: 'North DC - DEL',
    toWarehouse: 'Central Hub - BLR',
    product: 'Leather Everyday Belt',
    sku: 'BLT-LTH-012',
    quantity: 200,
    transferDate: '01 Sep 2026',
    expectedArrival: '04 Sep 2026',
    status: 'Received',
  },
  {
    id: 'TRF-2026-034',
    fromWarehouse: 'West DC - BOM',
    toWarehouse: 'Central Hub - BLR',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    quantity: 150,
    transferDate: '07 Sep 2026',
    expectedArrival: '11 Sep 2026',
    status: 'Requested',
  },
];

const initialFulfilments: FulfilmentItem[] = [
  {
    id: 'FLF-001',
    orderId: 'ORD-9821',
    customer: 'Aarav Mehta',
    product: 'Organic Cotton T-Shirt',
    requiredQty: 4,
    availableQty: 3200,
    reservedQty: 4,
    warehouse: 'Central Hub - BLR',
    readiness: 'Ready',
    expectedDispatch: 'Today, 4:30 PM',
  },
  {
    id: 'FLF-002',
    orderId: 'ORD-9825',
    customer: 'Tanvi Saxena',
    product: 'Classic Denim Jacket',
    requiredQty: 2,
    availableQty: 1400,
    reservedQty: 2,
    warehouse: 'Central Hub - BLR',
    readiness: 'Ready',
    expectedDispatch: 'Today, 6:00 PM',
  },
  {
    id: 'FLF-003',
    orderId: 'ORD-9830',
    customer: 'Rohan Gupta',
    product: 'Merino Wool Sweater',
    requiredQty: 5,
    availableQty: 15,
    reservedQty: 5,
    warehouse: 'North DC - DEL',
    readiness: 'Partially Ready',
    expectedDispatch: 'Tomorrow, 11:00 AM',
  },
  {
    id: 'FLF-004',
    orderId: 'ORD-9844',
    customer: 'Priya Sharma',
    product: 'Premium Linen Shirt',
    requiredQty: 2,
    availableQty: 0,
    reservedQty: 0,
    warehouse: 'West DC - BOM',
    readiness: 'Waiting for Stock',
    expectedDispatch: '26 Sep 2026',
  },
  {
    id: 'FLF-005',
    orderId: 'ORD-9849',
    customer: 'Kunal Singhal',
    product: 'Organic Cotton T-Shirt',
    requiredQty: 10,
    availableQty: 3200,
    reservedQty: 10,
    warehouse: 'Central Hub - BLR',
    readiness: 'Waiting for QC',
    expectedDispatch: '09 Sep 2026',
  },
  {
    id: 'FLF-006',
    orderId: 'ORD-9856',
    customer: 'Aditi Rao',
    product: 'Merino Wool Sweater',
    requiredQty: 3,
    availableQty: 15,
    reservedQty: 0,
    warehouse: 'North DC - DEL',
    readiness: 'Waiting for Production',
    expectedDispatch: '14 Sep 2026',
  },
];

const initialAlerts: DelayAlertItem[] = [
  {
    id: 'ALT-001',
    type: 'Out of Stock',
    severity: 'critical',
    title: 'Out of Stock: Premium Linen Shirt',
    description: 'SKU SHT-LIN-007 has 0 available units across all fulfillment centers. 12 backorders pending.',
    entityId: 'SHT-LIN-007',
    timestamp: '25 mins ago',
    actionText: 'Expedite Procurement',
    resolved: false,
  },
  {
    id: 'ALT-002',
    type: 'Production Delay',
    severity: 'critical',
    title: 'Production Delay: Himalayan Woolcrafts',
    description: 'Order PRD-2026-004 delayed by 10 days due to raw material dye lot mismatch.',
    entityId: 'PRD-2026-004',
    timestamp: '1 hour ago',
    actionText: 'View Order Status',
    resolved: false,
  },
  {
    id: 'ALT-003',
    type: 'Low Stock',
    severity: 'warning',
    title: 'Low Stock: Merino Wool Sweater',
    description: 'North DC - DEL inventory has only 15 available units remaining (Reorder threshold: 250 units).',
    entityId: 'SWT-MRN-005',
    timestamp: '2 hours ago',
    actionText: 'Create Transfer',
    resolved: false,
  },
  {
    id: 'ALT-004',
    type: 'QC Failure',
    severity: 'warning',
    title: 'QC Batch Failure: Merino Wool Sweater',
    description: 'Inspection QC-2026-115 rejected 95 units due to excess fiber pilling. Factory re-wash requested.',
    entityId: 'QC-2026-115',
    timestamp: '4 hours ago',
    actionText: 'Inspect Report',
    resolved: false,
  },
  {
    id: 'ALT-005',
    type: 'Procurement Delay',
    severity: 'warning',
    title: 'Procurement Delay: Highland Knits Global',
    description: 'PO PRC-2026-092 overdue by 2 days. Port customs clearance holding dispatch documentation.',
    entityId: 'PRC-2026-092',
    timestamp: 'Yesterday',
    actionText: 'Contact Supplier',
    resolved: false,
  },
  {
    id: 'ALT-006',
    type: 'Fulfilment Risk',
    severity: 'info',
    title: 'Fulfilment Risk: 3 Orders in North DC',
    description: 'Winter demand spike may deplete Delhi buffer stock within 48 hours without stock transfer arrival.',
    entityId: 'North DC - DEL',
    timestamp: 'Yesterday',
    actionText: 'Track Transfer',
    resolved: false,
  },
];

const initialStockMovements: StockMovementItem[] = [
  {
    id: 'MOV-2026-8841',
    dateTime: '07 Sep 2026, 11:42 AM',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    warehouse: 'Central Hub - BLR',
    movementType: 'Receipt',
    reference: 'PO-2026-089',
    qtyIn: 1200,
    qtyOut: 0,
    previousStock: 3000,
    newStock: 4200,
    performedBy: 'Rahul Sharma (Warehouse Mgr)',
  },
  {
    id: 'MOV-2026-8840',
    dateTime: '07 Sep 2026, 10:15 AM',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    warehouse: 'Central Hub - BLR',
    movementType: 'Receipt',
    reference: 'QC-2026-112',
    qtyIn: 710,
    qtyOut: 0,
    previousStock: 1140,
    newStock: 1850,
    performedBy: 'Neha Kapoor (QC Lead)',
  },
  {
    id: 'MOV-2026-8839',
    dateTime: '07 Sep 2026, 09:30 AM',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    warehouse: 'Central Hub - BLR',
    movementType: 'Dispatch',
    reference: 'ORD-9812',
    qtyIn: 0,
    qtyOut: 2,
    previousStock: 1852,
    newStock: 1850,
    performedBy: 'Vikrant Yadav (Dispatch)',
  },
  {
    id: 'MOV-2026-8838',
    dateTime: '06 Sep 2026, 04:50 PM',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    warehouse: 'West DC - BOM',
    movementType: 'Adjustment',
    reference: 'INV-AUD-09',
    qtyIn: 0,
    qtyOut: 15,
    previousStock: 755,
    newStock: 740,
    performedBy: 'Manoj Pillai (Supervisor)',
  },
  {
    id: 'MOV-2026-8837',
    dateTime: '05 Sep 2026, 02:15 PM',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    warehouse: 'Central Hub - BLR',
    movementType: 'Transfer Out',
    reference: 'TRF-2026-031',
    qtyIn: 0,
    qtyOut: 350,
    previousStock: 510,
    newStock: 160,
    performedBy: 'Rahul Sharma (Warehouse Mgr)',
  },
];

export const useWarehouseStore = create<WarehouseState>()(
  persist(
    (set, get) => ({
      procurements: initialProcurements,
      manufacturers: initialManufacturers,
      productionOrders: initialProductionOrders,
      productionTracking: initialProductionTracking,
      qualityChecks: initialQualityChecks,
      stock: initialStock,
      incomingStock: initialIncomingStock,
      reservations: initialReservations,
      transfers: initialTransfers,
      fulfilments: initialFulfilments,
      alerts: initialAlerts,
      stockMovements: initialStockMovements,

      getOverviewMetrics: () => {
        const { stock, productionOrders, qualityChecks, procurements, fulfilments } = get();

        const totalStock = stock.reduce((acc, item) => acc + item.stockInHand, 0);
        const availableStock = stock.reduce((acc, item) => acc + item.available, 0);
        const reservedStock = stock.reduce((acc, item) => acc + item.reserved, 0);
        const incomingStock = stock.reduce((acc, item) => acc + item.incoming, 0);

        const underProduction = productionOrders
          .filter((p) => p.status === 'In Production' || p.status === 'Scheduled')
          .reduce((acc, item) => acc + item.remaining, 0);

        const qcPending = qualityChecks
          .filter((q) => q.status === 'Pending' || q.status === 'In Progress')
          .reduce((acc, item) => acc + item.received, 0);

        const delayedOrders = procurements.filter((p) => p.status === 'Delayed').length +
          productionOrders.filter((p) => p.status === 'Delayed').length;

        const readyCount = fulfilments.filter((f) => f.readiness === 'Ready').length;
        const fulfilmentReady = fulfilments.length > 0 ? Math.round((readyCount / fulfilments.length) * 1000) / 10 : 94.2;

        return {
          totalStock,
          availableStock,
          reservedStock,
          incomingStock,
          underProduction,
          qcPending,
          delayedOrders,
          fulfilmentReady,
        };
      },

      addProcurement: (data) => {
        const newId = `PRC-2026-0${100 + get().procurements.length}`;
        const newProcurement: ProcurementItem = {
          ...data,
          id: newId,
          received: 0,
          pending: data.quantity,
          status: 'In Transit',
        };

        const newIncoming: IncomingStockItem = {
          id: `INC-2026-0${50 + get().incomingStock.length}`,
          referenceId: newId,
          source: 'Purchase Order',
          supplierManufacturer: data.supplier,
          product: data.product,
          sku: data.sku,
          quantity: data.quantity,
          expectedArrival: data.expectedDelivery,
          warehouse: data.warehouse,
          status: 'In Transit',
        };

        set((state) => ({
          procurements: [newProcurement, ...state.procurements],
          incomingStock: [newIncoming, ...state.incomingStock],
          stock: state.stock.map((s) =>
            s.sku === data.sku && s.warehouse === data.warehouse
              ? { ...s, incoming: s.incoming + data.quantity }
              : s
          ),
        }));
      },

      receiveProcurementStock: (id, qty) => {
        const item = get().procurements.find((p) => p.id === id);
        if (!item) return;

        const newReceived = Math.min(item.quantity, item.received + qty);
        const newPending = Math.max(0, item.quantity - newReceived);
        const newStatus = newPending === 0 ? 'Delivered' : 'Partially Received';

        set((state) => {
          // Update Stock
          const updatedStock = state.stock.map((stk) => {
            if (stk.sku === item.sku && stk.warehouse === item.warehouse) {
              const prevOnHand = stk.stockInHand;
              const newOnHand = prevOnHand + qty;
              const newAvailable = newOnHand - stk.reserved - stk.hold;
              const newIncoming = Math.max(0, stk.incoming - qty);
              let status: StockItem['status'] = 'Healthy';
              if (newAvailable <= 0) status = 'Out of Stock';
              else if (newAvailable < stk.reorderLevel / 2) status = 'Critical';
              else if (newAvailable <= stk.reorderLevel) status = 'Low Stock';

              return {
                ...stk,
                stockInHand: newOnHand,
                available: newAvailable,
                incoming: newIncoming,
                status,
                updated: 'Just now',
              };
            }
            return stk;
          });

          // Log Movement
          const stkItem = state.stock.find((s) => s.sku === item.sku && s.warehouse === item.warehouse);
          const prevOnHand = stkItem ? stkItem.stockInHand : 0;
          const newMovement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            product: item.product,
            sku: item.sku,
            warehouse: item.warehouse,
            movementType: 'Receipt',
            reference: item.id,
            qtyIn: qty,
            qtyOut: 0,
            previousStock: prevOnHand,
            newStock: prevOnHand + qty,
            performedBy: 'Operations Admin',
          };

          return {
            procurements: state.procurements.map((p) =>
              p.id === id ? { ...p, received: newReceived, pending: newPending, status: newStatus } : p
            ),
            stock: updatedStock,
            stockMovements: [newMovement, ...state.stockMovements],
          };
        });
      },

      addManufacturer: (data) => {
        const newId = `MFG-00${get().manufacturers.length + 1}`;
        set((state) => ({
          manufacturers: [
            ...state.manufacturers,
            { ...data, id: newId, activeOrders: 0, delayedOrders: 0 },
          ],
        }));
      },

      addProductionOrder: (data) => {
        const newId = `PRD-2026-00${get().productionOrders.length + 1}`;
        const newOrder: ProductionOrderItem = {
          ...data,
          id: newId,
          producedQty: 0,
          remaining: data.orderedQty,
          qcPassed: 0,
          progress: 0,
          status: 'Scheduled',
        };

        const newTracking: ProductionTrackingItem = {
          id: `TRK-00${get().productionTracking.length + 1}`,
          orderId: newId,
          product: data.product,
          manufacturer: data.manufacturer,
          ordered: data.orderedQty,
          produced: 0,
          remaining: data.orderedQty,
          productionPercent: 0,
          expectedDate: data.expectedCompletion,
          currentStatus: 'Order scheduled with production line',
          currentStage: 'Raw Materials',
          stages: [
            { name: 'Raw Materials Sourced', completed: false, current: true, date: 'Pending' },
            { name: 'Cutting & Pattern Layout', completed: false, date: 'Est. 3 days' },
            { name: 'Assembly & Sewing', completed: false, date: 'Est. 7 days' },
            { name: 'Finishing & Pressing', completed: false, date: 'Est. 10 days' },
            { name: 'Ready for QC', completed: false, date: data.expectedCompletion },
          ],
        };

        set((state) => ({
          productionOrders: [newOrder, ...state.productionOrders],
          productionTracking: [newTracking, ...state.productionTracking],
        }));
      },

      updateProductionProgress: (orderId, producedQty, nextStage) => {
        set((state) => {
          const updatedOrders = state.productionOrders.map((order) => {
            if (order.id === orderId) {
              const newProduced = Math.min(order.orderedQty, producedQty);
              const remaining = Math.max(0, order.orderedQty - newProduced);
              const progress = Math.round((newProduced / order.orderedQty) * 100);
              let status = order.status;
              if (progress === 100) status = 'QC Pending';
              else if (progress > 0) status = 'In Production';

              return {
                ...order,
                producedQty: newProduced,
                remaining,
                progress,
                status,
              };
            }
            return order;
          });

          const updatedTracking = state.productionTracking.map((trk) => {
            if (trk.orderId === orderId) {
              const newProduced = Math.min(trk.ordered, producedQty);
              const remaining = Math.max(0, trk.ordered - newProduced);
              const progress = Math.round((newProduced / trk.ordered) * 100);

              return {
                ...trk,
                produced: newProduced,
                remaining,
                productionPercent: progress,
                currentStage: nextStage || trk.currentStage,
              };
            }
            return trk;
          });

          return {
            productionOrders: updatedOrders,
            productionTracking: updatedTracking,
          };
        });
      },

      addQualityCheck: (data) => {
        const newId = `QC-2026-${120 + get().qualityChecks.length}`;
        const newQC: QualityCheckItem = {
          ...data,
          id: newId,
          qcDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Pending',
        };
        set((state) => ({
          qualityChecks: [newQC, ...state.qualityChecks],
        }));
      },

      recordQC: ({ qcId, passed, failed, damaged, inspector, notes }) => {
        set((state) => {
          const qc = state.qualityChecks.find((q) => q.id === qcId);
          if (!qc) return state;

          const totalInspected = passed + failed + damaged;
          let status: QualityCheckItem['status'] = 'Passed';
          if (passed === 0 && (failed > 0 || damaged > 0)) status = 'Failed';
          else if (failed > 0 || damaged > 0) status = 'Partially Passed';

          // Update stock if items passed QC
          let updatedStock = state.stock;
          let newMovements = [...state.stockMovements];

          if (passed > 0) {
            updatedStock = state.stock.map((stk) => {
              if (stk.product.toLowerCase().includes(qc.product.toLowerCase())) {
                const prevOnHand = stk.stockInHand;
                const newOnHand = prevOnHand + passed;
                const newAvailable = newOnHand - stk.reserved - stk.hold;
                return {
                  ...stk,
                  stockInHand: newOnHand,
                  available: newAvailable,
                  updated: 'Just now',
                };
              }
              return stk;
            });

            const matchedItem = state.stock.find((s) => s.product.toLowerCase().includes(qc.product.toLowerCase()));
            newMovements.unshift({
              id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              dateTime: new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              product: qc.product,
              sku: matchedItem?.sku || 'SKU-GEN',
              warehouse: matchedItem?.warehouse || 'Central Hub - BLR',
              movementType: 'Receipt',
              reference: qcId,
              qtyIn: passed,
              qtyOut: 0,
              previousStock: matchedItem ? matchedItem.stockInHand : 0,
              newStock: matchedItem ? matchedItem.stockInHand + passed : passed,
              performedBy: inspector || 'QC Inspector',
            });
          }

          return {
            qualityChecks: state.qualityChecks.map((q) =>
              q.id === qcId
                ? {
                    ...q,
                    passed,
                    failed,
                    damaged,
                    inspector: inspector || q.inspector,
                    notes: notes || q.notes,
                    status,
                  }
                : q
            ),
            stock: updatedStock,
            stockMovements: newMovements,
          };
        });
      },

      adjustStock: (id, newOnHand, newHold, reason) => {
        set((state) => {
          const item = state.stock.find((s) => s.id === id);
          if (!item) return state;

          const prevOnHand = item.stockInHand;
          const diff = newOnHand - prevOnHand;
          const newAvailable = newOnHand - item.reserved - newHold;

          let status: StockItem['status'] = 'Healthy';
          if (newAvailable <= 0) status = 'Out of Stock';
          else if (newAvailable < item.reorderLevel / 2) status = 'Critical';
          else if (newAvailable <= item.reorderLevel) status = 'Low Stock';

          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            product: item.product,
            sku: item.sku,
            warehouse: item.warehouse,
            movementType: 'Adjustment',
            reference: reason || 'Manual Audit Adjustment',
            qtyIn: diff > 0 ? diff : 0,
            qtyOut: diff < 0 ? Math.abs(diff) : 0,
            previousStock: prevOnHand,
            newStock: newOnHand,
            performedBy: 'Warehouse Lead',
          };

          return {
            stock: state.stock.map((s) =>
              s.id === id
                ? {
                    ...s,
                    stockInHand: newOnHand,
                    hold: newHold,
                    available: newAvailable,
                    status,
                    updated: 'Just now',
                  }
                : s
            ),
            stockMovements: [movement, ...state.stockMovements],
          };
        });
      },

      addIncomingStock: (data) => {
        const newId = `INC-2026-0${60 + get().incomingStock.length}`;
        set((state) => ({
          incomingStock: [{ ...data, id: newId }, ...state.incomingStock],
        }));
      },

      receiveIncomingAtDock: (id) => {
        set((state) => {
          const item = state.incomingStock.find((i) => i.id === id);
          if (!item) return state;

          const updatedStock = state.stock.map((stk) => {
            if (stk.sku === item.sku && stk.warehouse === item.warehouse) {
              const newOnHand = stk.stockInHand + item.quantity;
              const newAvailable = newOnHand - stk.reserved - stk.hold;
              const newIncoming = Math.max(0, stk.incoming - item.quantity);
              return {
                ...stk,
                stockInHand: newOnHand,
                available: newAvailable,
                incoming: newIncoming,
                updated: 'Just now',
              };
            }
            return stk;
          });

          const matchedItem = state.stock.find((s) => s.sku === item.sku && s.warehouse === item.warehouse);
          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            product: item.product,
            sku: item.sku,
            warehouse: item.warehouse,
            movementType: 'Receipt',
            reference: item.referenceId,
            qtyIn: item.quantity,
            qtyOut: 0,
            previousStock: matchedItem ? matchedItem.stockInHand : 0,
            newStock: (matchedItem ? matchedItem.stockInHand : 0) + item.quantity,
            performedBy: 'Inbound Dock Supervisor',
          };

          return {
            incomingStock: state.incomingStock.map((i) =>
              i.id === id ? { ...i, status: 'Dock Arrived' } : i
            ),
            stock: updatedStock,
            stockMovements: [movement, ...state.stockMovements],
          };
        });
      },

      releaseReservation: (id) => {
        set((state) => {
          const res = state.reservations.find((r) => r.id === id);
          if (!res) return state;

          const updatedStock = state.stock.map((stk) => {
            if (stk.sku === res.sku && stk.warehouse === res.warehouse) {
              const newReserved = Math.max(0, stk.reserved - res.reservedQty);
              const newAvailable = stk.stockInHand - newReserved - stk.hold;
              return {
                ...stk,
                reserved: newReserved,
                available: newAvailable,
                updated: 'Just now',
              };
            }
            return stk;
          });

          return {
            reservations: state.reservations.map((r) =>
              r.id === id ? { ...r, status: 'Released', reservedQty: 0 } : r
            ),
            stock: updatedStock,
          };
        });
      },

      addTransfer: (data) => {
        const newId = `TRF-2026-0${40 + get().transfers.length}`;
        const newTransfer: TransferItem = {
          ...data,
          id: newId,
          transferDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'In Transit',
        };

        set((state) => ({
          transfers: [newTransfer, ...state.transfers],
        }));
      },

      receiveTransfer: (id) => {
        set((state) => {
          const trf = state.transfers.find((t) => t.id === id);
          if (!trf) return state;

          // Add to target warehouse stock
          const updatedStock = state.stock.map((stk) => {
            if (stk.sku === trf.sku && stk.warehouse === trf.toWarehouse) {
              const newOnHand = stk.stockInHand + trf.quantity;
              const newAvailable = newOnHand - stk.reserved - stk.hold;
              return {
                ...stk,
                stockInHand: newOnHand,
                available: newAvailable,
                updated: 'Just now',
              };
            }
            return stk;
          });

          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            product: trf.product,
            sku: trf.sku,
            warehouse: trf.toWarehouse,
            movementType: 'Transfer In',
            reference: trf.id,
            qtyIn: trf.quantity,
            qtyOut: 0,
            previousStock: 0,
            newStock: trf.quantity,
            performedBy: 'Receiving Dock Lead',
          };

          return {
            transfers: state.transfers.map((t) => (t.id === id ? { ...t, status: 'Received' } : t)),
            stock: updatedStock,
            stockMovements: [movement, ...state.stockMovements],
          };
        });
      },

      dispatchFulfilment: (id) => {
        set((state) => {
          const flf = state.fulfilments.find((f) => f.id === id);
          if (!flf) return state;

          const updatedStock = state.stock.map((stk) => {
            if (stk.product.toLowerCase().includes(flf.product.toLowerCase()) && stk.warehouse === flf.warehouse) {
              const newOnHand = Math.max(0, stk.stockInHand - flf.requiredQty);
              const newReserved = Math.max(0, stk.reserved - flf.reservedQty);
              const newAvailable = newOnHand - newReserved - stk.hold;
              return {
                ...stk,
                stockInHand: newOnHand,
                reserved: newReserved,
                available: newAvailable,
                updated: 'Just now',
              };
            }
            return stk;
          });

          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            product: flf.product,
            sku: 'SKU-FULFILL',
            warehouse: flf.warehouse,
            movementType: 'Dispatch',
            reference: flf.orderId,
            qtyIn: 0,
            qtyOut: flf.requiredQty,
            previousStock: 0,
            newStock: 0,
            performedBy: 'Dispatch Lead',
          };

          return {
            fulfilments: state.fulfilments.filter((f) => f.id !== id),
            stock: updatedStock,
            stockMovements: [movement, ...state.stockMovements],
          };
        });
      },

      resolveAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
        }));
      },

      addStockMovement: (movement) => {
        const newMovement: StockMovementItem = {
          ...movement,
          id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          dateTime: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        set((state) => ({
          stockMovements: [newMovement, ...state.stockMovements],
        }));
      },
    }),
    {
      name: 'jodo-warehouse-store',
    }
  )
);
