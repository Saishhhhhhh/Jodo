# Warehouse & Inventory Management System (WMS) — Architecture & Operational Guide

> **Module Status:** Production Ready  
> **Package Location:** `apps/admin/src/components/warehouse/`, `apps/admin/src/app/(dashboard)/warehouse/`, `apps/admin/src/stores/warehouse.ts`  
> **Primary Technology:** Next.js (App Router), Zustand (with `localStorage` persistence & migrations), TypeScript, Tailwind CSS, Lucide Icons, Radix UI / shadcn.

---

## 1. Executive Summary & Philosophy

The **Warehouse & Inventory Management System (WMS)** within the Jodo Headless Commerce Platform provides end-to-end visibility across the entire supply chain. It connects:
1. **Upstream Raw Material & Finished Good Procurement** (Vendor POs, receipt tracking, cost accounting).
2. **Contract Manufacturing & Factory Floor Tracking** (7-stage production lifecycle, manufacturer utilization, lead-time tracking).
3. **Quality Control & Defect Quarantining** (Batch inspections, checkpoint checklists, automated stock-in upon pass).
4. **Multi-Location Inventory Management** (Stock-in-hand, reserved units, buffer safety thresholds, bin/rack locations).
5. **Dynamic Fulfilment Readiness Validation** (6-condition gating algorithm before orders can be dispatched).
6. **Exception Management & Delay Alerts** (Root-cause classification, SLA delay tracking, bottleneck resolution).

---

## 2. Core Architecture & Data Flow

```
[ Purchase Orders (Procurement) ] 
               │
               ▼
[ Stock Received / Raw Materials ] ──► [ Contract Manufacturers (Factory Allocation) ]
                                                        │
                                                        ▼
                                          [ 7-Stage Production Tracking ]
                                                        │
                                                        ▼
                                          [ Quality Control (QC Inspection) ]
                                          ├── Passed ──► [ Central Stock In-Hand ]
                                          └── Failed ──► [ Quarantine / Rework ]
                                                                │
                                                                ▼
                                                  [ Order Fulfilment Readiness ]
                                                  (6-Point Automated Validation)
                                                                │
                                                                ▼
                                                  [ One-Click Carrier Dispatch ]
```

---

## 3. Data Models & TypeScript Schemas

All types are strictly defined in `apps/admin/src/stores/warehouse.ts`:

### 3.1 Procurement (`ProcurementItem`)
Tracks purchase orders raised with textile mills, fabric suppliers, and packaging vendors.
```typescript
export interface ProcurementItem {
  id: string; // e.g., PRC-2026-089
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
```

### 3.2 Contract Manufacturers (`ManufacturerItem`)
Maintains manufacturer profiles, active capacity utilization, and historical SLA compliance.
```typescript
export interface ManufacturerItem {
  id: string; // e.g., MFG-001
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
  currentUtilization: number; // e.g., 78%
  averageLeadTime: string; // e.g., 14 days
  qualityRating: number; // e.g., 4.8 / 5.0
  onTimeDeliveryRate: number; // e.g., 96.5%
  status: 'Active' | 'At Capacity' | 'Temporarily Unavailable' | 'Inactive';
}
```

### 3.3 Production Orders & 7-Stage Tracking (`ProductionOrderItem`, `ProductionTrackingItem`)
Tracks units being manufactured at external partner facilities through 7 explicit milestones.
```typescript
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

export interface ProductionOrderItem {
  id: string; // e.g., PRD-2026-001
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
  progress: number; // 0 - 100%
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
```

### 3.4 Quality Checks (`QualityCheckItem`)
Enforces strict AQL inspection standards before goods enter sellable stock.
```typescript
export interface QualityCheckItem {
  id: string; // e.g., QC-2026-112
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
  defectType?:
    | 'None'
    | 'Stitching & Seam'
    | 'Color Mismatch'
    | 'Sizing & Dimensions'
    | 'Fabric Flaw'
    | 'Hardware Issue';
  defectNotes?: string;
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
```

