# AnnotateAI Production Dockerfile
# Multi-stage build for optimized production deployment

# Stage 1: Base dependencies
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Stage 2: Dependencies installation
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# Stage 3: Build stage
FROM base AS build
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 4: Production image
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Install production dependencies
RUN apk add --no-cache \
    python3 \
    curl \
    && rm -rf /var/cache/apk/*

# Copy built application
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Copy infrastructure engines
COPY --from=build --chown=nextjs:nodejs /app/../../infrastructure/engines ./infrastructure/engines

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

# Security enhancements
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"] 