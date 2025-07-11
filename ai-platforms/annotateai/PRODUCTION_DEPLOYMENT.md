# AnnotateAI Production Deployment Guide

## Overview

This guide provides complete instructions for deploying the AnnotateAI platform in a production environment using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ and Docker Compose 2.0+
- SSL certificates for HTTPS
- Production database (PostgreSQL 15+)
- Redis server for caching and sessions
- S3-compatible storage for file uploads
- Domain name and DNS configuration

## Quick Start

1. **Clone and prepare the repository**
   ```bash
   git clone <repository-url>
   cd ai-platforms/annotateai
   ```

2. **Configure environment variables**
   ```bash
   cp env.production.example .env.production
   # Edit .env.production with your production values
   ```

3. **Prepare SSL certificates**
   ```bash
   mkdir -p ssl
   # Copy your SSL certificates to ssl/fullchain.pem and ssl/privkey.pem
   ```

4. **Deploy the platform**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

## Detailed Configuration

### 1. Environment Variables

Copy `env.production.example` to `.env.production` and configure:

#### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/annotateai
POSTGRES_PASSWORD=secure_database_password

# Redis
REDIS_PASSWORD=secure_redis_password

# Authentication
NEXTAUTH_SECRET=your_super_secret_key_minimum_32_characters
NEXTAUTH_URL=https://your-domain.com

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-production-bucket

# External Services
SENTRY_DSN=your_sentry_dsn
STRIPE_SECRET_KEY=your_stripe_secret_key
```

#### Optional Variables
```env
# Monitoring
GRAFANA_PASSWORD=secure_grafana_password

# Performance
WORKER_CONCURRENCY=4
DB_POOL_SIZE=20

# Security
CORS_ORIGIN=https://your-domain.com
ALLOWED_HOSTS=your-domain.com
```

### 2. SSL Configuration

Place your SSL certificates in the `ssl/` directory:
```
ssl/
├── fullchain.pem  # Full certificate chain
└── privkey.pem    # Private key
```

### 3. Database Initialization

Place any database initialization scripts in `database/init/`:
```sql
-- database/init/01-create-extensions.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 4. Nginx Configuration

The default nginx configuration in `nginx/nginx.conf` includes:
- SSL termination with modern ciphers
- Security headers
- Rate limiting
- File upload handling
- WebSocket proxying
- Static file serving

Customize `nginx/conf.d/` for additional virtual hosts.

### 5. Monitoring Setup

Configure Prometheus and Grafana:
```bash
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/{dashboards,datasources}
```

## Production Services

The deployment includes these services:

### Core Services
- **annotateai**: Main Next.js application
- **postgres**: PostgreSQL database
- **redis**: Redis cache and sessions
- **nginx**: Reverse proxy and SSL termination

### Additional Services
- **websocket**: Real-time collaboration server
- **worker**: Background job processor
- **prometheus**: Metrics collection
- **grafana**: Monitoring dashboard

## Security Features

### Application Security
- Non-root containers
- Read-only file systems where possible
- Security headers (CSP, HSTS, etc.)
- Rate limiting
- CORS protection

### Network Security
- Custom Docker network isolation
- Internal service communication
- SSL/TLS encryption
- Firewall-ready port configuration

### Data Security
- Database encryption at rest
- Secure session management
- File upload validation
- GDPR compliance features

## Monitoring and Health Checks

### Health Endpoints
- Application: `GET /api/health`
- WebSocket: `GET /health` (port 3001)
- Nginx: `GET /health`

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization
- **Sentry**: Error tracking
- **Built-in health checks**: Container-level monitoring

### Key Metrics
- Response times
- Error rates
- Memory usage
- Database performance
- Queue depths
- Active connections

## Backup and Recovery

### Database Backups
```bash
# Create backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U annotateai annotateai > backup.sql

# Restore backup
docker-compose -f docker-compose.production.yml exec -T postgres psql -U annotateai annotateai < backup.sql
```

### File Backups
- Upload files are stored in S3 with versioning
- Database backups are stored in `./database/backups/`
- Redis persistence is configured for durability

## Scaling and Performance

### Horizontal Scaling
- Multiple application instances behind load balancer
- Database read replicas
- Redis clustering
- CDN for static assets

### Resource Allocation
```yaml
# Default resource limits
annotateai:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 4G
      reservations:
        cpus: '1.0'
        memory: 2G
```

### Performance Optimization
- Nginx caching for static assets
- Database query optimization
- Redis caching strategy
- Image optimization pipeline

## Deployment Commands

### Initial Deployment
```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f annotateai
```

### Updates and Maintenance
```bash
# Update application
docker-compose -f docker-compose.production.yml pull
docker-compose -f docker-compose.production.yml up -d

# Database migrations
docker-compose -f docker-compose.production.yml exec annotateai npm run migrate

# Restart specific service
docker-compose -f docker-compose.production.yml restart annotateai
```

### Troubleshooting
```bash
# View all logs
docker-compose -f docker-compose.production.yml logs

# Execute shell in container
docker-compose -f docker-compose.production.yml exec annotateai sh

# Check disk usage
docker system df
docker system prune -a --volumes
```

## Security Checklist

- [ ] SSL certificates installed and configured
- [ ] All default passwords changed
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Redis password configured
- [ ] Firewall rules configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] File upload restrictions set
- [ ] Monitoring alerts configured

## Performance Tuning

### Database Optimization
```sql
-- postgresql.conf optimizations
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
```

### Redis Optimization
```conf
# redis.conf optimizations
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Compliance and GDPR

The platform includes:
- Data export utilities
- Data deletion workflows
- Consent management
- Audit logging
- Data retention policies
- Privacy controls

## Support and Maintenance

### Log Management
- Centralized logging with structured JSON format
- Log rotation and retention policies
- Error tracking with Sentry integration

### Regular Maintenance
- Database maintenance and optimization
- Security updates
- Certificate renewal
- Backup verification
- Performance monitoring

## Troubleshooting Guide

### Common Issues

1. **Application won't start**
   - Check environment variables
   - Verify database connectivity
   - Check SSL certificate paths

2. **Database connection failed**
   - Verify DATABASE_URL format
   - Check PostgreSQL service status
   - Verify network connectivity

3. **WebSocket connection issues**
   - Check nginx WebSocket configuration
   - Verify WebSocket service is running
   - Check firewall rules

4. **File upload failures**
   - Verify S3 credentials
   - Check file size limits
   - Verify nginx upload configuration

### Debug Commands
```bash
# Check container health
docker-compose -f docker-compose.production.yml ps

# View detailed logs
docker-compose -f docker-compose.production.yml logs --tail=100 annotateai

# Test database connection
docker-compose -f docker-compose.production.yml exec annotateai npm run db:test

# Test Redis connection
docker-compose -f docker-compose.production.yml exec redis redis-cli ping
```

## Contact and Support

For production support:
- Documentation: https://docs.annotateai.com
- Support: support@annotateai.com
- Emergency: +1-XXX-XXX-XXXX

---

**Important**: This deployment guide assumes familiarity with Docker, Linux system administration, and web application deployment. Always test in a staging environment before production deployment. 