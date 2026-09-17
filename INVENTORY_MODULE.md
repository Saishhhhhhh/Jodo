# Inventory Module

## Overview
The Inventory Module handles stock tracking, reorder thresholds, and multi-location inventory management.

## Data Model
The `InventoryItem` model (`apps/api/src/models/InventoryItem.ts`) tracks:
- **Identification**: SKU, `tenantId`, `storeId`.
- **Location**: Multi-location support via `locationName`.
- **Quantities**:
  - `onHand`: Total physical stock.
  - `available`: Stock available to be sold (onHand - committed).
  - `committed`: Stock allocated to pending orders.
  - `reservedStock`: Stock held back for special purposes.
- **Thresholds**: `reorderLevel` and `reorderQuantity` for automated restocking alerts.
- **Status**: Computed status (`in_stock`, `low_stock`, `out_of_stock`).

## Features
- **Automated Stock Checks**: Mongoose post-save hooks automatically trigger a `NotificationService.checkInventoryItem` to fire notifications (e.g., low stock alerts).
- **Concurrency**: Tracks committed vs available stock to prevent overselling in a headless environment.
- **Unique Constraints**: Ensures a unique combination of Store, SKU, and Location.
