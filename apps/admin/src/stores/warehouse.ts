import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProcurementItem {
  id: string; // e.g. PRC-2026-089
  supplier: string;
  product: string;
  sku: string;
  category: 'Raw Materials' | 'Finished Goods' | 'Packaging' | 'Hardware & Trims';
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  purchaseOrderNumber: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  destinationWarehouse: string;
  procurementOwner: string;
  status:
    | 'Draft'
    | 'PO Raised'
    | 'Confirmed'
    | 'In Transit'
    | 'Partially Received'
    | 'Received'
    | 'Delayed'
    | 'Cancelled';
  notes?: string;
}

export interface ManufacturerItem {
  id: string; // e.g. MFG-001
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  productCategories: string[];
  activeProductionOrders: number;
  completedOrdersCount: number;
  delayedOrdersCount: number;
  productionCapacity: string;
  currentUtilization: number; // e.g. 78%
  averageLeadTime: string; // e.g. 14 days
  qualityRating: number; // e.g. 4.8
  onTimeDeliveryRate: number; // e.g. 96.5%
  status: 'Active' | 'At Capacity' | 'Temporarily Unavailable' | 'Inactive';
}

export interface ProductionOrderItem {
  id: string; // e.g. PRD-2026-001
  product: string;
  sku: string;
  manufacturer: string;
  quantity: number;
  completedQuantity: number;
  rawMaterialRequirement: string;
  plannedStartDate: string;
  plannedCompletionDate: string;
  actualStartDate?: string;
  actualCompletionDate?: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  destinationWarehouse: string;
  assignedManager: string;
  progress: number;
  qcPassed: number;
  status:
    | 'Draft'
    | 'Scheduled'
    | 'Material Pending'
    | 'In Production'
    | 'QC Pending'
    | 'Completed'
    | 'Delayed'
    | 'Cancelled';
  notes?: string;
}

export type ProductionTrackingStageName =
  | 'Scheduled'
  | 'Materials Allocated'
  | 'Production Started'
  | 'In Production'
  | 'Production Completed'
  | 'Quality Check'
  | 'Ready for Stock-In';

export interface ProductionTrackingStage {
  name: ProductionTrackingStageName;
  completed: boolean;
  current?: boolean;
  date?: string;
}

export interface ProductionTrackingItem {
  id: string;
  orderId: string;
  product: string;
  manufacturer: string;
  orderedQty: number;
  completedQty: number;
  progress: number;
  currentStage: ProductionTrackingStageName;
  startDate: string;
  expectedCompletion: string;
  delayDays: number;
  status: string;
  stages: ProductionTrackingStage[];
}

export interface QualityCheckItem {
  id: string; // e.g. QC-2026-112
  productionOrder: string;
  product: string;
  sku: string;
  manufacturer: string;
  batchNumber: string;
  quantityInspected: number;
  passedQuantity: number;
  failedQuantity: number;
  inspectionDate: string;
  inspector: string;
  defectType?: 'None' | 'Stitching & Seam' | 'Color Mismatch' | 'Sizing & Dimensions' | 'Fabric Flaw' | 'Hardware Issue';
  defectNotes?: string;
  defectDescription?: string;
  checkpoints?: Record<string, 'Pass' | 'Fail' | 'NA'>;
  images?: string[];
  qcStatus:
    | 'Pending'
    | 'In Inspection'
    | 'Passed'
    | 'Partially Passed'
    | 'Failed'
    | 'Reinspection Required';
}

export interface StockItem {
  id: string;
  product: string;
  sku: string;
  warehouse: string;
  stockInHand: number;
  reserved: number;
  available: number; // strictly: stockInHand - reserved
  incoming: number;
  reorderLevel: number;
  status: 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';
  lastUpdated: string;
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
  channel: 'Website' | 'Amazon' | 'Myntra' | 'B2B Wholesale' | 'Direct Sales';
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
  status: 'Draft' | 'Requested' | 'Approved' | 'In Transit' | 'Received' | 'Cancelled';
}

export interface FulfilmentCondition {
  stockAvailable: boolean; // 20%
  stockReserved: boolean; // 15%
  productionCompleted: boolean; // 20%
  qcPassed: boolean; // 20%
  packagingReady: boolean; // 15%
  dispatchPrepared: boolean; // 10%
}

export interface FulfilmentItem {
  id: string;
  orderId: string; // e.g. ORD-1045
  customer: string;
  channel: string;
  product: string;
  sku: string;
  requiredQty: number;
  availableQty: number;
  reservedQty: number;
  warehouse: string;
  conditions: FulfilmentCondition;
  readinessPercent: number; // Computed 0 - 100%
  finalStatus:
    | 'Not Ready'
    | 'At Risk'
    | 'Partially Ready'
    | 'Almost Ready'
    | 'Ready for Fulfilment'
    | 'Dispatched';
  expectedDispatch: string;
}

export interface DelayAlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type:
    | 'Procurement Delay'
    | 'Supplier Delay'
    | 'Raw Material Shortage'
    | 'Manufacturer Delay'
    | 'Production Delay'
    | 'QC Delay'
    | 'QC Failure'
    | 'Incoming Shipment Delay'
    | 'Stock Shortage'
    | 'Fulfilment Risk';
  entityId: string;
  product: string;
  reason: string;
  daysDelayed: number;
  responsibleParty: string;
  createdTime: string;
  recommendedAction: string;
  resolved: boolean;
}

export interface WarehouseIssueItem {
  id: string; // e.g. ISS-2026-001
  relatedOrder: string;
  type:
    | 'Procurement Delay'
    | 'Production Delay'
    | 'Material Shortage'
    | 'Quality Failure'
    | 'Manufacturer Issue'
    | 'Transportation Delay'
    | 'Other';
  product: string;
  sku?: string;
  supplierManufacturer: string;
  issue: string;
  expectedDate: string;
  daysDelayed: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseNotificationItem {
  id: string; // e.g. NOTIF-001
  title: string;
  message: string;
  type:
    | 'low_stock'
    | 'out_of_stock'
    | 'po_delayed'
    | 'prod_delayed'
    | 'qc_failed'
    | 'qc_waiting'
    | 'mfg_delayed'
    | 'stock_received'
    | 'prod_completed'
    | 'fulfilment_ready';
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  read: boolean;
  orderId?: string;
  link?: string;
}

export interface StockMovementItem {
  id: string;
  dateTime: string;
  product: string;
  sku: string;
  warehouse: string;
  movementType:
    | 'Receipt'
    | 'Reservation'
    | 'Reservation Release'
    | 'Dispatch'
    | 'Transfer In'
    | 'Transfer Out'
    | 'Adjustment'
    | 'Return';
  quantity: number;
  qtyIn: number;
  qtyOut: number;
  previousStock: number;
  newStock: number;
  referenceId: string;
  performedBy: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  referenceId: string;
  previousValue: string;
  newValue: string;
  user: string;
  dateTime: string;
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
  issues: WarehouseIssueItem[];
  notifications: WarehouseNotificationItem[];
  stockMovements: StockMovementItem[];
  auditLog: AuditLogEntry[];

  // Dynamic KPI overview computation
  getOverviewMetrics: () => {
    totalStock: number;
    availableStock: number;
    reservedStock: number;
    incomingStock: number;
    underProduction: number;
    qcPending: number;
    delayedOrders: number;
    fulfilmentReadyPercent: number;
  };

