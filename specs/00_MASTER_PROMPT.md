# LUMORA — Master Build Prompt (Claude Code)

> **How to run this:** Put all twelve files from this `lumora-specs/` folder into the root of an empty repo (e.g. `./specs/`). Open Claude Code there and paste **this file** (`00_MASTER_PROMPT.md`) as your first message. It instructs Claude Code to read the other eleven spec files as the **source of truth** and build in phases. Best results: let it finish a phase, confirm it runs, then say "continue."

You are a **senior full-stack engineer + product designer**. Build and deploy **LUMORA**, a premium e-commerce + business platform with an AI shopping concierge. It must read as the work of a top product studio.

## 0. READ THE SPEC PACK FIRST (source of truth)

Before writing any code, read all of these and treat them as binding. Where they conflict with your defaults, the spec wins.

- `01_design-system.md` — Aurora Glass tokens, Tailwind config, globals.css, motion rules (USE VERBATIM)
- `02_data-models.md` — Mongoose schemas, indexes, relationships
- `03_api-contract.md` — every endpoint, request/response shapes, error envelope, socket events
- `04_seed-data.md` — categories, products, users, coupons (seed exactly this)
- `05_ai-concierge.md` — Groq system prompt + tool schemas + streaming protocol (USE VERBATIM)
- `06_env-and-deploy.md` — env vars, free-tier deploy steps, CI, Docker, Nginx
- `07_qa-and-dod.md` — QA gate + definition of done (must pass before you finish)
- `08_engineering-standards.md` — architecture layers, folder structures, conventions, error handling, the checkout transaction, perf budgets (BINDING)
- `09_security.md` — threat model, auth hardening, CSRF, RBAC/IDOR, headers/CSP (release blocker)
- `10_testing.md` — test pyramid, critical-path tests, coverage gates, E2E, CI
- `11_ux-pages.md` — sitemap, page-by-page briefs, user stories + acceptance criteria, component inventory, a11y, SEO, copy

## 0.5 SENIOR COUNCIL MANDATE

Build as if a council of senior leads must each sign off before release. Hold yourself to every one of their bars simultaneously:

- **Principal Architect** — clean layered architecture, typed contracts, idempotency, transactional integrity, graceful shutdown (`08`).
- **Staff Frontend** — correct state ownership (URL / Query / Zustand / form), RSC vs client boundaries, optimistic UI, accessibility, performance budgets (`08`, `11`).
- **Staff Backend** — thin controllers, service layer owns logic, no N+1, indexed hot paths, server-authoritative pricing (`02`, `03`, `08`).
- **Security Lead** — OWASP coverage, CSRF for cross-site cookies, RBAC + no IDOR, CSP, signed uploads, prompt-injection containment (`09`). Security issues block release.
- **QA Lead** — automated unit/integration/E2E on the critical paths + the manual gate; CI is green (`10`, `07`).
- **DevOps / SRE** — observability, health/readiness, cold-start handling, CI/CD, Docker/Nginx, zero-downtime restarts (`06`, `08`).
- **Design Director** — the Aurora Glass system executed precisely, full component-state matrix, motion discipline (`01`, `11`).
- **Product Lead** — every user story's acceptance criteria met; nothing faked (`11`).

When two bars tension (e.g. rich motion vs performance), resolve per §5 — never silently drop one.

## 1. NON-NEGOTIABLE REQUIREMENTS

1. **$0 running cost.** Free tiers only, no card required (see `06`).
2. **Original, cohesive frontend** — execute the Aurora Glass system in `01` precisely. No generic template look.
3. **Everything works end-to-end.** No dead buttons, no mock data hardcoded in the frontend, no `// TODO`, no unhandled promise, no `any` left as a shortcut.
4. **Fast & responsive.** Targets and the perf/animation trade-off are in §5.
5. **Real backend** per `02`/`03`. **Deployed live** per `06`.

## 2. RULES OF ENGAGEMENT

