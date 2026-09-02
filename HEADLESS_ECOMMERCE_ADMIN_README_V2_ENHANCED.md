# Headless E-commerce Admin Panel — Shopify-Level / Beyond-Shopify Blueprint

> **Goal:** Build a clean, powerful, headless e-commerce admin panel that can connect to **any frontend**: Next.js storefront, React app, mobile app, marketplace, POS, WhatsApp commerce, custom client website, or future sales channel.
>
> This project is not just a Shopify clone. The goal is to build a **modular commerce operating system** where merchants, developers, and agencies can customize almost every part of the store: products, pricing, checkout, shipping, taxes, themes, plugins, automation, APIs, permissions, and analytics.

---

## 1. Product Vision

### 1.1 What we are building

We are building an **API-first e-commerce admin panel** with:

- A beautiful **Next.js admin panel** using **shadcn/ui**
- A robust **Node.js / Express / MongoDB backend**
- Headless storefront APIs
- Multi-store and multi-tenant support
- Plugin/app architecture
- Checkout rules engine
- Automation builder
- Advanced product, inventory, order, customer, marketing, analytics, and fulfillment features
- Developer SDKs and webhooks
- Custom fields and metaobjects for unlimited customization
- Role-based access control
- Audit logs
- Secure payment and shipping integrations
- Import/export tools
- Enterprise-level scalability design

### 1.2 Target users

This admin panel should support:

1. **Small merchants**
   - Simple product catalog
   - COD / UPI / Razorpay / Stripe payments
   - Basic shipping
   - Discounts
   - Order management

2. **Growing brands**
   - Multi-location inventory
   - Multiple staff roles
   - Advanced promotions
   - Abandoned cart flows
   - SEO, analytics, customer segmentation
   - Marketing campaigns

3. **Agencies**
   - Attach admin to many custom frontends
   - Manage multiple client stores
   - Build custom plugins
   - Create storefront-specific settings
   - White-label admin panel

4. **Enterprise stores**
   - Multi-country / multi-currency
   - B2B pricing
   - Approval workflows
   - Custom checkout rules
   - ERP/CRM integrations
   - Advanced audit and compliance
   - Workflow automation

---

## 2. Key Principle: Headless First

The admin panel should not depend on one frontend.

The backend should expose APIs that any frontend can consume.

```txt
Admin Panel  --->  Backend APIs  --->  Database / Workers / Integrations
Storefront A --->  Storefront APIs
Mobile App   --->  Storefront APIs
POS App      --->  Storefront APIs
Marketplace  --->  Channel APIs
```

### 2.1 Supported frontend types

- Next.js storefront
- React storefront
- Astro storefront
- Vue/Nuxt storefront
- Native mobile app
- Flutter app
- React Native app
- POS system
- WhatsApp order flow
- B2B portal
- Marketplace connector
- Custom client frontend

### 2.2 Required API layers

1. **Admin API**
   - Used by the admin panel
   - Full permission checks
   - Staff authentication
   - Store management

2. **Storefront API**
   - Public-safe API
   - Product listing
   - Product details
   - Cart
   - Checkout
   - Customer login
   - Orders
   - Reviews
   - CMS content

3. **Plugin API**
   - Plugins can read/write allowed resources
   - Strict permission scopes
   - Webhook/event access
   - App settings and UI extensions

4. **Webhook API**
   - External systems receive event notifications
   - Signed webhook payloads
   - Retry mechanism
   - Delivery logs

5. **Integration API**
   - ERP, CRM, accounting, shipping, marketing, warehouse systems
   - API keys / OAuth tokens
   - Rate limits

---

## 3. Tech Stack

### 3.1 Frontend Admin

| Area | Technology |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| UI Library | shadcn/ui |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table |
| Data fetching | TanStack Query |
| Charts | Recharts / Tremor-compatible charts |
| State | Zustand for UI state, TanStack Query for server state |
| Drag/drop | dnd-kit |
| Rich text | TipTap |
| File upload | Uppy / UploadThing-compatible custom uploader |
| Command palette | cmdk |
| Icons | lucide-react |
| Auth UI | Custom shadcn-based auth screens |

### 3.2 Backend

| Area | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| Cache | Redis |
| Queue | BullMQ |
| Search | Meilisearch / OpenSearch / Typesense |
| File storage | S3 / Cloudflare R2 / DigitalOcean Spaces |
| Realtime | Socket.io / Server-Sent Events |
| Validation | Zod / Joi |
| Auth | JWT + refresh token rotation |
| API docs | OpenAPI / Swagger |
| Emails | Resend / AWS SES / SMTP |
| SMS/WhatsApp | Twilio / Gupshup / Interakt / Meta WhatsApp Cloud API |
| Payments | Razorpay, Stripe, Cashfree, PayPal, manual payment, COD |
| Logging | Pino / Winston |
| Monitoring | Sentry + OpenTelemetry |
| Testing | Vitest / Jest + Supertest + Playwright |
| Deployment | Docker + PM2 / Kubernetes-ready structure |

### 3.3 Suggested monorepo

```txt
commerce-os/
├── apps/
│   ├── admin/                     # Next.js admin panel
│   ├── api/                       # Express API server
│   ├── storefront-demo/           # Example headless storefront
│   └── worker/                    # Queue workers, cron jobs
│
├── packages/
│   ├── ui/                        # Shared shadcn components
│   ├── config/                    # ESLint, TS config, Tailwind config
│   ├── shared/                    # Shared types, constants, zod schemas
│   ├── sdk/                       # JS SDK for storefronts/plugins
│   ├── plugin-sdk/                # Plugin development SDK
│   ├── email-templates/           # Transactional email templates
│   └── testing/                   # Shared testing helpers
│
├── plugins/
│   ├── payment-razorpay/
│   ├── payment-stripe/
│   ├── shipping-shiprocket/
│   ├── search-meilisearch/
│   ├── marketing-whatsapp/
│   ├── reviews-basic/
│   └── tax-india-gst/
│
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── database/
│   ├── plugin-development/
│   └── deployment/
│
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

---

## 4. Admin UI Direction

### 4.1 Visual style

The admin panel should feel:

- Clean
- Modern
- Premium
- Fast
- Minimal
- Developer-friendly
- Merchant-friendly
- Black and white first
- With very controlled accent colors

### 4.2 Color language

| Usage | Color direction |
|---|---|
| Primary UI | Black, white, neutral gray |
| Main accent | One premium accent, for example electric blue / violet / amber |
| Safe state | Green |
| Warning state | Amber / yellow |
| Critical state | Red |
| Disabled state | Muted gray |
| Info state | Blue |

### 4.3 Design rules

1. Do not make the UI colorful everywhere.
2. Use black/white/gray as the base.
3. Use red only for critical actions:
   - Delete product
   - Refund payment
   - Cancel order
   - Disable plugin
   - Remove staff access
4. Use green only for successful/safe states:
   - Paid
   - Fulfilled
   - In stock
   - Active
   - Verified
5. Use yellow/amber for warnings:
   - Low stock
   - Payment pending
   - Fraud review
   - Shipping delay
6. Every dangerous action must require confirmation.
7. Every high-risk action must create an audit log.
8. Every complex page must include:
   - Search
   - Filters
   - Bulk actions
   - Export
   - Saved views
   - Keyboard shortcuts where useful

---

## 5. Main Navigation Structure

```txt
Dashboard

Store
├── Products
├── Collections
├── Inventory
├── Purchase Orders
├── Gift Cards
├── Digital Products
├── Product Reviews
└── Catalog Settings

Orders
├── All Orders
├── Draft Orders
├── Abandoned Checkouts
├── Returns
├── Exchanges
├── Refunds
├── Fulfillments
└── Fraud Review

Customers
├── All Customers
├── Segments
├── Customer Groups
├── Loyalty
├── Wallets / Store Credit
└── Customer Support Notes

Marketing
├── Discounts
├── Campaigns
├── Automations
├── Email
├── SMS
├── WhatsApp
├── Push Notifications
├── Coupons
├── Referrals
└── SEO

Content
├── Pages
├── Blog
├── Navigation Menus
├── Banners
├── Landing Pages
├── Forms
└── Media Library

Checkout
├── Checkout Builder
├── Payment Methods
├── Shipping Rules
├── Cart Rules
├── Checkout Validations
├── Upsells
├── Cross-sells
└── Checkout Extensions

Sales Channels
├── Online Store
├── POS
├── WhatsApp
├── Instagram/Facebook
├── Google Shopping
├── Marketplaces
├── B2B Portal
└── Custom API Channels

Analytics
├── Overview
├── Sales
├── Products
├── Customers
├── Marketing
├── Inventory
├── Search
├── Checkout Funnel
├── Cohorts
└── Reports

Apps & Plugins
├── Installed Apps
├── App Marketplace
├── Private Apps
├── API Keys
├── Webhooks
└── Developer Tools

