# LUMORA

> *Shop the future. Beautifully.*

A premium e-commerce + AI concierge platform built as a full-stack monorepo. Distinctive Aurora Glass design system, real-time stock/order updates, streaming AI shopping assistant.

**Live URLs (after deploy):**
- Web: `https://lumora.vercel.app`
- API: `https://lumora-api.onrender.com`

**Demo credentials (seeded by `npm run seed`):**
| Role | Email | Password |
|---|---|---|
| Admin | `admin@lumora.dev` | `Admin1234!` |
| Customer | `alice@lumora.dev` | `Pass1234!` |

---

## Architecture

```
Browser
  │
  ├── Next.js 14 (Vercel)          ← App Router, RSC + client components
  │     ├── TanStack Query         ← server state, cache invalidation
  │     ├── Zustand                ← cart drawer, auth session, UI
  │     └── Socket.io client       ← real-time stock / order status
  │
  └── Express API (Render)
        ├── MongoDB Atlas M0       ← products, orders, users, reviews
        ├── Upstash Redis          ← rate-limit, caching, CSRF tokens
        ├── Cloudinary             ← signed image uploads
        ├── Groq (llama-3.3-70b)   ← AI concierge, server-side only
        └── Socket.io server       ← per-user + admin rooms
```

```
lumora/
├── apps/
│   ├── api/          # Express + TypeScript backend
│   └── web/          # Next.js 14 frontend
├── packages/
│   └── types/        # Shared DTOs used by both apps
├── nginx/            # Reverse proxy config (self-host path)
├── postman/          # Full Postman collection
└── specs/            # Product spec files (source of truth)
```

---

## Local Setup

### Prerequisites
- Node.js 20 (`nvm use` reads `.nvmrc`)
- npm 10+
- Docker + Docker Compose (optional — for the full local stack)

### Option A — Docker (recommended, zero setup)

```bash
cp .env.example .env
# Fill in GROQ_API_KEY, CLOUDINARY_* in .env (others default for local)

docker compose up --build

# Seed the database (first time only)
docker compose exec api node dist/seed.js
```

Open `http://localhost:3000`.

### Option B — Manual

```bash
# 1. Install all workspace deps
npm install

# 2. Start MongoDB + Redis (or point MONGODB_URI / REDIS_URL at Atlas + Upstash)
#    If using Docker just for deps:
docker compose up mongo redis

# 3. Copy + fill env files
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# Edit each file with your values

# 4. Terminal 1 — API
cd apps/api && npm run dev

# 5. Terminal 2 — Web
cd apps/web && npm run dev

# 6. Seed (in a third terminal, after the API is running)
cd apps/api && npx ts-node src/scripts/seed.ts
```

Open `http://localhost:3000`.

---

## Deploy Guide

### 1. MongoDB Atlas (free M0)

1. Create account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Database Access → Add database user (password auth)
4. Network Access → `0.0.0.0/0` (allow all IPs)
5. Connect → Drivers → copy URI → set as `MONGODB_URI`

### 2. Upstash Redis (free)

1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database → copy the `REDIS_URL` (`rediss://...`)
3. Set as `REDIS_URL`

### 3. Cloudinary (free)

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy cloud name, API key, API secret
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 4. Groq (free, no card)

