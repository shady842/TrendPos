# TrendPos

Multi-tenant F&amp;B **POS + ERP** foundation — **no Supabase** (NestJS + PostgreSQL + Next.js + Flutter).

## If Docker fails on Windows (`docker_engine` / npipe)

**You do not need Docker.** Use free Postgres from **Neon**: https://console.neon.tech  

Full steps: **[docs/SETUP_WINDOWS.md](./docs/SETUP_WINDOWS.md)**

Summary:

1. Create a Neon project and copy the **connection string** (include `?sslmode=require`).
2. Put it in **`apps/api/.env`** as `DATABASE_URL="..."`.
3. Run:

```powershell
cd C:\Users\DELL\Desktop\TrendPos
npm install
npm run db:migrate
npm run dev
```

(This starts **API + web** together.)

### URLs to test (local)

| Page | Link |
|------|------|
| **Landing** | http://localhost:3000 |
| **Register (creates tenant)** | http://localhost:3000/register |
| **Sign in** | http://localhost:3000/login |
| **ERP shell (all modules)** | http://localhost:3000/erp/dashboard |
| **Floor / tables (API)** | http://localhost:3000/erp/floor |
| **Menu builder** | http://localhost:3000/erp/menu |
| **API health** | http://localhost:4000/api/health |

Read **`docs/PRODUCT_ROADMAP.md`** for how the full Toast-class scope maps to phased delivery.

---

## Stack

| App | Stack | Port |
|-----|--------|------|
| **API** | NestJS, Prisma, PostgreSQL, Socket.IO | `4000` |
| **Web admin** | Next.js, Tailwind | `3000` |
| **POS (APK)** | Flutter (Android), SQLite outbox | — |
| **Manager (APK)** | Flutter (Android), approvals scaffold | — |

## Prerequisites

- Node.js 20+
- **PostgreSQL** — Docker **or** Neon **or** any Postgres 16+
- Flutter SDK (optional, for `apps/pos`)

## Database

**Docker (PostgreSQL only; Redis optional):**

```bash
docker compose up -d
npm run db:migrate
```

**Neon / other hosted Postgres:** set `DATABASE_URL` in `apps/api/.env`, then `npm run db:migrate`.

## Run API + Web

From repo root:

```bash
npm install
npm run dev
```

Or separately: `npm run dev:api` and `npm run dev:web`.

## Flutter — POS & Manager

```bash
cd apps/pos
flutter pub get
flutter run
```

```bash
cd apps/manager
flutter pub get
flutter run
```

Emulator API default: `http://10.0.2.2:4000`. Physical device:

```bash
flutter run --dart-define=API_BASE=http://YOUR_PC_LAN_IP:4000
```

## APK without Android Studio (workaround)

If your internet is too slow to install Android Studio/SDK locally, use the cloud build:

1. Push this project to GitHub.
2. In GitHub repo, open **Actions** → **Build Flutter APKs**.
3. Click **Run workflow**.
4. When finished, download artifacts:
   - `pos-app-debug` (POS APK)
   - `manager-app-debug` (Manager APK)

Workflow file: `.github/workflows/build-apks.yml`

## Documentation

- [docs/SETUP_WINDOWS.md](./docs/SETUP_WINDOWS.md) — **Neon + Docker + testing links**
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — design & roadmap

## MVP features

- Register → company + main branch + owner + sample menu item.
- JWT auth, memberships, orders, `clientOrderId` idempotency for POS.
- Realtime `order:updated` on Socket.IO namespace `/realtime`.
- Menu builder (add items from the web).
- Flutter: login, order, outbox + flush.