Settings
├── Store Details
├── Staff & Permissions
├── Roles
├── Taxes
├── Shipping
├── Payments
├── Locations
├── Markets
├── Currencies
├── Languages
├── Notifications
├── Checkout
├── Policies
├── Domains
├── Files
├── Audit Logs
└── Billing
```

---

## 6. Core Feature Requirements

## 6.1 Dashboard

### Purpose

Give the merchant a real-time view of store health.

### Widgets

- Total revenue
- Net revenue
- Orders today
- Average order value
- Conversion rate
- Abandoned checkout value
- Returning customer rate
- Top products
- Low stock products
- Pending fulfillments
- Payment failures
- Refund amount
- Fraud alerts
- Marketing campaign performance
- Sales by channel
- Sales by location
- Live visitor count
- Recent activities
- Store health score

### Filters

- Today
- Yesterday
- Last 7 days
- Last 30 days
- This month
- Last month
- Custom date range
- Channel
- Location
- Currency
- Market
- Product collection

### Advanced

- Custom dashboard builder
- Pin/unpin widgets
- Role-specific dashboards
- Export dashboard as PDF
- Schedule email reports
- Compare current period vs previous period

---

## 6.2 Store Setup Wizard

### Purpose

Help users launch a store quickly.

### Steps

1. Store name
2. Business details
3. Currency
4. Country/region
5. Tax setup
6. Payment setup
7. Shipping setup
8. First product
9. Theme/storefront connection
10. Test order
11. Launch checklist

### Launch checklist

- Store details complete
- Payment method active
- Shipping zone active
- Tax rules configured
- At least one product active
- Domain connected
- Policies added
- Email notifications tested
- Checkout tested
- Analytics connected

---

## 6.3 Products

### Product types

- Simple product
- Variable product
- Bundle product
- Configurable product
- Digital product
- Service product
- Subscription product
- Gift card
- Pre-order product
- Made-to-order product
- Rental product
- B2B-only product
- Hidden/private product

### Product fields

- Title
- Slug
- Description
- Short description
- Brand
- Vendor
- Product type
- Collections
- Tags
- Status
  - Draft
  - Active
  - Archived
  - Scheduled
- Sales channels
- SEO title
- SEO description
- Search keywords
- Product media
- Variant options
- Attributes
- Custom fields
- Metaobjects
- Related products
- Cross-sell products
- Upsell products
- Product labels
- Warranty info
- Return policy override
- Shipping profile
- Tax class
- Inventory tracking
- Product score
- Publishing schedule

### Variant features

- Multiple options:
  - Size
  - Color
  - Material
  - Style
  - Weight
  - Custom options
- SKU
- Barcode
- HSN/SAC
- MRP
- Selling price
- Compare-at price
- Cost per item
- Margin
- Weight
- Dimensions
- Inventory item
- Tax class
- Media per variant
- Minimum order quantity
- Maximum order quantity
- Step quantity
- Variant-specific SEO
- Variant-specific metafields

### Product media

- Images
- Videos
- 3D models
- AR files
- PDFs
- Size charts
- Manuals
- Certificates
- Alt text
- Focal point
- CDN optimization
- Image compression
- Auto WebP/AVIF generation

### Advanced product features

- Product templates
- Bulk product editor
- Product import/export
- Product duplication
- Product version history
- Product approval workflow
- Product content AI helper
- Automatic SEO suggestions
- Product completeness score
- Product feed generator
- Product rule engine
- Product-specific checkout rules
- Product visibility by customer group
- Product visibility by market
- Product visibility by sales channel
- Product visibility by date/time
- Product visibility by inventory condition

---

## 6.4 Collections / Categories

### Collection types

1. Manual collection
2. Smart collection

### Smart collection rules

- Product title contains
- Tag equals
- Price greater than
- Inventory greater than
- Vendor equals
- Product type equals
- Created date
- Sales count
- Review rating
- Custom field condition
- Market condition
- Customer group condition

### Features

- Nested categories
- Collection image
- Collection banner
- SEO title/description
- URL slug
- Sort order
- Custom filters
- Faceted navigation
- Collection-specific discounts
- Collection-specific shipping rules
- Collection-specific merchandising
- Collection landing page builder
- Hide collection from specific channels
- Schedule collection publishing
- Product pinning
- AI sorting recommendations

---

## 6.5 Inventory

### Inventory concepts

Inventory should be ledger-based, not just a number on product variants.

### Inventory modules

- Warehouses
- Locations
- Inventory items
- Stock ledger
- Stock reservations
- Stock transfers
- Purchase orders
- Supplier management
- Stock adjustment
- Cycle count
- Low stock alerts
- Safety stock
- Backorders
- Pre-orders
- Damaged stock
- Incoming stock
- Committed stock
- Available stock
- On-hand stock

### Inventory states

```txt
onHand = physical stock present
reserved = stock locked for carts/checkouts/orders
committed = stock assigned to paid orders
available = onHand - reserved - committed - damaged
incoming = stock expected from purchase orders
damaged = stock not sellable
```

### Required inventory features

- Multi-location inventory
- Inventory history
- Stock reservation expiry
- Automatic stock deduction after payment
- Automatic stock release after payment failure
- Stock transfer between warehouses
- Purchase order creation
- Supplier lead time tracking
- Low stock notifications
- Reorder point
- Reorder quantity suggestion
- Inventory CSV import/export
- Barcode scanning support
- Batch/lot tracking
- Expiry date tracking
- Serial number tracking
- Inventory audit logs

---

## 6.6 Pricing Engine

### Price types

- Base price
- Compare-at price
- Cost price
- Customer group price
- B2B price
- Market-specific price
- Currency-specific price
- Channel-specific price
- Time-based price
- Flash sale price
- Bulk/tiered price
- Contract price
- Subscription price
- Bundle price
- Dynamic price

### Price lists

Create price lists for:

- Retail customers
- Wholesale customers
- VIP customers
- Employees
- Resellers
- Country-specific markets
- Marketplace channels
- B2B accounts

### Pricing rules

Examples:

- If customer group is `VIP`, give 10% lower product price.
- If market is `India`, use INR price list.
- If quantity is greater than 10, use bulk pricing.
- If channel is `B2B`, hide retail price and show negotiated price.
- If sale is active, use sale price between start/end dates.

### Pricing priority

Suggested priority:

```txt
Manual order override
> Contract/B2B account price
> Customer group price
> Market price
> Channel price
> Sale/discount price
> Base price
```

---

## 6.7 Discounts and Promotions

### Discount types

- Percentage discount
- Fixed amount discount
- Free shipping
- Buy X Get Y
- Bundle discount
- Tiered discount
- Quantity discount
- First order discount
- Customer group discount
- Collection discount
- Product discount
- Cart value discount
- Coupon code
- Automatic discount
- Referral discount
- Loyalty discount
- Birthday discount
- Abandoned cart discount
- Subscription discount
- Payment method discount
- Shipping method discount
- Market-specific discount
- Channel-specific discount

### Conditions

- Minimum cart value
- Minimum quantity
- Product included
- Product excluded
- Collection included
- Customer included
- Customer group
- Customer tag
- Country
- State
- City
- Pincode
- Device type
- Channel
- Payment method
- Shipping method
- Date range
- Usage limit
- One use per customer
- New customer only
- Returning customer only

### Discount conflict rules

Discounts need a conflict-resolution engine.

Options:

- Allow stacking
- Do not allow stacking
- Stack only with selected discounts
- Highest discount wins
- Merchant priority order
- Product discount + cart discount allowed
- Shipping discount separate
- Exclude sale items
- Exclude gift cards

### Promotion builder

Admin should include a visual rule builder:

```txt
IF cart subtotal > ₹5000
AND customer tag = VIP
AND shipping country = India
THEN apply 12% discount
MAX discount = ₹1000
USAGE = one time per customer
```

---

## 6.8 Cart Engine

### Cart features

- Anonymous cart
- Logged-in customer cart
- Cart merge after login
- Cart expiration
- Multi-currency cart
- Cart notes
- Gift message
- Cart attributes
- Custom line item properties
- Cart-level metafields
- Cart validation
- Cart price recalculation
- Coupon apply/remove
- Shipping estimate
- Tax estimate
- Inventory reservation
- Cart recovery
- Cart sharing link
- Cart locking during checkout

### Cart rules

- Minimum order value
- Maximum order value
- Minimum quantity
- Maximum quantity
- Product combination restriction
- Restricted pincode
- Restricted state/country
- Payment method restrictions
- Shipping method restrictions
- Age-restricted product rules
- B2B approval required
- COD availability rules
- Inventory availability rules

---

## 6.9 Checkout Engine

### Goal

Create a flexible checkout that developers can customize without breaking security.

### Checkout steps

1. Cart review
2. Customer identification
3. Address
4. Shipping method
5. Payment method
6. Review
7. Payment
8. Order confirmation
9. Thank-you page

### Checkout modes

- Single-page checkout
- Multi-step checkout
- Express checkout
- Guest checkout
- Login-required checkout
- B2B quote checkout
- COD checkout
- Payment link checkout
- Draft order checkout

### Checkout customization

- Enable/disable steps
- Custom checkout blocks
- Custom fields
- Custom validations
- Payment method visibility rules
- Shipping method visibility rules
- Upsell blocks
- Cross-sell blocks
- Trust badges
- Delivery instructions
- Gift options
- Date/time delivery picker
- Store pickup selector
- Address verification
- Tax ID / GSTIN field
- Business invoice field
- Age confirmation
- Terms checkbox
- Customer consent
- Thank-you page widgets

### Checkout validation examples

- Block checkout if cart total is below ₹500.
- Hide COD if order value is above ₹10,000.
- Hide free shipping if customer is outside selected pincodes.
- Require GSTIN for B2B customer group.
- Require approval for wholesale order above ₹1,00,000.
- Prevent checkout if restricted product is shipping to restricted region.
- Prevent checkout if item stock was reserved by another order.

---

## 6.10 Orders

### Order states

```txt
draft
pending_payment
payment_failed
paid
partially_paid
confirmed
processing
partially_fulfilled
fulfilled
partially_refunded
refunded
cancelled
returned
closed
```

### Order features

- Order list with saved views
- Order detail timeline
- Payment status
- Fulfillment status
- Customer details
- Billing/shipping address
- Line items
- Taxes
- Discounts
- Shipping charges
- Notes
- Staff comments
- Tags
- Risk flags
- Customer communication
- Print invoice
- Generate packing slip
- Send order confirmation
- Send tracking notification
- Edit order
- Add/remove line items
- Adjust price
- Capture payment
- Refund payment
- Partial refund
- Cancel order
- Archive order
- Duplicate order
- Create draft order
- Create return
- Create exchange
- Create replacement order
- Create manual order
- Create payment link
- Export orders

### Order timeline

Every order should have an immutable event timeline:

- Order created
- Payment initiated
- Payment succeeded
- Payment failed
- Inventory reserved
- Inventory deducted
- Order confirmed
- Fulfillment created
- Tracking added
- Refund initiated
- Refund completed
- Return requested
- Staff note added
- Customer email sent
- Webhook delivered
- Plugin action executed

### Order editing safety

When editing an order:

- Recalculate tax
- Recalculate discounts
- Check inventory
- Check payment delta
- Log audit event
- Notify customer if required
- Keep original order snapshot
- Never silently mutate paid financial records

---

## 6.11 Payments

### Supported payment methods

- Razorpay
- Stripe
- Cashfree
- PayPal
- PhonePe
- PayU
- CCAvenue
- UPI
- Netbanking
- Wallets
- Cards
- EMI
- COD
- Bank transfer
- Manual payment
- Store credit
- Gift card
- Split payment

### Payment architecture

Use a payment adapter pattern:

```ts
interface PaymentProvider {
  createPaymentIntent(input): Promise<PaymentIntent>;
  capturePayment(input): Promise<CaptureResult>;
  refundPayment(input): Promise<RefundResult>;
  verifyWebhook(payload, signature): Promise<WebhookVerificationResult>;
}
```

### Payment safety

- Webhook signature verification
- Idempotency keys
- Payment attempt tracking
- Duplicate webhook prevention
- Payment reconciliation
- Manual review state
- Refund permission checks
- Partial refund support
- Payment logs
- Gateway error logs
- Gateway health monitor

---

## 6.12 Shipping and Fulfillment

### Shipping features

- Shipping zones
- Shipping profiles
- Weight-based rates
- Price-based rates
- Product-based rates
- Location-based rates
- Pincode serviceability
- Free shipping rules
- Flat rate shipping
- Carrier-calculated rates
- Local delivery
- Store pickup
- Scheduled delivery
- Same-day delivery
- International shipping
- Multi-package shipment
- Partial shipment
- Split fulfillment
- Tracking number
- Shipping labels
- Packing slips
- Delivery instructions

### Fulfillment providers

- Manual fulfillment
- Shiprocket
- Delhivery
- Blue Dart
- DTDC
- FedEx
- DHL
- UPS
- Amazon MCF
- Warehouse app
- Custom 3PL

### Fulfillment states

```txt
unfulfilled
scheduled
on_hold
partially_fulfilled
fulfilled
in_transit
out_for_delivery
delivered
failed_delivery
returned_to_origin
```

---

## 6.13 Returns, Refunds, and Exchanges

### Return features

- Return request portal
- Return eligibility rules
- Return window
- Product-specific return policy
- Exchange request
- Replacement order
- Partial return
- Refund to original payment
- Refund to wallet/store credit
- Restocking fee
- Return shipping label
- Return reason
- Return condition
- Quality check
- RMA number
- Return timeline
- Return analytics

### Return rules

Examples:

- Return allowed within 7 days for fashion.
- Return not allowed for digital products.
- Exchange allowed only once.
- Refund to wallet if COD.
- Auto-approve return for VIP customer.
- Manual approval for order value above ₹20,000.

---

## 6.14 Customers

### Customer profile

- Name
- Email
- Phone
- Gender
- Date of birth
- Addresses
- Tags
- Notes
- Customer group
- Lifetime value
- Average order value
- Total orders
- Last order date
- Marketing consent
- WhatsApp consent
- Email consent
- SMS consent
- Wallet balance
- Store credit
- Loyalty points
- Risk notes
- Support history
- Login activity

### Customer features

- Customer segmentation
- Customer import/export
- Customer merge
- Customer blacklist
- Customer tags
- Customer group pricing
- Customer-specific discounts
- Customer timeline
- Customer notes
- Customer privacy requests
- Account deletion request
- GDPR-style data export
- OTP login
- Password login
- Magic link login
- Social login
- B2B customer accounts

---

## 6.15 B2B / Wholesale

### B2B features

- Company accounts
- Multiple buyers per company
- Buyer roles
- Approval workflow
- Purchase order checkout
- Credit limit
- Payment terms
- Net 15 / Net 30 / Net 60
- Custom price lists
- Contract pricing
- MOQ rules
- RFQ / quote request
- Bulk order form
- Reorder from previous order
- GSTIN / tax ID capture
- Company address book
- Sales rep assignment
- Account manager notes

### B2B workflows

```txt
Buyer creates cart
→ Cart requires approval
→ Manager approves
→ Order created as payment due
→ Invoice generated
→ Payment collected later
```

---

## 6.16 Subscriptions

### Subscription features

- Subscription products
- Subscribe and save
- Recurring orders
- Pause subscription
- Skip subscription
- Cancel subscription
- Change frequency
- Change product
- Change quantity
- Retry failed payment
- Dunning emails
- Subscription discount
- Subscription analytics

### Billing intervals

- Daily
- Weekly
- Monthly
- Quarterly
- Yearly
- Custom interval

---

## 6.17 Gift Cards, Store Credit, Wallet

### Gift cards

- Generate gift card
- Sell gift card as product
- Gift card code
- Balance tracking
- Expiry date
- Partial redemption
- Email gift card
- Disable gift card
- Fraud check

### Wallet/store credit

- Refund to wallet
- Manual credit/debit
- Credit expiry
- Store credit campaign
- Customer wallet ledger
- Admin adjustment audit

---

## 6.18 CMS and Content

### Content modules

- Pages
- Blog
- Landing pages
- Navigation menus
- Banners
- Announcement bars
- Forms
- FAQs
- Policy pages
- Size charts
- Lookbooks
- Product guides
- Media library

### Headless CMS features

- Page builder
- Section builder
- Reusable blocks
- Dynamic data binding
- SEO fields
- Scheduled publishing
- Draft/publish workflow
- Page version history
- Multilingual content
- Custom content types
- Metaobjects

---

## 6.19 Storefront Customization

### Storefront settings

Even though the admin is headless, it should provide frontend customization data.

Storefronts can consume:

- Theme settings JSON
- Navigation JSON
- Homepage sections
- Product page layout settings
- Collection page settings
- Checkout display settings
- Color tokens
- Typography tokens
- Feature toggles
- Announcement banners
- Popup settings
- Recommendation settings

### Storefront Builder

Optional advanced module:

- Drag/drop sections
- JSON schema-based blocks
- Device preview
- Live preview
- Publish version
- Rollback version
- A/B test sections
- Personalization rules

---

## 6.20 Sales Channels

### Supported channels

- Online storefront
- Mobile app
- POS
- WhatsApp
- Instagram/Facebook shop
- Google Shopping
- Amazon
- Flipkart
- Meesho
- ONDC
- B2B portal
- Custom API channel

### Channel-specific settings

- Product visibility
- Pricing
- Inventory allocation
- Tax rules
- Shipping rules
- Payment methods
- Order sync
- Return sync
- Catalog feed
- Channel analytics

---

## 6.21 Marketing

### Marketing modules

- Campaigns
- Email marketing
- SMS marketing
- WhatsApp marketing
- Push notifications
- Abandoned cart recovery
- Win-back campaigns
- Product recommendations
- Coupons
- Referral program
- Affiliate program
- Loyalty program
- Customer segmentation
- Landing pages
- Forms/popups
- UTM tracking

### Automation examples

```txt
IF customer abandons cart for 2 hours
THEN send WhatsApp reminder
WAIT 24 hours
IF still no order
THEN send 10% coupon
```

```txt
IF customer placed 3 orders
AND total spent > ₹10,000
THEN tag as VIP
AND send loyalty reward
```

```txt
IF product inventory < 5
THEN notify purchase manager
AND create draft purchase order
```

---

## 6.22 SEO

### SEO features

- Product SEO
- Collection SEO
- Page SEO
- Blog SEO
- Canonical URL
- Robots settings
- Sitemap generation
- Redirect manager
- 404 monitor
- Meta title/description
- Open Graph image
- Schema markup
- Product structured data
- Breadcrumb schema
- FAQ schema
- Review schema
- URL handle management
- Bulk SEO editor
- AI SEO suggestions

---

## 6.23 Reviews and UGC

### Review features

- Product reviews
- Photo reviews
- Video reviews
- Review moderation
- Verified buyer badge
- Review request email
- Review request WhatsApp
- Rating summary
- Review filters
- Review import/export
- Review reply
- Review incentives
- Abuse reporting
- Q&A module

---

## 6.24 Analytics and Reports

### Analytics modules

- Revenue analytics
- Order analytics
- Product analytics
- Customer analytics
- Inventory analytics
- Marketing analytics
- Checkout funnel
- Search analytics
- Refund analytics
- Return analytics
- Channel analytics
- Staff activity analytics
- Fraud analytics
- Cohort analysis
- LTV analysis

### Reports

- Sales by date
- Sales by product
- Sales by collection
- Sales by channel
- Sales by location
- Sales by customer group
- Tax report
- GST report
- Inventory valuation
- Low stock report
- Payment reconciliation
- Refund report
- Return reason report
- Discount usage report
- Marketing ROI report
- Abandoned checkout report

### Export formats

- CSV
- Excel
- PDF
- Scheduled email
- API export
- Webhook export

---

## 6.25 App / Plugin System

### Why plugin system is important

Shopify became powerful because apps extend the core platform. This system should have a plugin architecture from day one.

### Plugin types

- Payment plugin
- Shipping plugin
- Tax plugin
- Marketing plugin
- Analytics plugin
- Search plugin
- Product extension plugin
- Checkout extension plugin
- Admin UI extension plugin
- Storefront extension plugin
- Automation action plugin
- Report plugin
- Import/export plugin
- Marketplace connector plugin

### Plugin capabilities

A plugin can:

- Register backend routes
- Register admin UI pages
- Register admin sidebar items
- Register webhooks
- Register automation triggers/actions
- Register checkout blocks
- Register validation rules
- Register payment methods
- Register shipping methods
- Register custom fields
- Register product tabs
- Register order tabs
- Register customer tabs
- Listen to events
- Emit events
- Store plugin settings
- Request permission scopes

### Plugin permission scopes

Examples:

```txt
read_products
write_products
read_orders
write_orders
read_customers
write_customers
read_discounts
write_discounts
read_inventory
write_inventory
read_payments
write_payments
read_checkouts
write_checkouts
read_content
write_content
read_analytics
write_webhooks
admin_ui_extension
checkout_extension
storefront_extension
```

### Plugin manifest

```json
{
  "name": "Razorpay Payments",
  "slug": "payment-razorpay",
  "version": "1.0.0",
  "description": "Accept UPI, cards, netbanking, wallets and Razorpay payments.",
  "author": "Your Company",
  "permissions": [
    "read_orders",
    "write_payments",
    "read_checkouts"
  ],
  "adminPages": [
    {
      "title": "Razorpay Settings",
      "path": "/apps/razorpay/settings"
    }
  ],
  "events": [
    "checkout.payment_requested",
    "payment.refund_requested"
  ],
  "webhooks": [
    "payment.succeeded",
    "payment.failed"
  ]
}
```

### Plugin marketplace

- Public apps
- Private apps
- Internal apps
- Paid apps
- Free apps
- App reviews
- App permissions screen
- App install/uninstall
- App settings
- App billing
- App audit logs
- App versioning
- App compatibility
- App health status

---

## 6.26 Automation Builder

### Goal

Create a Shopify Flow-like workflow builder.

### Automation structure

```txt
Trigger → Conditions → Actions
```

### Trigger examples

- Order created
- Order paid
- Order cancelled
- Refund created
- Customer created
- Customer tagged
- Product low stock
- Cart abandoned
- Return requested
- Review submitted
- Payment failed
- Shipment delayed
- Subscription payment failed

### Condition examples

- Order value > ₹5000
- Customer tag = VIP
- Product collection = Shoes
- Inventory quantity < 10
- Country = India
- Payment method = COD
- Customer total orders > 3

### Action examples

- Send email
- Send WhatsApp
- Add customer tag
- Add order tag
- Create task
- Notify staff
- Create discount
- Create purchase order
- Hold order
- Cancel order
- Create webhook call
- Update metafield
- Trigger plugin action

---

## 6.27 AI Assistant

### AI features

- Product description generation
- SEO title/description generation
- Product image alt text generation
- Smart collection suggestions
- Discount campaign ideas
- Customer segment recommendations
- Fraud risk explanation
- Inventory reorder suggestions
- Support reply suggestions
- Order issue summary
- Review sentiment analysis
- Marketing campaign generator
- Dashboard insight summary

### AI safety

- AI should never directly refund/cancel/delete without confirmation.
- AI must show sources/data used.
- AI suggestions should be editable.
- AI actions must pass permission checks.
- AI actions must be logged.
- AI should not expose private customer/payment data to unauthorized staff.

---

## 7. Database Design

## 7.1 Multi-tenant strategy

Every core document must include:

```ts
tenantId: ObjectId
storeId: ObjectId
```

This prevents data leakage between stores.

### Required tenant guards

- Every query must filter by tenantId.
- Every mutation must verify tenantId.
- Every aggregation must start with tenant match.
- Every webhook must resolve tenant safely.
- Every background job must include tenantId.
- Every audit log must include tenantId.
- Every plugin request must include tenant context.

---

## 7.2 Core collections

### Tenant

```ts
{
  _id,
  name,
  slug,
  plan,
  status,
  ownerUserId,
  billingEmail,
  createdAt,
  updatedAt
}
```

### Store

```ts
{
  _id,
  tenantId,
  name,
  slug,
  primaryDomain,
  defaultCurrency,
  defaultCountry,
  timezone,
  status,
  settings,
  createdAt,
  updatedAt
}
```

### User

```ts
{
  _id,
  tenantId,
  name,
  email,
  phone,
  passwordHash,
  avatarUrl,
  status,
  roles,
  permissions,
  lastLoginAt,
  twoFactorEnabled,
  createdAt,
  updatedAt
}
```

### Role

```ts
{
  _id,
  tenantId,
  name,
  description,
  permissions,
  isSystemRole,
  createdAt,
  updatedAt
}
```

### Product

```ts
{
  _id,
  tenantId,
  storeId,
  title,
  slug,
  description,
  shortDescription,
  status,
  productType,
  vendor,
  brand,
  tags,
  collections,
  options,
  media,
  seo,
  metafields,
  salesChannels,
  publishedAt,
  scheduledAt,
  createdAt,
  updatedAt
}
```

### ProductVariant

```ts
{
  _id,
  tenantId,
  storeId,
  productId,
  title,
  sku,
  barcode,
  optionValues,
  price,
  compareAtPrice,
  costPrice,
  currency,
  taxable,
  taxClassId,
  weight,
  dimensions,
  inventoryItemId,
  media,
  metafields,
  status,
  createdAt,
  updatedAt
}
```

### InventoryItem

```ts
{
  _id,
  tenantId,
  storeId,
  sku,
  tracked,
  requiresShipping,
  countryOfOrigin,
  harmonizedSystemCode,
  cost,
  createdAt,
  updatedAt
}
```

### InventoryLevel

```ts
{
  _id,
  tenantId,
  storeId,
  inventoryItemId,
  locationId,
  onHand,
  reserved,
  committed,
  available,
  incoming,
  damaged,
  updatedAt
}
```

### InventoryLedger

```ts
{
  _id,
  tenantId,
  storeId,
  inventoryItemId,
  locationId,
  type,
  quantityDelta,
  reason,
  referenceType,
  referenceId,
  before,
  after,
  createdBy,
  createdAt
}
```

### Customer

```ts
{
  _id,
  tenantId,
  storeId,
  firstName,
  lastName,
  email,
  phone,
  addresses,
  tags,
  customerGroupIds,
  acceptsMarketing,
  acceptsWhatsApp,
  acceptsSms,
  totalSpent,
  ordersCount,
  lastOrderAt,
  walletBalance,
  loyaltyPoints,
  metafields,
  createdAt,
  updatedAt
}
```

### Cart

```ts
{
  _id,
  tenantId,
  storeId,
  customerId,
  anonymousId,
  lines,
  currency,
  region,
  discounts,
  shippingAddress,
  billingAddress,
  attributes,
  expiresAt,
  createdAt,
  updatedAt
}
```

### Checkout

```ts
{
  _id,
  tenantId,
  storeId,
  cartId,
  customerId,
  token,
  status,
  lines,
  pricingSnapshot,
  taxSnapshot,
  shippingSnapshot,
  paymentSession,
  validationErrors,
  completedAt,
  expiresAt,
  createdAt,
  updatedAt
}
```

### Order

```ts
{
  _id,
  tenantId,
  storeId,
  orderNumber,
  customerId,
  email,
  phone,
  status,
  paymentStatus,
  fulfillmentStatus,
  returnStatus,
  currency,
  lines,
  subtotal,
  discountTotal,
  shippingTotal,
  taxTotal,
  grandTotal,
  paidTotal,
  refundedTotal,
  billingAddress,
  shippingAddress,
  paymentIds,
  fulfillmentIds,
  tags,
  notes,
  timeline,
  risk,
  source,
  createdAt,
  updatedAt
}
```

### Payment

```ts
{
  _id,
  tenantId,
  storeId,
  orderId,
  provider,
  providerPaymentId,
  status,
  amount,
  currency,
  method,
  gatewayResponse,
  capturedAt,
  failedAt,
  refundedAmount,
  createdAt,
  updatedAt
}
```

### Refund

```ts
{
  _id,
  tenantId,
  storeId,
  orderId,
  paymentId,
  amount,
  reason,
  status,
  providerRefundId,
  lineItems,
  createdBy,
  createdAt,
  updatedAt
}
```

### Fulfillment

```ts
{
  _id,
  tenantId,
  storeId,
  orderId,
  locationId,
  status,
  lineItems,
  provider,
  trackingCompany,
  trackingNumber,
  trackingUrl,
  shippedAt,
  deliveredAt,
  createdAt,
  updatedAt
}
```

### Discount

```ts
{
  _id,
  tenantId,
  storeId,
  title,
  code,
  type,
  value,
  conditions,
  eligibility,
  usageLimits,
  combinationRules,
  startsAt,
  endsAt,
  status,
  createdAt,
  updatedAt
}
```

### WebhookEndpoint

```ts
{
  _id,
  tenantId,
  storeId,
  url,
  events,
  secret,
  status,
  failureCount,
  lastDeliveryAt,
  createdAt,
  updatedAt
}
```

### AuditLog

```ts
{
  _id,
  tenantId,
  storeId,
  actorUserId,
  actorType,
  action,
  resourceType,
  resourceId,
  before,
  after,
  ip,
  userAgent,
  createdAt
}
```

---

## 8. API Design

## 8.1 Admin REST API examples

```txt
POST   /api/admin/auth/login
POST   /api/admin/auth/refresh
POST   /api/admin/auth/logout