  // Actions
  addProcurement: (data: Omit<ProcurementItem, 'id' | 'quantityReceived' | 'status'>) => void;
  updateProcurementStatus: (id: string, status: ProcurementItem['status']) => void;
  receiveProcurementStock: (id: string, qty: number) => void;
  receiveIncomingAtDock: (incomingId: string) => void;
  addManufacturer: (data: Omit<ManufacturerItem, 'id' | 'activeProductionOrders' | 'completedOrdersCount' | 'delayedOrdersCount'>) => void;
  addProductionOrder: (data: Omit<ProductionOrderItem, 'id' | 'completedQuantity' | 'qcPassed' | 'progress' | 'status'>) => void;
  updateProductionStage: (orderId: string, stage: ProductionTrackingStageName, completedQty?: number) => void;
  recordQualityCheck: (data: {
    qcId: string;
    passedQuantity: number;
    failedQuantity: number;
    inspector: string;
    defectType?: QualityCheckItem['defectType'];
    defectNotes?: string;
    defectDescription?: string;
    checkpoints?: Record<string, 'Pass' | 'Fail' | 'NA'>;
    images?: string[];
  }) => void;
  adjustStock: (stockId: string, newStockInHand: number, reason: string) => void;
  releaseReservation: (resId: string) => void;
  allocateReservation: (orderId: string, sku: string, qty: number) => void;
  addTransfer: (data: Omit<TransferItem, 'id' | 'status' | 'transferDate'>) => void;
  receiveTransfer: (transferId: string) => void;
  dispatchFulfilmentOrder: (fulfilmentId: string) => void;
  resolveAlert: (alertId: string) => void;
  addIssue: (data: Omit<WarehouseIssueItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIssueStatus: (id: string, status: WarehouseIssueItem['status'], notes?: string) => void;
  assignIssue: (id: string, assignedTo: string) => void;
  addNotification: (data: Omit<WarehouseNotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'dateTime'>) => void;
}

// Initial realistic dataset
const initialProcurements: ProcurementItem[] = [
  {
    id: 'PRC-2026-089',
    supplier: 'Apex Fabrics Ltd',
    product: 'Organic Cotton Jersey Fabric',
    sku: 'FAB-ORG-001',
    category: 'Raw Materials',
    quantityOrdered: 2500,
    quantityReceived: 1500,
    unitCost: 190,
    totalCost: 475000,
    purchaseOrderNumber: 'PO-2026-089',
    orderDate: '15 Aug 2026',
    expectedDeliveryDate: '01 Sep 2026',
    destinationWarehouse: 'Central Hub - BLR',
    procurementOwner: 'Vikram Sethi',
    status: 'Partially Received',
    notes: 'Initial lot of 1,500m received. Remaining 1,000m dispatched via road freight.',
  },
  {
    id: 'PRC-2026-090',
    supplier: 'Vanguard Textiles Corp',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    category: 'Finished Goods',
    quantityOrdered: 1000,
    quantityReceived: 0,
    unitCost: 920,
    totalCost: 920000,
    purchaseOrderNumber: 'PO-2026-090',
    orderDate: '20 Aug 2026',
    expectedDeliveryDate: '18 Sep 2026',
    destinationWarehouse: 'West DC - BOM',
    procurementOwner: 'Pooja Iyer',
    status: 'In Transit',
    notes: 'Container loaded at Surat hub. Tracking: BLR-TRK-9821.',
  },
  {
    id: 'PRC-2026-091',
    supplier: 'Zenith Mill Supplies',
    product: 'YKK Metal Zippers (Bronze 18cm)',
    sku: 'TRM-ZIP-004',
    category: 'Hardware & Trims',
    quantityOrdered: 5000,
    quantityReceived: 5000,
    unitCost: 15,
    totalCost: 75000,
    purchaseOrderNumber: 'PO-2026-091',
    orderDate: '10 Aug 2026',
    expectedDeliveryDate: '25 Aug 2026',
    actualDeliveryDate: '24 Aug 2026',
    destinationWarehouse: 'Central Hub - BLR',
    procurementOwner: 'Vikram Sethi',
    status: 'Received',
    notes: 'Full order inspected and stocked into Trim Locker B.',
  },
  {
    id: 'PRC-2026-092',
    supplier: 'Highland Knits Global',
    product: 'Merino Wool Yarn Cones',
    sku: 'YRN-MRN-005',
    category: 'Raw Materials',
    quantityOrdered: 800,
    quantityReceived: 0,
    unitCost: 900,
    totalCost: 720000,
    purchaseOrderNumber: 'PO-2026-092',
    orderDate: '05 Aug 2026',
    expectedDeliveryDate: '02 Sep 2026', // Past date -> Automatically Delayed!
    destinationWarehouse: 'North DC - DEL',
    procurementOwner: 'Ananya Roy',
    status: 'Delayed',
    notes: 'Shipment delayed at Ludhiana transit station due to monsoon road closure.',
  },
  {
    id: 'PRC-2026-093',
    supplier: 'Eastern Indigo Mills',
    product: 'Pure Linen Shirting Fabric',
    sku: 'FAB-LIN-007',
    category: 'Raw Materials',
    quantityOrdered: 1200,
    quantityReceived: 0,
    unitCost: 450,
    totalCost: 540000,
    purchaseOrderNumber: 'PO-2026-093',
    orderDate: '01 Sep 2026',
    expectedDeliveryDate: '25 Sep 2026',
    destinationWarehouse: 'Central Hub - BLR',
    procurementOwner: 'Pooja Iyer',
    status: 'Confirmed',
    notes: 'Supplier acknowledged PO. Dyeing schedule locked for 10 Sep.',
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
    productCategories: ['Denim Jackets', 'Chino Trousers', 'Heavy Twills'],
    activeProductionOrders: 3,
    completedOrdersCount: 28,
    delayedOrdersCount: 0,
    productionCapacity: '60,000 units/mo',
    currentUtilization: 84,
    averageLeadTime: '14 days',
    qualityRating: 4.8,
    onTimeDeliveryRate: 98.2,
    status: 'Active',
  },
  {
    id: 'MFG-002',
    name: 'Sterling Garments Ltd',
    contactPerson: 'Pooja Deshmukh',
    phone: '+91 97652 11980',
    email: 'orders@sterlinggarments.com',
    location: 'Tirupur, Tamil Nadu',
    productCategories: ['Organic T-Shirts', 'Polos', 'Fleece Hoodies'],
    activeProductionOrders: 4,
    completedOrdersCount: 45,
    delayedOrdersCount: 1,
    productionCapacity: '120,000 units/mo',
    currentUtilization: 92,
    averageLeadTime: '10 days',
    qualityRating: 4.9,
    onTimeDeliveryRate: 96.5,
    status: 'Active',
  },
  {
    id: 'MFG-003',
    name: 'Himalayan Woolcrafts',
    contactPerson: 'Vikram Thakur',
    phone: '+91 94180 33410',
    email: 'orders@himalayanwool.co.in',
    location: 'Ludhiana, Punjab',
    productCategories: ['Merino Sweaters', 'Cardigans', 'Thermal Knits'],
    activeProductionOrders: 2,
    completedOrdersCount: 16,
    delayedOrdersCount: 1,
    productionCapacity: '25,000 units/mo',
    currentUtilization: 96,
    averageLeadTime: '21 days',
    qualityRating: 4.6,
    onTimeDeliveryRate: 88.0,
    status: 'At Capacity',
  },
  {
    id: 'MFG-004',
    name: 'Kaveri Silk & Linens',
    contactPerson: 'Suresh Nambiar',
    phone: '+91 98450 78233',
    email: 'info@kaverisilks.com',
    location: 'Bengaluru, Karnataka',
    productCategories: ['Linen Shirts', 'Silk Scarves', 'Resort Wear'],
    activeProductionOrders: 1,
    completedOrdersCount: 12,
    delayedOrdersCount: 0,
    productionCapacity: '35,000 units/mo',
    currentUtilization: 65,
    averageLeadTime: '18 days',
    qualityRating: 4.4,
    onTimeDeliveryRate: 94.0,
    status: 'Active',
  },
];

const initialProductionOrders: ProductionOrderItem[] = [
  {
    id: 'PRD-2026-001',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    manufacturer: 'Sterling Garments Ltd',
    quantity: 1000,
    completedQuantity: 750,
    rawMaterialRequirement: '1,400m 12oz Indigo Denim + 6,000 Rivets',
    plannedStartDate: '25 Aug 2026',
    plannedCompletionDate: '18 Sep 2026',
    actualStartDate: '26 Aug 2026',
    priority: 'High',
    destinationWarehouse: 'Central Hub - BLR',
    assignedManager: 'Kunal Singhal',
    progress: 75,
    qcPassed: 710,
    status: 'In Production',
    notes: 'Washing cycle completed. Currently in button attachment & final thread trimming.',
  },
  {
    id: 'PRD-2026-002',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    manufacturer: 'Sterling Garments Ltd',
    quantity: 2500,
    completedQuantity: 2500,
    rawMaterialRequirement: '1,250kg Combed Cotton Single Jersey',
    plannedStartDate: '15 Aug 2026',
    plannedCompletionDate: '08 Sep 2026',
    actualStartDate: '15 Aug 2026',
    priority: 'Medium',
    destinationWarehouse: 'Central Hub - BLR',
    assignedManager: 'Kunal Singhal',
    progress: 100,
    qcPassed: 2420,
    status: 'QC Pending',
    notes: 'Production complete. Batch delivered to warehouse inspection bay 4.',
  },
  {
    id: 'PRD-2026-003',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    manufacturer: 'Vanguard Textiles Corp',
    quantity: 1800,
    completedQuantity: 1100,
    rawMaterialRequirement: '2,200m Stretch Cotton Twill + 1,800 YKK Zippers',
    plannedStartDate: '20 Aug 2026',
    plannedCompletionDate: '22 Sep 2026',
    actualStartDate: '22 Aug 2026',
    priority: 'Medium',
    destinationWarehouse: 'West DC - BOM',
    assignedManager: 'Pooja Iyer',
    progress: 61,
    qcPassed: 1050,
    status: 'In Production',
    notes: 'Line 2 assembly on pace. Waistband elastic attachment scheduled for 14 Sep.',
  },
  {
    id: 'PRD-2026-004',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    manufacturer: 'Himalayan Woolcrafts',
    quantity: 1200,
    completedQuantity: 300,
    rawMaterialRequirement: '720kg 2/28 Merino Wool Yarn',
    plannedStartDate: '10 Aug 2026',
    plannedCompletionDate: '10 Sep 2026',
    actualStartDate: '18 Aug 2026',
    priority: 'Critical',
    destinationWarehouse: 'North DC - DEL',
    assignedManager: 'Ananya Roy',
    progress: 25,
    qcPassed: 280,
    status: 'Delayed',
    notes: 'Yarn dye lot variation required re-dyeing lot 2. Completion delayed by 8 days.',
  },
  {
    id: 'PRD-2026-005',
    product: 'Premium Linen Shirt',
    sku: 'SHT-LIN-007',
    manufacturer: 'Kaveri Silk & Linens',
    quantity: 1500,
    completedQuantity: 0,
    rawMaterialRequirement: '2,100m 60s Count French Linen',
    plannedStartDate: '12 Sep 2026',
    plannedCompletionDate: '30 Sep 2026',
    priority: 'High',
    destinationWarehouse: 'West DC - BOM',
    assignedManager: 'Pooja Iyer',
    progress: 0,
    qcPassed: 0,
    status: 'Scheduled',
    notes: 'Fabric arriving from Eastern Indigo Mills on 10 Sep. Cutting begins 12 Sep.',
  },
];

const initialProductionTracking: ProductionTrackingItem[] = [
  {
    id: 'TRK-001',
    orderId: 'PRD-2026-001',
    product: 'Classic Denim Jacket',
    manufacturer: 'Sterling Garments Ltd',
    orderedQty: 1000,
    completedQty: 750,
    progress: 75,
    currentStage: 'In Production',
    startDate: '26 Aug 2026',
    expectedCompletion: '18 Sep 2026',
    delayDays: 0,
    status: 'Stitching & Hardware Assembly',
    stages: [
      { name: 'Scheduled', completed: true, date: '25 Aug 2026' },
      { name: 'Materials Allocated', completed: true, date: '26 Aug 2026' },
      { name: 'Production Started', completed: true, date: '28 Aug 2026' },
      { name: 'In Production', completed: false, current: true, date: 'Target: 14 Sep' },
      { name: 'Production Completed', completed: false, date: 'Est: 16 Sep' },
      { name: 'Quality Check', completed: false, date: 'Est: 17 Sep' },
      { name: 'Ready for Stock-In', completed: false, date: 'Est: 18 Sep' },
    ],
  },
  {
    id: 'TRK-002',
    orderId: 'PRD-2026-002',
    product: 'Organic Cotton T-Shirt',
    manufacturer: 'Sterling Garments Ltd',
    orderedQty: 2500,
    completedQty: 2500,
    progress: 100,
    currentStage: 'Quality Check',
    startDate: '15 Aug 2026',
    expectedCompletion: '08 Sep 2026',
    delayDays: 0,
    status: 'Under Quality Inspection at Bay 4',
    stages: [
      { name: 'Scheduled', completed: true, date: '15 Aug 2026' },
      { name: 'Materials Allocated', completed: true, date: '16 Aug 2026' },
      { name: 'Production Started', completed: true, date: '18 Aug 2026' },
      { name: 'In Production', completed: true, date: '30 Aug 2026' },
      { name: 'Production Completed', completed: true, date: '05 Sep 2026' },
      { name: 'Quality Check', completed: false, current: true, date: 'Active Today' },
      { name: 'Ready for Stock-In', completed: false, date: 'Pending QC' },
    ],
  },
  {
    id: 'TRK-003',
    orderId: 'PRD-2026-003',
    product: 'Slim Fit Chino Trouser',
    manufacturer: 'Vanguard Textiles Corp',
    orderedQty: 1800,
    completedQty: 1100,
    progress: 61,
    currentStage: 'In Production',
    startDate: '22 Aug 2026',
    expectedCompletion: '22 Sep 2026',
    delayDays: 0,
    status: 'Assembly Line 2 - Waistband Attachment',
    stages: [
      { name: 'Scheduled', completed: true, date: '20 Aug 2026' },
      { name: 'Materials Allocated', completed: true, date: '21 Aug 2026' },
      { name: 'Production Started', completed: true, date: '24 Aug 2026' },
      { name: 'In Production', completed: false, current: true, date: 'Est: 16 Sep' },
      { name: 'Production Completed', completed: false, date: 'Est: 19 Sep' },
      { name: 'Quality Check', completed: false, date: 'Est: 20 Sep' },
      { name: 'Ready for Stock-In', completed: false, date: 'Est: 22 Sep' },
    ],
  },
  {
    id: 'TRK-004',
    orderId: 'PRD-2026-004',
    product: 'Merino Wool Sweater',
    manufacturer: 'Himalayan Woolcrafts',
    orderedQty: 1200,
    completedQty: 300,
    progress: 25,
    currentStage: 'Production Started',
    startDate: '18 Aug 2026',
    expectedCompletion: '10 Sep 2026',
    delayDays: 8,
    status: 'Delayed: Re-dyeing Yarn Lot #2',
    stages: [
      { name: 'Scheduled', completed: true, date: '10 Aug 2026' },
      { name: 'Materials Allocated', completed: true, date: '14 Aug 2026' },
      { name: 'Production Started', completed: false, current: true, date: 'Delayed: 18 Sep' },
      { name: 'In Production', completed: false, date: 'Est: 24 Sep' },
      { name: 'Production Completed', completed: false, date: 'Est: 28 Sep' },
      { name: 'Quality Check', completed: false, date: 'Est: 29 Sep' },
      { name: 'Ready for Stock-In', completed: false, date: 'Est: 30 Sep' },
    ],
  },
];

const initialQualityChecks: QualityCheckItem[] = [
  {
    id: 'QC-2026-112',
    productionOrder: 'PRD-2026-001',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    manufacturer: 'Sterling Garments Ltd',
    batchNumber: 'BATCH-26A-01',
    quantityInspected: 750,
    passedQuantity: 710,
    failedQuantity: 40,
    inspectionDate: '06 Sep 2026',
    inspector: 'Rahul Sharma',
    defectType: 'Stitching & Seam',
    defectNotes: 'Riveting passed 99%. 40 units failed due to double-needle hem skipping on lower jacket band.',
    qcStatus: 'Passed',
  },
  {
    id: 'QC-2026-113',
    productionOrder: 'PRD-2026-002',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    manufacturer: 'Sterling Garments Ltd',
    batchNumber: 'BATCH-26B-04',
    quantityInspected: 2500,
    passedQuantity: 0,
    failedQuantity: 0,
    inspectionDate: '07 Sep 2026',
    inspector: 'Neha Kapoor',
    defectType: 'None',
    defectNotes: 'Awaiting shrinkage & color-fastness lab report before release.',
    qcStatus: 'Pending',
  },
  {
    id: 'QC-2026-114',
    productionOrder: 'PRD-2026-003',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    manufacturer: 'Vanguard Textiles Corp',
    batchNumber: 'BATCH-26C-02',
    quantityInspected: 1100,
    passedQuantity: 1050,
    failedQuantity: 50,
    inspectionDate: '05 Sep 2026',
    inspector: 'Karthik Raja',
    defectType: 'Hardware Issue',
    defectNotes: 'Zipper slider puller detachment on 50 units. Approved 1,050 units cleared for inventory.',
    qcStatus: 'Partially Passed',
  },
  {
    id: 'QC-2026-115',
    productionOrder: 'PRD-2026-004',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    manufacturer: 'Himalayan Woolcrafts',
    batchNumber: 'BATCH-26D-01',
    quantityInspected: 300,
    passedQuantity: 180,
    failedQuantity: 120,
    inspectionDate: '03 Sep 2026',
    inspector: 'Rahul Sharma',
    defectType: 'Fabric Flaw',
    defectNotes: 'Severe pilling index failure. 120 units quarantined for factory de-pilling rework.',
    qcStatus: 'Failed',
  },
];

// Available Stock = Stock in Hand - Reserved Stock
const initialStock: StockItem[] = [
  {
    id: 'STK-001',
    product: 'Organic Cotton T-Shirt (Navy / M)',
    sku: 'TSH-ORG-001',
    warehouse: 'Central Hub - BLR',
    stockInHand: 4200,
    reserved: 1000,
    available: 3200, // 4200 - 1000
    incoming: 800,
    reorderLevel: 1000,
    status: 'Healthy',
    lastUpdated: '15 mins ago',
  },
  {
    id: 'STK-002',
    product: 'Classic Denim Jacket (Indigo / L)',
    sku: 'JKT-DNM-003',
    warehouse: 'Central Hub - BLR',
    stockInHand: 1850,
    reserved: 450,
    available: 1400, // 1850 - 450
    incoming: 1000,
    reorderLevel: 500,
    status: 'Healthy',
    lastUpdated: '1 hour ago',
  },
  {
    id: 'STK-003',
    product: 'Slim Fit Chino Trouser (Khaki / 32)',
    sku: 'CHN-SLM-002',
    warehouse: 'West DC - BOM',
    stockInHand: 740,
    reserved: 440,
    available: 300, // 740 - 440
    incoming: 1500,
    reorderLevel: 450,
    status: 'Low Stock', // Available (300) <= Reorder (450)
    lastUpdated: '30 mins ago',
  },
  {
    id: 'STK-004',
    product: 'Merino Wool Sweater (Charcoal / L)',
    sku: 'SWT-MRN-005',
    warehouse: 'North DC - DEL',
    stockInHand: 160,
    reserved: 145,
    available: 15, // 160 - 145
    incoming: 800,
    reorderLevel: 250,
    status: 'Critical',
    lastUpdated: '5 mins ago',
  },
  {
    id: 'STK-005',
    product: 'Premium Linen Shirt (White / M)',
    sku: 'SHT-LIN-007',
    warehouse: 'West DC - BOM',
    stockInHand: 0,
    reserved: 0,
    available: 0,
    incoming: 1200,
    reorderLevel: 200,
    status: 'Out of Stock', // Available = 0
    lastUpdated: '2 hours ago',
  },
  {
    id: 'STK-006',
    product: 'Silk Blend Scarf (Olive / Unisex)',
    sku: 'SCF-SLK-009',
    warehouse: 'Central Hub - BLR',
    stockInHand: 1420,
    reserved: 200,
    available: 1220,
    incoming: 300,
    reorderLevel: 300,
    status: 'Healthy',
    lastUpdated: '3 hours ago',
  },
  {
    id: 'STK-007',
    product: 'Leather Everyday Belt (Brown / 34)',
    sku: 'BLT-LTH-012',
    warehouse: 'North DC - DEL',
    stockInHand: 890,
    reserved: 250,
    available: 640,
    incoming: 0,
    reorderLevel: 350,
    status: 'Healthy',
    lastUpdated: '4 hours ago',
  },
];

const initialIncomingStock: IncomingStockItem[] = [
  {
    id: 'INC-2026-045',
    referenceId: 'PO-2026-089',
    source: 'Purchase Order',
    supplierManufacturer: 'Apex Fabrics Ltd',
    product: 'Organic Cotton Jersey Fabric',
    sku: 'FAB-ORG-001',
    quantity: 1000,
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
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    quantity: 1000,
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
    orderId: 'ORD-1045',
    customer: 'Aarav Mehta',
    channel: 'Website',
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
    orderId: 'ORD-1048',
    customer: 'Tanvi Saxena',
    channel: 'Myntra',
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
    orderId: 'ORD-1052',
    customer: 'Rohan Gupta',
    channel: 'Amazon',
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
    orderId: 'ORD-1055',
    customer: 'Priya Sharma',
    channel: 'Website',
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
    orderId: 'ORD-1060',
    customer: 'Deepak Chawla',
    channel: 'B2B Wholesale',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    warehouse: 'West DC - BOM',
    requiredQty: 50,
    reservedQty: 50,
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
    status: 'Approved',
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

// Helper to calculate dynamic fulfilment readiness
export function calculateFulfilmentReadiness(conditions: FulfilmentCondition): {
  percent: number;
  finalStatus: FulfilmentItem['finalStatus'];
} {
  let percent = 0;
  if (conditions.stockAvailable) percent += 20;
  if (conditions.stockReserved) percent += 15;
  if (conditions.productionCompleted) percent += 20;
  if (conditions.qcPassed) percent += 20;
  if (conditions.packagingReady) percent += 15;
  if (conditions.dispatchPrepared) percent += 10;

  let finalStatus: FulfilmentItem['finalStatus'] = 'Not Ready';
  if (percent === 100) finalStatus = 'Ready for Fulfilment';
  else if (percent >= 85) finalStatus = 'Almost Ready';
  else if (percent >= 50) finalStatus = 'Partially Ready';
  else if (percent > 0 && !conditions.stockAvailable) finalStatus = 'At Risk';

  return { percent, finalStatus };
}

const initialFulfilments: FulfilmentItem[] = [
  {
    id: 'FLF-001',
    orderId: 'ORD-1045',
    customer: 'Aarav Mehta',
    channel: 'Website',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    requiredQty: 4,
    availableQty: 3200,
    reservedQty: 4,
    warehouse: 'Central Hub - BLR',
    conditions: {
      stockAvailable: true, // 20
      stockReserved: true, // 15
      productionCompleted: true, // 20
      qcPassed: true, // 20
      packagingReady: true, // 15
      dispatchPrepared: false, // 0 -> 90%
    },
    readinessPercent: 90,
    finalStatus: 'Almost Ready',
    expectedDispatch: 'Today, 5:30 PM',
  },
  {
    id: 'FLF-002',
    orderId: 'ORD-1048',
    customer: 'Tanvi Saxena',
    channel: 'Myntra',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    requiredQty: 2,
    availableQty: 1400,
    reservedQty: 2,
    warehouse: 'Central Hub - BLR',
    conditions: {
      stockAvailable: true, // 20
      stockReserved: true, // 15
      productionCompleted: true, // 20
      qcPassed: true, // 20
      packagingReady: true, // 15
      dispatchPrepared: true, // 10 -> 100%
    },
    readinessPercent: 100,
    finalStatus: 'Ready for Fulfilment',
    expectedDispatch: 'Ready to Dispatch',
  },
  {
    id: 'FLF-003',
    orderId: 'ORD-1052',
    customer: 'Rohan Gupta',
    channel: 'Amazon',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    requiredQty: 5,
    availableQty: 15,
    reservedQty: 5,
    warehouse: 'North DC - DEL',
    conditions: {
      stockAvailable: true, // 20
      stockReserved: true, // 15
      productionCompleted: true, // 20
      qcPassed: true, // 20
      packagingReady: false, // 0
      dispatchPrepared: false, // 0 -> 75%
    },
    readinessPercent: 75,
    finalStatus: 'Partially Ready',
    expectedDispatch: 'Tomorrow, 11:00 AM',
  },
  {
    id: 'FLF-004',
    orderId: 'ORD-1055',
    customer: 'Priya Sharma',
    channel: 'Website',
    product: 'Premium Linen Shirt',
    sku: 'SHT-LIN-007',
    requiredQty: 2,
    availableQty: 0,
    reservedQty: 0,
    warehouse: 'West DC - BOM',
    conditions: {
      stockAvailable: false, // 0
      stockReserved: false, // 0
      productionCompleted: false, // 0
      qcPassed: false, // 0
      packagingReady: false, // 0
      dispatchPrepared: false, // 0
    },
    readinessPercent: 0,
    finalStatus: 'Not Ready',
    expectedDispatch: '26 Sep 2026',
  },
  {
    id: 'FLF-005',
    orderId: 'ORD-1060',
    customer: 'Deepak Chawla',
    channel: 'B2B Wholesale',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    requiredQty: 50,
    availableQty: 300,
    reservedQty: 50,
    warehouse: 'West DC - BOM',
    conditions: {
      stockAvailable: true, // 20
      stockReserved: true, // 15
      productionCompleted: true, // 20
      qcPassed: true, // 20
      packagingReady: true, // 15
      dispatchPrepared: false, // 0 -> 90%
    },
    readinessPercent: 90,
    finalStatus: 'Almost Ready',
    expectedDispatch: '09 Sep 2026',
  },
];

const initialAlerts: DelayAlertItem[] = [
  {
    id: 'ALT-001',
    severity: 'critical',
    type: 'Stock Shortage',
    entityId: 'SHT-LIN-007',
    product: 'Premium Linen Shirt (White / M)',
    reason: 'Available stock is 0 units across all warehouses. 12 backorders accumulating.',
    daysDelayed: 4,
    responsibleParty: 'Eastern Indigo Mills',
    createdTime: '25 mins ago',
    recommendedAction: 'Expedite Procurement',
    resolved: false,
  },
  {
    id: 'ALT-002',
    severity: 'critical',
    type: 'Production Delay',
    entityId: 'PRD-2026-004',
    product: 'Merino Wool Sweater (Charcoal / L)',
    reason: 'Yarn dye lot color variation caused 8-day stoppage at Himalayan Woolcrafts.',
    daysDelayed: 8,
    responsibleParty: 'Himalayan Woolcrafts',
    createdTime: '1 hour ago',
    recommendedAction: 'Contact Manufacturer',
    resolved: false,
  },
  {
    id: 'ALT-003',
    severity: 'warning',
    type: 'Stock Shortage',
    entityId: 'SWT-MRN-005',
    product: 'Merino Wool Sweater (North DC - DEL)',
    reason: 'Available stock (15 units) is critically below reorder threshold (250 units).',
    daysDelayed: 0,
    responsibleParty: 'North DC Logistics',
    createdTime: '2 hours ago',
    recommendedAction: 'Create Stock Transfer',
    resolved: false,
  },
  {
    id: 'ALT-004',
    severity: 'warning',
    type: 'QC Failure',
    entityId: 'QC-2026-115',
    product: 'Merino Wool Sweater (Batch 26D-01)',
    reason: '120 units failed fiber pilling test. Quarantined for de-pilling rework.',
    daysDelayed: 3,
    responsibleParty: 'QC Lab Bay 2',
    createdTime: '4 hours ago',
    recommendedAction: 'Inspect QC Report',
    resolved: false,
  },
  {
    id: 'ALT-005',
    severity: 'warning',
    type: 'Procurement Delay',
    entityId: 'PRC-2026-092',
    product: 'Merino Wool Yarn Cones',
    reason: 'Expected delivery date was 02 Sep 2026. Monsoon road transport delays reported.',
    daysDelayed: 5,
    responsibleParty: 'Highland Knits Global',
    createdTime: 'Yesterday',
    recommendedAction: 'Expedite Procurement',
    resolved: false,
  },
  {
    id: 'ALT-006',
    severity: 'info',
    type: 'Fulfilment Risk',
    entityId: 'ORD-1052',
    product: 'Merino Wool Sweater (5 units)',
    reason: 'Buffer stock at Delhi warehouse is at 15 units. Risk of stockout if transfer arrives late.',
    daysDelayed: 1,
    responsibleParty: 'Delhi Dispatch Hub',
    createdTime: 'Yesterday',
    recommendedAction: 'Track Transfer',
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
    quantity: 1200,
    qtyIn: 1200,
    qtyOut: 0,
    previousStock: 3000,
    newStock: 4200,
    referenceId: 'PO-2026-089',
    performedBy: 'Rahul Sharma (Warehouse Mgr)',
  },
  {
    id: 'MOV-2026-8840',
    dateTime: '07 Sep 2026, 10:15 AM',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    warehouse: 'Central Hub - BLR',
    movementType: 'Receipt',
    quantity: 710,
    qtyIn: 710,
    qtyOut: 0,
    previousStock: 1140,
    newStock: 1850,
    referenceId: 'QC-2026-112',
    performedBy: 'Neha Kapoor (QC Lead)',
  },
  {
    id: 'MOV-2026-8839',
    dateTime: '07 Sep 2026, 09:30 AM',
    product: 'Classic Denim Jacket',
    sku: 'JKT-DNM-003',
    warehouse: 'Central Hub - BLR',
    movementType: 'Dispatch',
    quantity: 2,
    qtyIn: 0,
    qtyOut: 2,
    previousStock: 1852,
    newStock: 1850,
    referenceId: 'ORD-9812',
    performedBy: 'Vikrant Yadav (Dispatch)',
  },
  {
    id: 'MOV-2026-8838',
    dateTime: '06 Sep 2026, 04:50 PM',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    warehouse: 'West DC - BOM',
    movementType: 'Adjustment',
    quantity: 15,
    qtyIn: 0,
    qtyOut: 15,
    previousStock: 755,
    newStock: 740,
    referenceId: 'INV-AUD-09',
    performedBy: 'Manoj Pillai (Supervisor)',
  },
  {
    id: 'MOV-2026-8837',
    dateTime: '05 Sep 2026, 02:15 PM',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    warehouse: 'Central Hub - BLR',
    movementType: 'Transfer Out',
    quantity: 350,
    qtyIn: 0,
    qtyOut: 350,
    previousStock: 510,
    newStock: 160,
    referenceId: 'TRF-2026-031',
    performedBy: 'Rahul Sharma (Warehouse Mgr)',
  },
];

const initialAuditLog: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    action: 'Stock Received via Procurement',
    referenceId: 'PRC-2026-089',
    previousValue: 'Quantity Received: 0',
    newValue: 'Quantity Received: 1,200',
    user: 'Rahul Sharma',
    dateTime: '07 Sep 2026, 11:42 AM',
  },
  {
    id: 'AUD-002',
    action: 'QC Inspection Recorded',
    referenceId: 'QC-2026-112',
    previousValue: 'Status: Pending',
    newValue: 'Status: Passed (710 passed, 40 failed)',
    user: 'Neha Kapoor',
    dateTime: '07 Sep 2026, 10:15 AM',
  },
  {
    id: 'AUD-003',
    action: 'Production Delay Reported',
    referenceId: 'PRD-2026-004',
    previousValue: 'Status: In Production',
    newValue: 'Status: Delayed (+8 days)',
    user: 'Ananya Roy',
    dateTime: '06 Sep 2026, 05:10 PM',
  },
  {
    id: 'AUD-004',
    action: 'Manual Physical Audit Adjustment',
    referenceId: 'INV-AUD-09',
    previousValue: 'Stock-in-Hand: 755',
    newValue: 'Stock-in-Hand: 740 (-15 damaged)',
    user: 'Manoj Pillai',
    dateTime: '06 Sep 2026, 04:50 PM',
  },
];

const initialIssues: WarehouseIssueItem[] = [
  {
    id: 'ISS-2026-001',
    relatedOrder: 'PRD-2026-004',
    type: 'Production Delay',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    supplierManufacturer: 'Himalayan Woolcrafts',
    issue: 'Dye lot variation and yarn re-spinning required after initial spool audit failed.',
    expectedDate: '01 Sep 2026',
    daysDelayed: 8,
    severity: 'Critical',
    assignedTo: 'Rahul Sharma',
    status: 'Investigating',
    createdAt: '01 Sep 2026',
    updatedAt: '08 Sep 2026',
  },
  {
    id: 'ISS-2026-002',
    relatedOrder: 'PRC-2026-092',
    type: 'Procurement Delay',
    product: 'YKK Antique Brass Metal Zippers',
    sku: 'TRM-ZIP-004',
    supplierManufacturer: 'TrimTech Fasteners Ltd',
    issue: 'Port customs clearance hold at Chennai seaport due to import tariff verification.',
    expectedDate: '04 Sep 2026',
    daysDelayed: 5,
    severity: 'High',
    assignedTo: 'Vikram Sethi',
    status: 'Open',
    createdAt: '04 Sep 2026',
    updatedAt: '08 Sep 2026',
  },
  {
    id: 'ISS-2026-003',
    relatedOrder: 'QC-2026-115',
    type: 'Quality Failure',
    product: 'Merino Wool Sweater',
    sku: 'SWT-MRN-005',
    supplierManufacturer: 'Himalayan Woolcrafts',
    issue: 'Severe pilling index failure. 120 units quarantined for factory de-pilling rework.',
    expectedDate: '03 Sep 2026',
    daysDelayed: 6,
    severity: 'Critical',
    assignedTo: 'Neha Kapoor',
    status: 'Investigating',
    createdAt: '03 Sep 2026',
    updatedAt: '07 Sep 2026',
  },
  {
    id: 'ISS-2026-004',
    relatedOrder: 'PRD-2026-002',
    type: 'Material Shortage',
    product: 'Organic Cotton T-Shirt',
    sku: 'TSH-ORG-001',
    supplierManufacturer: 'Sterling Garments Ltd',
    issue: 'Remaining 1,000m fabric roll batch in transit; knit line paused at cutting table.',
    expectedDate: '07 Sep 2026',
    daysDelayed: 2,
    severity: 'Medium',
    assignedTo: 'Vikram Sethi',
    status: 'Open',
    createdAt: '07 Sep 2026',
    updatedAt: '08 Sep 2026',
  },
  {
    id: 'ISS-2026-005',
    relatedOrder: 'MFG-002',
    type: 'Manufacturer Issue',
    product: 'Slim Fit Chino Trouser',
    sku: 'CHN-SLM-002',
    supplierManufacturer: 'Vanguard Textiles Corp',
    issue: 'Spinning machine breakdown on Line 3. Reduced output capacity by 35% for 48 hours.',
    expectedDate: '06 Sep 2026',
    daysDelayed: 3,
    severity: 'Medium',
    assignedTo: 'Ananya Roy',
    status: 'Resolved',
    createdAt: '06 Sep 2026',
    updatedAt: '08 Sep 2026',
  },
  {
    id: 'ISS-2026-006',
    relatedOrder: 'ORD-1052',
    type: 'Transportation Delay',
    product: 'Premium Silk Scarf',
    sku: 'SCF-SLK-007',
    supplierManufacturer: 'BlueDart Logistics',
    issue: 'Heavy rainfall route diversion along Western corridor delayed line-haul truck.',
    expectedDate: '08 Sep 2026',
    daysDelayed: 1,
    severity: 'Low',
    assignedTo: 'Manoj Pillai',
    status: 'Resolved',
    createdAt: '08 Sep 2026',
    updatedAt: '09 Sep 2026',
  },
];

const initialNotifications: WarehouseNotificationItem[] = [
  {
    id: 'NOTIF-001',
    title: 'Production Delay Warning',
    message: 'Production Order PRD-2026-004 (Merino Wool Sweater) is 8 days behind schedule.',
    type: 'prod_delayed',
    severity: 'critical',
    timestamp: '15m ago',
    read: false,
    orderId: 'PRD-2026-004',
    link: '/warehouse/delays-issues',
  },
  {
    id: 'NOTIF-002',
    title: 'Low Stock Alert',
    message: 'Merino Wool Sweater (SWT-MRN-005) available stock (160) dropped below reorder level (200).',
    type: 'low_stock',
    severity: 'warning',
    timestamp: '1h ago',
    read: false,
    orderId: 'SWT-MRN-005',
    link: '/warehouse/stock-in-hand',
  },
  {
    id: 'NOTIF-003',
    title: 'Quality Check Required',
    message: '12 inspection batches waiting for bay tolerance audit.',
    type: 'qc_waiting',
    severity: 'warning',
    timestamp: '3h ago',
    read: false,
    orderId: 'QC-2026-113',
    link: '/warehouse/quality-checks',
  },
  {
    id: 'NOTIF-004',
    title: 'Stock Received at Dock',
    message: 'PO-2026-089: 1,500m Organic Cotton Fabric received at Central Hub - BLR.',
    type: 'stock_received',
    severity: 'info',
    timestamp: '5h ago',
    read: true,
    orderId: 'PO-2026-089',
    link: '/warehouse/procurement',
  },
  {
    id: 'NOTIF-005',
    title: 'Orders Ready for Dispatch',
    message: '42 customer orders have passed all 6 gates and are ready for warehouse dispatch.',
    type: 'fulfilment_ready',
    severity: 'info',
    timestamp: '1d ago',
    read: true,
    orderId: 'ORD-1045',
    link: '/warehouse/fulfilment-readiness',
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
      issues: initialIssues,
      notifications: initialNotifications,
      stockMovements: initialStockMovements,
      auditLog: initialAuditLog,

      getOverviewMetrics: () => {
        const { stock, productionOrders, qualityChecks, procurements, fulfilments, alerts } = get();

        const totalStock = stock.reduce((acc, item) => acc + item.stockInHand, 0);
        const availableStock = stock.reduce((acc, item) => acc + item.available, 0);
        const reservedStock = stock.reduce((acc, item) => acc + item.reserved, 0);
        const incomingStock = stock.reduce((acc, item) => acc + item.incoming, 0);

        const underProduction = productionOrders
          .filter((p) => p.status === 'In Production' || p.status === 'Scheduled' || p.status === 'Material Pending')
          .reduce((acc, item) => acc + (item.quantity - item.completedQuantity), 0);

        const qcPending = qualityChecks
          .filter((q) => q.qcStatus === 'Pending' || q.qcStatus === 'In Inspection')
          .reduce((acc, item) => acc + item.quantityInspected, 0);

        const delayedOrders = procurements.filter((p) => p.status === 'Delayed').length +
          productionOrders.filter((p) => p.status === 'Delayed').length;

        const readyFulfilments = fulfilments.filter((f) => f.finalStatus === 'Ready for Fulfilment').length;
        const fulfilmentReadyPercent = fulfilments.length > 0
          ? Math.round((readyFulfilments / fulfilments.length) * 1000) / 10
          : 94.2;

        return {
          totalStock,
          availableStock,
          reservedStock,
          incomingStock,
          underProduction,
          qcPending,
          delayedOrders,
          fulfilmentReadyPercent,
        };
      },

      addProcurement: (data) => {
        const id = `PRC-2026-0${100 + get().procurements.length}`;
        const newProc: ProcurementItem = {
          ...data,
          id,
          quantityReceived: 0,
          status: 'Confirmed',
        };

        const newIncoming: IncomingStockItem = {
          id: `INC-2026-0${50 + get().incomingStock.length}`,
          referenceId: id,
          source: 'Purchase Order',
          supplierManufacturer: data.supplier,
          product: data.product,
          sku: data.sku,
          quantity: data.quantityOrdered,
          expectedArrival: data.expectedDeliveryDate,
          warehouse: data.destinationWarehouse,
          status: 'In Transit',
        };

        const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const audit: AuditLogEntry = {
          id: `AUD-0${get().auditLog.length + 1}`,
          action: 'Procurement Order Created',
          referenceId: id,
          previousValue: 'None',
          newValue: `${data.quantityOrdered} units of ${data.sku}`,
          user: data.procurementOwner || 'Admin',
          dateTime: now,
        };

        set((state) => ({
          procurements: [newProc, ...state.procurements],
          incomingStock: [newIncoming, ...state.incomingStock],
          auditLog: [audit, ...state.auditLog],
          stock: state.stock.map((s) =>
            s.sku === data.sku && s.warehouse === data.destinationWarehouse
              ? { ...s, incoming: s.incoming + data.quantityOrdered }
              : s
          ),
        }));
      },

      updateProcurementStatus: (id, status) => {
        const item = get().procurements.find((p) => p.id === id);
        if (!item) return;

        const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const audit: AuditLogEntry = {
          id: `AUD-0${get().auditLog.length + 1}`,
          action: 'Procurement Status Changed',
          referenceId: id,
          previousValue: item.status,
          newValue: status,
          user: 'Procurement Lead',
          dateTime: now,
        };

        // If marked delayed, add an alert
        let newAlerts = get().alerts;
        if (status === 'Delayed') {
          newAlerts = [
            {
              id: `ALT-0${newAlerts.length + 1}`,
              severity: 'warning',
              type: 'Procurement Delay',
              entityId: id,
              product: item.product,
              reason: `Expected on ${item.expectedDeliveryDate}. Supplier flagged dispatch delay.`,
              daysDelayed: 3,
              responsibleParty: item.supplier,
              createdTime: 'Just now',
              recommendedAction: 'Expedite Procurement',
              resolved: false,
            },
            ...newAlerts,
          ];
        }

        set((state) => ({
          procurements: state.procurements.map((p) => (p.id === id ? { ...p, status } : p)),
          auditLog: [audit, ...state.auditLog],
          alerts: newAlerts,
        }));
      },

      receiveProcurementStock: (id, qty) => {
        const item = get().procurements.find((p) => p.id === id);
        if (!item) return;

        const newReceived = Math.min(item.quantityOrdered, item.quantityReceived + qty);
        const status: ProcurementItem['status'] =
          newReceived >= item.quantityOrdered ? 'Received' : 'Partially Received';

        const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        // Update Stock-in-Hand & Available
        const updatedStock = get().stock.map((stk) => {
          if (stk.sku === item.sku && stk.warehouse === item.destinationWarehouse) {
            const newOnHand = stk.stockInHand + qty;
            const newAvailable = newOnHand - stk.reserved;
            const newIncoming = Math.max(0, stk.incoming - qty);
            let sStatus: StockItem['status'] = 'Healthy';
            if (newAvailable <= 0) sStatus = 'Out of Stock';
            else if (newAvailable < stk.reorderLevel / 2) sStatus = 'Critical';
            else if (newAvailable <= stk.reorderLevel) sStatus = 'Low Stock';

            return {
              ...stk,
              stockInHand: newOnHand,
              available: newAvailable,
              incoming: newIncoming,
              status: sStatus,
              lastUpdated: 'Just now',
            };
          }
          return stk;
        });

        // Audit & Movement
        const matchedItem = get().stock.find((s) => s.sku === item.sku && s.warehouse === item.destinationWarehouse);
        const prevOnHand = matchedItem ? matchedItem.stockInHand : 0;
        const movement: StockMovementItem = {
          id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          dateTime: now,
          product: item.product,
          sku: item.sku,
          warehouse: item.destinationWarehouse,
          movementType: 'Receipt',
          quantity: qty,
          qtyIn: qty,
          qtyOut: 0,
          previousStock: prevOnHand,
          newStock: prevOnHand + qty,
          referenceId: item.id,
          performedBy: 'Operations Admin',
        };

        const audit: AuditLogEntry = {
          id: `AUD-0${get().auditLog.length + 1}`,
          action: 'Stock Received via Procurement',
          referenceId: item.id,
          previousValue: `Received: ${item.quantityReceived}`,
          newValue: `Received: ${newReceived}`,
          user: 'Operations Admin',
          dateTime: now,
        };

        set((state) => ({
          procurements: state.procurements.map((p) =>
            p.id === id ? { ...p, quantityReceived: newReceived, status } : p
          ),
          stock: updatedStock,
          stockMovements: [movement, ...state.stockMovements],
          auditLog: [audit, ...state.auditLog],
        }));
      },

      receiveIncomingAtDock: (incomingId: string) => {
        const item = get().incomingStock.find((inc) => inc.id === incomingId);
        if (!item) return;

        const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const updatedIncoming = get().incomingStock.map((inc) =>
          inc.id === incomingId ? { ...inc, status: 'Dock Arrived' as const } : inc
        );

        const updatedStock = get().stock.map((stk) => {
          if (stk.sku === item.sku && stk.warehouse === item.warehouse) {
            const newOnHand = stk.stockInHand + item.quantity;
            const newAvailable = newOnHand - stk.reserved;
            const newIncoming = Math.max(0, stk.incoming - item.quantity);
            let sStatus: StockItem['status'] = 'Healthy';
            if (newAvailable <= 0) sStatus = 'Out of Stock';
            else if (newAvailable < stk.reorderLevel / 2) sStatus = 'Critical';
            else if (newAvailable <= stk.reorderLevel) sStatus = 'Low Stock';

            return {
              ...stk,
              stockInHand: newOnHand,
              available: newAvailable,
              incoming: newIncoming,
              status: sStatus,
              lastUpdated: 'Just now',
            };
          }
          return stk;
        });

        const matchedItem = get().stock.find((s) => s.sku === item.sku && s.warehouse === item.warehouse);
        const prevOnHand = matchedItem ? matchedItem.stockInHand : 0;
        const movement: StockMovementItem = {
          id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          dateTime: now,
          product: item.product,
          sku: item.sku,
          warehouse: item.warehouse,
          movementType: 'Receipt',
          quantity: item.quantity,
          qtyIn: item.quantity,
          qtyOut: 0,
          previousStock: prevOnHand,
          newStock: prevOnHand + item.quantity,
          referenceId: item.referenceId,
          performedBy: 'Dock Receiving Supervisor',
        };

        const audit: AuditLogEntry = {
          id: `AUD-0${get().auditLog.length + 1}`,
          action: 'Dock Shipment Received',
          referenceId: item.referenceId,
          previousValue: 'Status: In Transit',
          newValue: `Received ${item.quantity} units at ${item.warehouse}`,
          user: 'Dock Receiving Supervisor',
          dateTime: now,
        };

        set((state) => ({
          incomingStock: updatedIncoming,
          stock: updatedStock,
          stockMovements: [movement, ...state.stockMovements],
          auditLog: [audit, ...state.auditLog],
        }));
      },

      addManufacturer: (data) => {
        const id = `MFG-00${get().manufacturers.length + 1}`;
        set((state) => ({
          manufacturers: [
            ...state.manufacturers,
            {
              ...data,
              id,
              activeProductionOrders: 0,
              completedOrdersCount: 0,
              delayedOrdersCount: 0,
            },
          ],
        }));
      },

      addProductionOrder: (data) => {
        const id = `PRD-2026-00${get().productionOrders.length + 1}`;
        const newOrder: ProductionOrderItem = {
          ...data,
          id,
          completedQuantity: 0,
          qcPassed: 0,
          progress: 0,
          status: 'Scheduled',
        };

        const trackingId = `TRK-00${get().productionTracking.length + 1}`;
        const newTracking: ProductionTrackingItem = {
          id: trackingId,
          orderId: id,
          product: data.product,
          manufacturer: data.manufacturer,
          orderedQty: data.quantity,
          completedQty: 0,
          progress: 0,
          currentStage: 'Scheduled',
          startDate: data.plannedStartDate,
          expectedCompletion: data.plannedCompletionDate,
          delayDays: 0,
          status: 'Production run scheduled with factory',
          stages: [
            { name: 'Scheduled', completed: true, date: data.plannedStartDate },
            { name: 'Materials Allocated', completed: false, current: true, date: 'Pending' },
            { name: 'Production Started', completed: false, date: 'Pending' },
            { name: 'In Production', completed: false, date: 'Pending' },
            { name: 'Production Completed', completed: false, date: data.plannedCompletionDate },
            { name: 'Quality Check', completed: false, date: 'Awaiting Run' },
            { name: 'Ready for Stock-In', completed: false, date: 'Final Step' },
          ],
        };

        const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const audit: AuditLogEntry = {
          id: `AUD-0${get().auditLog.length + 1}`,
          action: 'Production Order Scheduled',
          referenceId: id,
          previousValue: 'None',
          newValue: `${data.quantity} units assigned to ${data.manufacturer}`,
          user: data.assignedManager || 'Production Lead',
          dateTime: now,
        };

        set((state) => ({
          productionOrders: [newOrder, ...state.productionOrders],
          productionTracking: [newTracking, ...state.productionTracking],
          auditLog: [audit, ...state.auditLog],
        }));
      },

      updateProductionStage: (orderId, stage, completedQty) => {
        set((state) => {
          const order = state.productionOrders.find((p) => p.id === orderId);
          if (!order) return state;

          const newCompleted = completedQty !== undefined ? completedQty : order.completedQuantity;
          const progress = Math.round((newCompleted / order.quantity) * 100);

          let pStatus = order.status;
          if (stage === 'Ready for Stock-In' || stage === 'Production Completed') {
            pStatus = 'QC Pending';
          } else if (stage === 'In Production' || stage === 'Production Started') {
            pStatus = 'In Production';
          }

          // If stage moved to QC Pending, auto-generate QC record if none exists
          let newQCs = state.qualityChecks;
          if (stage === 'Quality Check' || stage === 'Production Completed') {
            if (!newQCs.some((q) => q.productionOrder === orderId)) {
              newQCs = [
                {
                  id: `QC-2026-${120 + newQCs.length}`,
                  productionOrder: orderId,
                  product: order.product,
                  sku: order.sku,
                  manufacturer: order.manufacturer,
                  batchNumber: `BATCH-26-${Math.floor(10 + Math.random() * 90)}`,
                  quantityInspected: order.quantity,
                  passedQuantity: 0,
                  failedQuantity: 0,
                  inspectionDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                  inspector: 'Assigned Inspector',
                  defectType: 'None',
                  defectNotes: 'Awaiting bay inspection',
                  qcStatus: 'Pending',
                },
                ...newQCs,
              ];
            }
          }

          const updatedTracking = state.productionTracking.map((trk) => {
            if (trk.orderId === orderId) {
              const stages = trk.stages.map((stg) => {
                if (stg.name === stage) {
                  return { ...stg, completed: false, current: true };
                }
                return stg;
              });
              return {
                ...trk,
                currentStage: stage,
                completedQty: newCompleted,
                progress,
                stages,
              };
            }
            return trk;
          });

          return {
            productionOrders: state.productionOrders.map((p) =>
              p.id === orderId ? { ...p, completedQuantity: newCompleted, progress, status: pStatus } : p
            ),
            productionTracking: updatedTracking,
            qualityChecks: newQCs,
          };
        });
      },

      recordQualityCheck: ({
        qcId,
        passedQuantity,
        failedQuantity,
        inspector,
        defectType,
        defectNotes,
        defectDescription,
        checkpoints,
        images,
      }) => {
        set((state) => {
          const qc = state.qualityChecks.find((q) => q.id === qcId);
          if (!qc) return state;

          let qcStatus: QualityCheckItem['qcStatus'] = 'Passed';
          if (passedQuantity === 0 && failedQuantity > 0) qcStatus = 'Failed';
          else if (failedQuantity > 0) qcStatus = 'Partially Passed';

          const now = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          const todayDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          // STRICT RULE: ONLY QC-approved quantity moves toward available stock!
          // Failed quantity is never added to stock!
          let updatedStock = state.stock;
          let newMovements = [...state.stockMovements];

          if (passedQuantity > 0) {
            updatedStock = state.stock.map((stk) => {
              if (stk.sku === qc.sku || stk.product.toLowerCase().includes(qc.product.toLowerCase())) {
                const newOnHand = stk.stockInHand + passedQuantity;
                const newAvailable = newOnHand - stk.reserved;
                return {
                  ...stk,
                  stockInHand: newOnHand,
                  available: newAvailable,
                  lastUpdated: 'Just now',
                };
              }
              return stk;
            });

            const matched = state.stock.find((s) => s.sku === qc.sku || s.product.toLowerCase().includes(qc.product.toLowerCase()));
            const prevStock = matched ? matched.stockInHand : 0;
            newMovements.unshift({
              id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              dateTime: now,
              product: qc.product,
              sku: qc.sku,
              warehouse: matched?.warehouse || 'Central Hub - BLR',
              movementType: 'Receipt',
              quantity: passedQuantity,
              qtyIn: passedQuantity,
              qtyOut: 0,
              previousStock: prevStock,
              newStock: prevStock + passedQuantity,
              referenceId: qcId,
              performedBy: inspector || 'QC Inspector',
            });
          }

          // If failed quantity > 0, generate QC alert & create automatic Issue
          let newAlerts = state.alerts;
          let newIssues = state.issues || [];
          let newNotifications = state.notifications || [];

          if (failedQuantity > 0 || (defectType && defectType !== 'None')) {
            newAlerts = [
              {
                id: `ALT-0${newAlerts.length + 1}`,
                severity: failedQuantity > 50 ? 'critical' : 'warning',
                type: 'QC Failure',
                entityId: qcId,
                product: qc.product,
                reason: `${failedQuantity} units failed inspection. Defect: ${defectType || 'Quality rejection'}.`,
                daysDelayed: 1,
                responsibleParty: qc.manufacturer,
                createdTime: 'Just now',
                recommendedAction: 'Inspect QC Report',
                resolved: false,
              },
              ...newAlerts,
            ];

            const issueItem: WarehouseIssueItem = {
              id: `ISS-2026-${Math.floor(100 + Math.random() * 900)}`,
              relatedOrder: qc.productionOrder,
              type: 'Quality Failure',
              product: qc.product,
              sku: qc.sku,
              supplierManufacturer: qc.manufacturer,
              issue: `QC inspection failed for batch ${qc.batchNumber}: ${defectDescription || defectNotes || defectType || 'Tolerance standard not met'}`,
              expectedDate: todayDate,
              daysDelayed: 1,
              severity: failedQuantity > 50 ? 'Critical' : 'High',
              assignedTo: inspector || 'Senior QC Inspector',
              status: 'Open',
              notes: defectDescription || defectNotes,
              createdAt: todayDate,
              updatedAt: todayDate,
            };
            newIssues = [issueItem, ...newIssues];

            newNotifications = [
              {
                id: `NOTIF-${Date.now()}`,
                title: 'Quality Check Failed',
                message: `Batch ${qc.batchNumber} (${qc.product}) failed inspection with ${failedQuantity} rejected units.`,
                type: 'qc_failed',
                severity: 'critical',
                timestamp: 'Just now',
                read: false,
                orderId: qc.productionOrder,
                link: '/warehouse/quality-checks',
              },
              ...newNotifications,
            ];
          } else if (passedQuantity > 0) {
            newNotifications = [
              {
                id: `NOTIF-${Date.now()}`,
                title: 'QC Passed & Stock Credited',
                message: `${passedQuantity} approved units of ${qc.product} credited to stock-in-hand.`,
                type: 'stock_received',
                severity: 'info',
                timestamp: 'Just now',
                read: false,
                orderId: qc.productionOrder,
                link: '/warehouse/stock-in-hand',
              },
              ...newNotifications,
            ];
          }

          // Recalculate Fulfilment Readiness for any orders waiting on this SKU!
          const updatedFulfilments = state.fulfilments.map((flf) => {
            if (flf.sku === qc.sku || flf.product.toLowerCase().includes(qc.product.toLowerCase())) {
              const newConditions = {
                ...flf.conditions,
                productionCompleted: true,
                qcPassed: true,
                stockAvailable: true,
              };
              const { percent, finalStatus } = calculateFulfilmentReadiness(newConditions);
              return {
                ...flf,
                conditions: newConditions,
                readinessPercent: percent,
                finalStatus,
              };
            }
            return flf;
          });

          const audit: AuditLogEntry = {
            id: `AUD-0${state.auditLog.length + 1}`,
            action: 'Quality Check Completed',
            referenceId: qcId,
            previousValue: 'Status: Pending',
            newValue: `Passed: ${passedQuantity}, Failed: ${failedQuantity} (${qcStatus})`,
            user: inspector || 'QC Inspector',
            dateTime: now,
          };

          return {
            qualityChecks: state.qualityChecks.map((q) =>
              q.id === qcId
                ? {
                    ...q,
                    passedQuantity,
                    failedQuantity,
                    inspector,
                    defectType: defectType || q.defectType,
                    defectNotes: defectNotes || q.defectNotes,
                    defectDescription: defectDescription || q.defectDescription,
                    checkpoints: checkpoints || q.checkpoints,
                    images: images || q.images,
                    qcStatus,
                  }
                : q
            ),
            stock: updatedStock,
            stockMovements: newMovements,
            alerts: newAlerts,
            issues: newIssues,
            notifications: newNotifications,
            fulfilments: updatedFulfilments,
            auditLog: [audit, ...state.auditLog],
          };
        });
      },

      adjustStock: (stockId, newStockInHand, reason) => {
        set((state) => {
          const item = state.stock.find((s) => s.id === stockId);
          if (!item) return state;

          const prevOnHand = item.stockInHand;
          const diff = newStockInHand - prevOnHand;
          const newAvailable = Math.max(0, newStockInHand - item.reserved);

          let status: StockItem['status'] = 'Healthy';
          if (newAvailable <= 0) status = 'Out of Stock';
          else if (newAvailable < item.reorderLevel / 2) status = 'Critical';
          else if (newAvailable <= item.reorderLevel) status = 'Low Stock';

          const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: now,
            product: item.product,
            sku: item.sku,
            warehouse: item.warehouse,
            movementType: 'Adjustment',
            quantity: Math.abs(diff),
            qtyIn: diff > 0 ? diff : 0,
            qtyOut: diff < 0 ? Math.abs(diff) : 0,
            previousStock: prevOnHand,
            newStock: newStockInHand,
            referenceId: reason || 'Manual Physical Inventory Count',
            performedBy: 'Warehouse Manager',
          };

          const audit: AuditLogEntry = {
            id: `AUD-0${state.auditLog.length + 1}`,
            action: 'Manual Stock Adjustment',
            referenceId: item.sku,
            previousValue: `Stock-in-Hand: ${prevOnHand}`,
            newValue: `Stock-in-Hand: ${newStockInHand} (${reason})`,
            user: 'Warehouse Manager',
            dateTime: now,
          };

          return {
            stock: state.stock.map((s) =>
              s.id === stockId
                ? {
                    ...s,
                    stockInHand: newStockInHand,
                    available: newAvailable,
                    status,
                    lastUpdated: 'Just now',
                  }
                : s
            ),
            stockMovements: [movement, ...state.stockMovements],
            auditLog: [audit, ...state.auditLog],
          };
        });
      },

      releaseReservation: (resId) => {
        set((state) => {
          const res = state.reservations.find((r) => r.id === resId);
          if (!res) return state;

          const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          const updatedStock = state.stock.map((stk) => {
            if (stk.sku === res.sku && stk.warehouse === res.warehouse) {
              const newReserved = Math.max(0, stk.reserved - res.reservedQty);
              const newAvailable = stk.stockInHand - newReserved;
              return {
                ...stk,
                reserved: newReserved,
                available: newAvailable,
                lastUpdated: 'Just now',
              };
            }
            return stk;
          });

          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: now,
            product: res.product,
            sku: res.sku,
            warehouse: res.warehouse,
            movementType: 'Reservation Release',
            quantity: res.reservedQty,
            qtyIn: res.reservedQty,
            qtyOut: 0,
            previousStock: res.available,
            newStock: res.available + res.reservedQty,
            referenceId: res.orderId,
            performedBy: 'Order Allocator',
          };

          return {
            reservations: state.reservations.map((r) =>
              r.id === resId ? { ...r, status: 'Released', reservedQty: 0 } : r
            ),
            stock: updatedStock,
            stockMovements: [movement, ...state.stockMovements],
          };
        });
      },