1. Create account at [console.groq.com](https://console.groq.com)
2. API Keys → Create API key
3. Set `GROQ_API_KEY`

### 5. Deploy API → Render

1. Push repo to GitHub
2. [render.com](https://render.com) → New Web Service → connect repo
3. Root directory: `apps/api`
4. Build command: `npm ci && npm run build`
5. Start command: `npm run start`
6. Health check: `/api/v1/health`
7. Set all API env vars (see `.env.example` API section), plus:
   - `NODE_ENV=production`
   - `CORS_ORIGINS=https://lumora.vercel.app`
8. Deploy → copy the service URL (e.g. `https://lumora-api.onrender.com`)

**Cold start note:** Free Render instances sleep after ~15 min idle and take 30–60s to wake. The app shows a "waking up…" indicator on the first API call.

### 6. Seed production database

From Render's shell (or locally with the prod `MONGODB_URI`):

```bash
node dist/seed.js
```

### 7. Deploy Web → Vercel

1. [vercel.com](https://vercel.com) → New Project → import repo
2. Root directory: `apps/web`
3. Framework: Next.js
4. Set env vars:
   - `NEXT_PUBLIC_API_URL=https://lumora-api.onrender.com/api/v1`
   - `NEXT_PUBLIC_SOCKET_URL=https://lumora-api.onrender.com`
   - `NEXT_PUBLIC_SITE_URL=https://lumora.vercel.app`
5. Deploy — Vercel auto-deploys on every push to `main`

### 8. Cross-origin cookies

When web (Vercel) and API (Render) are on different domains, cookies need:
```
httpOnly; Secure; SameSite=None; Path=/
```
This is set automatically when `NODE_ENV=production`. Ensure your API is served over HTTPS (Render provides this by default).

---

## Self-Host with Docker + Nginx (Linux VPS)

```bash
# On a Linux server with Docker installed:
git clone <your-repo> lumora && cd lumora
cp .env.example .env && nano .env  # fill in all vars

# Build + start
docker compose up -d --build

# Seed
docker compose exec api node dist/seed.js

# Install Nginx
sudo apt install nginx

# Copy config
sudo cp nginx/lumora.conf /etc/nginx/sites-available/lumora
sudo ln -s /etc/nginx/sites-available/lumora /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d lumora.app -d www.lumora.app
# Uncomment the HTTPS block in nginx/lumora.conf after Certbot runs
```

---

## Environment Reference

See `.env.example` for all variables with descriptions.

| Variable | App | Required |
|---|---|---|
| `NODE_ENV` | API | Yes |
| `PORT` | API | No (default 4000) |
| `CORS_ORIGINS` | API | Yes |
| `MONGODB_URI` | API | Yes |
| `REDIS_URL` | API | Yes |
| `JWT_ACCESS_SECRET` | API | Yes (≥32 chars) |
| `JWT_REFRESH_SECRET` | API | Yes (≥32 chars) |
| `GROQ_API_KEY` | API | Yes (AI concierge) |
| `CLOUDINARY_*` | API | Yes (image uploads) |
| `RESEND_API_KEY` | API | No (logs to console if absent) |
| `NEXT_PUBLIC_API_URL` | Web | Yes |
| `NEXT_PUBLIC_SOCKET_URL` | Web | Yes |
| `NEXT_PUBLIC_SITE_URL` | Web | Yes |

---

## CI / CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:

1. **Lint + Typecheck** — ESLint and `tsc --noEmit` for both apps
2. **Test** — Vitest unit/integration tests for both apps (API uses in-memory replica set for transaction tests)
3. **Build** — Production build for both apps
4. **E2E** — Playwright against running API + web (MongoDB + Redis services)
5. **Security audit** — `npm audit --audit-level=high`

Vercel and Render auto-deploy from `main` on a passing CI run.

---

## QA Checklist

Gates completed:

- [x] `lint` clean — web + api
- [x] `typecheck` clean — no unresolved `any` without comment
- [x] `build` succeeds — web (Next.js standalone) + api (tsc)
- [x] Lighthouse targets (run in incognito, report in screenshots):
  - Performance: ≥ 92 mobile / ≥ 98 desktop
  - Accessibility: ≥ 95
  - Best Practices: ≥ 95
  - SEO: ≥ 95

Full manual checklist from `specs/07_qa-and-dod.md` to be completed on live URLs after deploy.

---

## What I'd Build Next

1. **Real payments** — The `PaymentProvider` interface is already in place; drop in a Stripe or Adyen adapter. No other code needs to change.
2. **Search service** — Replace the Mongoose text-search with Typesense or Algolia for sub-10ms full-text search with typo tolerance.
3. **Personalised recommendations** — Collaborative filtering on the order history; feed signals to Lumi as context.
4. **Internationalisation** — Next.js `i18n` routing + `next-intl`; the design system and token names are already locale-agnostic.
5. **Coverage expansion** — Push unit coverage above 80% on all service files; add contract tests between the API and Next.js client.

---

## Decisions Log

| Decision | Reason |
|---|---|
| `npm` workspaces over `pnpm` | Zero additional tooling; Node 20 workspace hoisting is sufficient for this repo size |
| `data-theme` attribute on `<html>` | Matches `[data-theme="light"]` selector in spec globals.css verbatim; avoids FOUC via inline script |
| Flat ESLint config (v9+) | Avoids `.eslintrc` deprecation warnings on Node 20 |
| Admin pagination inside `data` field | `apiFetch` only returns `json.data`; bundling `{ data, meta }` inside the `data` field preserves the TypeScript contract without a separate code path |
| `StaggerGrid` wraps product arrays | Framer Motion `useInView` exits when the component unmounts — using a wrapper avoids prop-drilling `inView` through every `ProductCard` |
| `NEXT_PUBLIC_*` vars baked at build time | Next.js requirement; Vercel re-runs the build on env changes |
| Simulated checkout behind `PaymentProvider` interface | Stripe unavailable in region; the interface is the seam for a real gateway to drop in later |
| Groq on server only, never in client bundle | API key would be visible in the browser if called client-side; SSE from the API to the browser is the correct pattern |
| `SameSite=None; Secure` cookies in production | Web (Vercel) and API (Render) are on different domains; `SameSite=Lax` silently drops cross-site cookies in modern browsers |
