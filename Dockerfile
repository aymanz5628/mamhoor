FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and create database with all tables
ENV DATABASE_URL "file:./prisma/prod.db"
ENV SESSION_SECRET "build-time-secret-not-used-in-production"
RUN npx prisma generate
RUN npx prisma db push --skip-generate --accept-data-loss

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL "file:./prisma/prod.db"
ENV SESSION_SECRET "mamhoor-production-secret-2026-secure"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

RUN mkdir -p public/uploads
RUN chown nextjs:nodejs public/uploads

# Copy standalone app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema AND the ready-made database
RUN mkdir -p prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/prod.db ./prisma/prod.db

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