GET    /api/admin/dashboard/summary

GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/:id
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id
POST   /api/admin/products/:id/duplicate
POST   /api/admin/products/bulk-update
POST   /api/admin/products/import
GET    /api/admin/products/export

GET    /api/admin/orders
POST   /api/admin/orders/draft
GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id
POST   /api/admin/orders/:id/cancel
POST   /api/admin/orders/:id/refund
POST   /api/admin/orders/:id/fulfill
POST   /api/admin/orders/:id/return
POST   /api/admin/orders/:id/exchange

GET    /api/admin/customers
POST   /api/admin/customers
GET    /api/admin/customers/:id
PATCH  /api/admin/customers/:id

GET    /api/admin/discounts
POST   /api/admin/discounts
PATCH  /api/admin/discounts/:id
DELETE /api/admin/discounts/:id

GET    /api/admin/inventory
POST   /api/admin/inventory/adjust
POST   /api/admin/inventory/transfer
GET    /api/admin/inventory/ledger

GET    /api/admin/apps
POST   /api/admin/apps/install
DELETE /api/admin/apps/:id/uninstall

GET    /api/admin/settings
PATCH  /api/admin/settings
```

## 8.2 Storefront API examples

```txt
GET    /api/storefront/products
GET    /api/storefront/products/:slug
GET    /api/storefront/collections
GET    /api/storefront/collections/:slug

