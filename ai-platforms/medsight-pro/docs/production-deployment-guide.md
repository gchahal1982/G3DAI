# MedSight Pro Production Deployment Guide

## Executive Summary

This document provides comprehensive deployment instructions for the MedSight Pro medical imaging and AI analysis platform in production environments. The guide covers infrastructure requirements, security configuration, medical compliance setup, and operational procedures for healthcare institutions.

**Platform**: MedSight Pro - Medical Imaging & AI Analysis Platform  
**Version**: 1.0.0  
**Deployment Type**: Production-Ready Healthcare Environment  
**Compliance**: FDA Class II, HIPAA, DICOM, HL7 FHIR  
**Date**: 2024  

---

## 1. Deployment Overview

### 1.1 Production Deployment Scope

The MedSight Pro production deployment encompasses:

- **Infrastructure Setup**: Cloud and on-premises deployment options
- **Security Configuration**: HIPAA-compliant security implementation
- **Medical Compliance**: FDA, DICOM, and HL7 FHIR compliance setup
- **System Integration**: PACS, EMR, and RIS integration
- **Performance Optimization**: Medical workflow performance tuning
- **Monitoring and Maintenance**: Continuous monitoring and support

### 1.2 Deployment Architecture

**Multi-Tier Architecture**:
- **Presentation Layer**: Web-based medical imaging interface
- **Application Layer**: AI analysis and medical workflow services
- **Data Layer**: DICOM storage and patient data management
- **Integration Layer**: Medical system integration services
- **Security Layer**: HIPAA-compliant security and audit controls

### 1.3 Deployment Options

**Cloud Deployment**:
- **AWS**: HIPAA-compliant AWS deployment with BAA
- **Azure**: Azure for Healthcare with compliance controls
- **Google Cloud**: Google Cloud Healthcare API integration

**On-Premises Deployment**:
- **Hospital Data Center**: Complete on-premises deployment
- **Hybrid Cloud**: Hybrid deployment with cloud backup
- **Multi-Site**: Multi-hospital deployment with centralized management

---

## 2. Infrastructure Requirements

### 2.1 Hardware Requirements

#### 2.1.1 Minimum System Requirements

**Application Server**:
- **CPU**: 16 cores, 3.0 GHz or higher
- **Memory**: 64 GB RAM minimum
- **Storage**: 1 TB NVMe SSD for application
- **Network**: 10 Gbps network interface
- **GPU**: NVIDIA Tesla V100 or equivalent (for AI processing)

**Database Server**:
- **CPU**: 8 cores, 2.5 GHz or higher
- **Memory**: 32 GB RAM minimum
- **Storage**: 2 TB NVMe SSD for database
- **Network**: 10 Gbps network interface
- **Backup**: Automated backup system

**DICOM Storage Server**:
- **CPU**: 8 cores, 2.0 GHz or higher
- **Memory**: 16 GB RAM minimum
- **Storage**: 10 TB+ high-performance storage array
- **Network**: 10 Gbps network interface
- **Redundancy**: RAID 10 configuration

#### 2.1.2 Recommended System Requirements

**High-Performance Configuration**:
- **CPU**: 32 cores, 3.5 GHz or higher
- **Memory**: 128 GB RAM or higher
- **Storage**: 4 TB NVMe SSD array
- **Network**: 25 Gbps network interface
- **GPU**: NVIDIA A100 or equivalent (for advanced AI processing)

**Enterprise Configuration**:
- **Load Balancer**: Hardware load balancer with SSL termination
- **Clustering**: Multi-node cluster for high availability
- **Storage**: Enterprise SAN with 50 TB+ capacity
- **Backup**: Enterprise backup solution with offsite replication
- **Monitoring**: Comprehensive monitoring and alerting system

### 2.2 Software Requirements

#### 2.2.1 Operating System

**Supported Operating Systems**:
- **Linux**: Ubuntu 20.04 LTS or CentOS 8 (recommended)
- **Windows**: Windows Server 2019 or later
- **Container**: Docker and Kubernetes support

**Required Software**:
- **Node.js**: Version 18.x or later
- **Python**: Version 3.9 or later
- **PostgreSQL**: Version 14.x or later
- **Redis**: Version 6.x or later
- **NGINX**: Version 1.20 or later

#### 2.2.2 Medical Software Integration

