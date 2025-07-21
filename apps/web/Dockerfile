FROM oven/bun:1.2.15 AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Copy package files for full monorepo
COPY package.json bun.lockb* ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY turbo.json ./
# Install dependencies for all workspaces
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build web app
RUN bun run build --filter=web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set the correct permission for prerender cache
RUN mkdir -p ./apps/web/.next
RUN chown nextjs:nodejs ./apps/web/.next

# Copy standalone files
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Install curl for health checks
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy admin scripts and root package.json for admin operations (fallback container)
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/scripts ./scripts/
# COPY --from=builder /app/node_modules ./node_modules/
# COPY --from=builder /app/apps/server/src/db ./apps/server/src/db
# COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]