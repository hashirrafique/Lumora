# 06 — Environment & Deployment ($0)

All free tiers, no card required. Produce the real config files and a `README` deploy section.

## .env.example (document every var)
```bash
# ---------- API (apps/api) ----------
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:3000           # prod: https://lumora.vercel.app
MONGODB_URI=                                   # Atlas M0 connection string
REDIS_URL=                                     # Upstash redis:// or rediss:// URL
JWT_ACCESS_SECRET=                             # long random
JWT_REFRESH_SECRET=                            # long random (different)
ACCESS_TTL=15m
REFRESH_TTL=7d
COOKIE_DOMAIN=                                 # leave blank locally; set in prod if needed
GROQ_API_KEY=                                  # console.groq.com (no card)
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_FALLBACK_MODEL=llama-3.1-8b-instant
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=                                # optional; if empty, log reset tokens to console

# ---------- WEB (apps/web) ----------
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1     # prod: https://lumora-api.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000         # prod: https://lumora-api.onrender.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000           # prod: https://lumora.vercel.app
```

## Free service setup (tell me exactly what to paste)
1. **MongoDB Atlas (M0, free):** create cluster → DB user → network access `0.0.0.0/0` → copy connection string → `MONGODB_URI`.
2. **Upstash Redis (free):** create database → copy the Redis URL → `REDIS_URL`. (Used for rate limiting + caching.)
3. **Cloudinary (free):** dashboard → cloud name + API key + secret → the 3 `CLOUDINARY_*` vars. Uploads are signed server-side; client uploads direct.
4. **Groq (free, no card):** console.groq.com → API Keys → create → `GROQ_API_KEY`.
5. **Resend (optional, free):** for password-reset email. If skipped, the reset token is logged to the server console (state this in README).

## Deploy
**Backend → Render (free web service)**
- New Web Service → connect repo → root `apps/api`.
- Build: `npm ci && npm run build` · Start: `npm run start` · Health check path: `/api/v1/health`.
- Add all API env vars. Set `CLIENT_ORIGIN` = the Vercel URL. Set `NODE_ENV=production`.
- **Cold start caveat:** free instances sleep after ~15 min idle and take ~30–60s to wake. Add a tiny client "waking the server…" state on the first request, and (optional) a `/health` ping on app load.

**Frontend → Vercel (free Hobby)**
- Import repo → root `apps/web` → framework Next.js.
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_SITE_URL` = the Render URL / the Vercel URL.
- Deploys on every push to `main`.

**Cross-site cookies (web on Vercel, api on Render = different domains):**
- Set auth cookies `httpOnly; Secure; SameSite=None; Path=/`.
- API CORS: `origin: CLIENT_ORIGIN`, `credentials: true`. Frontend fetch/axios uses `credentials:'include'`. Socket.io client `withCredentials:true`, server CORS mirrors it.

**Seed prod once:** run the seed script against the Atlas URI (Render shell or local with prod `MONGODB_URI`).

## CI — `.github/workflows/ci.yml`
On push/PR: install → `lint` → `typecheck` → `build` for both apps (matrix or two jobs). Fail the build on any error. (Vercel/Render handle deploy on push; CI is the quality gate.)

## Local full stack — `docker-compose.yml`
Services: `mongo` (with volume), `redis`, `api` (depends_on mongo+redis), `web` (depends_on api). One `docker compose up` boots everything; api waits for mongo/redis healthchecks. Provide a `make seed` / npm script to seed the dockerized DB.

## Self-host path (proves Nginx/Linux/SSL on CV) — `nginx/lumora.conf`
Reverse proxy: `/` → web:3000, `/api` and `/socket.io` → api:4000 (with `Upgrade`/`Connection` headers for WebSockets), gzip, security headers, and a commented Certbot/Let's Encrypt block for SSL. Include short README notes for deploying the compose stack on a Linux VPS behind this Nginx config.

## Dockerfiles
Multi-stage for each app (build → slim runtime, non-root user, only prod deps in final image). `web` uses Next.js standalone output; `api` runs the compiled JS.