      allocateReservation: (orderId, sku, qty) => {
        set((state) => {
          const stkItem = state.stock.find((s) => s.sku === sku);
          if (!stkItem || stkItem.available < qty) return state;

          const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          const newReserved = stkItem.reserved + qty;
          const newAvailable = stkItem.stockInHand - newReserved;

          const newRes: ReservationItem = {
            id: `RES-00${state.reservations.length + 1}`,
            orderId,
            customer: 'Direct Wholesale Allocation',
            channel: 'Website',
            product: stkItem.product,
            sku,
            warehouse: stkItem.warehouse,
            requiredQty: qty,
            reservedQty: qty,
            available: newAvailable,
            status: 'Allocated',
          };

          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: now,
            product: stkItem.product,
            sku,
            warehouse: stkItem.warehouse,
            movementType: 'Reservation',
            quantity: qty,
            qtyIn: 0,
            qtyOut: qty,
            previousStock: stkItem.available,
            newStock: newAvailable,
            referenceId: orderId,
            performedBy: 'Order Allocator',
          };

          return {
            reservations: [newRes, ...state.reservations],
            stock: state.stock.map((s) =>
              s.id === stkItem.id ? { ...s, reserved: newReserved, available: newAvailable } : s
            ),
            stockMovements: [movement, ...state.stockMovements],
          };
        });
      },

