# MedSight Pro Production Dockerfile
# HIPAA-compliant medical imaging platform with enhanced security

# Stage 1: Base dependencies with medical imaging libraries
FROM node:18-alpine AS base
WORKDIR /app

# Install medical imaging and security dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    openssl \
    ca-certificates \
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

# Stage 4: Production image with medical compliance
FROM node:18-alpine AS production
WORKDIR /app

# Create medical-specific user groups for HIPAA compliance
RUN addgroup -g 1001 -S medical \
    && adduser -S medsight -u 1001 -G medical

# Install production dependencies with medical imaging support
RUN apk add --no-cache \
    python3 \
    curl \
    openssl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Copy built application
COPY --from=build --chown=medsight:medical /app/.next/standalone ./
COPY --from=build --chown=medsight:medical /app/.next/static ./.next/static
COPY --from=build --chown=medsight:medical /app/public ./public

# Copy infrastructure engines with medical security
COPY --from=build --chown=medsight:medical /app/../../infrastructure/engines ./infrastructure/engines

# Copy WebGPU definitions for medical compute
COPY --from=build --chown=medsight:medical /app/webgpu.d.ts ./webgpu.d.ts

# Environment variables for medical compliance
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1 \
    MEDICAL_COMPLIANCE_MODE=true \
    HIPAA_AUDIT_ENABLED=true \
    ENCRYPTION_LEVEL=enhanced

# Security enhancements for medical data
RUN chown -R medsight:medical /app \
    && chmod -R 750 /app

# Switch to medical user for HIPAA compliance
USER medsight

# Health check with medical data security validation
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health/medical || exit 1

# Expose port
EXPOSE 3000

# Start application with medical compliance logging
CMD ["node", "server.js"] 