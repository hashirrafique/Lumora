# 09 — Security (Security Lead)

Treat this as a release blocker, not a nice-to-have. Map every item to OWASP Top 10 and verify in QA (`07`) + tests (`10`).

## Authentication & sessions
- Passwords: bcrypt cost **12**; min policy: ≥8 chars with at least one letter + number (enforced client + server via Zod). Never log or return password/hash.
- Tokens: short-lived **access** (15m) + **refresh** (7d), both `httpOnly; Secure; SameSite=None; Path=/` cookies. Store only a **hash** of the current refresh token on the user; rotate on every refresh.
- **Refresh-reuse detection:** if a refresh token that doesn't match the stored hash is presented, treat as theft → invalidate the user's refresh token (force re-login). 
- Generic auth errors ("invalid email or password") — never reveal which field was wrong. `forgot-password` always returns 200 (no account enumeration).
- Brute-force: Redis rate-limit on `/auth/*` (e.g. 10/min/IP) + per-account login throttle.

## CSRF (critical — cookies are cross-site here)
Because auth cookies are `SameSite=None`, you MUST defend state-changing requests:
- Implement a **double-submit CSRF token**: issue a non-httpOnly `csrf` cookie + require the same value in an `X-CSRF-Token` header on all mutating requests (POST/PATCH/DELETE). Reject mismatches with 403.
- Strict **CORS allowlist** (exact web origin(s)) with `credentials:true`; reject others. Do not reflect arbitrary origins.
- The axios client attaches the CSRF header automatically; document this in README.

## Authorization (no IDOR, real RBAC)
- Every order/review/address/cart mutation checks **ownership** (`resource.user === req.user.id`) OR admin — at the **service layer**, not just the route.
- Admin endpoints behind `rbac('admin')` middleware **and** the UI hides admin nav for non-admins — but UI hiding is never the control; the API is.
- Never trust client-sent `userId`, `role`, prices, totals, or `isAdmin`. Derive identity from the verified token only.

## Input handling & injection
- Validate/whitelist every body+query+param with Zod; reject unknown keys; cap string/array lengths; coerce types.
- Mongo: use typed queries/`$`-operators carefully; sanitize against operator injection (e.g. `express-mongo-sanitize`); never build queries from raw user objects.
- Output: React escapes by default — **no `dangerouslySetInnerHTML`** on user content. Sanitize any rich text (reviews) server-side.

## Security headers / transport
- `helmet` with a real **Content-Security-Policy** (allow self + your API + Cloudinary images + Groq is server-side so not in CSP; no `unsafe-inline` for scripts — use nonces/hashes if needed), `Referrer-Policy`, `X-Content-Type-Options`, `Frame-Options/ frame-ancestors 'none'`, HSTS in prod.
- HTTPS only in prod (Vercel/Render terminate TLS). Cookies `Secure`. No mixed content.

## File uploads (Cloudinary)
- Client never holds the API secret. Server issues a **signed** upload (admin-only); restrict `resource_type=image`, allowed formats, max size; validate the returned URL is a Cloudinary URL before persisting.

## Secrets & supply chain
- All secrets via env only; `.env` git-ignored; `.env.example` has placeholders, never real values. No secrets in the client bundle (grep the build in QA).
- Lockfiles committed; run `npm audit` in CI (fail on high/critical where a fix exists). Pin/refresh dependencies.
- Rate-limit the AI endpoint (cost + abuse) and cap message length + tool rounds.

## AI-specific
- Prompt-injection containment: the concierge only acts through the defined tools, which run server-side with their own authz (e.g. `get_order_status` re-checks ownership). User/chat text can never escalate to admin actions or read other users' data. Strip/ignore any "ignore your instructions"-style content — tools are the only action surface.

## OWASP coverage checklist (verify)
- [ ] A01 Broken Access Control → ownership + RBAC at service layer, no IDOR.
- [ ] A02 Crypto Failures → bcrypt, HTTPS, secure cookies, hashed refresh tokens.
- [ ] A03 Injection → Zod + mongo-sanitize, no raw query building, React escaping.
- [ ] A04 Insecure Design → transactional checkout, idempotency, fail-closed.
- [ ] A05 Misconfiguration → helmet/CSP, CORS allowlist, no stack traces in prod.
- [ ] A07 Auth Failures → throttling, generic errors, no enumeration, token rotation+reuse detection.
- [ ] A08 Integrity → signed uploads, dependency audit, lockfiles.
- [ ] A09 Logging → structured logs w/ request id, secrets redacted.
- [ ] A10 SSRF → server only calls known hosts (Groq/Cloudinary/Mongo/Redis); no user-supplied URLs fetched.
