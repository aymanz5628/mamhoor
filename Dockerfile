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

# Generate Prisma Client
ENV DATABASE_URL "file:./dev.db"
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL "file:/app/prisma/prod.db"
ENV SESSION_SECRET "mamhoor-production-secret-2026-secure"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Create uploads directory and set permissions
RUN mkdir -p public/uploads
RUN chown nextjs:nodejs public/uploads

# SQLite setup - create dir with full permissions BEFORE copy
RUN mkdir -p /app/prisma
RUN chown -R nextjs:nodejs /app/prisma

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma

# Install prisma CLI for db push
RUN npm install -g prisma

USER nextjs

EXPOSE 3000
ENV PORT 3000

# Create database and start app - all inline to avoid script permission issues
CMD ["sh", "-c", "echo '==> Creating database...' && prisma db push --skip-generate --accept-data-loss 2>&1 && echo '==> Database ready!' && exec node server.js"]
