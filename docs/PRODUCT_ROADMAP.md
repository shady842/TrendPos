# TrendPos — product scope vs delivery (honest view)

Your specification matches **commercial suites built over many years by hundreds of engineers** (Toast, Lightspeed, Oracle Micros, etc.). No single repo iteration can ship that entire surface area. What we **can** do is keep a **clean architecture** and deliver **vertical slices** that stay mergeable and production-grade.

## What “production-ready” means here

- **Production-ready code** = typed APIs, migrations, authz boundaries, realtime hooks, offline-safe IDs, audit-friendly schema — **not** “every checkbox in the RFP is implemented.”
- The **full RFP** is a **program** of phases (below), not one milestone.

## Phase map (your requirements → engineering phases)

| Phase | Scope (from your list) | Rough team-time order |
|-------|-------------------------|------------------------|
| **0 — Foundation** | Multi-tenant DB, auth, orders, menu seed, Socket.IO company rooms, web login, Flutter POS login + outbox | **Done (MVP)** |
| **1 — POS core** | Dine-in / takeaway / delivery channels, table floor plan CRUD + drag UI, split/merge/transfer, modifiers on items, payments + partial pay | Months |
| **2 — KDS** | Station routing on order lines, ticket board UI (Flutter or web), sound/bump, SLA timers, realtime filters | Months |
| **3 — Manager** | Approval queue (void/refund/discount), push (FCM), mobile BI summaries | Months |
| **4 — Inventory** | Recipes, stock ledger, locations, transfers, procurement, approvals | Many months |
| **5 — ERP** | GL, P&L, AP/AR, bank rec, HR/payroll, CRM, promotions | Many months |
| **6 — SaaS growth** | Stripe plans, trials, provisioning emails, APK distribution, setup wizard | Months |
| **7 — AI** | Voice POS, NL reporting, forecasting — **only** after stable event + data pipelines | Ongoing |

## What was just added (toward Phase 1–4, not “complete”)

Database extensions (migrations) for:

- **Stripe** readiness: `Company.stripeCustomerId`
- **Floor plan**: `DiningTable` per branch
- **KDS routing fields**: `OrderLine.station`, `kitchenStatus`, `KitchenStation`
- **Modifiers**: `ModifierGroup`, `Modifier`, `MenuItemModifierGroup`
- **Payments**: `Payment` (multi-tender / partial pay foundation)
- **Manager approvals**: `ApprovalRequest`
- **Audit**: `AuditLog`
- **CRM stub**: `Customer`
- **Inventory stub**: `StockItem`, `StockLocation`, `StockLedger`

API:

- `GET/POST /api/branches/:branchId/floor/tables` — list/create dining tables

Web:

- **ERP shell** at `/erp/*` with sidebar for every module (most pages start as structured placeholders so navigation matches the product vision).

Flutter:

- **`apps/manager`** — second app scaffold for owner/manager flows (approvals, alerts) sharing the same API.

## How we continue without thrashing

1. Pick **one vertical** next (recommended: **floor plan + table status + order→table** OR **KDS read model**).
2. Implement **end-to-end** (DB → API → web or Flutter → realtime).
3. Ship behind **feature flags** or **plan tier** when Stripe lands.

This document is the contract for **expectations**: the codebase can grow into your full spec, but only through **sequenced phases**, not a single “everything” drop.