POST   /api/storefront/cart
GET    /api/storefront/cart/:cartId
POST   /api/storefront/cart/:cartId/items
PATCH  /api/storefront/cart/:cartId/items/:lineId
DELETE /api/storefront/cart/:cartId/items/:lineId
POST   /api/storefront/cart/:cartId/discounts

POST   /api/storefront/checkout
GET    /api/storefront/checkout/:token
PATCH  /api/storefront/checkout/:token/address
PATCH  /api/storefront/checkout/:token/shipping
POST   /api/storefront/checkout/:token/payment
POST   /api/storefront/checkout/:token/complete

POST   /api/storefront/customers/register
POST   /api/storefront/customers/login
GET    /api/storefront/customers/me
GET    /api/storefront/customers/me/orders
```

## 8.3 Webhook events

```txt
product.created
product.updated
product.deleted
inventory.low_stock
inventory.adjusted
customer.created
customer.updated
cart.abandoned
checkout.created
checkout.completed
order.created
order.paid
order.cancelled
order.fulfilled
order.refunded
return.requested
review.created
payment.succeeded
payment.failed
app.installed
app.uninstalled
```

---

## 9. Security Requirements

## 9.1 Authentication

- JWT access token
- Refresh token rotation
- Refresh token reuse detection
- Device/session list
- Logout from all devices
- Password reset
- Email verification
- OTP login optional
- 2FA for admins
- Staff invitation flow
- API key auth for private apps
- OAuth for public apps

## 9.2 Authorization

- Role-based access control
- Permission-based access control
- Store-level permissions
- App-level permission scopes
- Field-level permissions where needed
- Route guards
- API middleware checks
- UI permission hiding is not enough; backend must enforce permissions

## 9.3 Data isolation

- Mandatory tenantId filter
- Mandatory storeId filter
- Query helper to prevent missing tenant filters
- Aggregation guard
- Worker job tenant guard
- Webhook tenant guard
- Plugin tenant guard

## 9.4 High-risk actions

Require confirmation and audit logs for:

- Delete product
- Delete customer
- Cancel order
- Refund payment
- Disable payment method
- Disable plugin
- Export customers
- Export orders
- Add staff user
- Change staff permissions
- Change payment settings
- Change domain
- Change tax settings
- Bulk delete
- Bulk price update

## 9.5 Webhook security

- Signed payloads
- Timestamp validation
- Replay prevention
- Retry with exponential backoff
- Delivery logs
- Dead-letter queue
- Secret rotation

## 9.6 Payment security

- Never store raw card details
- Verify provider webhooks
- Idempotency keys
- Duplicate event prevention
- Payment state machine
- Refund permission checks
- Refund reason required
- Gateway logs masked

## 9.7 File upload security

- MIME validation
- Extension validation
- File size limit
- Image processing sandbox
- Virus scanning
- Private bucket for sensitive files
- Signed URLs
- CDN public files only where safe
- No executable uploads

## 9.8 Compliance

- GDPR-style data export
- Customer deletion/anonymization
- Consent tracking
- Cookie consent support
- Tax invoice retention
- Audit log retention
- Staff access logs

---

## 10. Performance and Scalability

## 10.1 Backend performance

- Pagination everywhere
- Cursor pagination for large collections
- Indexes on tenantId/storeId
- Compound indexes for common filters
- Redis caching for storefront data
- CDN for media
- Queue slow jobs
- Avoid heavy synchronous work
- Use aggregation carefully
- Precompute analytics where needed
- Use read replicas if needed
- Background sync for integrations

## 10.2 MongoDB index examples

```ts
Product.index({ tenantId: 1, storeId: 1, status: 1, slug: 1 });
Product.index({ tenantId: 1, storeId: 1, tags: 1 });
Product.index({ tenantId: 1, storeId: 1, collections: 1 });

Order.index({ tenantId: 1, storeId: 1, createdAt: -1 });
Order.index({ tenantId: 1, storeId: 1, status: 1 });
Order.index({ tenantId: 1, storeId: 1, customerId: 1 });

Customer.index({ tenantId: 1, storeId: 1, email: 1 });
Customer.index({ tenantId: 1, storeId: 1, phone: 1 });

