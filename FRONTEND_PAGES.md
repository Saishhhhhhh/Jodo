# Jodo Commerce OS - Complete Frontend Pages Directory

This document lists all frontend application pages across the **Admin Portal** (`apps/admin`) and the **Customer Storefront** (`apps/web`).

---

## Summary Overview

| Application | Technology | Base Directory | Total Pages | Target Audience |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Portal** | Next.js 14+ (App Router), Tailwind/CSS | [`apps/admin/src/app`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app) | **104 Pages** | Admins, Store Owners, Project Managers, Team Members |
| **Customer Storefront** | Next.js 14+ (App Router), Tailwind/CSS | [`apps/web/src/app`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app) | **22 Pages** | End Consumers, Shoppers, Registered Accounts |
| **Total Frontend Pages** | - | - | **126 Pages** | Full Omnichannel Commerce & ERP OS |

---

## 1. Admin Portal (`apps/admin`)

The Admin application is organized into operational modules within `apps/admin/src/app`.

### 1.1 Authentication & Root
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/login` | [`(auth)/login/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(auth)/login/page.tsx) | Admin & Team Member login portal | Public |
| `/` | [`(dashboard)/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/page.tsx) | Executive store dashboard, KPI stats & live orders | Admin / Manager |

---

### 1.2 Task Management & Team Workspace
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/tasks` | [`(dashboard)/tasks/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/page.tsx) | Main unified tasks dashboard, timer & action table/cards | Admin / Manager |
| `/tasks/my-tasks` | [`(dashboard)/tasks/my-tasks/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/my-tasks/page.tsx) | Individual assignee workspace (filtered to current user) | Team Member / Admin |
| `/tasks/team-members` | [`(dashboard)/tasks/team-members/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/team-members/page.tsx) | Team member accounts, permissions & actions management | Admin / Manager |
| `/tasks/all-tasks` | [`(dashboard)/tasks/all-tasks/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/all-tasks/page.tsx) | Organization-wide task list with department filters | Admin / Manager |
| `/tasks/team-tasks` | [`(dashboard)/tasks/team-tasks/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/team-tasks/page.tsx) | Departmental task queue | Admin / Manager |
| `/tasks/completed` | [`(dashboard)/tasks/completed/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/completed/page.tsx) | Completed & closed deliverables archive | All roles |
| `/tasks/overdue` | [`(dashboard)/tasks/overdue/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/overdue/page.tsx) | Urgent & overdue deliverables tracker | Admin / Manager |
| `/tasks/reports` | [`(dashboard)/tasks/reports/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/reports/page.tsx) | Task velocity & logged work duration analytics | Admin / Manager |
| `/tasks/templates` | [`(dashboard)/tasks/templates/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/templates/page.tsx) | Reusable standard operating procedure task templates | Admin / Manager |
| `/tasks/:id` | [`(dashboard)/tasks/[id]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/tasks/[id]/page.tsx) | Task details, delay remarks history & checklist | All roles |

---

### 1.3 Orders, Returns & Fulfilment
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/orders` | [`(dashboard)/orders/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/orders/page.tsx) | Customer orders management and status updates | Admin / Manager |
| `/orders/:id` | [`(dashboard)/orders/[id]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/orders/[id]/page.tsx) | Order detail, line items, fulfillment & payment tracking | Admin / Manager |
| `/orders/draft` | [`(dashboard)/orders/draft/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/orders/draft/page.tsx) | Draft and telephone order list | Admin / Manager |
| `/orders/draft/new` | [`(dashboard)/orders/draft/new/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/orders/draft/new/page.tsx) | Manual draft order creation interface | Admin / Manager |
| `/returns` | [`(dashboard)/returns/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/returns/page.tsx) | Customer return requests (RMA), images & refund approval | Admin / Manager |
| `/shipping-labels` | [`(dashboard)/shipping-labels/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/shipping-labels/page.tsx) | Courier manifests & generated shipping labels | Admin / Manager |
| `/print-label/:id` | [`print-label/[id]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/print-label/[id]/page.tsx) | Thermal print shipping label view | Admin / Manager |

---

