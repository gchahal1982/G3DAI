/**
 * MedSight Pro - Shared Services Configuration
 * Configuration for G3DAI shared infrastructure integration
 * Optimized for medical-grade performance and HIPAA compliance
 */

// Medical environment configuration
interface MedicalEnvironmentConfig {
  apiUrl: string;
  authUrl: string;
  gatewayUrl: string;
  environment: 'development' | 'staging' | 'production';
  medicalCompliance: 'basic' | 'hipaa' | 'enterprise';
  region: string;
}

// Medical API service endpoints
interface MedicalAPIEndpoints {
  visionPro: string;      // Medical image analysis
  healthAI: string;       // Clinical AI models
  documind: string;       // Medical document processing
  secureAI: string;       // HIPAA compliance scanning
  dataforge: string;      // Medical data analytics
  bioAI: string;          // Biological data processing
  neuroAI: string;        // Neurological AI analysis
  quantumAI: string;      // Quantum computing for medical research
}

// Medical authentication configuration
interface MedicalAuthConfig {
  serviceId: string;
  clientId: string;
  audience: string;
  scopes: string[];
  sessionTimeout: number;
  enableMFA: boolean;
  medicalLicenseRequired: boolean;
  hipaaAuditEnabled: boolean;
}

// Medical analytics configuration
interface MedicalAnalyticsConfig {
  enableTracking: boolean;
  medicalEventTracking: boolean;
  hipaaCompliantLogging: boolean;
  auditTrailRequired: boolean;
  performanceMonitoring: boolean;
  realTimeAlerts: boolean;
}

// Medical security configuration
interface MedicalSecurityConfig {
  encryptionStandard: 'AES256' | 'FIPS140' | 'HIPAA';
  keyRotationInterval: number;
  accessControlLevel: 'basic' | 'medical' | 'enterprise';
  auditLevel: 'standard' | 'medical' | 'comprehensive';
  dataRetentionPeriod: number;
  anonymizationRequired: boolean;
}

// Medical billing configuration
interface MedicalBillingConfig {
  stripePublishableKey: string;
  enableUsageTracking: boolean;
  medicalTierPricing: boolean;
  hipaaComplianceFee: boolean;
  enterpriseBilling: boolean;
}

// Complete MedSight Pro configuration
export interface MedSightProConfig {
  environment: MedicalEnvironmentConfig;
  api: MedicalAPIEndpoints;
  auth: MedicalAuthConfig;
  analytics: MedicalAnalyticsConfig;
  security: MedicalSecurityConfig;
  billing: MedicalBillingConfig;
}

// Environment-specific configurations
const developmentConfig: MedSightProConfig = {
  environment: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002',
    gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3000',
    environment: 'development',
    medicalCompliance: 'basic',
    region: 'us-east-1'
  },
  api: {
    visionPro: '/api/vision-pro',
    healthAI: '/api/health-ai',
    documind: '/api/documind',
    secureAI: '/api/secure-ai',
    dataforge: '/api/data-forge',
    bioAI: '/api/bio-ai',
    neuroAI: '/api/neuro-ai',
    quantumAI: '/api/quantum-ai'
  },
  auth: {
    serviceId: 'medsight-pro-dev',
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || 'medsight-dev-client',
    audience: process.env.NEXT_PUBLIC_AUTH_AUDIENCE || 'medsight-api',
    scopes: ['read:medical-data', 'write:medical-data', 'admin:medical-system'],
    sessionTimeout: 15 * 60 * 1000, // 15 minutes for development
    enableMFA: false, // Disabled for development
    medicalLicenseRequired: false, // Disabled for development
    hipaaAuditEnabled: false // Disabled for development
  },
  analytics: {
    enableTracking: true,
    medicalEventTracking: true,
    hipaaCompliantLogging: false, // Disabled for development
    auditTrailRequired: false, // Disabled for development
    performanceMonitoring: true,
    realTimeAlerts: false // Disabled for development
  },
  security: {
    encryptionStandard: 'AES256',
    keyRotationInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
    accessControlLevel: 'basic',
    auditLevel: 'standard',
    dataRetentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
    anonymizationRequired: false // Disabled for development
  },
  billing: {
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    enableUsageTracking: false, // Disabled for development
    medicalTierPricing: false,
    hipaaComplianceFee: false,
    enterpriseBilling: false
  }
};

