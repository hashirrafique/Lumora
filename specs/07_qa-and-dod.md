# 07 — QA Gate & Definition of Done

Do not declare the build finished until every box passes **on the live deployed URLs**. Report the completed checklist back to me with real numbers.

## Automated
- [ ] `lint` clean (web + api), `typecheck` clean (no stray `any` without a reason comment), `build` succeeds for both.
- [ ] CI workflow is green.
- [ ] API smoke test (Postman collection or script) hits **every** endpoint in `03` → expected status + shape. No 500s on happy paths.
- [ ] Lighthouse (incognito, mobile + desktop) run on Home, Catalog, Product, and paste the scores:
  - Performance ≥ **92 mobile / 98 desktop**
  - Accessibility, Best Practices, SEO ≥ **95**
  - If a target is missed, simplify per master §5 and re-run — don't ship under.

## Manual click-through (every item must actually work)
**Auth**
- [ ] Register → login → `me` persists across reload → logout → refresh-token keeps session alive → protected route redirects when logged out.
- [ ] Forgot-password issues a token (email or console) → reset works.

**Storefront**
- [ ] Home: hero, featured/bestsellers, category grid, newsletter — all render from real data; CTAs navigate.
- [ ] Catalog: every filter (category, price slider, rating, brand, in-stock, tags) and every sort changes results; state is in the URL and is shareable; pagination/infinite-scroll works; instant search returns real matches; empty state shows on no results.
- [ ] Product: gallery + zoom, variant selection, **live stock** (open a 2nd tab, change stock → updates), add-to-cart, add-to-wishlist, related products, reviews list, write-a-review (verified-purchase badge correct).
- [ ] Cart: add / change qty / remove; subtotal correct; promo code validates server-side (valid + invalid + below-min cases); persists across reload; guest cart merges on login.

**Checkout & orders**
- [ ] Multi-step checkout; card validation rejects bad Luhn/expiry/CVC; success creates a real order, decrements stock, clears cart, shows animated confirmation with order number.
- [ ] Order appears in user dashboard history with correct totals and a status timeline.
- [ ] Out-of-stock and low-stock products show the right states and block over-ordering.

**Real-time**
- [ ] Admin changes an order's status → that customer's dashboard updates live (no refresh).
- [ ] Stock change (checkout or admin) reflects live on the product page in another tab.

**Admin (RBAC)**
- [ ] Non-admin is blocked from `/admin` (UI + API).
- [ ] Overview KPIs + charts render from aggregation (numbers match seed/orders).
- [ ] Product CRUD incl. Cloudinary image upload; create/edit/soft-delete reflect on storefront.
- [ ] Order status update (customer sees live), user role change, review moderate/approve.

**AI concierge**
- [ ] Streams token-by-token (fast).
- [ ] "Best noise-cancelling earbuds" → returns **real catalog** items with real prices/specs; never invents products.
- [ ] Recommends only in-stock items; suggests alternative when something's out.
- [ ] add_to_cart from chat updates the real cart + toast.
- [ ] get_order_status requires sign-in and only returns the user's own order.
- [ ] 429 fallback to 8B model verified; friendly message on hard limit.

**Cross-cutting**
- [ ] Theme toggle (dark/light) persists; ⌘K command palette searches + navigates.
- [ ] Mobile menu, toasts, loading skeletons, empty states, and a global error boundary all work.
- [ ] **Every button/link/icon on every page does something correct — zero dead handlers.**
- [ ] Fully responsive at 375 / 768 / 1280px — no overflow, no broken layout.
- [ ] Keyboard navigation + visible focus rings + AA contrast; `prefers-reduced-motion` kills non-essential motion.
- [ ] No console errors/warnings on any page; no failed network requests on happy paths.
- [ ] `.env` not committed; no secrets in client bundle (grep the build).

## Definition of Done
A reviewer (or a senior Anthropic engineer) opening the live site and the repo would conclude this is a polished, production-quality, end-to-end product — distinctive design, real backend, real-time, working AI, deployed, and fully functional with nothing faked.

## Deliverables to return
1. Live **web URL**, live **API URL**, **GitHub repo** link.
2. Seeded **admin** (`admin@lumora.app`) + **demo customer** credentials (password `Lumora@123`).
3. `README` with: architecture overview/diagram, local setup (incl. `docker compose up`), full deploy guide, env reference, screenshots/GIFs of key flows, and a "Decisions" log.
4. This **QA checklist completed**, with the real Lighthouse scores pasted in.
5. A short **"What I'd build next"** note (real payments behind the PaymentProvider interface, a search service, recommendations, tests).