### 1.4 Products, Inventory & Catalogs
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/products` | [`(dashboard)/products/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/products/page.tsx) | Product inventory list, pricing & variant management | Admin / Manager |
| `/products/:id` | [`(dashboard)/products/[id]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/products/[id]/page.tsx) | Product editor, 3D AR models, media & specifications | Admin / Manager |
| `/collections` | [`(dashboard)/collections/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/collections/page.tsx) | Category and collection groupings management | Admin / Manager |
| `/inventory` | [`(dashboard)/inventory/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/inventory/page.tsx) | Multi-location stock levels, reorder points & adjustments | Admin / Manager |
| `/inventory/intelligence` | [`(dashboard)/inventory/intelligence/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/inventory/intelligence/page.tsx) | AI festival forecasting, stockout risk & replenishment signals | Admin / Manager |
| `/digital-products` | [`(dashboard)/digital-products/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/digital-products/page.tsx) | Downloadable files & license key products | Admin / Manager |

---

### 1.5 Reports & Executive AI Digests
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/reports` | [`(dashboard)/reports/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/page.tsx) | Executive AI overview, revenue charts & attention pie | Admin / Owner |
| `/reports/daily` | [`(dashboard)/reports/daily/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/daily/page.tsx) | Daily operational sales, returns & productivity digest | Admin / Owner |
| `/reports/weekly` | [`(dashboard)/reports/weekly/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/weekly/page.tsx) | Weekly trend analysis and week-over-week performance | Admin / Owner |
| `/reports/sales` | [`(dashboard)/reports/sales/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/sales/page.tsx) | Gross revenue, tax collections & discount impact | Admin / Owner |
| `/reports/orders` | [`(dashboard)/reports/orders/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/orders/page.tsx) | Order volume, fulfillment times & cancellation rates | Admin / Owner |
| `/reports/inventory` | [`(dashboard)/reports/inventory/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/inventory/page.tsx) | Inventory valuation, stock turnover & carrying cost | Admin / Owner |
| `/reports/leads` | [`(dashboard)/reports/leads/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/leads/page.tsx) | Lead conversion rates & pipeline velocity report | Admin / Owner |
| `/reports/quotations` | [`(dashboard)/reports/quotations/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/quotations/page.tsx) | B2B quotations acceptance & average quotation values | Admin / Owner |
| `/reports/follow-ups` | [`(dashboard)/reports/follow-ups/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/follow-ups/page.tsx) | Client follow-up timeliness & engagement tracking | Admin / Owner |
| `/reports/support` | [`(dashboard)/reports/support/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/support/page.tsx) | Support tickets, complaint resolution & customer CSAT | Admin / Owner |
| `/reports/:id` | [`(dashboard)/reports/[id]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reports/[id]/page.tsx) | Saved custom report view | Admin / Owner |

---

### 1.6 AI Content Suite
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/ai-content` | [`(dashboard)/ai-content/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/ai-content/page.tsx) | AI Content generator overview & activity hub | Admin / Manager |
| `/ai-content/product-descriptions` | [`(dashboard)/ai-content/product-descriptions/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/ai-content/product-descriptions/page.tsx) | AI copy generator for product feature highlights & SEO | Admin / Manager |
| `/ai-content/listing-copy` | [`(dashboard)/ai-content/listing-copy/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/ai-content/listing-copy/page.tsx) | Marketplace listing titles, bullet points & meta copy | Admin / Manager |
| `/ai-content/campaign-content` | [`(dashboard)/ai-content/campaign-content/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/ai-content/campaign-content/page.tsx) | Social media captions & advertising campaign ad copy | Admin / Manager |
| `/ai-content/catalogue-content` | [`(dashboard)/ai-content/catalogue-content/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/ai-content/catalogue-content/page.tsx) | Print & digital brochure catalogue copy | Admin / Manager |
| `/ai-content/drafts` | [`(dashboard)/ai-content/drafts/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/ai-content/drafts/page.tsx) | In-progress AI generated drafts queue | Admin / Manager |
| `/ai-content/review-approval` | [`(dashboard)/ai-content/review-approval/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/ai-content/review-approval/page.tsx) | Editorial review & approval workflow | Admin / Manager |
| `/ai-content/published` | [`(dashboard)/ai-content/published/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/ai-content/published/page.tsx) | Live published marketing copy archive | Admin / Manager |

---

### 1.7 Customers, CRM & Leads
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/customers` | [`(dashboard)/customers/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/customers/page.tsx) | Customer directory, lifetime value & orders count | Admin / Manager |
| `/customers/segments` | [`(dashboard)/customers/segments/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/customers/segments/page.tsx) | Dynamic audience segmentation & filter tags | Admin / Manager |
| `/customers/loyalty` | [`(dashboard)/customers/loyalty/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/customers/loyalty/page.tsx) | Loyalty rewards tiers & point balances | Admin / Manager |
| `/customers/wallets` | [`(dashboard)/customers/wallets/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/customers/wallets/page.tsx) | Store credit & customer wallet ledgers | Admin / Manager |
| `/leads` | [`(dashboard)/leads/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/leads/page.tsx) | Sales CRM pipeline, quotation builder & stage tracker | Admin / Manager |
| `/whatsapp` | [`(dashboard)/whatsapp/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/whatsapp/page.tsx) | WhatsApp Business live customer conversations & templates | Admin / Manager |

---

### 1.8 Marketing, Promotions & Content
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/discounts` | [`(dashboard)/discounts/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/discounts/page.tsx) | Coupon codes, automatic cart rules & tiered discounts | Admin / Manager |
| `/gift-cards` | [`(dashboard)/gift-cards/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/gift-cards/page.tsx) | Digital gift card vouchers & issuance | Admin / Manager |
| `/campaigns` | [`(dashboard)/campaigns/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/campaigns/page.tsx) | Multi-channel promotional campaigns management | Admin / Manager |
| `/marketing/email` | [`(dashboard)/marketing/email/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/marketing/email/page.tsx) | Email newsletter broadcasts & templates | Admin / Manager |
| `/marketing/sms` | [`(dashboard)/marketing/sms/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/marketing/sms/page.tsx) | SMS promotional & transactional messages | Admin / Manager |
| `/marketing/whatsapp` | [`(dashboard)/marketing/whatsapp/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/marketing/whatsapp/page.tsx) | WhatsApp marketing blast campaigns | Admin / Manager |
| `/marketing/push` | [`(dashboard)/marketing/push/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/marketing/push/page.tsx) | Mobile & web push notification broadcasts | Admin / Manager |
| `/banners` | [`(dashboard)/banners/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/banners/page.tsx) | Homepage promotional slider banners & hero graphics | Admin / Manager |
| `/blog` | [`(dashboard)/blog/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/blog/page.tsx) | Blog articles management & publishing | Admin / Manager |
| `/faqs` | [`(dashboard)/faqs/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/faqs/page.tsx) | Frequently asked questions & categorization | Admin / Manager |
| `/pages` | [`(dashboard)/pages/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/pages/page.tsx) | Static content pages editor (Terms, Privacy, About) | Admin / Manager |
| `/reviews` | [`(dashboard)/reviews/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/reviews/page.tsx) | Product review moderation, ratings & customer photos | Admin / Manager |

---

### 1.9 Sales Channels & Omnichannel
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/channels/online` | [`(dashboard)/channels/online/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/channels/online/page.tsx) | Online storefront channel health & settings | Admin / Owner |
| `/channels/pos` | [`(dashboard)/channels/pos/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/channels/pos/page.tsx) | Point-of-Sale in-store counter terminals | Admin / Owner |
| `/channels/b2b` | [`(dashboard)/channels/b2b/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/channels/b2b/page.tsx) | B2B Wholesale wholesale portal and tier pricing | Admin / Owner |
| `/channels/whatsapp` | [`(dashboard)/channels/whatsapp/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/channels/whatsapp/page.tsx) | WhatsApp commerce storefront catalog synchronization | Admin / Owner |

---

### 1.10 Warehouse, Manufacturing & Supply Chain
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/warehouse` | [`(dashboard)/warehouse/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/page.tsx) | Central warehouse operations cockpit | Admin / Manager |
| `/warehouse/dashboard` | [`(dashboard)/warehouse/dashboard/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/dashboard/page.tsx) | Warehouse KPIs, inbound/outbound queues & dock load | Admin / Manager |
| `/warehouse/procurement` | [`(dashboard)/warehouse/procurement/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/procurement/page.tsx) | Raw material purchase orders & vendor deliveries | Admin / Manager |
| `/warehouse/contract-manufacturers` | [`(dashboard)/warehouse/contract-manufacturers/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/contract-manufacturers/page.tsx) | External factories & OEM vendor directory | Admin / Manager |
| `/warehouse/production-orders` | [`(dashboard)/warehouse/production-orders/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/production-orders/page.tsx) | Assembly batches & manufacturing work orders | Admin / Manager |
| `/warehouse/production-tracking` | [`(dashboard)/warehouse/production-tracking/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/production-tracking/page.tsx) | Live line stage tracking (Cutting, Sewing, Packaging) | Admin / Manager |
| `/warehouse/delays-issues` | [`(dashboard)/warehouse/delays-issues/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/delays-issues/page.tsx) | Manufacturing bottlenecks & defect remediation | Admin / Manager |
| `/warehouse/quality-checks` | [`(dashboard)/warehouse/quality-checks/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/quality-checks/page.tsx) | QA gate audits & batch tolerance checks | Admin / Manager |
| `/warehouse/stock-in-hand` | [`(dashboard)/warehouse/stock-in-hand/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/stock-in-hand/page.tsx) | Bin / Rack physical inventory verification | Admin / Manager |
| `/warehouse/fulfilment-readiness` | [`(dashboard)/warehouse/fulfilment-readiness/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/warehouse/fulfilment-readiness/page.tsx) | Pick & pack dispatch staging verification | Admin / Manager |

---

### 1.11 Analytics
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/analytics` | [`(dashboard)/analytics/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/analytics/page.tsx) | General business analytics & real-time traffic | Admin / Owner |
| `/analytics/sales` | [`(dashboard)/analytics/sales/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/analytics/sales/page.tsx) | Detailed revenue, margin & product sales breakdown | Admin / Owner |
| `/analytics/products` | [`(dashboard)/analytics/products/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/analytics/products/page.tsx) | Top-selling items, low-movers & page views | Admin / Owner |
| `/analytics/customers` | [`(dashboard)/analytics/customers/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/analytics/customers/page.tsx) | Retention cohort charts & acquisition channels | Admin / Owner |
| `/analytics/funnel` | [`(dashboard)/analytics/funnel/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/analytics/funnel/page.tsx) | Checkout conversion funnel & cart drop-off analysis | Admin / Owner |
| `/analytics/reports` | [`(dashboard)/analytics/reports/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/analytics/reports/page.tsx) | Custom tabular analytics data export | Admin / Owner |

---

### 1.12 Apps, Developers & Automations
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/apps` | [`(dashboard)/apps/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/apps/page.tsx) | Installed apps & integrations overview | Admin / Owner |
| `/apps/marketplace` | [`(dashboard)/apps/marketplace/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/apps/marketplace/page.tsx) | App store directory (Shiprocket, Interakt, etc.) | Admin / Owner |
| `/apps/api-keys` | [`(dashboard)/apps/api-keys/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/apps/api-keys/page.tsx) | Secret API credentials & access token management | Admin / Owner |
| `/apps/webhooks` | [`(dashboard)/apps/webhooks/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/apps/webhooks/page.tsx) | Webhook subscriptions, endpoints & delivery logs | Admin / Owner |
| `/apps/dev` | [`(dashboard)/apps/dev/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/apps/dev/page.tsx) | Developer console & custom private app creation | Admin / Owner |
| `/automations` | [`(dashboard)/automations/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/automations/page.tsx) | Workflow automation rules (trigger → condition → action) | Admin / Owner |

---

### 1.13 Media, Navigation & Storefront Design
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/media` | [`(dashboard)/media/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/media/page.tsx) | Cloud asset library (Images, videos, 3D GLB assets) | Admin / Manager |
| `/navigation` | [`(dashboard)/navigation/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/navigation/page.tsx) | Storefront header menu & footer menu tree editor | Admin / Manager |
| `/navigation/:id` | [`(dashboard)/navigation/[id]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/navigation/[id]/page.tsx) | Specific menu hierarchy editor | Admin / Manager |
| `/seo` | [`(dashboard)/seo/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/seo/page.tsx) | Search engine indexing, meta tags & robots.txt rules | Admin / Manager |
| `/fraud` | [`(dashboard)/fraud/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/fraud/page.tsx) | Risk analysis, blacklisted IPs & chargeback protection | Admin / Owner |
| `/notifications` | [`(dashboard)/notifications/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/notifications/page.tsx) | System alert center & team notifications list | All roles |
| `/help` | [`(dashboard)/help/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/help/page.tsx) | Admin documentation, tutorials & platform support | All roles |

---

### 1.14 Settings & System Administration
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/settings` | [`(dashboard)/settings/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/page.tsx) | General store profile, branding & contact details | Admin / Owner |
| `/settings/profile` | [`(dashboard)/settings/profile/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/profile/page.tsx) | Admin user account profile & password reset | All roles |
| `/settings/staff` | [`(dashboard)/settings/staff/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/staff/page.tsx) | System user staff accounts & role permissions | Admin / Owner |
| `/settings/payments` | [`(dashboard)/settings/payments/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/payments/page.tsx) | Payment gateways (Razorpay, Stripe, COD) setup | Admin / Owner |
| `/settings/shipping` | [`(dashboard)/settings/shipping/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/shipping/page.tsx) | Shipping zones, flat rates & Shiprocket integration | Admin / Owner |
| `/settings/locations` | [`(dashboard)/settings/locations/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/locations/page.tsx) | Physical warehouse & store fulfillment locations | Admin / Owner |
| `/settings/taxes` | [`(dashboard)/settings/taxes/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/taxes/page.tsx) | GST tax rules, HSN codes & tax rates configuration | Admin / Owner |
| `/settings/policies` | [`(dashboard)/settings/policies/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/policies/page.tsx) | Legal policies (Return policy, Terms of Service, Privacy) | Admin / Owner |
| `/settings/languages` | [`(dashboard)/settings/languages/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/languages/page.tsx) | Multi-language localization settings | Admin / Owner |
| `/settings/audit-logs` | [`(dashboard)/settings/audit-logs/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/admin/src/app/(dashboard)/settings/audit-logs/page.tsx) | System security audit trail & actor activity records | Admin / Owner |

---

## 2. Customer Storefront (`apps/web`)

The Customer Storefront provides the public-facing shopping experience located within `apps/web/src/app`.

### 2.1 Home, Landing & Branding
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/` | [`page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/page.tsx) | Primary storefront landing page with hero banners & collections | Public |
| `/home` | [`home/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/home/page.tsx) | Alternate dynamic homepage | Public |
| `/about` | [`about/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/about/page.tsx) | Brand story, values, craftsmanship & company overview | Public |
| `/coming-soon` | [`coming-soon/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/coming-soon/page.tsx) | Interactive 3D WebGL / AR interactive showcase | Public |

---

### 2.2 Product Discovery & Shopping
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/shop` | [`shop/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/shop/page.tsx) | Master product catalog with price, category & sort filters | Public |
| `/shop/:category` | [`shop/[category]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/shop/[category]/page.tsx) | Category-specific product collection page | Public |
| `/collections` | [`collections/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/collections/page.tsx) | Curated collections gallery | Public |
| `/collections/:slug` | [`collections/[slug]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/collections/[slug]/page.tsx) | Specific collection page with custom banner & products | Public |
| `/products/:id` | [`products/[id]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/products/[id]/page.tsx) | Product detail page (PDP), 3D AR view, image gallery & cart | Public |
| `/wishlist` | [`wishlist/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/wishlist/page.tsx) | Customer saved favorites & wishlist management | Public |

---

### 2.3 Checkout & Purchasing
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/checkout` | [`checkout/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/checkout/page.tsx) | Multi-step checkout (Address, Shipping rate, Payment) | Public / Registered |
| `/checkout/success` | [`checkout/success/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/checkout/success/page.tsx) | Post-purchase confirmation, receipt & tracking link | Public / Registered |

---

### 2.4 Customer Account & Orders
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/login` | [`(auth)/login/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/(auth)/login/page.tsx) | Customer login page | Public |
| `/register` | [`(auth)/register/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/(auth)/register/page.tsx) | Customer sign-up & account creation page | Public |
| `/account` | [`account/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/account/page.tsx) | Customer account dashboard & profile details | Customer Login |
| `/account/orders` | [`account/orders/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/account/orders/page.tsx) | Past purchase history & order tracking status | Customer Login |
| `/account/orders/:id` | [`account/orders/[id]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/account/orders/[id]/page.tsx) | Order tracking detail, invoice download & return request flow | Customer Login |
| `/account/addresses` | [`account/addresses/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/account/addresses/page.tsx) | Saved shipping & billing address book | Customer Login |

---

### 2.5 Content, Blog & Support
| Route URL | Source File | Description | Access |
| :--- | :--- | :--- | :--- |
| `/blog` | [`blog/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/blog/page.tsx) | Store editorial blog article list | Public |
| `/blog/:slug` | [`blog/[slug]/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/blog/[slug]/page.tsx) | Individual blog post reader with related articles | Public |
| `/contact` | [`contact/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/contact/page.tsx) | Contact form, store location map & customer support info | Public |
| `/faq` | [`faq/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/faq/page.tsx) | Store FAQ accordion & knowledgebase | Public |
| `/faqs` | [`faqs/page.tsx`](file:///c:/Users/Admin/Documents/jodo/Jodo/apps/web/src/app/faqs/page.tsx) | Searchable categorised FAQs portal | Public |
