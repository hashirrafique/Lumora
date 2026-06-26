# ── Dependencies ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/web/package.json ./apps/web/

RUN npm ci

# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules 2>/dev/null || true

COPY packages/types/ ./packages/types/
COPY apps/web/ ./apps/web/
COPY package.json ./

# Build args become NEXT_PUBLIC_* env vars at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build --workspace=apps/web

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S lumora && adduser -S lumora -G lumora

# Copy only the standalone output (Next.js standalone mode)
COPY --from=builder --chown=lumora:lumora /app/apps/web/.next/standalone ./
COPY --from=builder --chown=lumora:lumora /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=lumora:lumora /app/apps/web/public ./apps/web/public

USER lumora

EXPOSE 3000

# Next.js standalone server
CMD ["node", "apps/web/server.js"]