InventoryLevel.index({ tenantId: 1, storeId: 1, inventoryItemId: 1, locationId: 1 });
```

## 10.3 Admin performance

- Server-side pagination
- Debounced search
- Virtualized tables
- Optimistic updates only where safe
- Skeleton loading
- Keep forms split into tabs
- Lazy-load heavy modules
- Cache dropdown options
- Avoid fetching entire product/order database
- Use saved views

## 10.4 Storefront performance

- Public product cache
- Collection cache
- Price cache per market/customer group
- Cart/checkout must stay fresh
- Inventory reservation must be atomic
- CDN images
- API rate limits
- Edge caching for public content

---

## 11. Event-Driven Architecture

### Why events

Many actions should not happen inside the main request cycle.

Example:

```txt
Order paid
→ Deduct inventory
→ Create fulfillment task
→ Send confirmation email
→ Send WhatsApp message
→ Fire webhook
→ Update analytics
→ Notify admin
```

### Event bus

Use an internal event bus with Redis/BullMQ.

### Event payload standard

```ts
{
  eventId: string;
  eventName: string;
  tenantId: string;
  storeId: string;
  resourceType: string;
  resourceId: string;
  occurredAt: string;
  actor?: {
    type: "user" | "customer" | "system" | "app";
    id?: string;
  };
  data: Record<string, unknown>;
}
```

---

## 12. Admin Pages — Detailed Requirements

## 12.1 Products page

### Must include

- Product table
- Search
- Filter by status
- Filter by collection
- Filter by vendor
- Filter by product type
- Filter by channel
- Filter by inventory status
- Saved views
- Bulk edit
- Bulk publish/unpublish
- Bulk delete with confirmation
- Import
- Export
- New product button

### Product table columns

- Product image
- Product name
- Status
- Inventory
- Category/collection
- Vendor
- Price
- Sales channels
- Created date
- Updated date

---

## 12.2 Product editor

### Layout

Tabs:

1. General
2. Media
3. Pricing
4. Inventory
5. Variants
6. Shipping
7. SEO
8. Metafields
9. Channels
10. Advanced

### Important UX

- Autosave draft option
- Unsaved changes warning
- Product preview
- SEO preview
- Variant matrix editor
- Drag/drop media sorting
- Bulk variant price update
- Product completeness indicator
- Duplicate product

---

## 12.3 Orders page

### Must include

- Order table
- Search by order number/customer/email/phone
- Filter by payment status
- Filter by fulfillment status
- Filter by return status
- Filter by channel
- Filter by date
- Saved views
- Bulk fulfill
- Bulk print invoice
- Bulk export
- Fraud/risk filter

### Order table columns

- Order number
- Date
- Customer
- Channel
- Payment status
- Fulfillment status
- Total
- Items
- Risk
- Tags

---

## 12.4 Order detail page

### Sections

- Order summary
- Timeline
- Customer card
- Shipping address
- Billing address
- Payment card
- Fulfillment card
- Return/refund card
- Line items
- Notes
- Tags
- Staff comments
- Fraud/risk analysis
- Webhook/app activity

### Actions

- Capture payment
- Mark as paid
- Fulfill
- Add tracking
- Print invoice
- Print packing slip
- Send email
- Refund
- Cancel
- Edit
- Create return
- Create exchange
- Archive

---

## 12.5 Customers page

### Must include

- Search
- Segments
- Filters
- Customer table
- Import/export
- Bulk tag
- Bulk email/WhatsApp campaign
- Create customer

### Customer detail

- Profile
- Orders
- Timeline
- Addresses
- Notes
- Tags
- Loyalty
- Wallet
- Marketing consent
- Support notes

---

## 12.6 Checkout builder

### Must include

- Checkout step settings
- Custom fields
- Checkout blocks
- Payment method rules
- Shipping method rules
- Cart validation rules
- Upsell/cross-sell blocks
- Thank-you page blocks
- Preview mode
- Test checkout

---

## 12.7 Plugin marketplace page

### Must include

- Installed apps
- Available apps
- Private apps
- App details
- Permission scopes
- Install flow
- Uninstall flow
- App settings
- App logs
- App billing
- App health

---

## 13. UX Components to Build with shadcn/ui

### Core components

- App sidebar
- Topbar
- Breadcrumbs
- Command palette
- Data table
- Saved views
- Filter builder
- Date range picker
- Metric cards
- Chart cards
- Empty states
- Confirm dialog
- Danger dialog
- Sheet forms
- Drawer details
- Toast notifications
- Status badges
- Timeline
- Activity feed
- Stepper
- Tabs
- Accordion
- Combobox
- Multi-select
- Tag input
- File uploader
- Rich text editor wrapper
- JSON editor
- Rule builder
- Permission matrix
- Audit log viewer

### Component standards

Every list page should use the same pattern:

```txt
Page header
→ Primary action
→ Search
→ Filters
→ Saved views
→ Table
→ Bulk actions
→ Pagination
```

Every detail page should use:

```txt
Header with title/status/actions
→ Main content
→ Right sidebar summary
→ Timeline/audit trail
```

Every form should use:

```txt
Zod schema
React Hook Form
Field-level validation
Dirty state
Confirmation on leave
Toast on save
```

---

## 14. Development Roadmap

## Phase 0 — Planning and foundation

- Finalize product scope
- Define domain models
- Create monorepo
- Setup TypeScript
- Setup ESLint/Prettier
- Setup Docker Compose
- Setup MongoDB
- Setup Redis
- Setup env system
- Setup logging
- Setup error handling
- Setup OpenAPI docs
- Setup shadcn/ui
- Setup base layout

### Deliverable

A running admin shell and API server.

---

## Phase 1 — Authentication, tenant, staff, roles

- Login
- Logout
- Refresh token
- Staff invitations
- Tenant creation
- Store creation
- Role model
- Permission model
- Route guards
- Audit logs
- Settings base

### Deliverable

Secure admin access with multi-tenant foundation.

---

## Phase 2 — Products and collections

- Product CRUD
- Variant CRUD
- Media upload
- Collections
- Tags
- SEO fields
- Product import/export
- Product table
- Product editor
- Custom fields/metafields

### Deliverable

Merchant can manage a real catalog.

---

## Phase 3 — Inventory

- Locations
- Inventory items
- Inventory levels
- Inventory ledger
- Stock adjustment
- Stock transfer
- Low stock alert
- Purchase order base

### Deliverable

Merchant can track inventory correctly.

---

## Phase 4 — Customers and carts

- Customer CRUD
- Customer groups
- Customer tags
- Storefront cart API
- Cart merge
- Cart discounts
- Cart validations
- Cart expiry

### Deliverable

Storefront can create and manage carts.

---

## Phase 5 — Checkout

- Checkout session
- Address handling
- Shipping selection
- Tax calculation base
- Payment session base
- Checkout completion
- Order creation
- Checkout validation rules

### Deliverable

A basic storefront can complete checkout and create orders.

---

## Phase 6 — Orders and payments

- Order list
- Order detail
- Payment providers
- Razorpay plugin
- Stripe plugin
- Payment webhooks
- Refunds
- Order cancellation
- Draft orders

### Deliverable

Merchant can process and manage orders.

---

## Phase 7 — Shipping and fulfillment

- Shipping zones
- Shipping rates
- Fulfillment creation
- Tracking
- Shipping provider plugin base
- Packing slip
- Invoice generation

### Deliverable

Merchant can fulfill orders.

---

## Phase 8 — Discounts and pricing engine

- Discount CRUD
- Coupon codes
- Automatic discounts
- Rule builder
- Discount conflict engine
- Price lists
- Customer group pricing
- Market/channel pricing

### Deliverable

Merchant can run advanced promotions.

---

## Phase 9 — Marketing and automation

- Email templates
- WhatsApp templates
- Campaigns
- Abandoned cart
- Automation builder
- Customer segmentation
- Loyalty base

### Deliverable

Merchant can automate marketing flows.

---

## Phase 10 — Apps and plugins

- Plugin manifest
- Plugin install/uninstall
- Plugin permissions
- Plugin settings
- Webhook system
- Admin UI extension points
- Checkout extension points
- Plugin marketplace UI

### Deliverable

Developers can extend the platform.

---

## Phase 11 — Analytics and reports

- Sales dashboard
- Product analytics
- Customer analytics
- Inventory analytics
- Checkout funnel
- Report builder
- Export/scheduled reports

### Deliverable

Merchant can understand business performance.

---

## Phase 12 — Enterprise features

- Multi-store
- Multi-market
- Multi-currency
- Multi-language
- B2B
- Subscriptions
- Advanced workflow approvals
- Advanced audit/compliance
- SLA monitoring
- White-label mode

### Deliverable

Platform can support agencies and larger brands.

---

## 15. MVP Scope

Do not try to build everything in the first version.

### MVP must include

1. Authentication
2. Tenant/store setup
3. Staff roles
4. Products
5. Variants
6. Collections
7. Media upload
8. Basic inventory
9. Customers
10. Cart API
11. Checkout API
12. Razorpay payment
13. COD payment
14. Orders
15. Order status management
16. Basic shipping rates
17. Basic discounts
18. Basic dashboard
19. Audit logs
20. Storefront demo integration

### MVP should not include immediately

- Full app marketplace
- Advanced automation builder
- B2B
- Subscriptions
- AI assistant
- POS
- Multi-country tax engine
- Enterprise approval workflows
- Advanced analytics warehouse

These can come after the core commerce flow is stable.

---

## 16. Non-negotiable Engineering Rules

1. Do not build UI-only features without backend logic.
2. Every mutation must have validation.
3. Every sensitive action must have permission checks.
4. Every cross-tenant query must be impossible by design.
5. Every payment webhook must be verified.
6. Every order financial change must be auditable.
7. Every inventory change must write to inventory ledger.
8. Every plugin must declare permission scopes.
9. Every public API must have rate limiting.
10. Every list API must use pagination.
11. Every file upload must be validated.
12. Every background job must be idempotent.
13. Every integration must have retry/error logging.
14. Every setting change must create an audit log.
15. Never trust frontend-calculated prices.
16. Never trust frontend-calculated tax.
17. Never trust frontend-calculated shipping.
18. Never trust frontend product availability.
19. Price, tax, shipping, and inventory must be recalculated server-side.
20. Keep core commerce logic independent from UI.

---

## 17. Testing Strategy

### Unit tests

- Pricing engine
- Discount engine
- Tax engine
- Inventory calculations
- Order state machine
- Payment state machine
- Permission checks
- Cart validation
- Checkout validation

### Integration tests

- Product create/update
- Cart to checkout
- Checkout to order
- Payment webhook to paid order
- Refund flow
- Inventory deduction
- Discount application
- Shipping rate calculation
- Webhook delivery

### E2E tests

- Admin login
- Create product
- Create collection
- Place order from storefront
- Pay order
- Fulfill order
- Refund order
- Create discount
- Apply discount
- Staff permission restrictions

### Security tests

- Tenant isolation
- IDOR prevention
- Auth bypass
- Permission bypass
- File upload validation
- Rate limits
- Webhook signature verification
- Payment webhook replay attack

---

## 18. Example Environment Variables

```env
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:3000
API_URL=http://localhost:5000

MONGODB_URI=mongodb://localhost:27017/commerce-os
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

EMAIL_PROVIDER=smtp
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

WHATSAPP_PROVIDER=
WHATSAPP_API_KEY=

SENTRY_DSN=
```

---

## 19. Initial Setup Commands

```bash
# Clone project
git clone <repo-url>
cd commerce-os

# Install dependencies
npm install

# Copy env
cp .env.example .env

# Run local services
docker compose up -d mongodb redis

# Run API
npm run dev --workspace apps/api

# Run admin
npm run dev --workspace apps/admin

