# 03 — API Contract

Base: `/api/v1`. JSON only. All inputs validated with **Zod**. Auth via httpOnly cookies (`access` ~15m, `refresh` ~7d, rotated). Roles: `customer`, `admin`.

## Conventions
- **Success:** `{ "success": true, "data": <payload>, "meta"?: {...} }`
- **Error envelope (every error):**
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Human readable", "details"?: [...] } }
```
- Codes: `VALIDATION_ERROR`(400), `UNAUTHENTICATED`(401), `FORBIDDEN`(403), `NOT_FOUND`(404), `CONFLICT`(409), `RATE_LIMITED`(429), `SERVER_ERROR`(500).
- **Pagination:** list endpoints accept `?page=1&limit=20`; respond with `meta: { page, limit, total, totalPages }`.
- **Rate limits (Redis):** auth routes 10/min/IP; AI chat 20/min/user; general 120/min/IP. 429 returns `Retry-After`.

## Health
- `GET /health` → `{ status:"ok", db:"up", redis:"up", uptime }`

## Auth
| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/auth/register` | – | `{name,email,password}` | user (safe) + sets cookies |
| POST | `/auth/login` | – | `{email,password}` | user (safe) + cookies |
| POST | `/auth/logout` | user | – | clears cookies |
| POST | `/auth/refresh` | refresh cookie | – | new access (rotates refresh) |
| GET  | `/auth/me` | user | – | current user (safe) |
| POST | `/auth/forgot-password` | – | `{email}` | `{sent:true}` (always 200; email or console-log token) |
| POST | `/auth/reset-password` | – | `{token,password}` | `{reset:true}` |

## Products
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/products` | – | query: `q, category(slug), brand, minPrice, maxPrice, minRating, inStock, tags, sort(price_asc|price_desc|newest|rating|popular), page, limit`. Returns products + `meta`. |
| GET | `/products/:slug` | – | single product + related (same category, top by soldCount) |
| GET | `/products/featured` | – | featured + bestsellers for home |
| POST | `/products` | admin | create (Zod: full product) |
| PATCH | `/products/:id` | admin | partial update |
| DELETE | `/products/:id` | admin | soft delete (`isActive=false`) |

## Categories
- `GET /categories` (public) · `POST/PATCH/DELETE /categories[/:id]` (admin)

## Cart  (all `user`)
- `GET /cart` → populated cart + computed `{subtotal,discount,shipping,total}`
- `POST /cart/items` `{productId, qty, variant?}` (validates stock)
- `PATCH /cart/items/:productId` `{qty}` · `DELETE /cart/items/:productId`
- `DELETE /cart` (clear) · `POST /cart/coupon` `{code}` → applies/validates · `DELETE /cart/coupon`
- `POST /cart/merge` `{items:[...]}` → merge guest cart on login

## Wishlist (`user`)
- `GET /wishlist` · `POST /wishlist/toggle` `{productId}` → `{added:boolean}`

## Orders
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/orders` | user | `{shippingAddress, shippingMethod, payment:{number,exp,cvc,name}}` → runs simulated payment + stock decrement transaction → returns order. **Validate card server-side (Luhn/exp/cvc); store only last4 + brandGuess.** |
| GET | `/orders` | user | my orders (paginated) |
| GET | `/orders/:orderNumber` | user(owner)/admin | order detail + statusHistory |
| GET | `/admin/orders` | admin | all orders, filter by status |
| PATCH | `/admin/orders/:id/status` | admin | `{status}` → push history + **emit `order:status` to user room** |

## Reviews
- `GET /products/:id/reviews` (public, paginated)
- `POST /products/:id/reviews` (user) `{rating,title?,body}` → sets `isVerifiedPurchase` if user has delivered order w/ product; recompute product rating
- `DELETE /reviews/:id` (owner/admin) · `PATCH /admin/reviews/:id` (admin) `{isApproved}`

## Uploads
- `POST /uploads/sign` (admin) → returns Cloudinary signed params (never expose secret to client; client uploads directly to Cloudinary with the signature)

## Admin analytics
- `GET /admin/stats/overview` → `{revenue, orders, aov, newUsers, deltas}` (aggregation over period `?days=30`)
- `GET /admin/stats/sales` → time series `[{date,revenue,orders}]`
- `GET /admin/stats/top` → `{topProducts:[...], topCategories:[...]}`

## AI
- `POST /ai/chat` (public, rate-limited) — **streaming SSE**. Body `{messages:[...], sessionId}`. Server runs Groq with tools (see `05`), executes tool calls against the real DB, streams text deltas + a final `tool_actions` event (e.g. an add-to-cart confirmation the UI can act on). Auth-gated tools (`get_order_status`) require the user cookie.

## Socket.io events
- Client connects with access cookie → server joins `user:<id>` room (+ `admin` room for admins).
- `stock:update` `{productId, stock}` — broadcast on any stock change (checkout, admin edit).
- `order:status` `{orderNumber, status, at}` — to the owning user's room when admin updates status.
- `presence` (admin room) — connected admins count (optional).

## Validation & security notes
- Every body/query validated with Zod; reject unknown fields.
- Sanitize strings; cap array/string lengths; coerce numbers.
- CORS allowlist = web origin(s); credentials true. Cookies `httpOnly; SameSite=None; Secure` in prod.
- Never return `passwordHash`/tokens. Owner-or-admin checks on order/review mutations.
