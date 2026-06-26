# 11 — UX, Pages & Acceptance Criteria (Product Lead + Design Director)

What every screen contains, how it behaves, and the acceptance criteria that define "right." Build to these; they make the difference between a demo and a product.

## Information architecture / sitemap
```
/                         Home
/shop                     Catalog (filters/sort/search via URL params)
/product/[slug]           Product detail
/search                   Search results (also powers ⌘K)
/cart                     Cart page (+ slide-over drawer everywhere)
/checkout                 Multi-step checkout
/login /register
/forgot-password /reset-password
/account                  → redirect to /account/orders
/account/orders           Order history
/account/orders/[no]      Order detail + live status timeline
/account/wishlist
/account/profile          Profile + avatar
/account/addresses
/admin                    → /admin/overview (admin only)
/admin/overview           KPIs + charts
/admin/products           Product table + CRUD
/admin/orders             Orders + status control
/admin/users              Users + roles
/admin/reviews            Review moderation
/not-found (404)
```

## Page briefs (layout + behavior)

**Home** — Sticky glass nav (logo, Shop, categories, search hint ⌘K, cart, theme, account). Hero: aurora-mesh background, headline (`text-aurora` accent word), subcopy, two CTAs (Shop / Talk to Lumi), parallax. Sections: Featured collection (3D-tilt cards), Bestsellers carousel, Category grid (5), value props strip (Free shipping over $X, Secure checkout, AI concierge), social-proof reviews, newsletter capture (validates email), footer (links, socials, payment-method marks). Everything below the fold lazy-loads.

**Catalog** — Left filter rail (desktop) / filter sheet (mobile): category, price range slider, rating, brand checklist, in-stock toggle, tag chips. Top bar: result count, sort dropdown, grid/list toggle. Product grid with staggered reveal + skeletons while loading. Filters write to URL; "clear all"; empty state when no matches ("No matches — try adjusting filters" + reset). Pagination or infinite scroll.

**Product** — Gallery (thumbs + main, hover/zoom), title, brand, rating (stars + count, jump to reviews), price (+ "was" strike + discount %), **live stock** ("Only 3 left" pulses), variant selectors (color swatches/size), qty stepper, Add to Cart (spring feedback) + Wishlist heart, trust row (shipping/returns), spec accordion, description, reviews (list + write form, verified badge), related products. Out-of-stock → disabled CTA + "Notify me" placeholder + alternative suggestions.

**Cart (drawer + page)** — Line items (image, title, variant, qty stepper, remove), live subtotal, promo-code field (apply/remove, inline validation), shipping estimate, "Proceed to checkout", "Continue shopping". Empty state with CTA. Drawer slides from right; page is the full version.

**Checkout** — Stepper: 1) Address (saved or new) 2) Shipping method (radio cards w/ ETA) 3) Payment (simulated card form, formatted card input, inline Luhn/expiry/CVC validation, brand icon) 4) Review (order summary, edit links) → Place order (loading "processing…" → success). Success screen: animated check, order number, "track order" + "continue shopping". Errors (stock/coupon/payment) surface clearly without losing entered data.

**Account** — Sidebar nav. Orders: cards with status pill + total; detail shows **live timeline** (placed→packed→shipped→delivered) that updates via socket, plus reorder. Wishlist grid (move to cart). Profile: name/email/avatar upload. Addresses: CRUD + set default.

**Admin** — Dense, fast, table-driven. Overview: KPI cards (revenue, orders, AOV, new users) with animated counters + deltas, sales line chart, top-products/categories. Products: searchable/sortable/paginated table, create/edit drawer with image upload + variants + stock, featured toggles, soft delete. Orders: filter by status, detail, status dropdown (pushes live update). Users: role select, ban toggle. Reviews: approve/remove. Every table has loading/empty states + optimistic updates.

## User stories with acceptance criteria (top flows)

**Browse & filter**
- *As a shopper, I can narrow products so I find what I want fast.*
  - AC: selecting any filter updates results without full reload; the URL reflects state and is shareable; "in stock only" hides 0-stock; clearing filters restores all; no-match shows a helpful empty state.

**Add to cart & persist**
- *As a shopper, my cart survives reloads and follows me after login.*
  - AC: add reflects instantly (optimistic) and is confirmed by the server; reload keeps the cart; logging in merges my guest cart; qty can't exceed stock.

**Checkout**
- *As a shopper, I can buy with confidence.*
  - AC: invalid card is caught inline before submit; on success I get an order number and the items appear in history; stock drops by what I bought; a failed/aborted payment leaves stock untouched and my form intact.

**Track order (real-time)**
- *As a customer, I see my order status change without refreshing.*
  - AC: when an admin advances my order, my dashboard timeline updates live within ~1s.

**AI concierge**
- *As a shopper, I can ask for help and get real, buyable recommendations.*
  - AC: answers stream quickly; every recommended item exists, is in stock, and shows its real price; I can add it to cart from chat; order questions require sign-in and only show my own orders.

**Admin manage**
- *As an admin, I run the store.*
  - AC: I can create/edit/delete products with images; change order status (customer sees it live); change roles; moderate reviews — and non-admins can never reach these, in UI or API.

## Component inventory (build as a small design-system kit)
Button (primary/secondary/ghost/destructive · sizes · loading · disabled · icon), Input/Textarea/Select/Checkbox/Radio/Switch/Slider (with label+error), Card, GlassPanel, Badge (incl. gradient bestseller), Avatar, Rating stars, Price, StockBadge, QtyStepper, Tabs, Accordion, Dialog/Modal, Drawer (cart + mobile menu), Toast, Tooltip, Dropdown/Menu, CommandPalette, Pagination, Skeleton, EmptyState, ErrorState, Table (sortable), Chart wrappers, Stepper, ThemeToggle, AIChatDock + MessageBubble + ProductResultCard.

**Every interactive component must ship all states:** default, hover, focus-visible, active, disabled, loading, error. Every data view must ship loading (skeleton), empty, and error states.

## Accessibility (WCAG 2.1 AA)
- Cart drawer & modals: focus-trap, `role="dialog"`, `aria-modal`, Esc closes, focus returns to trigger.
- Search/command palette: combobox pattern with `aria-activedescendant`, arrow-key nav.
- All inputs labelled; errors linked via `aria-describedby`; icon-only buttons have `aria-label`.
- Visible focus ring (aurora) on every focusable; logical tab order; skip-to-content link.
- Contrast AA in both themes; never rely on color alone (pair with icon/text); `prefers-reduced-motion` disables non-essential motion.
- Live regions for cart updates / toasts / order-status changes.

## SEO
- Per-route `metadata` (title/description/canonical) + Open Graph + Twitter cards; dynamic `opengraph-image` for products.
- **JSON-LD** `Product` (name, image, price, availability, aggregateRating) on product pages; `BreadcrumbList` on catalog/product; `Organization` on home.
- `sitemap.xml` (products + categories) + `robots.txt`. Semantic HTML, one `h1` per page, descriptive `alt` on every image.

## Microcopy (tone: confident, warm, concise — no filler)
- Empty cart: "Your cart's feeling light. Let's fix that." → Shop now.
- No search results: "Nothing matched. Try fewer filters or ask Lumi."
- Checkout success: "You're all set. Order {number} is on its way."
- Out of stock: "Sold out for now — here's a close match."
- AI greeting: "Hi, I'm Lumi 👋 Tell me what you're shopping for."