# Run worker
npm run dev --workspace apps/worker
```

---

## 20. Suggested API Response Format

```ts
{
  success: true,
  data: {},
  meta: {
    requestId: "req_123",
    pagination: {
      page: 1,
      limit: 20,
      total: 100
    }
  }
}
```

Error format:

```ts
{
  success: false,
  error: {
    code: "PRODUCT_NOT_FOUND",
    message: "Product not found.",
    details: {}
  },
  meta: {
    requestId: "req_123"
  }
}
```

---

## 21. Status Badge System

| Status | Badge |
|---|---|
| Active | Green |
| Draft | Gray |
| Archived | Gray |
| Paid | Green |
| Pending payment | Amber |
| Failed | Red |
| Fulfilled | Green |
| Unfulfilled | Amber |
| Cancelled | Red |
| Refunded | Gray |
| Low stock | Amber |
| Out of stock | Red |
| Installed | Green |
| Disabled | Gray |
| Critical error | Red |

---

## 22. Future Advanced Ideas

- Visual checkout builder
- Shopify-like Functions engine
- Serverless plugin runtime
- AI product merchandising
- AI customer segmentation
- AI support assistant
- AI fraud explanation
- AI SEO optimizer
- AI inventory forecasting
- Product recommendation engine
- Personalization engine
- Built-in A/B testing
- Native POS app
- Native mobile admin app
- Marketplace seller panel
- Vendor/multi-seller marketplace
- Dropshipping supplier module
- ERP connector
- Accounting connector
- ONDC connector
- GST e-invoice connector
- Warehouse mobile scanner app
- White-label SaaS billing
- Theme marketplace
- Plugin marketplace
- Developer portal

---

## 23. Best First Implementation Order

For the first build, implement in this order:

1. Monorepo setup
2. Admin layout with shadcn/ui
3. Auth
4. Tenant/store system
5. Role/permission system
6. Product model
7. Product list page
8. Product editor
9. Media upload
10. Collection system
11. Inventory model
12. Customer model
13. Cart API
14. Checkout API
15. Basic order creation
16. COD payment
17. Razorpay payment
18. Order admin page
19. Fulfillment basics
20. Dashboard basics
21. Audit logs
22. Storefront demo

Only after these are stable, start plugins, automation, B2B, subscriptions, and advanced analytics.

---

## 24. Build Philosophy

This project must be built like a real commerce platform, not like a simple CRUD admin.

### Commerce rules

- Product data is important.
- Price calculation must be centralized.
- Tax calculation must be centralized.
- Discount calculation must be centralized.
- Inventory must be ledger-based.
- Orders must be immutable where financial records are involved.
- Payment webhooks must be idempotent.
- Refunds must be controlled.
- Plugins must not bypass security.
- Storefront APIs must be fast.
- Admin APIs must be permission-safe.
- Every business action should be traceable.

### Final vision

The final product should allow a merchant or agency to say:

> “I can connect any frontend, customize my checkout, install plugins, manage products/orders/inventory/customers, automate my store, and scale without being locked into one storefront.”

That is the core purpose of this platform.


---

# V2 Enhancement Addendum — Missing Items, Corrections, and Required Upgrades

This addendum improves the original README after reviewing it against the updated product requirement:

> Build a Shopify-level or beyond-Shopify headless e-commerce admin that can connect to any frontend, including mobile apps, and can enable or disable features/add-ons per client/store. Payments should not depend only on Razorpay; the platform should support many gateways through a payment orchestration layer.

---

## A. Audit Verdict

The current README is a very strong base for a serious headless e-commerce platform. It correctly covers products, collections, inventory, pricing, discounts, cart, checkout, orders, fulfillment, customers, marketing, analytics, plugins, automation, security, and roadmap.

However, it is still incomplete for the final SaaS/agency product vision.

### Main gaps

1. **Feature add-on system is missing.**
   - The README says plugins exist, but it does not define a proper feature entitlement system where you can enable/disable modules per client.
   - This is critical for your business model because one client may need only Products + Orders + Razorpay, while another may need B2B + Subscriptions + ONDC + WhatsApp + Advanced Analytics.

2. **Mobile app frontend connection is not detailed enough.**
   - The README mentions mobile apps as supported frontends, but it does not define mobile SDKs, mobile sales channels, mobile app tokens, deep links, push notifications, app versioning, or mobile checkout flows.

3. **Payments are too basic.**
   - Current section lists gateways, but the architecture is only a provider adapter.
   - A serious platform needs a **payment orchestration layer** with smart routing, fallback gateway, retry rules, settlement reconciliation, dispute handling, payout support, subscription mandate handling, refunds, COD verification, fraud controls, and gateway-level feature toggles.

4. **Plugin system needs more safety.**
   - It mentions plugin permissions, but does not define sandboxing, app review, app billing, extension runtime isolation, API rate limits per app, app version compatibility, or marketplace approval workflow.

5. **Billing and SaaS plan management are underdeveloped.**
   - There is no strong billing model for your own clients.
   - You need plans, usage limits, add-on billing, trial periods, invoices, and feature locks.

6. **Mobile admin app / merchant app is missing.**
   - Storefront mobile app is one side.
   - Merchants may also want a mobile admin app to manage orders, payments, refunds, inventory, and notifications.

7. **Payment compliance is not enough.**
   - Need PCI-safe design, RBI/India recurring payment considerations, webhook replay protection, masked logs, payment data retention policy, settlement reconciliation, and dispute evidence management.

8. **No clear module dependency system.**
   - Example: Subscriptions require Customers + Products + Payments + Orders + Notifications.
   - B2B requires Customers + Pricing + Approvals + Payments.
   - Marketplace requires Vendors + Payouts + Commission + Settlement.

9. **No frontend channel token model.**
   - Every frontend should have its own channel/app key, allowed origins, API scopes, rate limits, status, and analytics attribution.

10. **No client onboarding / provisioning flow.**
    - Agency owner should be able to create a client store, choose modules, choose payment gateways, assign domain/frontend, invite staff, and launch.

---

## B. Corrected Product Positioning

### Original positioning

> Headless e-commerce admin panel like Shopify.

### Better positioning

> A modular, API-first, multi-tenant commerce operating system where each client can run a custom e-commerce backend, connect any frontend or mobile app, and activate only the features, payment gateways, sales channels, and workflows they need.

This should be treated as:

```txt
Shopify-like Admin
+ Headless Commerce APIs
+ Plugin Marketplace
+ Client-wise Add-ons
+ Payment Orchestration
+ Mobile App Ready APIs
+ Agency Control Panel
+ White-label SaaS Billing
```

---

## C. Required New Core Module: Feature Add-ons / Entitlement System

### Purpose

The platform owner or agency admin must be able to enable or disable features for each client/store.

Example:

```txt
Client A: Products + Orders + COD + Razorpay
Client B: Products + Orders + Inventory + Shiprocket + WhatsApp
Client C: B2B + GST + Multi-location + Cashfree + PayU + ERP
Client D: Mobile App + Loyalty + Wallet + Push Notifications
```

### Feature system levels

There should be three layers:

1. **Platform features**
   - Built into the main system.
   - Example: Products, Orders, Customers, Inventory, Reports.

2. **Add-ons**
   - Optional paid modules.
   - Example: B2B, Subscriptions, Loyalty, Advanced Analytics, Automation Builder.

3. **Plugins / Apps**
   - External or custom extension packages.
   - Example: Razorpay, Cashfree, Shiprocket, WhatsApp provider, ERP connector.

### Feature states

```txt
available      = platform supports this feature
enabled        = enabled for this tenant/store
disabled       = disabled for this tenant/store
trial          = enabled temporarily
locked         = visible but not usable because plan does not include it
deprecated     = no longer available for new clients
beta           = available only for selected clients
maintenance    = temporarily disabled due to issue
```

### Feature category examples

```txt
Core Commerce
├── products
├── collections
├── inventory
├── customers
├── cart
├── checkout
├── orders
├── fulfillment
└── basic_reports

Advanced Commerce
├── b2b
├── subscriptions
├── gift_cards
├── wallet
├── loyalty
├── marketplace
├── multi_vendor
├── product_personalization
├── rental_products
└── digital_products

Marketing
├── coupons
├── abandoned_cart
├── email_campaigns
├── sms_campaigns
├── whatsapp_campaigns
├── referrals
├── affiliates
└── automation_builder

Sales Channels
├── web_storefront
├── mobile_app
├── pos
├── whatsapp_store
├── instagram_facebook
├── google_shopping
├── amazon
├── flipkart
├── meesho
├── ondc
└── custom_api_channel

Payments
├── cod
├── manual_payment
├── razorpay
├── cashfree
├── stripe
├── paypal
├── phonepe
├── payu
├── ccavenue
├── juspay_orchestration
├── hyperswitch
├── adyen
├── checkout_com
├── paytm
├── billdesk
├── instamojo
├── easebuzz
├── hdfc_smartgateway
├── icici_eazypay
└── bank_transfer

Operations
├── shipping_integrations
├── returns_exchanges
├── rma
├── warehouse_management
├── purchase_orders
├── supplier_management
└── barcode_scanning

Compliance
├── gst_reports
├── gst_invoice
├── e_invoice
├── e_way_bill
├── gdpr_export_delete
├── consent_manager
└── audit_logs
```

### Required database models

#### FeatureDefinition

```ts
{
  _id,
  key: "subscriptions",
  name: "Subscriptions",
  description: "Recurring orders and subscription billing.",
  category: "advanced_commerce",
  type: "platform_feature" | "addon" | "plugin_feature",
  status: "available" | "beta" | "deprecated",
  defaultEnabled: false,
  requiredPlanKeys: ["growth", "enterprise"],
  dependencies: ["products", "customers", "orders", "payments"],
  conflicts: [],
  createdAt,
  updatedAt
}
```

#### TenantFeature

```ts
{
  _id,
  tenantId,
  storeId,
  featureKey: "subscriptions",
  status: "enabled" | "disabled" | "trial" | "locked",
  enabledBy,
  enabledAt,
  disabledBy,
  disabledAt,
  trialEndsAt,
  settings: {},
  limits: {
    maxOrdersPerMonth,
    maxProducts,
    maxStaffUsers,
    maxLocations,
    maxApiCallsPerMonth
  },
  createdAt,
  updatedAt
}
```

#### Addon

```ts
{
  _id,
  key: "advanced_analytics",
  name: "Advanced Analytics",
  priceMonthly,
  priceYearly,
  currency,
  includedFeatures: ["cohort_analysis", "ltv_report", "custom_reports"],
  status,
  createdAt,
  updatedAt
}
```

### Required backend service

```ts
class FeatureGateService {
  isEnabled(tenantId, storeId, featureKey): Promise<boolean>;
  requireFeature(tenantId, storeId, featureKey): Promise<void>;
  enableFeature(tenantId, storeId, featureKey, actorUserId): Promise<void>;
  disableFeature(tenantId, storeId, featureKey, actorUserId): Promise<void>;
  getEnabledFeatures(tenantId, storeId): Promise<string[]>;
  validateDependencies(tenantId, storeId, featureKey): Promise<void>;
}
```

### Required frontend behavior

- Sidebar should show only enabled modules.
- Locked modules can be shown with an upgrade badge.
- Admin routes must be protected by backend feature checks.
- API routes must reject disabled features.
- Webhooks/jobs for disabled features must not execute.
- Plugins must not bypass feature gates.
- Audit log should record every feature enable/disable.

### Feature middleware example

```ts
requireFeature("subscriptions")
requirePermission("write_subscriptions")
```

### API examples

```txt
GET    /api/owner/features
GET    /api/owner/tenants/:tenantId/features
PATCH  /api/owner/tenants/:tenantId/features/:featureKey/enable
PATCH  /api/owner/tenants/:tenantId/features/:featureKey/disable
GET    /api/admin/features/enabled
GET    /api/admin/features/locked
```

---

## D. Required New Core Module: Agency Owner Control Panel

### Purpose

Because this platform is for your clients, you need a separate owner/super-admin panel above the merchant admin.

### Owner panel navigation

```txt
Owner Dashboard
├── Clients / Tenants
├── Stores
├── Plans
├── Add-ons
├── Feature Controls
├── Payment Gateway Templates
├── Plugin Registry
├── System Health
├── Usage & Billing
├── Client Invoices
├── Support Tickets
├── Audit Logs
├── White-label Settings
└── Platform Settings
```

### Owner can do

- Create new client tenant.
- Create one or multiple stores under a tenant.
- Enable/disable modules per client.
- Assign plan.
- Assign add-ons.
- Set usage limits.
- Configure allowed payment gateways.
- Configure allowed sales channels.
- Upload client logo/branding.
- View usage by API calls, orders, storage, staff users.
- Suspend client.
- Impersonate client safely with audit logs.
- View health of integrations.
- Check failed webhooks and failed payment callbacks.

### Client provisioning flow

```txt
Owner creates tenant
→ Select plan
→ Select enabled modules
→ Select payment gateways
→ Select sales channels
→ Create default store
→ Invite client owner
→ Connect frontend/mobile app
→ Configure domain
→ Launch checklist
```

---

## E. Required New Core Module: Frontend / Mobile App Channel System

### Purpose

Every storefront, website, app, POS, marketplace, or custom frontend should be registered as a **Sales Channel** or **API Channel**.

This makes the system clean, secure, and trackable.

### Channel types

```txt
web_storefront
mobile_app_ios
mobile_app_android
react_native_app
flutter_app
pos_app
whatsapp_store
marketplace_connector
b2b_portal
custom_frontend
headless_experiment
```

### Channel model

```ts
{
  _id,
  tenantId,
  storeId,
  name: "Client Mobile App",
  type: "mobile_app_android",
  status: "active" | "disabled" | "testing",
  publicKey,
  privateKeyHash,
  allowedOrigins: [],
  allowedBundleIds: ["com.client.store"],
  allowedPackageNames: ["com.client.store"],
  allowedRedirectUrls: [],
  apiScopes: [
    "read_products",
    "write_cart",
    "write_checkout",
    "read_customer_orders"
  ],
  rateLimits: {
    requestsPerMinute: 300,
    requestsPerDay: 100000
  },
  settings: {
    defaultCurrency: "INR",
    defaultMarket: "india",
    enableGuestCheckout: true,
    enableOtpLogin: true,
    enablePushNotifications: true,
    paymentMethods: ["upi", "cards", "cod"],
    shippingMethods: ["standard", "express"],
    themeTokenSet: "default"
  },
  analytics: {
    attributionSource: "mobile_app",
    utmSource: "mobile_app"
  },
  createdAt,
  updatedAt
}
```

### Mobile app API requirements

Mobile app should use the same Storefront API, but with mobile-specific support.

Required endpoints:

```txt
POST   /api/storefront/mobile/session
POST   /api/storefront/mobile/device-token
DELETE /api/storefront/mobile/device-token
GET    /api/storefront/mobile/config
GET    /api/storefront/mobile/home
GET    /api/storefront/mobile/navigation
GET    /api/storefront/mobile/feature-flags
POST   /api/storefront/mobile/deep-link/resolve
POST   /api/storefront/mobile/app-version/check
```

### Mobile SDK packages

Create official SDK packages:

```txt
@commerce-os/storefront-js
@commerce-os/storefront-react
@commerce-os/storefront-react-native
@commerce-os/storefront-flutter
@commerce-os/admin-sdk
```

### React Native SDK features

```ts
commerce.mobile.init({
  channelKey: process.env.COMMERCE_CHANNEL_KEY,
  apiUrl: process.env.COMMERCE_API_URL,
  appVersion: "1.0.0",
  platform: "android"
});

