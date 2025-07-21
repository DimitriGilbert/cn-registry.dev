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

# Build server app
RUN bun run build --filter=server

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p ./apps/server/.next
RUN chown nextjs:nodejs ./apps/server/.next

# Copy standalone files
COPY --from=builder --chown=nextjs:nodejs /app/apps/server/.next/standalone ./
# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/apps/server/.next/static ./apps/server/.next/static

USER nextjs

EXPOSE 42001

ENV PORT 42001
ENV HOSTNAME "0.0.0.0"

# Install curl and postgres client for health checks and migrations
USER root
RUN apt-get update && apt-get install -y curl postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy drizzle files and bun for database operations
COPY --from=builder /app/apps/server/drizzle.config.ts ./apps/server/
COPY --from=builder /app/apps/server/src/db ./apps/server/src/db
COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun

USER nextjs

CMD ["node", "apps/server/server.js"]