const stagingConfig: MedSightProConfig = {
  environment: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.medsight.g3d.ai',
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth-staging.g3d.ai',
    gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway-staging.g3d.ai',
    environment: 'staging',
    medicalCompliance: 'hipaa',
    region: 'us-east-1'
  },
  api: {
    visionPro: '/api/vision-pro',
    healthAI: '/api/health-ai',
    documind: '/api/documind',
    secureAI: '/api/secure-ai',
    dataforge: '/api/data-forge',
    bioAI: '/api/bio-ai',
    neuroAI: '/api/neuro-ai',
    quantumAI: '/api/quantum-ai'
  },
  auth: {
    serviceId: 'medsight-pro-staging',
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || 'medsight-staging-client',
    audience: process.env.NEXT_PUBLIC_AUTH_AUDIENCE || 'medsight-api',
    scopes: ['read:medical-data', 'write:medical-data', 'admin:medical-system'],
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    enableMFA: true,
    medicalLicenseRequired: true,
    hipaaAuditEnabled: true
  },
  analytics: {
    enableTracking: true,
    medicalEventTracking: true,
    hipaaCompliantLogging: true,
    auditTrailRequired: true,
    performanceMonitoring: true,
    realTimeAlerts: true
  },
  security: {
    encryptionStandard: 'HIPAA',
    keyRotationInterval: 24 * 60 * 60 * 1000, // 24 hours
    accessControlLevel: 'medical',
    auditLevel: 'medical',
    dataRetentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    anonymizationRequired: true
  },
  billing: {
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    enableUsageTracking: true,
    medicalTierPricing: true,
    hipaaComplianceFee: true,
    enterpriseBilling: false
  }
};

const productionConfig: MedSightProConfig = {
  environment: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.medsight.g3d.ai',
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.g3d.ai',
    gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.g3d.ai',
    environment: 'production',
    medicalCompliance: 'enterprise',
    region: process.env.AWS_REGION || 'us-east-1'
  },
  api: {
    visionPro: '/api/vision-pro',
    healthAI: '/api/health-ai',
    documind: '/api/documind',
    secureAI: '/api/secure-ai',
    dataforge: '/api/data-forge',
    bioAI: '/api/bio-ai',
    neuroAI: '/api/neuro-ai',
    quantumAI: '/api/quantum-ai'
  },
  auth: {
    serviceId: 'medsight-pro',
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '',
    audience: process.env.NEXT_PUBLIC_AUTH_AUDIENCE || 'medsight-api',
    scopes: ['read:medical-data', 'write:medical-data', 'admin:medical-system'],
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    enableMFA: true,
    medicalLicenseRequired: true,
    hipaaAuditEnabled: true
  },
  analytics: {
    enableTracking: true,
    medicalEventTracking: true,
    hipaaCompliantLogging: true,
    auditTrailRequired: true,
    performanceMonitoring: true,
    realTimeAlerts: true
  },
  security: {
    encryptionStandard: 'FIPS140',
    keyRotationInterval: 12 * 60 * 60 * 1000, // 12 hours
    accessControlLevel: 'enterprise',
    auditLevel: 'comprehensive',
    dataRetentionPeriod: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
    anonymizationRequired: true
  },
  billing: {
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    enableUsageTracking: true,
    medicalTierPricing: true,
    hipaaComplianceFee: true,
    enterpriseBilling: true
  }
};

// Get configuration based on environment
export function getMedSightProConfig(): MedSightProConfig {
  const env = process.env.NODE_ENV || 'development';
  const medicalEnv = process.env.NEXT_PUBLIC_MEDICAL_ENV || env;
  
  if (env === 'production' || medicalEnv === 'production') {
    return productionConfig;
  }
  
  if (medicalEnv === 'staging') {
    return stagingConfig;
  }
  
  return developmentConfig;
}

// Get specific service configurations
export function getAPIConfig(): MedicalAPIEndpoints {
  return getMedSightProConfig().api;
}

export function getAuthConfig(): MedicalAuthConfig {
  return getMedSightProConfig().auth;
}

export function getAnalyticsConfig(): MedicalAnalyticsConfig {
  return getMedSightProConfig().analytics;
}

export function getSecurityConfig(): MedicalSecurityConfig {
  return getMedSightProConfig().security;
}

export function getBillingConfig(): MedicalBillingConfig {
  return getMedSightProConfig().billing;
}

export function getEnvironmentConfig(): MedicalEnvironmentConfig {
  return getMedSightProConfig().environment;
}

// Medical service feature flags
export interface MedicalFeatureFlags {
  enableDICOMProcessing: boolean;
  enableAIInference: boolean;
  enableCollaboration: boolean;
  enableXRSupport: boolean;
  enableAdvancedRendering: boolean;
  enableMedicalReporting: boolean;
  enableComplianceTracking: boolean;
  enablePerformanceOptimization: boolean;
}