commerce.products.list();
commerce.cart.create();
commerce.cart.addItem();
commerce.checkout.start();
commerce.payments.createSession();
commerce.customers.otpLogin();
commerce.orders.listCustomerOrders();
```

### Mobile-specific features

- OTP login.
- Magic link login.
- Device token registration.
- Push notifications.
- In-app order tracking.
- Deep links for product, collection, cart, checkout, order.
- App version force update.
- Maintenance mode.
- Remote config.
- Mobile-specific banners.
- Mobile-specific menu/navigation.
- Mobile-specific payment method visibility.
- UPI intent support.
- Native payment SDK support.
- Offline wishlist.
- Recently viewed products.
- App install attribution.
- App-only coupons.
- App-only pricing.
- App-only push campaigns.

### Mobile checkout requirements

- UPI intent for Android.
- UPI collect fallback.
- UPI QR for web/mobile fallback.
- Card tokenization through provider SDK only.
- Native SDK support for Razorpay, Cashfree, PhonePe, Stripe, PayPal, Adyen where supported.
- Deep link return handling after payment.
- Payment status polling after app return.
- Webhook remains source of truth.
- Customer should not see order success until backend confirms payment or marks pending verification.

---

## F. Required Payment Upgrade: Payment Orchestration Layer

### Problem with only Razorpay

Razorpay is useful, but a robust commerce platform should not depend on a single gateway. Payment success rates, settlement timing, UPI performance, international support, recurring billing, refunds, and downtime can vary by gateway and payment method.

### Required architecture

Use two payment layers:

```txt
Checkout
→ Payment Orchestrator
→ Payment Gateway Adapter
→ Gateway API
```

### Payment Orchestrator responsibilities

- Select the best gateway for each payment.
- Support multiple gateways per store.
- Route by payment method.
- Route by country/market.
- Route by currency.
- Route by amount.
- Route by customer group.
- Route by gateway success rate.
- Route by gateway cost/MDR.
- Route by gateway downtime.
- Route by settlement preference.
- Retry failed payments where safe.
- Fallback to another gateway if primary gateway is down.
- Split traffic for A/B testing.
- Support manual priority rules.
- Support gateway health dashboard.
- Track success rate per gateway/method/bank/UPI handle.

### Payment orchestration flow

```txt
Customer selects payment method
→ Orchestrator checks enabled gateways
→ Filters gateways by currency/country/method
→ Checks routing rules
→ Checks live gateway health
→ Creates payment session with selected gateway
→ Stores payment attempt
→ Waits for customer completion
→ Verifies webhook signature
→ Updates payment state machine
→ Creates order/payment timeline event
→ Runs reconciliation later
```

### Payment routing rule examples

```txt
IF paymentMethod = UPI AND amount < ₹5000
THEN use PhonePe first, Razorpay fallback, Cashfree fallback

IF paymentMethod = Card AND internationalCard = true
THEN use Stripe or Adyen

IF market = India AND paymentMethod = NetBanking
THEN use PayU or CCAvenue

IF gateway Razorpay success_rate_last_15_min < 80%
THEN route new payments to Cashfree

IF customer group = B2B AND amount > ₹100000
THEN allow bank_transfer, cheque, payment_terms only
```

### Payment gateway matrix

| Gateway / Rail | Use case | Recommended status |
|---|---|---|
| COD | India D2C basic stores | MVP |
| Manual Bank Transfer | B2B/manual orders | MVP |
| Razorpay | India UPI/cards/netbanking/wallets | Phase 1 |
| Cashfree | India payments + payouts + international collections | Phase 1 |
| PhonePe PG | UPI-heavy Indian checkout | Phase 2 |
| PayU | India enterprise/netbanking/UPI/cards/BNPL | Phase 2 |
| CCAvenue | Legacy/enterprise Indian merchants, multi-currency needs | Phase 2 |
| Stripe | Global cards, wallets, subscriptions, Apple Pay/Google Pay | Phase 2 |
| PayPal | International wallet/card checkout | Phase 2 |
| Juspay / Hyperswitch | Payment orchestration layer | Phase 3 |
| Adyen | Enterprise/global payments, UPI support where available | Phase 3 |
| Checkout.com | Enterprise/global payments | Phase 3 |
| BillDesk | Enterprise/bill payments | Phase 4 |
| Paytm | India wallet/UPI/cards use cases | Phase 4 |
| Easebuzz | India SME payment gateway | Phase 4 |
| Instamojo | Small sellers/payment links | Phase 4 |
| HDFC SmartGateway | Bank direct enterprise use case | Phase 4 |
| ICICI EazyPay | Bank direct enterprise use case | Phase 4 |

### Payment methods to support

```txt
Cards
├── credit_card
├── debit_card
├── international_card
├── card_emi
├── card_tokenized
└── saved_card_reference

UPI
├── upi_collect
├── upi_intent
├── upi_qr
├── upi_autopay
└── upi_mandate

Banking
├── netbanking
├── bank_transfer
├── virtual_account
├── neft_rtgs_imps
└── cheque_manual

Wallets
├── paypal_wallet
├── paytm_wallet
├── phonepe_wallet
├── amazon_pay
├── mobikwik
└── provider_wallets

BNPL / Credit
├── pay_later
├── cardless_emi
├── consumer_finance
└── invoice_terms

Internal
├── cod
├── store_credit
├── wallet_balance
├── gift_card
├── loyalty_points
└── split_payment
```

### Payment states

```txt
created
session_created
requires_customer_action
customer_redirected
pending
authorized
captured
partially_captured
failed
cancelled
expired
refunded
partially_refunded
disputed
chargeback
reconciled
settlement_pending
settled
manual_review
```

### PaymentAttempt model

```ts
{
  _id,
  tenantId,
  storeId,
  checkoutId,
  orderId,
  paymentId,
  attemptNumber,
  orchestratorDecisionId,
  provider,
  providerAccountId,
  method,
  amount,
  currency,
  status,
  idempotencyKey,
  clientSecret,
  redirectUrl,
  returnUrl,
  webhookEvents: [],
  errorCode,
  errorMessage,
  riskScore,
  createdAt,
  updatedAt
}
```

### PaymentGatewayAccount model

```ts
{
  _id,
  tenantId,
  storeId,
  provider: "razorpay" | "cashfree" | "stripe" | "paypal" | "phonepe" | "payu" | "ccavenue" | "adyen" | "hyperswitch",
  displayName,
  status: "active" | "disabled" | "testing" | "error",
  mode: "test" | "live",
  supportedMethods: ["upi", "cards", "netbanking", "wallets"],
  supportedCurrencies: ["INR", "USD"],
  supportedCountries: ["IN", "US"],
  credentialsEncrypted,
  webhookSecretEncrypted,
  priority,
  routingWeight,
  limits: {
    minAmount,
    maxAmount,
    dailyVolumeLimit,
    monthlyVolumeLimit
  },
  health: {
    status,
    successRate15m,
    successRate1h,
    lastFailureAt,
    lastSuccessAt
  },
  settlement: {
    settlementCycle,
    settlementAccount,
    lastReconciledAt
  },
  createdAt,
  updatedAt
}
```

### PaymentRoutingRule model

```ts
{
  _id,
  tenantId,
  storeId,
  name,
  status,
  priority,
  conditions: {
    country,
    currency,
    paymentMethod,
    amountMin,
    amountMax,
    customerGroup,
    channel,
    cardCountry,
    bankCode,
    upiProvider
  },
  actions: {
    preferredProviders: ["phonepe", "razorpay", "cashfree"],
    fallbackProviders: ["cashfree", "payu"],
    splitTraffic: [{ provider: "razorpay", weight: 70 }, { provider: "cashfree", weight: 30 }],
    requireManualReview: false
  },
  createdAt,
  updatedAt
}
```

### Payment reconciliation module

Required features:

- Gateway settlement file upload.
- Auto settlement import through API where supported.
- Match gateway transaction with internal payment/order.
- Detect missing settlement.
- Detect amount mismatch.
- Detect duplicate payment.
- Detect refund mismatch.
- Mark payment as reconciled.
- Export reconciliation report.
- Daily reconciliation dashboard.

### Disputes and chargebacks

Required features:

- Dispute list.
- Dispute evidence upload.
- Gateway dispute webhook.
- Chargeback status.
- Staff notes.
- Customer/order timeline link.
- Evidence deadline alerts.
- Dispute analytics.

### Payment provider adapter interface v2

```ts
interface PaymentProviderAdapter {
  providerKey: string;

  getCapabilities(): PaymentProviderCapabilities;

  createSession(input: CreatePaymentSessionInput): Promise<CreatePaymentSessionResult>;
  authorize(input: AuthorizePaymentInput): Promise<AuthorizePaymentResult>;
  capture(input: CapturePaymentInput): Promise<CapturePaymentResult>;
  cancel(input: CancelPaymentInput): Promise<CancelPaymentResult>;
  refund(input: RefundPaymentInput): Promise<RefundPaymentResult>;
  getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusResult>;
  verifyWebhook(input: VerifyWebhookInput): Promise<VerifiedPaymentWebhook>;
  parseWebhookEvent(input: VerifiedPaymentWebhook): Promise<PaymentEvent>;

  createMandate?(input: CreateMandateInput): Promise<CreateMandateResult>;
  chargeMandate?(input: ChargeMandateInput): Promise<ChargeMandateResult>;
  createPayout?(input: CreatePayoutInput): Promise<CreatePayoutResult>;
}
```

### Payment security non-negotiables

- Never store raw card numbers, CVV, or full magnetic/card data.
- Use gateway-hosted fields or provider SDKs for cards.
- Encrypt gateway credentials.
- Verify every webhook signature.
- Store gateway event IDs to prevent duplicate processing.
- Use idempotency keys for payment session, capture, refund, and webhook processing.
- Webhook is source of truth, but API polling can be used as backup.
- Mask all gateway logs.
- Refunds require staff permission and reason.
- High-value refunds require maker-checker approval.
- Payment method availability must be recalculated server-side.

---

## G. Required New Module: Payment Method Rules

Merchants should be able to control payment methods without coding.

### Rule examples

```txt
Hide COD if order value > ₹10,000
Hide COD for prepaid-only products
Show UPI first for mobile app users
Show PayPal only for international customers
Show bank transfer only for B2B customers
Show EMI only for cart value > ₹3,000
Show store credit only for logged-in customers
Require manual review for high-risk orders
```

### Admin page

```txt
Settings → Payments → Payment Method Rules
```

### UI requirements

- Rule name.
- Status.
- Conditions.
- Actions.
- Priority.
- Preview test checkout.
- Audit history.

---

## H. Required New Module: Client-wise Payment Gateway Controls

### Purpose

You should control which gateways are available for each client.

Example:

```txt
Client A: COD + Razorpay
Client B: COD + Cashfree + PhonePe
Client C: Stripe + PayPal + Adyen
Client D: Hyperswitch orchestration + Razorpay + PayU + Cashfree
```

### Owner controls

- Enable/disable gateway per client.
- Force test mode or live mode.
- Set allowed payment methods.
- Set gateway priority.
- Set fallback gateway.
- Set maximum transaction amount.
- Set refund permission.
- Set settlement account.
- View gateway health.
- View failed webhooks.

---

## I. Required New Module: App / Plugin Sandboxing

The current README has plugins, but it needs stronger control.

### Plugin execution types

```txt
internal_plugin      = built and trusted by platform team
private_plugin       = custom client plugin
public_marketplace   = available to many clients
external_oauth_app   = third-party app connected through OAuth
serverless_extension = isolated runtime function
```

### Plugin safety requirements

- Each plugin must declare permissions.
- Each plugin must declare feature dependencies.
- Each plugin must run under tenant context.
- Each plugin must have API rate limits.
- Each plugin must have audit logs.
- Plugin secrets must be encrypted.
- Plugin uninstall must clean up safely.
- Plugin cannot directly access database collections unless internal and approved.
- External plugins must use APIs, not database connections.
- Checkout extensions must be sandboxed.
- Plugin UI must not receive unauthorized customer/payment data.

### Plugin lifecycle

```txt
draft → submitted → review → approved → published → installed → active → disabled → uninstalled
```

### App marketplace review checklist

- Security review.
- Permission review.
- Data handling review.
- Webhook review.
- UI review.
- Performance review.
- Uninstall behavior review.
- Version compatibility review.

---

## J. Required New Module: SaaS Billing for Your Clients

### Why needed

Because your system will be used for multiple clients, you need billing for your own platform.

### Plans

```txt
Starter
├── Products
├── Orders
├── COD
├── Razorpay
├── Basic reports
└── 2 staff users

