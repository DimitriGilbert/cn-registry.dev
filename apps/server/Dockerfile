FROM oven/bun:1.2.15 AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Copy package files
COPY package.json bun.lockb* ./
COPY apps/server/package.json ./apps/server/
COPY turbo.json ./
# Install dependencies
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

# Copy public folder if it exists
COPY --from=builder /app/apps/server/public* ./apps/server/public/ || true

# Set the correct permission for prerender cache
RUN mkdir -p ./apps/server/.next
RUN chown nextjs:nodejs ./apps/server/.next

# Copy standalone files
COPY --from=builder --chown=nextjs:nodejs /app/apps/server/.next/standalone ./
# Copy static files if they exist
COPY --from=builder --chown=nextjs:nodejs /app/apps/server/.next/static* ./apps/server/.next/static/ || true

USER nextjs

EXPOSE 42001

ENV PORT 42001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/server/server.js"]