export function getMedicalFeatureFlags(): MedicalFeatureFlags {
  const config = getMedSightProConfig();
  
  return {
    enableDICOMProcessing: true,
    enableAIInference: true,
    enableCollaboration: config.environment.environment !== 'development',
    enableXRSupport: config.environment.environment === 'production',
    enableAdvancedRendering: true,
    enableMedicalReporting: config.analytics.medicalEventTracking,
    enableComplianceTracking: config.security.auditLevel !== 'standard',
    enablePerformanceOptimization: config.analytics.performanceMonitoring
  };
}

// Medical API client configuration
export interface MedicalAPIClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  auth: {
    type: 'bearer' | 'api-key';
    credentials: string;
  };
}

export function getMedicalAPIClientConfig(): MedicalAPIClientConfig {
  const config = getMedSightProConfig();
  
  return {
    baseURL: config.environment.gatewayUrl,
    timeout: 30000, // 30 seconds
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
      'X-Medical-Platform': 'medsight-pro',
      'X-HIPAA-Compliance': config.security.auditLevel === 'comprehensive' ? 'enabled' : 'disabled',
      'X-Medical-Region': config.environment.region
    },
    auth: {
      type: 'bearer',
      credentials: process.env.NEXT_PUBLIC_API_TOKEN || ''
    }
  };
}

// Medical WebSocket configuration for real-time features
export interface MedicalWebSocketConfig {
  url: string;
  enableReconnection: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  enableCompression: boolean;
  medicalEventTypes: string[];
}

export function getMedicalWebSocketConfig(): MedicalWebSocketConfig {
  const config = getMedSightProConfig();
  
  return {
    url: config.environment.gatewayUrl.replace('http', 'ws') + '/medical-ws',
    enableReconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000, // 2 seconds
    enableCompression: true,
    medicalEventTypes: [
      'dicom-processing',
      'ai-inference',
      'collaboration-update',
      'medical-alert',
      'system-notification'
    ]
  };
}

// Medical compliance configuration
export interface MedicalComplianceConfig {
  hipaaRequired: boolean;
  auditLoggingEnabled: boolean;
  dataEncryptionRequired: boolean;
  accessControlRequired: boolean;
  dataRetentionPeriod: number;
  anonymizationRequired: boolean;
  consentTrackingRequired: boolean;
}

export function getMedicalComplianceConfig(): MedicalComplianceConfig {
  const config = getMedSightProConfig();
  
  return {
    hipaaRequired: config.environment.medicalCompliance !== 'basic',
    auditLoggingEnabled: config.analytics.hipaaCompliantLogging,
    dataEncryptionRequired: config.security.encryptionStandard !== 'AES256',
    accessControlRequired: config.security.accessControlLevel !== 'basic',
    dataRetentionPeriod: config.security.dataRetentionPeriod,
    anonymizationRequired: config.security.anonymizationRequired,
    consentTrackingRequired: config.auth.hipaaAuditEnabled
  };
}

// Export default configuration
export default getMedSightProConfig();

// Medical services configuration for components
export const medicalServices = {
  config: getMedSightProConfig(),
  api: getAPIConfig(),
  auth: getAuthConfig(),
  analytics: getAnalyticsConfig(),
  security: getSecurityConfig(),
  billing: getBillingConfig(),
  environment: getEnvironmentConfig(),
  features: getMedicalFeatureFlags(),
  compliance: getMedicalComplianceConfig(),
  websocket: getMedicalWebSocketConfig(),
  apiClient: getMedicalAPIClientConfig(),
  
  // Medical validation methods
  validateMedicalLicense: async (licenseNumber: string, state: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/medical/validate-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseNumber, state })
      });
      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('Medical license validation error:', error);
      return false;
    }
  },

  validateNPI: async (npiNumber: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/medical/validate-npi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npiNumber })
      });
      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('NPI validation error:', error);
      return false;
    }
  },

  validateSpecialization: async (specialization: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/medical/validate-specialization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialization })
      });
      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('Specialization validation error:', error);
      return false;
    }
  },

  auditMedicalAccess: async (userId: string, action: string, eventType: string): Promise<void> => {
    try {
      await fetch('/api/medical/audit-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, eventType, timestamp: new Date() })
      });
    } catch (error) {
      console.error('Medical access audit error:', error);
    }
  }
};

// Log configuration on initialization (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('🏥 MedSight Pro Configuration Initialized');
  console.log(`   📍 Environment: ${getMedSightProConfig().environment.environment}`);
  console.log(`   🔒 Medical Compliance: ${getMedSightProConfig().environment.medicalCompliance}`);
  console.log(`   🛡️ Security Level: ${getMedSightProConfig().security.accessControlLevel}`);
  console.log(`   📊 Analytics: ${getMedSightProConfig().analytics.enableTracking ? 'Enabled' : 'Disabled'}`);
  console.log(`   💳 Billing: ${getMedSightProConfig().billing.enableUsageTracking ? 'Enabled' : 'Disabled'}`);
} 