      addTransfer: (data) => {
        const id = `TRF-2026-0${40 + get().transfers.length}`;
        const newTransfer: TransferItem = {
          ...data,
          id,
          transferDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'In Transit',
        };

        const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        // Deduct from source warehouse
        const updatedStock = get().stock.map((stk) => {
          if (stk.sku === data.sku && stk.warehouse === data.fromWarehouse) {
            const newOnHand = Math.max(0, stk.stockInHand - data.quantity);
            return {
              ...stk,
              stockInHand: newOnHand,
              available: Math.max(0, newOnHand - stk.reserved),
              lastUpdated: 'Just now',
            };
          }
          return stk;
        });

        const movement: StockMovementItem = {
          id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          dateTime: now,
          product: data.product,
          sku: data.sku,
          warehouse: data.fromWarehouse,
          movementType: 'Transfer Out',
          quantity: data.quantity,
          qtyIn: 0,
          qtyOut: data.quantity,
          previousStock: 0,
          newStock: 0,
          referenceId: id,
          performedBy: 'Logistics Lead',
        };

        set((state) => ({
          transfers: [newTransfer, ...state.transfers],
          stock: updatedStock,
          stockMovements: [movement, ...state.stockMovements],
        }));
      },

      receiveTransfer: (transferId) => {
        set((state) => {
          const trf = state.transfers.find((t) => t.id === transferId);
          if (!trf) return state;

          const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          // Add to destination warehouse
          const updatedStock = state.stock.map((stk) => {
            if (stk.sku === trf.sku && stk.warehouse === trf.toWarehouse) {
              const newOnHand = stk.stockInHand + trf.quantity;
              return {
                ...stk,
                stockInHand: newOnHand,
                available: newOnHand - stk.reserved,
                lastUpdated: 'Just now',
              };
            }
            return stk;
          });

          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: now,
            product: trf.product,
            sku: trf.sku,
            warehouse: trf.toWarehouse,
            movementType: 'Transfer In',
            quantity: trf.quantity,
            qtyIn: trf.quantity,
            qtyOut: 0,
            previousStock: 0,
            newStock: trf.quantity,
            referenceId: trf.id,
            performedBy: 'Inbound Dock',
          };

          return {
            transfers: state.transfers.map((t) => (t.id === transferId ? { ...t, status: 'Received' } : t)),
            stock: updatedStock,
            stockMovements: [movement, ...state.stockMovements],
          };
        });
      },

      dispatchFulfilmentOrder: (fulfilmentId) => {
        set((state) => {
          const flf = state.fulfilments.find((f) => f.id === fulfilmentId);
          if (!flf) return state;

          const now = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          // Deduct from stock
          const updatedStock = state.stock.map((stk) => {
            if ((stk.sku === flf.sku || stk.product.toLowerCase().includes(flf.product.toLowerCase())) && stk.warehouse === flf.warehouse) {
              const newOnHand = Math.max(0, stk.stockInHand - flf.requiredQty);
              const newReserved = Math.max(0, stk.reserved - flf.reservedQty);
              return {
                ...stk,
                stockInHand: newOnHand,
                reserved: newReserved,
                available: Math.max(0, newOnHand - newReserved),
                lastUpdated: 'Just now',
              };
            }
            return stk;
          });

          const movement: StockMovementItem = {
            id: `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            dateTime: now,
            product: flf.product,
            sku: flf.sku,
            warehouse: flf.warehouse,
            movementType: 'Dispatch',
            quantity: flf.requiredQty,
            qtyIn: 0,
            qtyOut: flf.requiredQty,
            previousStock: 0,
            newStock: 0,
            referenceId: flf.orderId,
            performedBy: 'Fulfillment Dispatch Lead',
          };

          const audit: AuditLogEntry = {
            id: `AUD-0${state.auditLog.length + 1}`,
            action: 'Order Fulfilled & Dispatched',
            referenceId: flf.orderId,
            previousValue: 'Status: Ready for Fulfilment',
            newValue: 'Status: Dispatched',
            user: 'Fulfillment Lead',
            dateTime: now,
          };

          return {
            fulfilments: state.fulfilments.map((f) =>
              f.id === fulfilmentId ? { ...f, finalStatus: 'Dispatched', expectedDispatch: 'Dispatched' } : f
            ),
            stock: updatedStock,
            stockMovements: [movement, ...state.stockMovements],
            auditLog: [audit, ...state.auditLog],
          };
        });
      },

      resolveAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
        }));
      },

      addIssue: (data) => {
        const now = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        const newIssue: WarehouseIssueItem = {
          ...data,
          id: `ISS-2026-${Math.floor(100 + Math.random() * 900)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          issues: [newIssue, ...(state.issues || [])],
        }));
      },

      updateIssueStatus: (id, status, notes) => {
        const now = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        set((state) => ({
          issues: (state.issues || []).map((issue) =>
            issue.id === id
              ? {
                  ...issue,
                  status,
                  notes: notes || issue.notes,
                  updatedAt: now,
                }
              : issue
          ),
        }));
      },

      assignIssue: (id, assignedTo) => {
        const now = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        set((state) => ({
          issues: (state.issues || []).map((issue) =>
            issue.id === id ? { ...issue, assignedTo, updatedAt: now } : issue
          ),
        }));
      },

      addNotification: (data) => {
        const newNotif: WarehouseNotificationItem = {
          ...data,
          id: `NOTIF-${Date.now()}`,
          timestamp: 'Just now',
          read: false,
        };
        set((state) => ({
          notifications: [newNotif, ...(state.notifications || [])],
        }));
      },

      dismissNotification: (id) => {
        set((state) => ({
          notifications: (state.notifications || []).filter((n) => n.id !== id),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: (state.notifications || []).map((n) => ({ ...n, read: true })),
        }));
      },

      addAuditEntry: (entry) => {
        const now = new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const newEntry: AuditLogEntry = {
          ...entry,
          id: `AUD-0${get().auditLog.length + 1}`,
          dateTime: now,
        };
        set((state) => ({
          auditLog: [newEntry, ...state.auditLog],
        }));
      },
    }),
    {
      name: 'jodo-warehouse-store',
      migrate: (persistedState: any) => {
        if (persistedState) {
          if (!Array.isArray(persistedState.issues) || persistedState.issues.length === 0) {
            persistedState.issues = initialIssues;
          }
          if (!Array.isArray(persistedState.notifications) || persistedState.notifications.length === 0) {
            persistedState.notifications = initialNotifications;
          }
          if (Array.isArray(persistedState.qualityChecks)) {
            persistedState.qualityChecks = persistedState.qualityChecks.map((qc: any) => ({
              ...qc,
              passedQuantity: qc.passedQuantity ?? 0,
              failedQuantity: qc.failedQuantity ?? 0,
            }));
          }
        }
        return persistedState;
      },
    }
  )
);