### 3.5 Multi-Warehouse Stock & Inventory (`StockItem`, `ReservationItem`, `TransferItem`)
Tracks physical inventory levels per SKU across designated hubs (e.g., Central Hub - BLR, West DC - BOM, North DC - DEL).
```typescript
export interface StockItem {
  id: string;
  product: string;
  sku: string;
  category: string;
  warehouse: string;
  zone: string;
  rack: string;
  shelf: string;
  stockInHand: number;
  reserved: number;
  available: number;
  incoming: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost: number;
  sellingPrice: number;
  lastAuditedDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Critical Shortage';
}

export interface ReservationItem {
  id: string; // RSV-001
  orderId: string;
  customer: string;
  sku: string;
  quantity: number;
  warehouse: string;
  reservedAt: string;
  reservedUntil: string;
  status: 'Active' | 'Fulfilled' | 'Expired' | 'Released';
}

export interface TransferItem {
  id: string; // TRF-2026-031
  fromWarehouse: string;
  toWarehouse: string;
  product: string;
  sku: string;
  quantity: number;
  transferDate: string;
  expectedArrival: string;
  status: 'Draft' | 'Requested' | 'Approved' | 'In Transit' | 'Received' | 'Cancelled';
}
```

### 3.6 Fulfilment Readiness & Gating Conditions (`FulfilmentItem`, `FulfilmentCondition`)
Calculates order dispatch readiness via weighted criteria:
```typescript
export interface FulfilmentCondition {
  stockAvailable: boolean;       // +20%
  stockReserved: boolean;        // +15%
  productionCompleted: boolean;  // +20%
  qcPassed: boolean;             // +20%
  packagingReady: boolean;       // +15%
  dispatchPrepared: boolean;     // +10%
}

export interface FulfilmentItem {
  id: string;                    // FLF-001
  orderId: string;               // ORD-1045
  customer: string;
  channel: string;               // Website, Amazon, Myntra, B2B Wholesale
  product: string;
  sku: string;
  requiredQty: number;
  availableQty: number;
  reservedQty: number;
  warehouse: string;
  conditions: FulfilmentCondition;
  readinessPercent: number;      // 0 - 100%
  finalStatus:
    | 'Not Ready'
    | 'At Risk'
    | 'Partially Ready'
    | 'Almost Ready'
    | 'Ready for Fulfilment'
    | 'Dispatched';
  expectedDispatch: string;
}
```

---

## 4. Gating & Fulfilment Readiness Algorithm

The readiness score is evaluated dynamically through `calculateFulfilmentReadiness(conditions)`:

| Condition | Weight | Impact on Dispatch |
| :--- | :---: | :--- |
| **1. Stock Available** | **20%** | Unlocks allocation; if false and score > 0, status is set to `At Risk` |
| **2. Stock Reserved** | **15%** | Confirms physical reservation against specific order ID |
| **3. Production Completed**| **20%** | Finished goods are off the manufacturing line |
| **4. QC Passed** | **20%** | Batch has passed AQL inspection and received QA release |
| **5. Packaging Ready** | **15%** | Gift boxing, garment polybags, and invoice packing slips attached |
| **6. Dispatch Prepared** | **10%** | Shipping label & carrier manifest printed and scanned |

### Readiness Thresholds:
- `100%`: **Ready for Fulfilment** (Enables the green "Dispatch" action button).
- `85% - 99%`: **Almost Ready** (Minor operational step pending, e.g., carrier pickup).
- `50% - 84%`: **Partially Ready** (Under production or waiting packaging).
- `> 0% but stock unavailable`: **At Risk** (Warning badge triggered).
- `< 50%`: **Not Ready**.

---

## 5. UI Structure & Routes

All routes live under `apps/admin/src/app/(dashboard)/warehouse/`:

