# 08 — Engineering Standards (Principal / Staff Engineer)

The architecture, conventions, and non-functional bar. Apply everywhere. A staff engineer reviewing this repo should find it boring in the best way: predictable, layered, typed, observable.

## Architecture principles
- **Layered, one direction of dependency:** `routes → controllers → services → models`. Controllers are thin (parse + validate + call service + shape response). **All business logic and DB access lives in services.** No Mongoose calls in controllers or components.
- **Shared contracts:** request/response DTOs and shared enums live in `packages/types`, imported by both apps. The frontend never redefines a shape the backend already owns.
- **Fail fast at boot:** validate env with Zod on startup; refuse to start if a required var is missing/malformed. Same for DB/Redis connection — crash loudly, don't limp.
- **Stateless API:** no in-memory session state; everything in Mongo/Redis so Render restarts and scaling are safe.
- **Idempotent where it matters:** order creation accepts an `Idempotency-Key` header; a repeated key returns the original order instead of double-charging/double-decrementing.

## Backend folder structure (`apps/api/src`)
```
config/      env.ts (Zod), db.ts, redis.ts, logger.ts, cloudinary.ts, groq.ts
models/      *.model.ts
schemas/     *.schema.ts            # Zod validators per endpoint
services/    *.service.ts           # business logic + data access
controllers/ *.controller.ts        # thin
routes/      index.ts, *.routes.ts
middleware/  auth.ts rbac.ts validate.ts error.ts notFound.ts rateLimit.ts requestId.ts
sockets/     index.ts, order.socket.ts, stock.socket.ts
lib/         payment/ (PaymentProvider iface + SimulatedProvider)
             ai/ (groqClient.ts, tools.ts, runChat.ts)
utils/       ApiError.ts asyncHandler.ts response.ts token.ts password.ts slug.ts
app.ts       # express app + middleware order
server.ts    # http + socket.io + graceful shutdown
seed.ts
```

**Middleware order (exact):** `requestId → morgan(logger) → helmet → cors(allowlist,credentials) → cookieParser → json/urlencoded(limits) → rateLimit → routes → notFound → errorHandler`.

## Frontend folder structure (`apps/web/src`)
```
app/
  (shop)/ layout.tsx page.tsx  shop/  product/[slug]/  cart/  checkout/  search/
  (auth)/ login/ register/ forgot-password/ reset-password/
  account/ (protected) orders/ orders/[orderNumber]/ wishlist/ profile/ addresses/
  admin/   (protected, admin) overview/ products/ orders/ users/ reviews/
  layout.tsx  not-found.tsx  error.tsx  globals.css  opengraph-image.tsx
components/ ui/  shop/  admin/  ai/  layout/  motion/
lib/        api.ts (axios, credentials, refresh interceptor)  queryClient.ts  socket.ts  fonts.ts  utils.ts  seo.ts
store/      cart.store.ts  ui.store.ts        # Zustand
hooks/      useDebounce, useMediaQuery, useCart, useAuth, useSocket...
types/      re-exports from packages/types
```

## State ownership (frontend — no overlap)
- **URL** = catalog filters/sort/search/pagination (shareable, back-button correct).
- **TanStack Query** = all server data (products, cart, orders, reviews). Cache keys namespaced; invalidate on mutation; optimistic updates for cart/wishlist with rollback on error.
- **Zustand** = ephemeral UI (cart drawer open, theme, command-palette, toasts) + guest cart mirror.
- **react-hook-form + Zod** = every form; inline field errors; disabled+spinner while submitting; never submit on invalid.
- Prefer **Server Components** for static/SEO content; Client Components only where interactivity/state is needed.

## Error handling
- Backend: one `ApiError(code,message,status,details?)` class + central error middleware → always the `03` envelope. `asyncHandler` wraps controllers (no unhandled rejections). Never leak stack traces in prod; log them server-side with the request id.
- Frontend: route-level `error.tsx` boundaries + a global boundary; query errors surface as toasts + inline retry; a typed `api` client maps the error envelope to a usable `AppError`.
- The 401→refresh→retry flow is handled once in the axios interceptor; on refresh failure → clear auth + redirect to login.

## Observability
- Structured JSON logs (pino or morgan+pino) with `requestId`, method, path, status, latency. Redact secrets/passwords.
- `GET /api/v1/health` (liveness) and a readiness check (db+redis). 
- Optional free **Sentry** (frontend + backend) if a DSN is provided; otherwise console with levels. Don't crash the app if Sentry is absent.

## The checkout transaction (get this exactly right)
1. Validate cart server-side (re-price from DB, never trust client).
2. Open a **Mongo session/transaction** (Atlas M0 supports transactions on replica set):
   - For each item: assert `stock >= qty` (fail whole order with a clear per-item message if not).
   - Run simulated payment (validate Luhn/expiry/CVC; derive brand+last4).
   - Create the Order (snapshot title/price/image per line).
   - `$inc` product stock down + `soldCount` up.
   - Clear the user's cart; mark coupon used.
3. Commit; on any failure, **abort** (no partial fulfilment) and return a typed error.
4. After commit: emit `stock:update` + (later) `order:status`, send confirmation (email or console), return the order.
- Honor `Idempotency-Key`: store key→orderId in Redis (TTL 24h); replays return the same order.

## Performance & quality budgets
- Web vitals: **LCP < 2.5s**, **CLS < 0.1**, **INP < 200ms** (mobile, mid-tier device).
- Initial JS for the storefront route ≤ ~180KB gzipped; dynamic-import the AI dock, command palette, charts, admin bundle, and any 3D/tilt code.
- API p95 latency < 300ms for reads on warm instance (cold start excepted). Indexed queries only on hot paths; no N+1 (use `.populate` selectively or aggregation).
- Redis-cache featured/home + hot product reads (short TTL, invalidate on write).
- TypeScript `strict`; ESLint with no-floating-promises, no-explicit-any (warn), import/order; Prettier. Conventional commits. Pre-commit hook runs lint+typecheck on staged files.

## Graceful shutdown
On SIGTERM/SIGINT: stop accepting new connections, drain in-flight, close socket.io, close Mongo/Redis, then exit. Render restarts must not drop requests mid-flight.