Growth
├── Everything in Starter
├── Inventory
├── Discounts
├── WhatsApp
├── Shiprocket
├── Abandoned cart
├── 10 staff users
└── 5,000 orders/month

Pro
├── Everything in Growth
├── B2B
├── Subscriptions
├── Automation builder
├── Advanced analytics
├── Multiple gateways
├── Mobile app channel
└── 25 staff users

Enterprise
├── Everything in Pro
├── Custom plugins
├── Dedicated gateway routing
├── Multi-store
├── ERP integration
├── SLA
├── Custom limits
└── White-label
```

### Billing models

- Monthly subscription.
- Yearly subscription.
- Per-order usage fee.
- Per-store fee.
- Per-staff fee.
- Add-on fee.
- Payment orchestration fee.
- Marketplace app revenue share.
- Enterprise custom pricing.

### Required billing models

#### Plan

```ts
{
  _id,
  key,
  name,
  priceMonthly,
  priceYearly,
  currency,
  includedFeatures,
  includedLimits,
  overageRules,
  status
}
```

#### TenantSubscription

```ts
{
  _id,
  tenantId,
  planKey,
  status,
  billingCycle,
  currentPeriodStart,
  currentPeriodEnd,
  trialEndsAt,
  cancelAtPeriodEnd,
  enabledAddons,
  limits,
  usageSnapshot,
  createdAt,
  updatedAt
}
```

#### UsageMeter

```ts
{
  _id,
  tenantId,
  storeId,
  period,
  ordersCount,
  apiCallsCount,
  storageUsedMb,
  staffUsersCount,
  productsCount,
  automationRuns,
  webhookDeliveries,
  paymentAttempts,
  createdAt,
  updatedAt
}
```

---

## K. Required New Module: Merchant Mobile Admin App

### Purpose

The merchant should be able to manage store operations from mobile.

### Features

- Dashboard.
- New order alerts.
- Payment alerts.
- Low stock alerts.
- Order approve/cancel/fulfill.
- Add tracking number.
- Refund request review.
- Product quick edit.
- Inventory adjustment.
- Customer search.
- Chat/support view.
- Push notification settings.
- Staff approval workflows.

### Safety

- Refunds from mobile require 2FA or OTP.
- High-risk actions require confirmation.
- Device/session management.
- Admin mobile push notifications must not leak sensitive payment details on lock screen.

---

## L. Required New Module: Developer Portal

### Purpose

If this is headless and plugin-first, developers need a portal.

### Developer portal features

- API documentation.
- Storefront API tokens.
- Admin API tokens.
- Webhook setup.
- Event logs.
- API logs.
- SDK downloads.
- Example Next.js storefront.
- Example React Native app.
- Plugin starter template.
- Payment adapter starter template.
- Shipping adapter starter template.
- Sandbox store creation.
- Test cards/test UPI/test payment flows.

---

## M. Required New Module: Observability and Operations

### System health dashboard

Track:

- API latency.
- API error rate.
- Worker queue length.
- Failed jobs.
- Webhook failures.
- Gateway failures.
- Payment success rate.
- Checkout conversion rate.
- Inventory reservation failures.
- Search indexing lag.
- Email/SMS/WhatsApp delivery failures.
- Storage usage.
- Tenant usage spikes.

### Critical alerts

- Payment gateway down.
- Checkout failure spike.
- Webhook retry exhausted.
- Inventory negative stock detected.
- Cross-tenant guard violation.
- Failed login spike.
- Large customer export.
- Feature disabled unexpectedly.
- Plugin error spike.

---

## N. Required Improvements in Existing Roadmap

### Corrected MVP

The original MVP has Razorpay and COD only. Better MVP should include the architecture to support more gateways even if only 2 gateways are implemented first.

### MVP v1 should include

1. Auth.
2. Tenant/store setup.
3. Owner panel base.
4. Feature entitlement system.
5. Products.
6. Collections.
7. Media.
8. Basic inventory.
9. Customers.
10. Sales channel registration.
11. Storefront API.
12. Mobile-ready Storefront API.
13. Cart.
14. Checkout.
15. Orders.
16. COD.
17. Razorpay adapter.
18. Cashfree adapter or Stripe adapter as second provider.
19. PaymentGatewayAccount model.
20. PaymentAttempt model.
21. Payment webhooks.
22. Payment method rules.
23. Basic shipping.
24. Basic discounts.
25. Audit logs.
26. Webhook event system.
27. Demo Next.js storefront.
28. Demo React Native or Flutter mobile app skeleton.

### MVP v1 should not include yet

- Full marketplace.
- Full automation builder.
- AI assistant.
- Advanced B2B.
- Full subscriptions.
- Enterprise global tax.
- Complex payment smart routing.
- POS.
- Multi-vendor marketplace.

### Phase 2 should include

- PhonePe.
- PayU.
- CCAvenue.
- Stripe.
- PayPal.
- Payment reconciliation.
- Gateway health dashboard.
- Feature add-on billing.
- Mobile push notifications.

### Phase 3 should include

- Juspay/Hyperswitch orchestration.
- Adyen.
- Checkout.com.
- Smart routing.
- Gateway fallback.
- Subscription mandates.
- Disputes/chargebacks.
- Advanced analytics.

---

## O. What Was Wrong / Risky in the Original README

### 1. Payment section was too small

It listed providers, but did not define reconciliation, disputes, mandates, fallback, routing, gateway account configuration, provider health, settlement, or payment attempts.

### 2. Add-ons were mixed with plugins

Feature add-ons and plugins are different:

```txt
Feature add-on = product capability you sell to clients.
Plugin = technical package/integration that extends the platform.
```

You need both.

### 3. Mobile app support was only mentioned, not designed

The new design needs channel keys, mobile SDKs, deep links, push notifications, mobile checkout, app version checks, and mobile-specific feature flags.

### 4. SaaS owner control panel was missing

A client-wise platform cannot be managed only from merchant admin. You need an owner dashboard for your agency/platform team.

### 5. No module dependency management

Without dependency checks, a client can enable Subscriptions without recurring payments, or Marketplace without payouts. That will break logic.

### 6. No usage limits

For SaaS pricing, you need limits by plan: products, staff, orders, locations, storage, API calls, automation runs, and webhooks.

### 7. No gateway credential encryption model

Payment gateway keys must be encrypted and access-controlled.

### 8. No operational failure handling

Payment and webhook failures need dashboards, retries, dead-letter queues, and alerts.

---

## P. Final Recommended Architecture

```txt
apps/admin
  Merchant admin panel using Next.js + shadcn/ui

apps/owner
  Platform owner panel for clients, plans, add-ons, feature gates, billing

apps/api
  Express/Nest-style API server

apps/worker
  BullMQ workers for webhooks, emails, payments, reconciliation, analytics

apps/storefront-demo
  Example Next.js headless storefront

apps/mobile-demo
  Example React Native or Flutter storefront app

packages/shared
  Types, Zod schemas, constants

packages/sdk-js
  Storefront JavaScript SDK

packages/sdk-react
  React hooks for storefront

packages/sdk-react-native
  React Native SDK

packages/plugin-sdk
  Plugin SDK

packages/payment-core
  Payment orchestrator, state machine, provider interfaces

packages/feature-gates
  Feature entitlement checker and middleware

packages/ui
  Shared shadcn/ui components

plugins/payment-razorpay
plugins/payment-cashfree
plugins/payment-stripe
plugins/payment-paypal
plugins/payment-phonepe
plugins/payment-payu
plugins/payment-ccavenue
plugins/payment-hyperswitch
plugins/shipping-shiprocket
plugins/marketing-whatsapp
```

---

## Q. Updated Non-negotiable Rules

Add these rules to the existing non-negotiable engineering section:

1. Every module must be feature-gated.
2. Every tenant/store must have explicit enabled features.
3. Disabled modules must be blocked in UI, API, workers, webhooks, and plugins.
4. Every frontend/mobile app must use a registered channel key.
5. Every channel must have scopes, rate limits, allowed origins or app identifiers.
6. Every payment must create a PaymentAttempt.
7. Every payment provider credential must be encrypted.
8. Webhook signature verification is mandatory for every payment provider.
9. Payment webhook processing must be idempotent.
10. Gateway health must affect routing only through safe rules.
11. Refunds must support maker-checker approval for high-risk stores.
12. Payment success page must not trust frontend callback alone.
13. Payment reconciliation must exist before enterprise launch.
14. Plugins cannot bypass tenant, permission, feature, or payment safety checks.
15. Storefront and mobile SDKs must never expose admin tokens.
16. App/mobile push tokens must be stored per customer/device/channel.
17. Owner impersonation must be time-limited and audited.
18. Client feature changes must create audit logs.
19. Usage meters must be tamper-resistant.
20. Plan/add-on limits must be enforced server-side.

---

## R. Final Build Recommendation

Build this project in the following order:

```txt
1. Monorepo setup
2. Admin shell with shadcn/ui
3. API server foundation
4. Tenant/store/auth/RBAC
5. Owner panel base
6. Feature gate/add-on system
7. Product/catalog module
8. Media module
9. Customer module
10. Sales channel registration
11. Storefront API
12. Mobile-ready API and SDK base
13. Cart module
14. Checkout module
15. Order module
16. Payment core state machine
17. COD provider
18. Razorpay provider
19. Cashfree or Stripe provider
20. Payment webhooks and attempts
21. Payment method rules
22. Basic shipping
23. Inventory ledger
24. Audit logs everywhere
25. Demo Next.js storefront
26. Demo mobile app skeleton
27. Plugin SDK foundation
28. Client billing/usage meters
29. Payment reconciliation
30. Smart routing/orchestration
```

This approach gives you a real product foundation instead of a normal CRUD e-commerce admin.

---

## S. Best Payment Strategy for This Platform

Do not say: “We support every gateway.”

Say:

> “We support a payment adapter and orchestration architecture where gateways can be added per client. MVP starts with COD, Razorpay, and Cashfree/Stripe. Then we add PhonePe, PayU, CCAvenue, PayPal, and enterprise orchestration through Hyperswitch/Juspay/Adyen.”

This is more professional, scalable, and realistic.

### Recommended first payment stack for India-first SaaS

```txt
MVP:
- COD
- Manual bank transfer
- Razorpay
- Cashfree

Phase 2:
- PhonePe
- PayU
- CCAvenue
- Stripe
- PayPal

Phase 3:
- Hyperswitch/Juspay orchestration
- Adyen
- Checkout.com
- Smart routing
- Reconciliation
- Disputes
- Subscription mandates
```

### Why this is better

- You are not locked to Razorpay.
- You can enable payment gateways per client.
- You can route payments based on success rate and cost.
- You can recover from gateway downtime.
- You can support Indian and international clients.
- You can later charge premium for payment orchestration.

---

## T. Final Product Definition After Improvements

The final system should be defined as:

> A multi-tenant, headless, feature-gated e-commerce operating system for agencies and merchants. It provides a Shopify-like admin, any-frontend connectivity, mobile app support, client-wise add-ons, plugin marketplace, advanced payment orchestration, strong inventory/order/payment logic, and enterprise-ready customization.

This is the correct direction for the product.
