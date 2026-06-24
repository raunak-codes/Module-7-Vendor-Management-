# EventHub360 — Module 7: Vendor Management

A full-stack vendor management system built as part of the EventHub360 enterprise event platform. Covers the complete vendor lifecycle — onboarding, KYC, purchase orders, work orders, invoicing, contracts, payments, and performance tracking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS, Prisma ORM, PostgreSQL |
| Admin Frontend | React (Vite), JSX |
| Vendor Frontend | React (Vite), TypeScript |
| Auth | JWT (role-based: ADMIN / VENDOR) |
| Storage | MinIO (document uploads) |
| Cache | Redis |
| Scheduling | `@nestjs/schedule` (CRON jobs) |
| API Docs | Swagger (`/api/docs`) |

---

## Project Structure

```
├── backend/                     # NestJS API
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── src/modules/
│       ├── auth/                # JWT login & vendor registration
│       ├── vendor/              # Vendor profiles, categories, performance
│       ├── kyc/                 # KYC document upload & verification
│       ├── purchase-order/      # PO approval matrix (TIER 1/2/3)
│       ├── work-order/          # Work order lifecycle & Kanban
│       ├── invoice/             # Invoice submission & 3-way match
│       ├── contract/            # Contract & SLA engine
│       ├── scheduler/           # CRON jobs
│       ├── finance-events/      # Finance Service Bus & webhook dispatch
│       ├── rating/              # Vendor ratings & reviews
│       ├── notification/        # In-app notifications
│       └── audit/               # Audit log
│
├── frontendAdmin/               # Admin portal (React)
│   └── src/pages/admin/
│       ├── AdminVendorDirectory          # Vendor list, flagging, CSV export
│       ├── AdminVendorProfile            # Vendor detail + availability checker
│       ├── AdminWorkOrderKanban          # Work order Kanban board
│       ├── AdminWorkOrderDetails         # WO detail + rate vendor modal
│       ├── AdminInvoiceManagement        # Invoice verification + 3-way match
│       ├── AdminContractManagement       # Contract lifecycle + SLA terms
│       ├── AdminCategoriesManagement     # Vendor category CRUD
│       ├── AdminFinanceEvents            # Finance event log + CSV export
│       └── AdminPurchaseOrders           # PO creation + approval matrix
│
└── frontendVendor/              # Vendor portal (React + TypeScript)
    └── src/pages/
        ├── dashboard/           # Vendor dashboard
        ├── purchase-orders/     # View & respond to POs
        ├── work-orders/         # View assigned work orders
        ├── finance/             # Invoice upload, payment history
        ├── contracts/           # Document Vault (active contracts + SLAs)
        ├── profile/             # Vendor profile, services, rate cards, documents
        ├── ratings/             # Ratings & reviews received
        └── performance/         # Performance & SLAs dashboard
```

---

## Features

### Vendor Onboarding
- Multi-step vendor registration (company info → services → KYC & bank)
- KYC document upload (GST, PAN, Business Registration, Bank Proof)
- Admin approval / rejection workflow
- Vendors blocked from portal until approved

### Purchase Order — Approval Matrix (SDD §9)
| Tier | Amount | Approval |
|---|---|---|
| TIER 1 | < ₹1,000 | Auto-approved |
| TIER 2 | ₹1,000 – ₹10,000 | Project Manager |
| TIER 3 | > ₹10,000 | Finance |

- POs escalated via CRON if pending > 48 hours

### Work Orders
- Admin creates and assigns work orders to vendors, optionally linked to a PO
- Kanban board (To Do → In Progress → Completed)
- Rate vendor directly from the work order detail page (star picker modal)

### Invoice & 3-Way Match (SDD §12)
- Vendors submit invoices linked to POs
- Admin sees a 3-way match panel on each invoice:
  - **Check 1**: Invoice amount ≤ PO amount + 5%
  - **Check 2**: All linked work orders are COMPLETED
- Approve button is disabled if either check fails

### Contract & SLA Engine (SDD §11)
- Admin creates contracts with SLA terms (metric / target / penalty %)
- Lifecycle: DRAFT → ACTIVE → TERMINATED / EXPIRED
- Vendors view active contracts and SLA terms in their Document Vault

### CRON Scheduler
| Schedule | Job |
|---|---|
| Daily 06:00 | KYC document expiry — marks expired docs, warns vendors |
| Daily 06:30 | Contract expiry — auto-expires overdue contracts |
| Every 4 hours | PO escalation — flags PENDING POs older than 48h |
| Daily 07:00 | Vendor auto-flag — flags vendors with avg rating < 2.5 (≥ 3 reviews) |

All jobs are manually triggerable via `POST /api/v1/scheduler/trigger/*` (admin only, useful for testing).

### Finance Service Bus (SDD §16)
- Events emitted on: `INVOICE_APPROVED`, `INVOICE_PAID`, `INVOICE_REJECTED`, `PO_ISSUED`, `PO_FULFILLED`, `PAYMENT_RECORDED`
- Optional webhook dispatch to an external finance system (`FINANCE_WEBHOOK_URL`)
- Admin Finance Bus page with event log, stats, type filters, and CSV export

### Vendor Performance
- Rating distribution (1–5 stars) and average score
- Work order completion rate
- Active contracts and SLA terms
- Auto-flag warning banner if vendor is flagged for low performance

### Vendor Availability Checker
- Admin selects a date range on the vendor profile page
- System returns availability status and any conflicting work orders

### My Documents (Vendor)
- Vendors view all uploaded KYC documents with live status (Under Review / Verified / Rejected / Expired)
- Re-upload expired or rejected documents without re-registering

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- MinIO

### Backend
```bash
cd backend
cp .env.example .env      # fill in DB, JWT, Redis, MinIO values
npm install
npx prisma db push
npm run start:dev
```
API: `http://localhost:5000`  
Swagger: `http://localhost:5000/api/docs`

### Admin Frontend
```bash
cd frontendAdmin
npm install
npm run dev
```
Runs on `http://localhost:5173`

### Vendor Frontend
```bash
cd frontendVendor
npm install
npm run dev
```
Runs on `http://localhost:5174`

---

## Environment Variables (Backend)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `REDIS_URL` | Redis connection URL |
| `MINIO_ENDPOINT` | MinIO host |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `FINANCE_WEBHOOK_URL` | Optional — external finance system webhook endpoint |

---

## Default Admin Credentials

```
Email:    admin@eventhub.com
Password: (set during seed / initial setup)
```

---

## API Reference

| Module | Base Path |
|---|---|
| Auth | `/api/v1/auth` |
| Vendors | `/api/v1/vendors` |
| KYC | `/api/v1/vendors/:vendorId/kyc` |
| Purchase Orders | `/api/v1/purchase-orders` |
| Work Orders | `/api/v1/work-orders` |
| Invoices | `/api/v1/invoices` |
| Contracts | `/api/v1/contracts` |
| Ratings | `/api/v1/vendors/:vendorId/ratings` |
| Finance Events | `/api/v1/finance-events` |
| Scheduler Triggers | `/api/v1/scheduler/trigger/*` |
| Audit Logs | `/api/v1/audit-logs` |
| Notifications | `/api/v1/notifications` |