- **Work autonomously.** Make reasonable decisions and keep moving. Only stop to ask if genuinely blocked (e.g., you need a key I haven't supplied). When you make a non-obvious call, log it in `README` under "Decisions."
- **Verify before advancing.** At each phase boundary, run the phase's acceptance gate (§6). Don't start the next phase until the current one passes. Give me a 3–5 line status + what to verify.
- **No fake completeness.** Frontend always talks to the real API via TanStack Query. If a feature isn't wired to the backend, it isn't done.
- **Strict TypeScript** in both apps. `any` only with a `// reason:` comment. Shared DTOs live in `packages/types` and are imported by both web and api.
- **Consistent conventions:** ESLint + Prettier, conventional commits, one feature per commit, meaningful messages. Every API error uses the envelope in `03`. Every list endpoint paginates.
- **Accessibility is a requirement, not a nicety:** keyboard nav, visible focus rings, ARIA on interactive components, color contrast AA, labels on every input, `prefers-reduced-motion` respected.
- **Security baseline:** helmet, CORS allowlist, Redis-backed rate limiting, bcrypt, JWT access+refresh in httpOnly cookies, Zod validation on every input, no secret in client code, sanitize user input.

## 3. ANTI-PATTERNS — DO NOT DO THESE

- ❌ Don't hardcode product/order data in React. ❌ Don't ship buttons with empty `onClick`. ❌ Don't leave default Next.js/Tailwind scaffolding visible. ❌ Don't use a component library's default theme (build the design system). ❌ Don't store JWTs in localStorage. ❌ Don't skip loading/empty/error states. ❌ Don't block the main thread with heavy animation. ❌ Don't invent products in the AI chat (catalog-grounded only). ❌ Don't commit `.env`. ❌ Don't declare "done" without running the QA gate in `07`.

## 4. LOCKED STACK

**Frontend:** Next.js 14 (App Router) + TypeScript, Tailwind (custom tokens), Framer Motion, Zustand (cart/UI), TanStack Query (server state), lucide-react, `next/image`, `next/font`.
**Backend:** Node + Express + TypeScript, MongoDB + Mongoose, Socket.io, JWT, Zod, bcrypt, helmet, express-rate-limit (Redis store), cors, morgan.
**AI:** Groq (`https://api.groq.com/openai/v1`, OpenAI-compatible), primary `llama-3.3-70b-versatile`, fallback `llama-3.1-8b-instant`, streaming + tool-calling (see `05`).
**Free infra:** MongoDB Atlas M0, Upstash Redis, Cloudinary, Vercel (web), Render (api). Details in `06`.
**Payments:** Stripe is unavailable in my region — implement a **simulated checkout** (Luhn + expiry + CVC validation client & server, fake "processing", real order written, stock decremented) behind a `PaymentProvider` interface so a real gateway can drop in later. Do **not** wire a real gateway.

**Monorepo:**
```
lumora/
├─ apps/web/            # Next.js 14 frontend
├─ apps/api/            # Express backend
├─ packages/types/      # shared TS DTOs/types
├─ specs/               # this folder (reference)
├─ docker-compose.yml   # web+api+mongo+redis local dev
├─ nginx/lumora.conf
├─ .github/workflows/ci.yml
├─ postman/LUMORA.postman_collection.json
├─ .env.example
└─ README.md
```
Use npm or pnpm workspaces. Node 20.

## 5. PERFORMANCE ↔ ANIMATION RESOLUTION (important)

The Aurora Glass look (blur, gradient mesh, motion) can hurt Lighthouse if done naively. Resolve it like this and you keep both:
- **Animate only `transform` and `opacity`** (GPU-composited). Never animate `box-shadow`, `filter`, `width/height`, or layout props in loops.
- **Blur budget:** at most a few `backdrop-blur` glass surfaces visible per viewport; cap blur radius; never animate blur. Use a static pre-rendered radial-gradient image or a single low-opacity CSS gradient + a slow `transform` drift for the "aurora mesh" — not a per-frame canvas.
- **Defer + lazy:** aurora mesh and the 3D-tilt effect mount after first paint and only on `(hover: hover)` pointers; disable entirely under `prefers-reduced-motion`.
- **Standard wins:** `next/image` (AVIF/WebP, correct sizes), `next/font`, route-level code splitting, dynamic-import the AI dock + command palette + charts, memoize lists, debounce search, lazy-load below-the-fold.
- **Realistic target:** Performance ≥ 92 mobile / ≥ 98 desktop; **Accessibility, Best Practices, SEO ≥ 95**. If the hero mesh costs more than ~3 points, simplify it rather than miss the gate. Report actual scores in QA.

**Fonts:** headings **Space Grotesk**, body **Inter**, both via `next/font/google` (self-hosted, zero layout shift). (Avoid Clash Display — it's not on Google Fonts.)

## 6. PHASES & ACCEPTANCE GATES

Do them in order. Each must pass its gate before continuing.

**P0 — Scaffold.** Monorepo, both apps, shared types, Tailwind + globals.css from `01`, theme system (dark default + light), logo SVG + favicons, ESLint/Prettier, base layout/nav/footer, `.env.example`.
*Gate:* both apps boot; theme toggle works; `typecheck`/`lint` clean.

**P1 — Backend foundation.** DB connect, all models (`02`), auth (JWT access+refresh, httpOnly cookies, refresh rotation), middleware (helmet/cors/rate-limit/error handler), Zod validation, `/api/v1/health`. Seed script from `04`. Postman collection.
*Gate:* seed runs; register/login/refresh/me work in Postman; rate limit returns 429; refresh-reuse is detected; health is green; auth + product service tests pass (`10`).

**P2 — Storefront core.** Home, catalog (filters/sort/search, URL-synced), product detail, cart (Zustand + drawer + page), wishlist — all wired via TanStack Query. Skeletons + empty + error states.
*Gate:* full browse→filter→product→add-to-cart→persist-on-reload works against the live API.

**P3 — Auth UI + checkout + orders.** Register/login/forgot-password UI, protected routes, user dashboard, multi-step simulated checkout, order creation + stock decrement, order history + detail.
*Gate:* a full purchase creates a real order, decrements stock, clears cart, shows confirmation, appears in history; checkout transaction tests pass incl. insufficient-stock rollback + idempotency replay (`10`).

**P4 — Real-time.** Socket.io server+client; live stock on product pages; live order-status to user dashboard; per-user rooms; admin presence.
*Gate:* changing order status (via API) updates the customer UI live; stock change reflects live in a second tab.

**P5 — Admin dashboard.** RBAC-gated. Overview KPIs + charts (aggregation pipelines, animated counters), product/order/user/review management, Cloudinary uploads.
*Gate:* admin can CRUD a product (with image), change an order status (customer sees it live), change a role, moderate a review.

**P6 — AI concierge.** Groq streaming chat with the tools and system prompt from `05`; floating glass dock; quick-replies; Redis rate-limit + 8B fallback on 429.
*Gate:* chat streams; `search_products`/`get_product`/`recommend`/`get_order_status` return real catalog/order data; never invents products; fallback verified.

**P7 — Polish + perf + SEO + hardening.** Framer Motion pass (transitions, scroll reveals, micro-interactions per `01`), ⌘K command palette, **accessibility audit to WCAG 2.1 AA** (`11`), metadata/OG/JSON-LD product schema/sitemap/robots, image+bundle optimization, Lighthouse tuning per §5, and a **security pass against `09`** (CSRF, headers/CSP, IDOR checks, secret-in-bundle grep).
*Gate:* Lighthouse meets §5 targets; a11y audit clean; security checklist in `09` passes; metadata present on all routes.

**Cross-cutting tracks (run continuously, not a separate phase):**
- **Tests (`10`):** write tests alongside each phase — auth/products/cart in P1–P2, the checkout transaction in P3, real-time in P4, admin/RBAC in P5, AI tools in P6, E2E journeys in P7. CI must be green at every gate.
- **Security (`09`):** apply at the point each feature is built (auth hardening in P1, ownership/RBAC as endpoints land, CSRF before P8) — don't bolt it on at the end.
- **Accessibility (`11`):** build components with their full state + ARIA from the start; the P7 audit confirms, it doesn't rescue.

**P8 — Deploy.** Push to GitHub; deploy Atlas + Upstash + Cloudinary + Render (api) + Vercel (web) per `06`; set all env; production CORS + `SameSite=None; Secure` cookies; verify live end-to-end. Add Dockerfile/compose, Nginx, CI.
*Gate:* the **full QA checklist in `07`** passes on the live URLs.

## 7. DELIVERABLES (hand back at the end)

1. Live web URL, live API URL, GitHub repo.
2. Seeded admin + demo-user credentials.
3. `README`: architecture diagram, local setup, full deploy guide, env reference, screenshots/GIFs, "Decisions" log.
4. Completed QA checklist (`07`) with real Lighthouse scores pasted.
5. "What I'd build next" note.

**Begin with P0 now.** After each phase: 3–5 line status + what I should verify before you continue. Build LUMORA to be genuinely impressive.
