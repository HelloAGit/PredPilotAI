# syntax=docker/dockerfile:1

# ─── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace manifests and lockfile first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY services/stream-worker/package.json ./services/stream-worker/package.json

# Install all dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY packages/shared ./packages/shared
COPY services/stream-worker ./services/stream-worker

# Build shared package first (stream-worker depends on it)
RUN pnpm --filter @txline-monorepo/shared build
RUN pnpm --filter @txline-monorepo/stream-worker build

# ─── Production stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace manifests for production install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY services/stream-worker/package.json ./services/stream-worker/package.json

# Install production dependencies only
RUN pnpm install --frozen-lockfile --ignore-scripts --prod

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/services/stream-worker/dist ./services/stream-worker/dist

# Copy Anchor IDL if present (optional – needed at runtime for on-chain calls)
COPY programs/settlement/target/idl ./programs/settlement/target/idl 2>/dev/null || true

ENV NODE_ENV=production

CMD ["node", "services/stream-worker/dist/index.js"]
