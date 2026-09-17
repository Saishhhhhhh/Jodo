# Returns Module

## Overview
The Returns Module manages the reverse logistics process, including customer return requests, package receiving, and refund issuance.

## Features & UI
The Returns Dashboard (`apps/admin/src/app/(dashboard)/returns/page.tsx`) provides:
- **Return Status Tracking**: 
  - `Requested` (Pending Review)
  - `Approved`
  - `Received` (Package Received)
  - `Refunded`
  - `Rejected`
- **Tabbed Filtering**: Quick filters to view returns by their current status.
- **Data Display**: Shows the original Order Number, Date Requested, Customer Details, Items Returned (count), Status, and Refund Total.
- **Details View**: Clicking a row or the "Eye" icon opens a `ReturnDetailsSheet` for managing specific return items and taking actions (like approving or refunding).

## Technical Implementation
- Data fetching via `@tanstack/react-query` using `returnsApi.list()`.
- Built with `DataTable` (TanStack Table) and Shadcn UI components (Badges, Buttons, Sheet).
