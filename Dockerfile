# Typequest Frontend - Next.js
# Multi-stage build for development and production

# ==================== Base Stage ====================
FROM node:20-alpine AS base

# Install libc6-compat for alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ==================== Dependencies Stage ====================
FROM base AS dependencies

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# ==================== Development Stage ====================
FROM dependencies AS development

# Copy source code
COPY . .

# Create .next directory with proper permissions
RUN mkdir -p .next && chown -R node:node /app

USER node

EXPOSE 3000

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Development command with hot reload
CMD ["npm", "run", "dev"]

# ==================== Builder Stage ====================
FROM dependencies AS builder

# Copy source code
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_USE_MOCK_API=false
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_USE_MOCK_API=$NEXT_PUBLIC_USE_MOCK_API
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# ==================== Production Stage ====================
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