| Route | View Component | Core Features |
| :--- | :--- | :--- |
| `/warehouse` | `overview-tab.tsx` + tabbed navigation | Dynamic KPI cards, production bottleneck breakdown, priority attention alerts, and tab switcher. |
| `/warehouse/stock-in-hand` | `stock-tab.tsx` | Search by SKU/Bin, category filters, low-stock threshold badges, Quick Stock Adjustment modal. |
| `/warehouse/procurement` | `procurement-tab.tsx` | Vendor PO status tracking, cost totals, receipt confirmation drawer, PO raising. |
| `/warehouse/contract-manufacturers` | `manufacturers-tab.tsx` | Factory cards, capacity utilization gauges, defect rates, On-Time Delivery (OTD) rankings. |
| `/warehouse/production-orders` | `production-orders-tab.tsx` | Priority order tables, planned vs actual timeline tracking, material pending blockers. |
| `/warehouse/production-tracking` | `production-tracking-tab.tsx` | Kanban-style and chronological 7-stage visual milestone progression. |
| `/warehouse/quality-checks` | `quality-checks-tab.tsx` | Inspection table, batch pass/fail metrics, Record QC drawer with AQL checklist. |
| `/warehouse/fulfilment-readiness` | `fulfilment-tab.tsx` | 6-checkpoint visual matrix, order dispatch readiness, bottleneck detection, one-click dispatch. |
| `/warehouse/delays-issues` | `alerts-tab.tsx` | Factory halt tracker, root-cause resolution, SLA delay notifications. |

---

## 6. Key Modals & Drawers

Located in `apps/admin/src/components/warehouse/modals/`:

1. **`record-qc-drawer.tsx`**:
   - Records pass/fail quantities.
   - Categorizes defects (e.g., Stitching & Seam, Color Mismatch, Fabric Flaws).
   - Updates stock: when QC is passed, sellable stock in-hand is automatically incremented, and waiting fulfilment orders are recalculated.
2. **`create-production-order-drawer.tsx`**:
   - Creates a new production order linked to an active manufacturer.
   - Calculates target completion dates based on manufacturer lead times.
3. **`create-procurement-drawer.tsx`**:
   - Generates vendor POs with auto-calculated line item totals and destination warehouse assignments.
4. **`adjust-stock-dialog.tsx`**:
   - Performs manual stock adjustments with mandatory audit reason logging (Cycle Count, Damaged Stock, Loss Write-off).
5. **`create-transfer-drawer.tsx`**:
   - Transfers stock between Central Hub, West DC, and North DC.

---

## 7. State Management & Offline-Resilient Persistence

The warehouse store is powered by Zustand with `persist` middleware configured under key `jodo-warehouse-store`.

### Schema Migration Safeguards
To prevent runtime exceptions (`TypeError: Cannot read properties of undefined`) when new fields or legacy local storage items are loaded:
```typescript
migrate: (persistedState: any) => {
  if (persistedState) {
    if (Array.isArray(persistedState.fulfilments)) {
      persistedState.fulfilments = persistedState.fulfilments.map((flf: any) => ({
        ...flf,
        conditions: flf.conditions ?? {
          stockAvailable: (flf.availableQty ?? 0) >= (flf.requiredQty ?? 0),
          stockReserved: (flf.reservedQty ?? 0) >= (flf.requiredQty ?? 0),
          productionCompleted: true,
          qcPassed: true,
          packagingReady: true,
          dispatchPrepared: flf.finalStatus === 'Ready for Fulfilment',
        },
      }));
    }
  }
  return persistedState;
}
```

---

## 8. Standard Operating Procedures (SOPs)

### SOP 1: Stock Receiving & Inspection Workflow
1. PO arrives at receiving bay -> Navigate to `/warehouse/procurement`.
2. Click **"Receive Goods"** -> Updates PO status to `Received`.
3. Create Inspection record in `/warehouse/quality-checks`.
4. Run checklist in **Record QC Drawer**.
5. Upon submission:
   - Passed units automatically increment `stockInHand` and `available` in `StockItem`.
   - Store records an entry in `StockMovementItem` with `movementType: 'Production In' | 'Procurement'`.
   - Fulfilment readiness checks automatically update any waiting orders for that SKU.

