# WebSocket Server Dockerfile for AnnotateAI Real-time Collaboration
FROM node:18-alpine AS deps

# Install dependencies
RUN apk add --no-cache libc6-compat dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 websocket

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build if needed
RUN npm run build:websocket || echo "No build script found"

# Production stage
FROM node:18-alpine AS runner

RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 websocket

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy application
COPY --from=deps --chown=websocket:nodejs /app/node_modules ./node_modules
COPY --chown=websocket:nodejs . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Switch to non-root user
USER websocket

# Expose port
EXPOSE 3001

# Start server
CMD ["dumb-init", "node", "index.js"] 