# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root manifests + api package only
COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

# Install all deps (needed to build @lumora/types)
RUN npm ci

# Copy source
COPY packages/types/ ./packages/types/
COPY apps/api/ ./apps/api/

# Build
RUN npm run build --workspace=apps/api

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Non-root user
RUN addgroup -S lumora && adduser -S lumora -G lumora

# Copy only production dependencies
COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/types ./packages/types

USER lumora

EXPOSE 4000

CMD ["node", "apps/api/dist/server.js"]
