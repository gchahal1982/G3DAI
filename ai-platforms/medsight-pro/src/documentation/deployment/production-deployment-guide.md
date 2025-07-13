# MedSight Pro Production Deployment Guide

## Executive Summary

This document provides comprehensive guidance for deploying the MedSight Pro medical imaging and AI analysis platform to production environments. The deployment procedures ensure compliance with medical device regulations, HIPAA requirements, and clinical workflow standards while maintaining 99.9% uptime for critical healthcare operations.

**Deployment Overview:**
- **Platform Type**: Medical Device Software (FDA Class II)
- **Deployment Model**: Cloud-native with hybrid on-premise support
- **Uptime Requirement**: 99.9% SLA (8.76 hours downtime/year max)
- **Security Level**: HIPAA compliant with zero-trust architecture
- **Compliance Standards**: FDA, HIPAA, DICOM, HL7 FHIR, ISO 13485, ISO 27001

**Prerequisites:**
- Medical device software validation completed
- Clinical validation studies approved
- Regulatory clearances obtained (FDA 510(k), CE Mark)
- Infrastructure security assessment passed
- Go-live checklist 100% completed

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites and Requirements](#prerequisites-and-requirements)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Security Configuration](#security-configuration)
5. [Medical Compliance Setup](#medical-compliance-setup)
6. [Application Deployment](#application-deployment)
7. [Database Configuration](#database-configuration)
8. [Integration Configuration](#integration-configuration)
9. [Monitoring and Alerting](#monitoring-and-alerting)
10. [Testing and Validation](#testing-and-validation)
11. [Go-Live Procedures](#go-live-procedures)
12. [Post-Deployment Operations](#post-deployment-operations)
13. [Troubleshooting](#troubleshooting)
14. [Appendices](#appendices)

## 1. Deployment Overview

### 1.1 Architecture Overview

MedSight Pro follows a microservices architecture optimized for medical environments:

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (HA)                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React/Next.js)   │   API Gateway (Node.js)      │
├─────────────────────────────────────────────────────────────┤
│  Medical Services            │   AI Services               │
│  - DICOM Processing         │   - Image Analysis          │
│  - Clinical Workflow        │   - Diagnostic AI           │
│  - Patient Data Mgmt        │   - Predictive Models       │
├─────────────────────────────────────────────────────────────┤
│  Integration Services        │   Security Services         │
│  - PACS Integration         │   - Authentication          │
│  - EMR/EHR Integration      │   - Authorization           │
│  - HL7 FHIR APIs            │   - Audit Logging           │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                  │   Infrastructure            │
│  - PostgreSQL (Medical)     │   - Kubernetes/Docker       │
│  - Redis (Cache)            │   - AWS/Azure/GCP           │
│  - Object Storage (DICOM)   │   - Monitoring Stack        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Deployment Environments

**Production Environment:**
- **Purpose**: Live medical imaging platform for clinical use
- **SLA**: 99.9% uptime, <2 second response time
- **Security**: Full HIPAA compliance, end-to-end encryption
- **Compliance**: FDA Class II, DICOM conformance, HL7 FHIR
- **Backup**: Real-time replication, 15-minute RPO

**Staging Environment:**
- **Purpose**: Pre-production testing and validation
- **Configuration**: Mirror of production environment
- **Data**: De-identified test data only
- **Access**: Restricted to authorized personnel

**Disaster Recovery Environment:**
- **Purpose**: Business continuity for medical operations
- **RTO**: 4 hours maximum downtime
- **RPO**: 15 minutes maximum data loss
- **Location**: Geographically separated from primary

### 1.3 Deployment Strategy

**Blue-Green Deployment:**
- Zero-downtime deployment for 24/7 medical operations
- Full environment duplication for safe rollbacks
- Automated health checks and traffic switching
- Clinical workflow continuity guaranteed

**Canary Deployment:**
- Gradual rollout with 5% initial traffic
- Real-time monitoring and automatic rollback
- Clinical validation at each rollout stage
- Full deployment only after validation

## 2. Prerequisites and Requirements

### 2.1 Regulatory Prerequisites

**FDA Requirements:**
- [ ] FDA 510(k) clearance obtained (K-number assigned)
- [ ] Quality Management System (ISO 13485) certified
- [ ] Software Lifecycle Process (IEC 62304) documented
- [ ] Risk Management File (ISO 14971) completed
- [ ] Clinical validation studies approved
- [ ] Labeling and Instructions for Use finalized

**International Requirements:**
- [ ] CE Marking obtained (if applicable)
- [ ] Health Canada Medical Device License (if applicable)
- [ ] Local regulatory approvals for target markets

**Compliance Certifications:**
- [ ] HIPAA compliance assessment passed
- [ ] SOC 2 Type II audit completed
- [ ] ISO 27001 certification obtained
- [ ] DICOM conformance statement validated
- [ ] HL7 FHIR R4 compliance verified

### 2.2 Technical Prerequisites

**Infrastructure Requirements:**
- [ ] Cloud platform account configured (AWS/Azure/GCP)
- [ ] Kubernetes cluster provisioned (min 3 nodes)
- [ ] Load balancer configured with SSL termination
- [ ] Database servers provisioned (primary + replica)
- [ ] Object storage configured for DICOM files
- [ ] CDN configured for global content delivery
- [ ] Backup and disaster recovery infrastructure ready

**Security Requirements:**
- [ ] SSL/TLS certificates installed and validated
- [ ] WAF (Web Application Firewall) configured
- [ ] DDoS protection enabled
- [ ] VPN access configured for administrators
- [ ] Multi-factor authentication system deployed
- [ ] Key management system (KMS) configured
- [ ] Security monitoring tools deployed

**Network Requirements:**
- [ ] Dedicated network segments for medical data
- [ ] Firewall rules configured per security policy
- [ ] Network monitoring and intrusion detection active
- [ ] Bandwidth capacity validated for peak usage
- [ ] Redundant network paths configured

### 2.3 Personnel Prerequisites

**Required Roles:**
- [ ] Deployment Lead (certified in medical device deployment)
- [ ] Medical Affairs Representative
- [ ] Compliance Officer
- [ ] Security Administrator
- [ ] Database Administrator
- [ ] DevOps Engineer
- [ ] Quality Assurance Lead
- [ ] Clinical Workflow Specialist

**Training Requirements:**
- [ ] All deployment team members trained on medical device procedures
- [ ] Security team trained on HIPAA technical safeguards
- [ ] Operations team trained on clinical workflow requirements
- [ ] Support team trained on medical emergency procedures

## 3. Infrastructure Setup

### 3.1 Cloud Infrastructure Deployment

**Step 1: Resource Provisioning**

```bash
# Deploy infrastructure using Terraform
cd infrastructure/terraform
terraform init
terraform plan -var-file="production.tfvars"
terraform apply -var-file="production.tfvars"

# Verify infrastructure deployment
kubectl get nodes
kubectl get namespaces
```

**Step 2: Kubernetes Configuration**

```yaml
# production-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: medsight-pro-production
  labels:
    environment: production
    compliance: hipaa
    security-level: high
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: medsight-pro-production
spec:
  hard:
    requests.cpu: "100"
    requests.memory: 200Gi
    persistentvolumeclaims: "20"
```

**Step 3: Storage Configuration**

```yaml
# medical-storage.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: medical-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  encrypted: "true"
  fsType: ext4
reclaimPolicy: Retain
allowVolumeExpansion: true
```

### 3.2 Database Setup

**Step 1: PostgreSQL Deployment**

```bash
# Deploy PostgreSQL with medical-grade configuration
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgresql bitnami/postgresql \
  --namespace medsight-pro-production \
  --set global.postgresql.auth.postgresPassword="<secure-password>" \
  --set primary.persistence.size=500Gi \
  --set primary.persistence.storageClass=medical-ssd \
  --set metrics.enabled=true \
  --set audit.logConnections=true \
  --set audit.logDisconnections=true
```

**Step 2: Database Initialization**

```sql
-- Create medical database
CREATE DATABASE medsight_pro_medical;

-- Create medical user with restricted permissions
CREATE USER medsight_medical WITH ENCRYPTED PASSWORD '<medical-db-password>';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE medsight_pro_medical TO medsight_medical;
GRANT USAGE ON SCHEMA public TO medsight_medical;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO medsight_medical;

-- Enable audit logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 0;
SELECT pg_reload_conf();
```

**Step 3: Redis Configuration**

```bash
# Deploy Redis for caching with encryption
helm install redis bitnami/redis \
  --namespace medsight-pro-production \
  --set auth.enabled=true \
  --set auth.password="<redis-password>" \
  --set master.persistence.enabled=true \
  --set master.persistence.size=100Gi
```

### 3.3 Object Storage Configuration

**AWS S3 Configuration:**

```bash
# Create S3 bucket for DICOM storage
aws s3 mb s3://medsight-pro-dicom-production --region us-east-1

# Configure bucket encryption
aws s3api put-bucket-encryption \
  --bucket medsight-pro-dicom-production \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "arn:aws:kms:us-east-1:account:key/key-id"
      }
    }]
  }'

# Configure bucket policy for HIPAA compliance
aws s3api put-bucket-policy \
  --bucket medsight-pro-dicom-production \
  --policy file://hipaa-bucket-policy.json
```

## 4. Security Configuration

### 4.1 SSL/TLS Configuration

**Step 1: Certificate Installation**

```bash
# Install cert-manager for automatic certificate management
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Configure Let's Encrypt issuer for production
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-production
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@medsightpro.com
    privateKeySecretRef:
      name: letsencrypt-production
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

**Step 2: Ingress Configuration**

```yaml
# medical-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: medsight-pro-ingress
  namespace: medsight-pro-production
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-production
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
spec:
  tls:
  - hosts:
    - medsightpro.com
    - api.medsightpro.com
    secretName: medsight-pro-tls
  rules:
  - host: medsightpro.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.medsightpro.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 80
```

### 4.2 Authentication and Authorization

**Step 1: OAuth 2.0 Configuration**

```bash
# Deploy OAuth 2.0 server
kubectl apply -f oauth2-deployment.yaml

# Configure OIDC provider
kubectl create secret generic oidc-config \
  --namespace=medsight-pro-production \
  --from-literal=client-id="<client-id>" \
  --from-literal=client-secret="<client-secret>" \
  --from-literal=issuer-url="https://auth.medsightpro.com"
```

**Step 2: RBAC Configuration**

```yaml
# medical-rbac.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: medsight-pro-production
  name: medical-operator
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch", "patch", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: medical-operator-binding
  namespace: medsight-pro-production
subjects:
- kind: User
  name: medical-operator
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: medical-operator
  apiGroup: rbac.authorization.k8s.io
```

### 4.3 Network Security

**Step 1: Network Policies**

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: medical-network-policy
  namespace: medsight-pro-production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: medsight-pro-production
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: medsight-pro-production
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 443
```

**Step 2: Pod Security Policies**

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: medical-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

## 5. Medical Compliance Setup

### 5.1 HIPAA Configuration

**Step 1: Audit Logging Configuration**

```yaml
# audit-logging.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: audit-config
  namespace: medsight-pro-production
data:
  audit-policy.yaml: |
    apiVersion: audit.k8s.io/v1
    kind: Policy
    rules:
    - level: Metadata
      resources:
      - group: ""
        resources: ["secrets", "configmaps"]
    - level: RequestResponse
      resources:
      - group: ""
        resources: ["*"]
      namespaces: ["medsight-pro-production"]
```

**Step 2: Data Encryption Configuration**

```bash
# Configure encryption at rest
kubectl create secret generic encryption-config \
  --namespace=medsight-pro-production \
  --from-literal=key="$(openssl rand -base64 32)"

# Apply encryption configuration
kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: medical-encryption-key
  namespace: medsight-pro-production
type: Opaque
data:
  key: $(echo -n "$(openssl rand -base64 32)" | base64)
EOF
```

### 5.2 DICOM Conformance

**Step 1: DICOM Configuration**

```bash
# Deploy DICOM server
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dicom-server
  namespace: medsight-pro-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dicom-server
  template:
    metadata:
      labels:
        app: dicom-server
    spec:
      containers:
      - name: dicom-server
        image: medsightpro/dicom-server:v1.0.0
        ports:
        - containerPort: 11112
        env:
        - name: DICOM_AET
          value: "MEDSIGHT_PRO"
        - name: DICOM_PORT
          value: "11112"
        - name: STORAGE_PATH
          value: "/dicom-storage"
        volumeMounts:
        - name: dicom-storage
          mountPath: /dicom-storage
      volumes:
      - name: dicom-storage
        persistentVolumeClaim:
          claimName: dicom-storage-pvc
EOF
```

**Step 2: HL7 FHIR Configuration**

```bash
# Deploy FHIR server
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fhir-server
  namespace: medsight-pro-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: fhir-server
  template:
    metadata:
      labels:
        app: fhir-server
    spec:
      containers:
      - name: fhir-server
        image: medsightpro/fhir-server:v1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: FHIR_VERSION
          value: "R4"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: fhir-database-url
EOF
```

## 6. Application Deployment

### 6.1 Frontend Deployment

**Step 1: Build and Push Images**

```bash
# Build production frontend image
cd frontend
docker build -t medsightpro/frontend:v1.0.0 .
docker push medsightpro/frontend:v1.0.0

# Verify image security scan
docker scan medsightpro/frontend:v1.0.0
```

**Step 2: Deploy Frontend Application**

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: medsight-pro-production
  labels:
    app: frontend
    tier: presentation
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: medsightpro/frontend:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_URL
          value: "https://api.medsightpro.com"
        - name: NEXT_PUBLIC_MEDICAL_MODE
          value: "true"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: medsight-pro-production
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

### 6.2 Backend Services Deployment

**Step 1: API Gateway Deployment**

```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: medsight-pro-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: medsightpro/api-gateway:v1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
```

**Step 2: Medical Services Deployment**

```yaml
# medical-services-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medical-services
  namespace: medsight-pro-production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: medical-services
  template:
    metadata:
      labels:
        app: medical-services
    spec:
      containers:
      - name: medical-processor
        image: medsightpro/medical-processor:v1.0.0
        ports:
        - containerPort: 3002
        env:
        - name: MEDICAL_MODE
          value: "production"
        - name: DICOM_STORAGE_PATH
          value: "/dicom-storage"
        - name: FDA_COMPLIANCE_MODE
          value: "true"
        volumeMounts:
        - name: dicom-storage
          mountPath: /dicom-storage
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
      volumes:
      - name: dicom-storage
        persistentVolumeClaim:
          claimName: dicom-storage-pvc
```

### 6.3 AI Services Deployment

**Step 1: AI Model Deployment**

```yaml
# ai-services-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-services
  namespace: medsight-pro-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-services
  template:
    metadata:
      labels:
        app: ai-services
    spec:
      containers:
      - name: ai-inference
        image: medsightpro/ai-inference:v1.0.0
        ports:
        - containerPort: 3003
        env:
        - name: MODEL_VALIDATION_MODE
          value: "production"
        - name: AI_COMPLIANCE_MODE
          value: "true"
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
          limits:
            memory: "8Gi"
            cpu: "4000m"
            nvidia.com/gpu: 1
        livenessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3003
          initialDelaySeconds: 30
          periodSeconds: 10
```

## 7. Database Configuration

### 7.1 Production Database Setup

**Step 1: Database Migration**

```bash
# Run database migrations
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run migrate:prod

# Verify migration status
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run migrate:status
```

**Step 2: Database Seeding**

```bash
# Seed production data (medical reference data only)
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run seed:medical-reference

# Create medical admin user
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run create-admin -- --email admin@medsightpro.com --role medical-admin
```

### 7.2 Database Backup Configuration

**Step 1: Automated Backup Setup**

```yaml
# database-backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
  namespace: medsight-pro-production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:14
            command:
            - /bin/bash
            - -c
            - |
              pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER $POSTGRES_DB | \
              gzip > /backup/medsight-pro-$(date +%Y%m%d-%H%M%S).sql.gz
              aws s3 cp /backup/medsight-pro-$(date +%Y%m%d-%H%M%S).sql.gz \
              s3://medsight-pro-backups/database/
            env:
            - name: POSTGRES_HOST
              value: "postgresql.medsight-pro-production.svc.cluster.local"
            - name: POSTGRES_USER
              value: "postgres"
            - name: POSTGRES_DB
              value: "medsight_pro_medical"
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgresql
                  key: postgres-password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            emptyDir: {}
          restartPolicy: OnFailure
```

### 7.3 Database Monitoring

**Step 1: PostgreSQL Exporter**

```yaml
# postgres-exporter.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-exporter
  namespace: medsight-pro-production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres-exporter
  template:
    metadata:
      labels:
        app: postgres-exporter
    spec:
      containers:
      - name: postgres-exporter
        image: prometheuscommunity/postgres-exporter:v0.11.1
        ports:
        - containerPort: 9187
        env:
        - name: DATA_SOURCE_NAME
          valueFrom:
            secretKeyRef:
              name: postgres-exporter-secret
              key: data-source-name
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
```

## 8. Integration Configuration

### 8.1 PACS Integration

**Step 1: PACS Connection Configuration**

```bash
# Configure PACS integration
kubectl create secret generic pacs-config \
  --namespace=medsight-pro-production \
  --from-literal=pacs-host="pacs.hospital.com" \
  --from-literal=pacs-port="11112" \
  --from-literal=pacs-aet="HOSPITAL_PACS" \
  --from-literal=our-aet="MEDSIGHT_PRO"
```

**Step 2: DICOM Worklist Configuration**

```yaml
# dicom-worklist-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dicom-worklist-config
  namespace: medsight-pro-production
data:
  worklist.conf: |
    [WORKLIST]
    Port = 11112
    AETitle = MEDSIGHT_PRO
    MaxPDU = 16384
    
    [DATABASE]
    Host = postgresql.medsight-pro-production.svc.cluster.local
    Port = 5432
    Database = medsight_pro_medical
    Schema = dicom_worklist
    
    [SECURITY]
    RequireAuth = true
    EncryptTransfer = true
    AuditLogging = true
```

### 8.2 EMR/EHR Integration

**Step 1: HL7 FHIR Integration**

```bash
# Configure FHIR endpoints
kubectl create configmap fhir-endpoints \
  --namespace=medsight-pro-production \
  --from-literal=epic-fhir="https://fhir.epic.com/interconnect-fhir-oauth" \
  --from-literal=cerner-fhir="https://fhir-open.cerner.com/r4" \
  --from-literal=allscripts-fhir="https://fhir.allscripts.com/r4"
```

**Step 2: Interface Engine Configuration**

```yaml
# interface-engine-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: interface-engine
  namespace: medsight-pro-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: interface-engine
  template:
    metadata:
      labels:
        app: interface-engine
    spec:
      containers:
      - name: interface-engine
        image: medsightpro/interface-engine:v1.0.0
        ports:
        - containerPort: 3004
        env:
        - name: HL7_MODE
          value: "production"
        - name: FHIR_VERSION
          value: "R4"
        - name: AUDIT_LOGGING
          value: "true"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

## 9. Monitoring and Alerting

### 9.1 Prometheus Configuration

**Step 1: Prometheus Deployment**

```bash
# Install Prometheus using Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace medsight-pro-monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=100Gi
```

**Step 2: Medical Metrics Configuration**

```yaml
# medical-metrics-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: medical-metrics-config
  namespace: medsight-pro-monitoring
data:
  medical-rules.yaml: |
    groups:
    - name: medical.rules
      rules:
      - alert: HighDICOMProcessingLatency
        expr: histogram_quantile(0.95, dicom_processing_duration_seconds) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High DICOM processing latency detected"
          description: "95th percentile latency is {{ $value }} seconds"
      
      - alert: MedicalServiceDown
        expr: up{job="medical-services"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Medical service is down"
          description: "Medical service {{ $labels.instance }} is down"
      
      - alert: DatabaseConnectionIssue
        expr: postgres_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection issue"
          description: "PostgreSQL database connection is down"
```

### 9.2 Grafana Dashboard Configuration

**Step 1: Medical Dashboard Import**

```bash
# Import medical dashboards
kubectl create configmap medical-dashboards \
  --namespace=medsight-pro-monitoring \
  --from-file=dashboards/medical-overview.json \
  --from-file=dashboards/dicom-processing.json \
  --from-file=dashboards/ai-performance.json
```

**Step 2: Custom Medical Metrics**

```json
{
  "dashboard": {
    "title": "MedSight Pro Medical Overview",
    "panels": [
      {
        "title": "DICOM Studies Processed",
        "type": "stat",
        "targets": [
          {
            "expr": "increase(dicom_studies_processed_total[24h])"
          }
        ]
      },
      {
        "title": "AI Inference Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, ai_inference_duration_seconds)"
          }
        ]
      },
      {
        "title": "Medical System Uptime",
        "type": "stat",
        "targets": [
          {
            "expr": "avg(up{job=\"medical-services\"}) * 100"
          }
        ]
      }
    ]
  }
}
```

### 9.3 Alertmanager Configuration

**Step 1: Alert Routing Configuration**

```yaml
# alertmanager-config.yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@medsightpro.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'medical-team'
  routes:
  - match:
      severity: critical
    receiver: 'critical-medical-alerts'
  - match:
      service: medical
    receiver: 'medical-team'

receivers:
- name: 'critical-medical-alerts'
  email_configs:
  - to: 'medical-emergency@medsightpro.com'
    subject: 'CRITICAL: MedSight Pro Medical Alert'
    body: |
      Alert: {{ .GroupLabels.alertname }}
      Severity: {{ .CommonLabels.severity }}
      Description: {{ .CommonAnnotations.description }}
      
      This is a critical medical system alert requiring immediate attention.
  
- name: 'medical-team'
  email_configs:
  - to: 'medical-team@medsightpro.com'
    subject: 'MedSight Pro Alert: {{ .GroupLabels.alertname }}'
    body: |
      Alert: {{ .GroupLabels.alertname }}
      Description: {{ .CommonAnnotations.description }}
```

## 10. Testing and Validation

### 10.1 Pre-Deployment Testing

**Step 1: Infrastructure Testing**

```bash
# Test database connectivity
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run test:database

# Test external integrations
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run test:integrations

# Test DICOM connectivity
kubectl exec -it deployment/dicom-server -n medsight-pro-production -- \
  echoscu pacs.hospital.com 11112
```

**Step 2: Security Testing**

```bash
# Run security scan
kubectl exec -it deployment/security-scanner -n medsight-pro-production -- \
  nmap -sS -O target_host

# Test SSL configuration
kubectl exec -it deployment/ssl-tester -n medsight-pro-production -- \
  testssl.sh --ssl2 --ssl3 --tls1 --tls1_1 --tls1_2 --tls1_3 \
  https://medsightpro.com
```

### 10.2 Functional Testing

**Step 1: Medical Workflow Testing**

```bash
# Run medical workflow tests
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run test:medical-workflows

# Test DICOM processing
kubectl exec -it deployment/medical-services -n medsight-pro-production -- \
  npm run test:dicom-processing

# Test AI inference
kubectl exec -it deployment/ai-services -n medsight-pro-production -- \
  npm run test:ai-inference
```

**Step 2: Integration Testing**

```bash
# Test PACS integration
kubectl exec -it deployment/interface-engine -n medsight-pro-production -- \
  npm run test:pacs-integration

# Test FHIR endpoints
kubectl exec -it deployment/fhir-server -n medsight-pro-production -- \
  npm run test:fhir-endpoints
```

### 10.3 Performance Testing

**Step 1: Load Testing**

```bash
# Run load tests
kubectl apply -f load-test-job.yaml

# Monitor performance during load test
kubectl logs -f job/load-test -n medsight-pro-production
```

**Step 2: Stress Testing**

```yaml
# stress-test-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: stress-test
  namespace: medsight-pro-production
spec:
  template:
    spec:
      containers:
      - name: stress-test
        image: medsightpro/stress-test:v1.0.0
        command:
        - /bin/bash
        - -c
        - |
          # Test DICOM processing under load
          for i in {1..1000}; do
            curl -X POST https://api.medsightpro.com/dicom/process \
              -H "Content-Type: application/json" \
              -d '{"studyId": "test-'$i'"}' &
          done
          wait
      restartPolicy: Never
```

## 11. Go-Live Procedures

### 11.1 Pre-Go-Live Checklist

**Medical Validation:**
- [ ] Clinical validation studies completed and approved
- [ ] Medical device software validation documented
- [ ] FDA 510(k) clearance letter available
- [ ] DICOM conformance statement validated
- [ ] Medical professional training completed

**Technical Validation:**
- [ ] All automated tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met (< 2s response time)
- [ ] Security scan passed (zero critical vulnerabilities)
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting functional

**Compliance Validation:**
- [ ] HIPAA compliance assessment passed
- [ ] SOC 2 Type II audit completed
- [ ] Data encryption verified (at rest and in transit)
- [ ] Audit logging functional and compliant
- [ ] Access controls tested and documented

**Operational Readiness:**
- [ ] 24/7 support team trained and available
- [ ] Escalation procedures documented and tested
- [ ] Disaster recovery plan tested
- [ ] Communication plan activated
- [ ] Rollback procedures documented and tested

### 11.2 Go-Live Execution

**Step 1: Final Preparations**

```bash
# Verify all systems are operational
kubectl get pods -n medsight-pro-production
kubectl get services -n medsight-pro-production
kubectl get ingress -n medsight-pro-production

# Check database connectivity
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run health-check

# Verify monitoring systems
curl -s http://prometheus.medsight-pro-monitoring.svc.cluster.local:9090/api/v1/query?query=up
```

**Step 2: Traffic Cutover**

```bash
# Update DNS to point to production
# This should be done through your DNS provider

# Verify traffic is flowing
kubectl logs -f deployment/frontend -n medsight-pro-production
kubectl logs -f deployment/api-gateway -n medsight-pro-production
```

**Step 3: Post-Cutover Validation**

```bash
# Run smoke tests
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run test:smoke

# Verify medical workflows
kubectl exec -it deployment/medical-services -n medsight-pro-production -- \
  npm run test:medical-smoke

# Check system health
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run health-check:comprehensive
```

### 11.3 Go-Live Communication

**Internal Communication:**
- [ ] Notify medical team of go-live completion
- [ ] Update technical team on monitoring procedures
- [ ] Inform support team of escalation procedures
- [ ] Brief executive team on go-live status

**External Communication:**
- [ ] Notify customers of platform availability
- [ ] Send communications to medical partners
- [ ] Update regulatory bodies as required
- [ ] Publish status page updates

## 12. Post-Deployment Operations

### 12.1 Monitoring and Maintenance

**Daily Operations:**
- Monitor system health dashboards
- Review application logs for errors
- Check backup completion status
- Verify security alert status
- Review performance metrics

**Weekly Operations:**
- Review security scan results
- Analyze performance trends
- Check capacity utilization
- Review incident reports
- Update documentation

**Monthly Operations:**
- Security vulnerability assessment
- Performance optimization review
- Capacity planning review
- Disaster recovery testing
- Compliance audit preparation

### 12.2 Backup and Recovery

**Daily Backup Verification:**

```bash
# Check backup completion
kubectl logs cronjob/database-backup -n medsight-pro-production

# Verify backup integrity
aws s3 ls s3://medsight-pro-backups/database/ --recursive

# Test backup restoration (in test environment)
kubectl exec -it deployment/backup-tester -n medsight-pro-test -- \
  restore-test.sh latest-backup.sql.gz
```

**Disaster Recovery Testing:**

```bash
# Monthly DR test
kubectl apply -f disaster-recovery-test.yaml

# Verify DR site functionality
curl -f https://dr.medsightpro.com/health

# Document DR test results
kubectl logs job/dr-test -n medsight-pro-dr
```

### 12.3 Performance Optimization

**Performance Monitoring:**

```bash
# Check response times
kubectl exec -it deployment/performance-monitor -n medsight-pro-production -- \
  performance-report.sh

# Analyze database performance
kubectl exec -it deployment/postgresql -n medsight-pro-production -- \
  psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Monitor resource utilization
kubectl top pods -n medsight-pro-production
kubectl top nodes
```

## 13. Troubleshooting

### 13.1 Common Issues

**Database Connection Issues:**

```bash
# Check database connectivity
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  nc -zv postgresql.medsight-pro-production.svc.cluster.local 5432

# Check database logs
kubectl logs deployment/postgresql -n medsight-pro-production

# Restart database if necessary
kubectl rollout restart deployment/postgresql -n medsight-pro-production
```

**DICOM Processing Issues:**

```bash
# Check DICOM server status
kubectl logs deployment/dicom-server -n medsight-pro-production

# Test DICOM connectivity
kubectl exec -it deployment/dicom-server -n medsight-pro-production -- \
  echoscu localhost 11112

# Check DICOM storage
kubectl exec -it deployment/dicom-server -n medsight-pro-production -- \
  df -h /dicom-storage
```

**AI Service Issues:**

```bash
# Check AI service logs
kubectl logs deployment/ai-services -n medsight-pro-production

# Check GPU availability
kubectl describe nodes | grep nvidia.com/gpu

# Restart AI services if necessary
kubectl rollout restart deployment/ai-services -n medsight-pro-production
```

### 13.2 Emergency Procedures

**System Outage Response:**

1. **Immediate Response:**
   - Activate incident response team
   - Assess impact on medical operations
   - Implement emergency communication plan
   - Switch to disaster recovery site if necessary

2. **Investigation:**
   - Collect system logs and metrics
   - Identify root cause
   - Document timeline of events
   - Coordinate with vendors if needed

3. **Recovery:**
   - Implement fix or workaround
   - Test system functionality
   - Gradually restore normal operations
   - Monitor system stability

4. **Post-Incident:**
   - Conduct post-mortem analysis
   - Update procedures and documentation
   - Communicate lessons learned
   - Implement preventive measures

**Rollback Procedures:**

```bash
# Emergency rollback to previous version
kubectl rollout undo deployment/frontend -n medsight-pro-production
kubectl rollout undo deployment/api-gateway -n medsight-pro-production
kubectl rollout undo deployment/medical-services -n medsight-pro-production

# Verify rollback success
kubectl rollout status deployment/frontend -n medsight-pro-production
kubectl rollout status deployment/api-gateway -n medsight-pro-production
kubectl rollout status deployment/medical-services -n medsight-pro-production

# Run smoke tests after rollback
kubectl exec -it deployment/api-gateway -n medsight-pro-production -- \
  npm run test:smoke
```

## 14. Appendices

### Appendix A: Configuration Files

**A.1 Environment Variables**

```bash
# Production environment variables
export NODE_ENV=production
export MEDICAL_MODE=true
export FDA_COMPLIANCE_MODE=true
export HIPAA_COMPLIANCE_MODE=true
export DATABASE_URL=postgresql://user:pass@host:5432/db
export REDIS_URL=redis://user:pass@host:6379
export DICOM_STORAGE_PATH=/dicom-storage
export AI_MODEL_PATH=/ai-models
export ENCRYPTION_KEY_PATH=/keys/encryption.key
export SSL_CERT_PATH=/certs/ssl.crt
export SSL_KEY_PATH=/certs/ssl.key
```

**A.2 Kubernetes Resources**

```yaml
# Resource quotas for production namespace
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: medsight-pro-production
spec:
  hard:
    requests.cpu: "50"
    requests.memory: 100Gi
    requests.nvidia.com/gpu: "10"
    limits.cpu: "100"
    limits.memory: 200Gi
    limits.nvidia.com/gpu: "10"
    persistentvolumeclaims: "50"
    services: "20"
    secrets: "50"
    configmaps: "50"
```

### Appendix B: Security Configurations

**B.1 SSL/TLS Configuration**

```nginx
# NGINX SSL configuration
server {
    listen 443 ssl http2;
    server_name medsightpro.com;
    
    ssl_certificate /etc/ssl/certs/medsightpro.crt;
    ssl_certificate_key /etc/ssl/private/medsightpro.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

**B.2 Network Security Policies**

```yaml
# Default deny all network policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: medsight-pro-production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

### Appendix C: Monitoring Configurations

**C.1 Prometheus Alerting Rules**

```yaml
groups:
- name: medical-system.rules
  rules:
  - alert: MedicalSystemDown
    expr: up{job=~"medical-.*"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Medical system component is down"
      description: "{{ $labels.job }} has been down for more than 1 minute"
  
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"
```

### Appendix D: Compliance Checklists

**D.1 HIPAA Compliance Checklist**

- [ ] Administrative Safeguards implemented
- [ ] Physical Safeguards implemented  
- [ ] Technical Safeguards implemented
- [ ] Audit controls functional
- [ ] Access controls verified
- [ ] Data integrity measures active
- [ ] Transmission security enabled
- [ ] Encryption at rest and in transit
- [ ] Backup and recovery procedures tested
- [ ] Incident response plan documented

**D.2 FDA Compliance Checklist**

- [ ] 510(k) clearance obtained
- [ ] Quality Management System certified
- [ ] Software Lifecycle Process documented
- [ ] Risk Management File completed
- [ ] Clinical validation completed
- [ ] Labeling requirements met
- [ ] Post-market surveillance plan active
- [ ] Adverse event reporting system functional

### Appendix E: Contact Information

**E.1 Emergency Contacts**

- **Medical Emergency**: medical-emergency@medsightpro.com
- **Technical Emergency**: tech-emergency@medsightpro.com  
- **Security Incident**: security-incident@medsightpro.com
- **Compliance Issues**: compliance@medsightpro.com

**E.2 Vendor Contacts**

- **Cloud Provider Support**: [Provider-specific contact]
- **Database Support**: [Database vendor contact]
- **Security Vendor**: [Security vendor contact]
- **Monitoring Vendor**: [Monitoring vendor contact]

---

**Document Information:**
- **Document Title**: MedSight Pro Production Deployment Guide
- **Document Version**: 1.0
- **Document Date**: January 15, 2025
- **Document Status**: Final
- **Prepared By**: MedSight Pro DevOps Team
- **Reviewed By**: Medical Affairs and Compliance Teams
- **Approved By**: Chief Technology Officer

**Confidentiality Notice:**
This document contains confidential and proprietary information. Distribution is restricted to authorized deployment personnel only.

**Contact Information:**
For questions regarding this deployment guide, please contact:
- **DevOps Team**: devops@medsightpro.com
- **Medical Affairs**: medical-affairs@medsightpro.com
- **Technical Support**: support@medsightpro.com 