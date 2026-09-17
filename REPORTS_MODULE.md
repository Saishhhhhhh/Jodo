# Reports Module

## Overview
The Reports Module provides merchants with analytics, business intelligence, and historical data exports.

## Features & UI
The Reports Dashboard (`apps/admin/src/app/(dashboard)/reports/page.tsx`) offers:
- **Date Range Filtering**: Allows viewing analytics between specific dates.
- **Key Metrics Summary**:
  - **Sales**: Total Revenue, Total Orders.
  - **Orders Status**: Paid vs Pending counts.
  - **Leads**: Total leads acquired.
  - **Inventory**: Total distinct items and total quantity.
  - **Quotations**: Total drafts.
  - **Support & Follow-ups**: Open/resolved cases and pending/overdue follow-ups.
- **Export Capabilities**:
  - **PDF Export**: Print-ready view of the reports page.
  - **CSV Export**: Client-side generation of a CSV summary covering all key metrics.
  - **Custom Report Generation**: Triggers async report generation via `reportsApi.generate`.
- **Report History**: A data table showing previously generated reports, their status (e.g., completed), and actions (View/Delete).

## Technical Implementation
- Built with `@tanstack/react-query` for data fetching (`summary`, `history`).
- Real-time CSV blob generation on the client side.