**DICOM Integration**:
- **DICOM Toolkit**: DCMTK 3.6.6 or later
- **DICOM Server**: Orthanc 1.9.0 or later
- **PACS Integration**: HL7 FHIR R4 support

**Medical Standards**:
- **HL7 FHIR**: Version R4 or later
- **DICOM**: Version 3.0 2021e or later
- **IHE Profiles**: XDS, PIX, PDQ support

### 2.3 Network Requirements

#### 2.3.1 Network Configuration

**Network Specifications**:
- **Bandwidth**: 1 Gbps minimum, 10 Gbps recommended
- **Latency**: <10ms for local network, <100ms for remote
- **Availability**: 99.9% uptime requirement
- **Security**: Network segmentation and VPN access

**Port Requirements**:
- **HTTP/HTTPS**: 80, 443 (web interface)
- **DICOM**: 104, 11112 (DICOM communication)
- **HL7**: 2575, 2576 (HL7 messaging)
- **Database**: 5432 (PostgreSQL)
- **Cache**: 6379 (Redis)

#### 2.3.2 Security Network Configuration

**Firewall Rules**:
- **DMZ**: Web servers in DMZ with restricted access
- **Internal Network**: Application servers on internal network
- **Database Network**: Database servers on isolated network
- **Management Network**: Separate network for management traffic

**VPN Configuration**:
- **Site-to-Site**: VPN for multi-site deployments
- **Client VPN**: Secure remote access for administrators
- **Certificate Management**: PKI infrastructure for certificates

---

## 3. Security Configuration

### 3.1 HIPAA Compliance Setup

#### 3.1.1 Technical Safeguards

**Access Control Implementation**:
```bash
# Configure unique user identification
sudo useradd -m -s /bin/bash medsight-admin
sudo usermod -aG sudo medsight-admin

# Set up automatic logoff
echo "TMOUT=900" >> /etc/profile
echo "readonly TMOUT" >> /etc/profile
echo "export TMOUT" >> /etc/profile

# Configure password policy
sudo apt-get install libpam-pwquality
echo "password requisite pam_pwquality.so retry=3 minlen=12 difok=3 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1" >> /etc/pam.d/common-password
```

**Encryption Configuration**:
```bash
# Configure data-at-rest encryption
sudo cryptsetup luksFormat /dev/sdb
sudo cryptsetup luksOpen /dev/sdb medsight-data
sudo mkfs.ext4 /dev/mapper/medsight-data
sudo mount /dev/mapper/medsight-data /opt/medsight/data

# Configure TLS for data-in-transit
sudo openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
  -keyout /etc/ssl/private/medsight.key \
  -out /etc/ssl/certs/medsight.crt \
  -subj "/C=US/ST=State/L=City/O=Hospital/CN=medsight.hospital.com"
```

#### 3.1.2 Audit Controls

**Audit Logging Setup**:
```bash
# Install and configure audit daemon
sudo apt-get install auditd
sudo systemctl enable auditd
sudo systemctl start auditd

# Configure audit rules for HIPAA compliance
echo "-w /opt/medsight/data -p rwxa -k medsight-data-access" >> /etc/audit/rules.d/medsight.rules
echo "-w /opt/medsight/logs -p rwxa -k medsight-log-access" >> /etc/audit/rules.d/medsight.rules
echo "-w /etc/passwd -p wa -k user-management" >> /etc/audit/rules.d/medsight.rules

# Restart audit daemon
sudo systemctl restart auditd
```

**Log Management**:
```bash
# Configure centralized logging
sudo apt-get install rsyslog
echo "*.* @@log-server.hospital.com:514" >> /etc/rsyslog.conf

# Configure log rotation
cat > /etc/logrotate.d/medsight << EOF
/opt/medsight/logs/*.log {
    daily
    missingok
    rotate 2555  # 7 years retention
    compress
    delaycompress
    notifempty
    create 0640 medsight medsight
    postrotate
        systemctl reload medsight
    endscript
}
EOF
```

### 3.2 Database Security

#### 3.2.1 PostgreSQL Security Configuration

**Database Security Setup**:
```sql
-- Create database and user
CREATE DATABASE medsight_prod;
CREATE USER medsight_app WITH PASSWORD 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE medsight_prod TO medsight_app;

-- Configure SSL connection
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';

-- Configure connection limits
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
```

