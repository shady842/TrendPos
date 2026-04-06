# TrendPos on Windows (no Docker required)

Your error:

```text
failed to connect to the docker API at npipe:////./pipe/docker_engine
```

means **Docker Desktop is not running** or **not installed**. The app **does not require Docker** if you use a free cloud Postgres instead.

---

## Option A — Recommended: Neon (free Postgres, 2 minutes)

1. Open **https://console.neon.tech** and sign in (GitHub is fine).
2. **Create project** → choose a region close to you.
3. Copy the **connection string** (it looks like  
   `postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require`).
4. Open `apps/api/.env` in this repo and set **one line**:

   ```env
   DATABASE_URL="postgresql://....paste-here....?sslmode=require"
   ```

   Keep the rest of the file (`JWT_*`, `PORT`, `CORS_ORIGIN`).

5. In PowerShell:

   ```powershell
   cd C:\Users\DELL\Desktop\TrendPos\apps\api
   npx prisma migrate deploy
   npm run start:dev
   ```

6. Second terminal:

   ```powershell
   cd C:\Users\DELL\Desktop\TrendPos\apps\web
   npm run dev
   ```

### Links to test (after API + web are running)

| What | URL |
|------|-----|
| **Web app (register / dashboard)** | **http://localhost:3000** |
| **API health** | **http://localhost:4000/api/health** |
| **Menu builder** | **http://localhost:3000/dashboard/menu** |

---

## Option B — Fix Docker (local Postgres)

1. Install **Docker Desktop for Windows**: https://docs.docker.com/desktop/install/windows-install/
2. Start **Docker Desktop** and wait until it says **Engine running**.
3. From repo root:

   ```powershell
   docker compose up -d
   cd apps\api
   npx prisma migrate deploy
   ```

`docker-compose.yml` starts **PostgreSQL only** by default. Redis is optional (`--profile with-redis`).

---

## Option C — Postgres installed on Windows (advanced)

Install PostgreSQL 16, create database `trendpos` and user, then set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/trendpos"
```

Then run `npx prisma migrate deploy` in `apps/api`.

---

## One command from repo root (API + web together)

After `DATABASE_URL` works:

```powershell
cd C:\Users\DELL\Desktop\TrendPos
npm install
npm run dev
```

Then open **http://localhost:3000**.
