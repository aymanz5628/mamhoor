FROM node:22-alpine AS base

# Install dependencies with build tools for better-sqlite3
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL "file:./prod.db"
ENV SESSION_SECRET "build-time-secret"
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image - copy everything needed
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL "file:./prisma/prod.db"
ENV SESSION_SECRET "mamhoor-production-secret-2026-secure"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built app and all dependencies
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts

# Copy prisma files and database
RUN mkdir -p prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prod.db ./prisma/prod.db
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

RUN mkdir -p public/uploads
RUN chown nextjs:nodejs public/uploads

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "npx next start -p ${PORT:-3000}"]