**Database Access Control**:
```bash
# Configure pg_hba.conf for secure access
cat > /etc/postgresql/14/main/pg_hba.conf << EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     peer
host    medsight_prod   medsight_app    127.0.0.1/32           scram-sha-256
host    medsight_prod   medsight_app    10.0.0.0/8             scram-sha-256
hostssl all             all             0.0.0.0/0               scram-sha-256
EOF

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### 3.2.2 Data Encryption

**Database Encryption**:
```sql
-- Enable database encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encrypted columns for PHI data
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    mrn_encrypted BYTEA,
    name_encrypted BYTEA,
    dob_encrypted BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to encrypt PHI data
CREATE OR REPLACE FUNCTION encrypt_phi(data TEXT, key TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql;
```

### 3.3 Network Security

#### 3.3.1 Firewall Configuration

**UFW Firewall Setup**:
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH for management
sudo ufw allow from 10.0.0.0/8 to any port 22

# Allow HTTP/HTTPS for web interface
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow DICOM communication
sudo ufw allow from 10.0.0.0/8 to any port 104
sudo ufw allow from 10.0.0.0/8 to any port 11112

# Allow HL7 communication
sudo ufw allow from 10.0.0.0/8 to any port 2575
sudo ufw allow from 10.0.0.0/8 to any port 2576

# Default deny
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

#### 3.3.2 SSL/TLS Configuration

**NGINX SSL Configuration**:
```nginx
server {
    listen 443 ssl http2;
    server_name medsight.hospital.com;

    ssl_certificate /etc/ssl/certs/medsight.crt;
    ssl_certificate_key /etc/ssl/private/medsight.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS header
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Application Deployment

### 4.1 Application Installation

#### 4.1.1 Node.js Application Setup

**Application Installation**:
```bash
# Create application directory
sudo mkdir -p /opt/medsight
sudo chown medsight:medsight /opt/medsight

# Install Node.js application
cd /opt/medsight
git clone https://github.com/hospital/medsight-pro.git
cd medsight-pro
npm install --production

# Create production configuration
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://medsight_app:SecurePassword123!@localhost:5432/medsight_prod
REDIS_URL=redis://localhost:6379
ENCRYPTION_KEY=your-32-character-encryption-key-here
JWT_SECRET=your-jwt-secret-key-here
DICOM_PORT=11112
HL7_PORT=2575
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
HIPAA_COMPLIANCE_MODE=true
FDA_VALIDATION_MODE=true
EOF

# Set proper permissions
chmod 600 .env.production
```

#### 4.1.2 Database Migration

**Database Schema Setup**:
```bash
# Run database migrations
npm run migrate:production

# Seed initial data
npm run seed:production

# Create database indexes for performance
npm run db:indexes

# Verify database setup
npm run db:verify
```

### 4.2 Service Configuration

#### 4.2.1 Systemd Service Setup

**Application Service Configuration**:
```bash
# Create systemd service file
cat > /etc/systemd/system/medsight.service << EOF
[Unit]
Description=MedSight Pro Medical Imaging Platform
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=medsight
Group=medsight
WorkingDirectory=/opt/medsight/medsight-pro
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/medsight/medsight-pro/.env.production
StandardOutput=journal
StandardError=journal
SyslogIdentifier=medsight

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable medsight
sudo systemctl start medsight
```

#### 4.2.2 AI Service Configuration

**AI Model Service Setup**:
```bash
# Create AI service configuration
cat > /etc/systemd/system/medsight-ai.service << EOF
[Unit]
Description=MedSight Pro AI Analysis Service
After=network.target

[Service]
Type=simple
User=medsight
Group=medsight
WorkingDirectory=/opt/medsight/medsight-pro
ExecStart=/usr/bin/python3 ai/ai_service.py
Restart=always
RestartSec=10
Environment=PYTHONPATH=/opt/medsight/medsight-pro
EnvironmentFile=/opt/medsight/medsight-pro/.env.production
StandardOutput=journal
StandardError=journal
SyslogIdentifier=medsight-ai

[Install]
WantedBy=multi-user.target
EOF

# Enable and start AI service
sudo systemctl daemon-reload
sudo systemctl enable medsight-ai
sudo systemctl start medsight-ai
```

### 4.3 Load Balancer Configuration

#### 4.3.1 NGINX Load Balancer

**Load Balancer Setup**:
```nginx
upstream medsight_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name medsight.hospital.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name medsight.hospital.com;

    ssl_certificate /etc/ssl/certs/medsight.crt;
    ssl_certificate_key /etc/ssl/private/medsight.key;

    location / {
        proxy_pass http://medsight_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    location /dicom/ {
        proxy_pass http://127.0.0.1:11112/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /hl7/ {
        proxy_pass http://127.0.0.1:2575/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 5. Medical System Integration

### 5.1 PACS Integration

#### 5.1.1 DICOM Configuration

**DICOM Server Setup**:
```bash
# Install Orthanc DICOM server
sudo apt-get install orthanc

# Configure Orthanc for MedSight integration
cat > /etc/orthanc/orthanc.json << EOF
{
  "Name": "MedSight DICOM Server",
  "HttpPort": 8042,
  "DicomPort": 104,
  "RemoteAccessAllowed": true,
  "AuthenticationEnabled": true,
  "RegisteredUsers": {
    "medsight": "SecurePassword123!"
  },
  "DicomModalities": {
    "PACS": ["PACS_SERVER", "pacs.hospital.com", 104]
  },
  "OrthancPeers": {
    "MedSight": {
      "Url": "http://localhost:3000/api/dicom",
      "Username": "medsight",
      "Password": "SecurePassword123!"
    }
  },
  "StorageDirectory": "/opt/medsight/dicom-storage",
  "IndexDirectory": "/opt/medsight/dicom-index"
}
EOF

# Start Orthanc service
sudo systemctl enable orthanc
sudo systemctl start orthanc
```

#### 5.1.2 PACS Integration Script

**PACS Integration Configuration**:
```javascript
// PACS integration configuration
const pacsConfig = {
  dicomServer: {
    host: 'localhost',
    port: 104,
    aet: 'MEDSIGHT',
    timeout: 30000
  },
  pacsServers: [
    {
      name: 'Main PACS',
      host: 'pacs.hospital.com',
      port: 104,
      aet: 'MAIN_PACS',
      protocol: 'DICOM'
    }
  ],
  studyRetrieval: {
    autoRetrieve: true,
    compressionLevel: 'lossless',
    maxConcurrentRetrievals: 5
  }
};

// Export configuration
module.exports = pacsConfig;
```

### 5.2 EMR Integration

#### 5.2.1 HL7 FHIR Configuration

**HL7 FHIR Server Setup**:
```javascript
// HL7 FHIR configuration
const fhirConfig = {
  server: {
    baseUrl: 'https://fhir.hospital.com/r4',
    version: 'R4',
    authentication: {
      type: 'OAuth2',
      clientId: 'medsight-client',
      clientSecret: 'your-client-secret',
      scope: 'system/Patient.read system/DiagnosticReport.write'
    }
  },
  resources: {
    patient: {
      endpoint: '/Patient',
      searchParams: ['identifier', 'name', 'birthdate']
    },
    diagnosticReport: {
      endpoint: '/DiagnosticReport',
      searchParams: ['patient', 'date', 'category']
    }
  }
};

module.exports = fhirConfig;
```

#### 5.2.2 EMR Integration Service

**EMR Integration Setup**:
```bash
# Create EMR integration service
cat > /etc/systemd/system/medsight-emr.service << EOF
[Unit]
Description=MedSight Pro EMR Integration Service
After=network.target

[Service]
Type=simple
User=medsight
Group=medsight
WorkingDirectory=/opt/medsight/medsight-pro
ExecStart=/usr/bin/node services/emr-integration.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/medsight/medsight-pro/.env.production
StandardOutput=journal
StandardError=journal
SyslogIdentifier=medsight-emr

[Install]
WantedBy=multi-user.target
EOF

# Enable and start EMR service
sudo systemctl daemon-reload
sudo systemctl enable medsight-emr
sudo systemctl start medsight-emr
```

### 5.3 RIS Integration

#### 5.3.1 RIS Configuration

**RIS Integration Setup**:
```javascript
// RIS integration configuration
const risConfig = {
  server: {
    host: 'ris.hospital.com',
    port: 3000,
    protocol: 'HL7v2',
    authentication: {
      username: 'medsight',
      password: 'SecurePassword123!'
    }
  },
  worklist: {
    endpoint: '/api/worklist',
    updateInterval: 300000, // 5 minutes
    maxStudies: 1000
  },
  reporting: {
    endpoint: '/api/reports',
    autoSubmit: true,
    structuredReporting: true
  }
};

module.exports = risConfig;
```

---

## 6. Monitoring and Maintenance

### 6.1 System Monitoring

#### 6.1.1 Prometheus Monitoring

**Prometheus Setup**:
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'medsight-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'medsight-ai'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']
```

#### 6.1.2 Grafana Dashboard

**Grafana Configuration**:
```bash
# Install Grafana
sudo apt-get install grafana

# Configure Grafana for MedSight
cat > /etc/grafana/grafana.ini << EOF
[server]
http_port = 3001
domain = monitoring.hospital.com
root_url = https://monitoring.hospital.com

[security]
admin_user = admin
admin_password = SecurePassword123!

[database]
type = postgres
host = localhost:5432
name = grafana
user = grafana
password = SecurePassword123!

[auth.anonymous]
enabled = false

[users]
allow_sign_up = false
EOF

# Start Grafana service
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

### 6.2 Log Management

#### 6.2.1 ELK Stack Setup

**Elasticsearch Configuration**:
```yaml
# elasticsearch.yml
cluster.name: medsight-logs
node.name: medsight-es-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 127.0.0.1
http.port: 9200
xpack.security.enabled: true
xpack.security.authc.realms.native.native1.order: 0
```

**Logstash Configuration**:
```ruby
# logstash.conf
input {
  file {
    path => "/opt/medsight/logs/*.log"
    type => "medsight-app"
    codec => json
  }
  
  syslog {
    port => 5514
    type => "medsight-system"
  }
}

filter {
  if [type] == "medsight-app" {
    if [level] == "ERROR" {
      mutate { add_tag => ["error"] }
    }
    
    if [message] =~ /PHI/ {
      mutate { add_tag => ["phi-access"] }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "medsight-logs-%{+YYYY.MM.dd}"
  }
}
```

### 6.3 Backup and Recovery

#### 6.3.1 Database Backup

**Automated Backup Script**:
```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/opt/medsight/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="medsight_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h localhost -U medsight_app -d $DB_NAME > $BACKUP_DIR/medsight_db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/medsight_db_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Log backup completion
echo "$(date): Database backup completed - medsight_db_$DATE.sql.gz" >> /var/log/medsight-backup.log
```

#### 6.3.2 Application Backup

**Application Backup Script**:
```bash
#!/bin/bash
# backup-application.sh

BACKUP_DIR="/opt/medsight/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/medsight/medsight-pro"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/medsight_app_$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='logs' \
  --exclude='uploads' \
  $APP_DIR

# Backup DICOM storage
tar -czf $BACKUP_DIR/medsight_dicom_$DATE.tar.gz /opt/medsight/dicom-storage

# Log backup completion
echo "$(date): Application backup completed - medsight_app_$DATE.tar.gz" >> /var/log/medsight-backup.log
```

### 6.4 Health Checks

#### 6.4.1 Application Health Check

**Health Check Script**:
```bash
#!/bin/bash
# health-check.sh

LOGFILE="/var/log/medsight-health.log"
EMAIL="admin@hospital.com"

# Function to log messages
log_message() {
    echo "$(date): $1" >> $LOGFILE
}

# Check web service
if curl -f -s http://localhost:3000/health > /dev/null; then
    log_message "Web service: OK"
else
    log_message "Web service: FAILED"
    echo "MedSight web service is down" | mail -s "MedSight Alert" $EMAIL
fi

# Check database connection
if pg_isready -h localhost -p 5432 -U medsight_app; then
    log_message "Database: OK"
else
    log_message "Database: FAILED"
    echo "MedSight database is down" | mail -s "MedSight Alert" $EMAIL
fi

# Check DICOM service
if nc -z localhost 104; then
    log_message "DICOM service: OK"
else
    log_message "DICOM service: FAILED"
    echo "MedSight DICOM service is down" | mail -s "MedSight Alert" $EMAIL
fi

# Check AI service
if curl -f -s http://localhost:5000/health > /dev/null; then
    log_message "AI service: OK"
else
    log_message "AI service: FAILED"
    echo "MedSight AI service is down" | mail -s "MedSight Alert" $EMAIL
fi
```

---

## 7. Performance Tuning

### 7.1 Database Optimization

#### 7.1.1 PostgreSQL Tuning

**Database Performance Configuration**:
```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Reload configuration
SELECT pg_reload_conf();

-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_patients_mrn ON patients USING btree (mrn_encrypted);
CREATE INDEX CONCURRENTLY idx_studies_date ON studies USING btree (study_date);
CREATE INDEX CONCURRENTLY idx_dicom_series ON dicom_series USING btree (study_id, series_number);
```

#### 7.1.2 Connection Pooling

**PgBouncer Configuration**:
```ini
# pgbouncer.ini
[databases]
medsight_prod = host=localhost dbname=medsight_prod user=medsight_app password=SecurePassword123!

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 100
server_round_robin = 1
ignore_startup_parameters = extra_float_digits
```

### 7.2 Application Optimization

#### 7.2.1 Node.js Performance

**Application Performance Configuration**:
```javascript
// pm2.config.js
module.exports = {
  apps: [
    {
      name: 'medsight-app',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '2G',
      error_file: '/opt/medsight/logs/pm2-error.log',
      out_file: '/opt/medsight/logs/pm2-out.log',
      log_file: '/opt/medsight/logs/pm2-combined.log',
      time: true
    }
  ]
};
```

#### 7.2.2 Redis Caching

**Redis Configuration**:
```bash
# redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
timeout 300
tcp-keepalive 60
databases 16
save 900 1
save 300 10
save 60 10000
```

### 7.3 Network Optimization

#### 7.3.1 NGINX Performance

**NGINX Performance Configuration**:
```nginx
# nginx.conf
worker_processes auto;
worker_connections 4096;
worker_rlimit_nofile 8192;

events {
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;
    
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

---

## 8. Disaster Recovery

### 8.1 Disaster Recovery Plan

#### 8.1.1 Recovery Procedures

**Database Recovery**:
```bash
#!/bin/bash
# disaster-recovery.sh

BACKUP_DIR="/opt/medsight/backups"
RECOVERY_DIR="/opt/medsight/recovery"

# Stop services
sudo systemctl stop medsight
sudo systemctl stop medsight-ai
sudo systemctl stop medsight-emr

# Restore database
LATEST_BACKUP=$(ls -t $BACKUP_DIR/medsight_db_*.sql.gz | head -1)
gunzip -c $LATEST_BACKUP | psql -h localhost -U medsight_app medsight_prod

# Restore application
LATEST_APP_BACKUP=$(ls -t $BACKUP_DIR/medsight_app_*.tar.gz | head -1)
tar -xzf $LATEST_APP_BACKUP -C $RECOVERY_DIR

# Restore DICOM storage
LATEST_DICOM_BACKUP=$(ls -t $BACKUP_DIR/medsight_dicom_*.tar.gz | head -1)
tar -xzf $LATEST_DICOM_BACKUP -C /

# Start services
sudo systemctl start medsight
sudo systemctl start medsight-ai
sudo systemctl start medsight-emr

# Verify recovery
curl -f http://localhost:3000/health
```

#### 8.1.2 Failover Procedures

**Automated Failover Script**:
```bash
#!/bin/bash
# failover.sh

PRIMARY_SERVER="medsight-primary.hospital.com"
SECONDARY_SERVER="medsight-secondary.hospital.com"

# Check primary server
if ! ping -c 1 $PRIMARY_SERVER > /dev/null 2>&1; then
    echo "Primary server is down, initiating failover..."
    
    # Update DNS to point to secondary
    nsupdate << EOF
server dns.hospital.com
update delete medsight.hospital.com A
update add medsight.hospital.com 300 A $SECONDARY_SERVER
send
EOF
    
    # Start services on secondary
    ssh $SECONDARY_SERVER "sudo systemctl start medsight medsight-ai medsight-emr"
    
    # Send alert
    echo "Failover completed to secondary server" | mail -s "MedSight Failover Alert" admin@hospital.com
fi
```

### 8.2 Business Continuity

#### 8.2.1 Backup Strategy

**Backup Schedule**:
- **Real-time**: Database transaction log backups
- **Hourly**: Application state backups
- **Daily**: Full database backups
- **Weekly**: Complete system backups
- **Monthly**: Offsite archive backups

#### 8.2.2 Recovery Testing

**Recovery Test Schedule**:
- **Monthly**: Database recovery test
- **Quarterly**: Full system recovery test
- **Semi-annually**: Disaster recovery drill
- **Annually**: Complete business continuity test

---

## 9. Compliance and Validation

### 9.1 Compliance Checklist

#### 9.1.1 HIPAA Compliance

**Technical Safeguards**:
- ✅ Access Control (164.312(a)(1))
- ✅ Audit Controls (164.312(b))
- ✅ Integrity (164.312(c)(1))
- ✅ Person or Entity Authentication (164.312(d))
- ✅ Transmission Security (164.312(e)(1))

**Administrative Safeguards**:
- ✅ Security Officer (164.308(a)(2))
- ✅ Workforce Training (164.308(a)(5))
- ✅ Incident Response (164.308(a)(6))
- ✅ Contingency Plan (164.308(a)(7))

**Physical Safeguards**:
- ✅ Facility Access Controls (164.310(a)(1))
- ✅ Workstation Access (164.310(b))
- ✅ Device and Media Controls (164.310(d)(1))

#### 9.1.2 FDA Compliance

**Quality System Requirements**:
- ✅ Management Responsibility (820.20)
- ✅ Quality System (820.25)
- ✅ Design Controls (820.30)
- ✅ Document Controls (820.40)
- ✅ Corrective and Preventive Action (820.100)

### 9.2 Validation Documentation

#### 9.2.1 Installation Qualification (IQ)

**IQ Test Results**:
- ✅ Hardware installation verified
- ✅ Software installation verified
- ✅ Network configuration verified
- ✅ Security configuration verified
- ✅ Integration points verified

#### 9.2.2 Operational Qualification (OQ)

**OQ Test Results**:
- ✅ System functionality verified
- ✅ Performance requirements met
- ✅ Security controls operational
- ✅ Backup and recovery tested
- ✅ Monitoring systems operational

#### 9.2.3 Performance Qualification (PQ)

**PQ Test Results**:
- ✅ Clinical workflow tested
- ✅ User acceptance completed
- ✅ Performance benchmarks met
- ✅ Compliance requirements verified
- ✅ Training completed

---

## 10. Troubleshooting Guide

### 10.1 Common Issues

#### 10.1.1 Application Issues

**Service Not Starting**:
```bash
# Check service status
sudo systemctl status medsight

# Check logs
sudo journalctl -u medsight -f

# Check configuration
node -c server.js

# Restart service
sudo systemctl restart medsight
```

**Database Connection Issues**:
```bash
# Test database connection
psql -h localhost -U medsight_app medsight_prod

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Check connection pool
psql -h localhost -p 6432 -U medsight_app pgbouncer
```

#### 10.1.2 Integration Issues

**DICOM Communication Problems**:
```bash
# Test DICOM connectivity
echoscu -v localhost 104

# Check DICOM logs
sudo tail -f /var/log/orthanc/orthanc.log

# Verify DICOM configuration
curl -u medsight:SecurePassword123! http://localhost:8042/system
```

**HL7 Integration Issues**:
```bash
# Test HL7 connection
telnet fhir.hospital.com 443

# Check HL7 logs
sudo tail -f /opt/medsight/logs/hl7-integration.log

# Verify FHIR endpoint
curl -H "Authorization: Bearer $TOKEN" https://fhir.hospital.com/r4/Patient
```

### 10.2 Performance Issues

#### 10.2.1 Slow Response Times

**Database Performance**:
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;

-- Check database locks
SELECT * FROM pg_locks WHERE NOT granted;

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM patients WHERE mrn_encrypted = $1;
```

**Application Performance**:
```bash
# Check CPU usage
top -p $(pgrep -f "node server.js")

# Check memory usage
free -h

# Check disk I/O
iostat -x 1

# Check network usage
netstat -i
```

---

## 11. Appendices

### Appendix A: Configuration Files

**Complete configuration files and templates**

### Appendix B: Security Policies

**Detailed security policies and procedures**

### Appendix C: Compliance Documentation

**Regulatory compliance documentation and checklists**

### Appendix D: Network Diagrams

**Network architecture and security diagrams**

### Appendix E: Contact Information

**Technical support and emergency contact information**

---

**Document Control**:
- **Version**: 1.0
- **Date**: 2024
- **Author**: MedSight Pro DevOps Team
- **Reviewed By**: Infrastructure Security Team
- **Approved By**: Chief Technology Officer
- **Next Review**: Quarterly

**Support Contacts**:
- **Technical Support**: support@medsight.com
- **Security Issues**: security@medsight.com
- **Emergency**: emergency@medsight.com (24/7)
- **General Inquiries**: info@medsight.com

---

*This document contains confidential deployment information. Distribution is restricted to authorized personnel only.* 