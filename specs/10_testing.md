# 10 — Testing Strategy (QA Lead)

Automated tests are part of "done," not optional. Keep them fast and focused on critical paths — don't chase 100% coverage, chase confidence on the flows that matter.

## Tooling
- **Unit + integration (api):** Vitest (or Jest) + Supertest + `mongodb-memory-server` (in-memory Mongo, no external dep) + `ioredis-mock`.
- **Unit (web):** Vitest + React Testing Library for critical components/hooks.
- **E2E:** Playwright (Chromium + mobile viewport project), run against a locally booted full stack with the seed data.
- Coverage reported in CI; **gate: ≥70% on services + critical components** (don't pad with trivial tests).

## Backend tests (must exist)
**Auth**
- register validates + hashes; duplicate email → 409.
- login sets cookies; wrong password → generic 401.
- refresh rotates token; reused/old refresh token → invalidated (reuse detection).
- protected route without/with expired token → 401; with valid → 200.
- forgot-password always 200 (no enumeration).

**Products**
- list filters by category/price/rating/inStock; sort orders correct; pagination meta correct; text search matches.
- single product by slug returns related; inactive product 404.
- admin create/patch/delete enforces RBAC (customer → 403).

**Cart / coupon**
- add respects stock; totals computed server-side; client-sent totals ignored.
- coupon: valid applies; expired/inactive/below-min/over-max-uses each rejected with correct code.

**Checkout (the crown jewel — test hard)**
- happy path: order created, stock decremented, soldCount up, cart cleared.
- **insufficient stock** on any line → whole order fails, **nothing** decremented (transaction rollback).
- invalid card (bad Luhn/expiry/CVC) → rejected before order.
- **Idempotency-Key** replay → returns the same order, no double decrement.
- concurrency: two simultaneous checkouts on a last-1-stock item → exactly one succeeds.

**Orders / reviews / authz**
- user can read only their own orders; other user's order → 403 (IDOR test).
- review create sets `isVerifiedPurchase` correctly; one-review-per-user enforced; rating recompute correct.
- admin status update emits and persists history.

**Security tests**
- mutation without CSRF header → 403.
- mongo-operator injection attempt in query/body → sanitized/rejected.
- rate limit returns 429 after threshold with `Retry-After`.

## Frontend tests (focused)
- Cart store: add/update/remove/total math; guest→user merge.
- Filter→URL sync hook: changing filters updates the query string and back-button restores state.
- Product card, price/stock display, form validation (login/checkout) show inline errors.
- AI message renderer handles streaming chunks + tool result cards.

## E2E (Playwright — the real user journeys)
1. **Guest shops → buys:** home → catalog → filter → product → add to cart → register at checkout → simulated pay → order confirmation → order in history.
2. **Search + concierge:** ⌘K search finds a product; AI dock "best earbuds under $150" returns real in-stock items; add-to-cart from chat updates the cart badge.
3. **Admin loop:** admin logs in → edits a product's stock → opens a customer order → marks it "shipped" → (in a second context as that customer) dashboard shows the new status live.
4. **Resilience:** out-of-stock product blocks add; invalid coupon shows error; expired session refreshes silently; reduced-motion disables animations.
5. **Responsive:** key pages pass at 375px and 1280px with no overflow.

## CI integration (`.github/workflows/ci.yml`)
Jobs (fail the pipeline on any red):
1. `install` (cached).
2. `lint` + `typecheck` (web + api).
3. `test:api` (Vitest + memory Mongo).
4. `test:web` (Vitest).
5. `build` (web + api).
6. `e2e` (Playwright; boot api+web; optional but recommended — at minimum journeys 1 & 3).
7. `audit` (`npm audit --audit-level=high`).

## Manual QA
The full manual checklist in `07` is still run on the **live** deployment before sign-off — automated tests cover logic; the manual pass covers polish, real-time across tabs, and "every button works."