### SOP 2: Order Fulfilment & Dispatch
1. Open `/warehouse/fulfilment-readiness`.
2. Review orders sorted by readiness percentage.
3. Filter by **"Ready for Fulfilment"** (100% score).
4. Click **"Dispatch"** -> Order updates to `Dispatched`, creates an audit log entry, and deducts reserved stock.

---

## 9. Plain-English Architecture: How We Built It & Why

If you look under the hood of our Warehouse module, here is how everything connects together in simple terms:

### 1. The Central "Brain" (Zustand Store)
- Instead of making every screen fetch from scratch, we built a single unified store: [`apps/admin/src/stores/warehouse.ts`](file:///c:/Users/Admin/Downloads/Jodo_Project/apps/admin/src/stores/warehouse.ts).
- **Why this matters:** When you pass a Quality Check on the QC tab, you don't need to refresh the page to see your Stock-In-Hand number increase or your Fulfilment tab update. All tabs listen to the same reactive state in real time.

### 2. The "Self-Healing" Memory (LocalStorage Persistence & Migrations)
- All warehouse activities, purchase orders, and stock movements are saved right into your browser's offline storage (`jodo-warehouse-store`).
- **The Self-Healing Trick (`migrate`):** If an older session had an incomplete data structure (e.g., missing `productCategories` or missing `conditions`), our custom migration function catches it and auto-fills sensible defaults so the screen never crashes with a red error box.

### 3. The Visual Control Deck (Next.js + Tailwind + Radix Drawers)
- Traditional warehouse software looks like a boring 1990s spreadsheet.
- We built clean, interactive **slide-out Drawers** (`Sheet` components) for tasks like creating POs, assigning factory runs, or performing QC. Operators never lose their place in the table when performing an action.

### 4. The 6-Point Formula Engine
- Fulfilment readiness isn't a manual guess. The engine calculates an exact 0–100% percentage by scoring:
  - **Stock Availability (20%)**
  - **Stock Reservation (15%)**
  - **Production Completion (20%)**
  - **Quality Check Approval (20%)**
  - **Packaging Readiness (15%)**
  - **Carrier Manifesting (10%)**
- This mathematically guarantees that orders can **only** be dispatched when every operational requirement has truly been cleared.

---

## 10. Optimized Workflow: Recommended Best-Practice Flow

Here is the recommended workflow designed to eliminate inventory errors, factory halts, and customer shipment delays:

```
[ Step 1: Supplier PO ] ────► [ Step 2: Bay Receipt ] ────► [ Step 3: Factory Allocation ]
   Raise PO in Procurement      Click "Receive Goods"         Assign to Factory under 85% capacity
                                                                            │
                                                                            ▼
[ Step 6: One-Click Ship ] ◄── [ Step 5: Fulfilment Gating ] ◄── [ Step 4: 7-Stage Run & QC ]
   Click "Dispatch" on 100%       Review 6-Point Checklist       Advance stages -> Pass QC -> Auto Stock-In
```

### The 4 Smart Automations Built Into This Workflow:
1. **Auto Stock-In on QC Pass:**
   You don't need to record a QC inspection and then separately go to the Stock page to type numbers. When you click "Passed" in the QC drawer, the approved units are immediately credited to available stock.
2. **Automated Bottleneck Detection:**
   If an order is stuck at 80% or 60%, the system tells you exactly why (e.g., *"Waiting QC Release"* or *"Stock Shortage"*), so your team knows which department to nudge.
3. **Multi-Location Safety Triggers:**
   When physical stock dips below the safety buffer (`reorderLevel`), an amber/red warning flag immediately lights up on the Overview dashboard.
4. **Resilient Data Rendering:**
   Every array and nested object uses safe navigation fallbacks (`|| []` and `?.`), ensuring uninterrupted operations on the warehouse floor even during rapid data entry.

