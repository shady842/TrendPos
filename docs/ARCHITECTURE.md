# TrendPos — Architecture (Supabase-free)

## Stack

| Layer | Technology |
|--------|------------|
| Web admin | Next.js (App Router), Tailwind CSS |
| API | NestJS, REST + Socket.IO (WebSockets) |
| Database | PostgreSQL (Prisma ORM) |
| Cache / pub-sub (future) | Redis (Docker) |
| POS + Manager + KDS | Flutter (Android APK), Drift (SQLite) offline |

## Why not Supabase

- **Full control** over auth flows, migrations, and realtime semantics (rooms, fan-out).
- **NestJS** gives typed modules, guards, and a clear place for ERP rules, webhooks (Stripe), and AI services later.
- **Socket.IO** scales horizontally with a Redis adapter when you outgrow a single API instance.

## Multi-tenancy

- Every business row is scoped by `companyId`.
- **Concepts** optional grouping (multi-brand under one company).
- **Branches** belong to a company (and optionally a concept).
- **Users** join companies via `UserCompany` with `role` (RBAC expansion later).

## Realtime

- Clients authenticate over Socket.IO with JWT.
- Server places sockets in rooms: `company:{companyId}` (and later `branch:{branchId}`, `kds:{branchId}:{station}`).
- Order create/update emits `order:updated` to the company room (KDS / manager / other terminals).

## Offline-first POS

- **Local**: Drift/SQLite stores menu snapshot, open orders, **outbox** mutations.
- **Sync**: Push outbox to `POST /orders` (idempotent via `clientOrderId` + unique constraint).
- **Pull**: `GET /menu`, `GET /orders?since=...` (to be extended).
- **Conflicts**: MVP last-write-wins on server; expand with vector clocks / domain rules per entity type.

## Security (MVP → production)

- Passwords: bcrypt.
- HTTP: JWT access (short) + refresh token (hashed in DB).
- Next: store access token in memory or secure cookie; refresh via API route (harden before prod).
- **Never** ship `JWT_*_SECRET` or DB passwords to clients.

## Folder layout

```
apps/api     — NestJS + Prisma
apps/web     — Next.js admin + /erp shell (module map)
apps/pos     — Flutter POS (tablet/phone APK)
apps/manager — Flutter manager APK (approvals / BI — scaffold)
docs/        — ARCHITECTURE, PRODUCT_ROADMAP, SETUP_WINDOWS
```

## Roadmap (from MVP)

1. Stripe billing + tenant provisioning webhook  
2. Redis adapter for Socket.IO + job queue (BullMQ)  
3. KDS Flutter app (subset of POS packages)  
4. Manager approvals API + push (FCM)  
5. NL reporting / AI behind authenticated admin endpoints  

## Innovative add-ons (suggested)

- **Event sourcing for orders** — replay + forensic audit for disputes.  
- **Per-branch read replicas** or cached menu CDN for high-latency venues.  
- **Edge-print spooler** — local bridge service so tablets stay thin clients.  
- **Loyalty + CDP** — first-party customer graph without ad-tech leakage.  
