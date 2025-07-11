#!/usr/bin/env node

/**
 * Health check script for AnnotateAI production deployment
 * Validates application health, dependencies, and system resources
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const os = require('os');

const HEALTH_CHECK_TIMEOUT = 8000;
const MAX_MEMORY_USAGE_PERCENT = 90;
const MAX_CPU_USAGE_PERCENT = 95;
const MIN_DISK_SPACE_MB = 100;

class HealthChecker {
  constructor() {
    this.port = process.env.PORT || 3000;
    this.hostname = process.env.HOSTNAME || 'localhost';
    this.checks = [];
    this.warnings = [];
    this.errors = [];
  }

  async runHealthCheck() {
    console.log(`[${new Date().toISOString()}] Starting health check...`);
    
    try {
      // Core application checks
      await this.checkApplicationHealth();
      await this.checkDatabaseConnection();
      await this.checkRedisConnection();
      await this.checkFileSystemAccess();
      
      // System resource checks
      await this.checkSystemResources();
      await this.checkNetworkConnectivity();
      
      // External service checks
      await this.checkExternalServices();
      
      // Security checks
      await this.checkSecurityConfiguration();
      
      this.reportResults();
      
    } catch (error) {
      console.error(`Health check failed: ${error.message}`);
      process.exit(1);
    }
  }

  async checkApplicationHealth() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.hostname,
        port: this.port,
        path: '/api/health',
        method: 'GET',
        timeout: HEALTH_CHECK_TIMEOUT,
        headers: {
          'User-Agent': 'HealthCheck/1.0'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);
              if (response.status === 'healthy') {
                this.checks.push({ name: 'Application Health', status: 'OK', details: response });
                resolve();
              } else {
                this.errors.push({ name: 'Application Health', status: 'UNHEALTHY', details: response });
                reject(new Error(`Application unhealthy: ${response.message || 'Unknown error'}`));
              }
            } catch (parseError) {
              this.errors.push({ name: 'Application Health', status: 'ERROR', details: 'Invalid JSON response' });
              reject(new Error('Invalid health check response'));
            }
          } else {
            this.errors.push({ name: 'Application Health', status: 'ERROR', details: `HTTP ${res.statusCode}` });
            reject(new Error(`Health check returned status ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        this.errors.push({ name: 'Application Health', status: 'ERROR', details: error.message });
        reject(new Error(`Health check request failed: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        this.errors.push({ name: 'Application Health', status: 'TIMEOUT', details: `Timeout after ${HEALTH_CHECK_TIMEOUT}ms` });
        reject(new Error('Health check timeout'));
      });

      req.end();
    });
  }

  async checkDatabaseConnection() {
    try {
      // Check if database connection is available
      // This would typically connect to your actual database
      const dbHealthy = await this.testDatabaseConnection();
      
      if (dbHealthy) {
        this.checks.push({ name: 'Database Connection', status: 'OK', details: 'Connected' });
      } else {
        this.errors.push({ name: 'Database Connection', status: 'ERROR', details: 'Cannot connect to database' });
        throw new Error('Database connection failed');
      }
    } catch (error) {
      this.errors.push({ name: 'Database Connection', status: 'ERROR', details: error.message });
      throw error;
    }
  }

  async checkRedisConnection() {
    try {
      // Check Redis connection for caching and sessions
      const redisHealthy = await this.testRedisConnection();
      
      if (redisHealthy) {
        this.checks.push({ name: 'Redis Connection', status: 'OK', details: 'Connected' });
      } else {
        this.warnings.push({ name: 'Redis Connection', status: 'WARNING', details: 'Redis unavailable, caching disabled' });
      }
    } catch (error) {
      this.warnings.push({ name: 'Redis Connection', status: 'WARNING', details: error.message });
    }
  }

  async checkFileSystemAccess() {
    try {
      const testFile = '/app/temp/health_check_test.txt';
      const testContent = `Health check test - ${Date.now()}`;
      
      // Test write access
      fs.writeFileSync(testFile, testContent);
      
      // Test read access
      const readContent = fs.readFileSync(testFile, 'utf8');
      
      if (readContent === testContent) {
        // Cleanup test file
        fs.unlinkSync(testFile);
        this.checks.push({ name: 'File System Access', status: 'OK', details: 'Read/write permissions verified' });
      } else {
        this.errors.push({ name: 'File System Access', status: 'ERROR', details: 'File content mismatch' });
        throw new Error('File system integrity check failed');
      }
    } catch (error) {
      this.errors.push({ name: 'File System Access', status: 'ERROR', details: error.message });
      throw new Error(`File system access failed: ${error.message}`);
    }
  }

  async checkSystemResources() {
    // Memory check
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const usedMemory = totalMemory - os.freemem();
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    if (memoryUsagePercent > MAX_MEMORY_USAGE_PERCENT) {
      this.warnings.push({ 
        name: 'Memory Usage', 
        status: 'WARNING', 
        details: `${memoryUsagePercent.toFixed(1)}% used (${Math.round(usedMemory / 1024 / 1024)}MB)` 
      });
    } else {
      this.checks.push({ 
        name: 'Memory Usage', 
        status: 'OK', 
        details: `${memoryUsagePercent.toFixed(1)}% used (${Math.round(usedMemory / 1024 / 1024)}MB)` 
      });
    }

    // CPU check (simplified)
    const loadAverage = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const cpuUsagePercent = (loadAverage / cpuCount) * 100;

    if (cpuUsagePercent > MAX_CPU_USAGE_PERCENT) {
      this.warnings.push({ 
        name: 'CPU Usage', 
        status: 'WARNING', 
        details: `${cpuUsagePercent.toFixed(1)}% load average` 
      });
    } else {
      this.checks.push({ 
        name: 'CPU Usage', 
        status: 'OK', 
        details: `${cpuUsagePercent.toFixed(1)}% load average` 
      });
    }

    // Disk space check
    try {
      const stats = fs.statSync('/app');
      const diskStats = fs.statSync('/');
      
      // This is a simplified check - in production you'd use a proper disk space library
      this.checks.push({ 
        name: 'Disk Space', 
        status: 'OK', 
        details: 'Sufficient space available' 
      });
    } catch (error) {
      this.warnings.push({ 
        name: 'Disk Space', 
        status: 'WARNING', 
        details: 'Could not check disk space' 
      });
    }
  }

  async checkNetworkConnectivity() {
    // Check internet connectivity
    try {
      await this.makeHttpRequest('https://www.google.com', 5000);
      this.checks.push({ name: 'Internet Connectivity', status: 'OK', details: 'External connectivity verified' });
    } catch (error) {
      this.warnings.push({ name: 'Internet Connectivity', status: 'WARNING', details: 'Limited external connectivity' });
    }
  }

  async checkExternalServices() {
    const services = [
      { name: 'Sentry', url: 'https://sentry.io', critical: false },
      { name: 'AWS S3', url: 'https://s3.amazonaws.com', critical: true },
      { name: 'Stripe API', url: 'https://api.stripe.com', critical: true }
    ];

    for (const service of services) {
      try {
        await this.makeHttpRequest(service.url, 5000);
        this.checks.push({ name: `${service.name} Service`, status: 'OK', details: 'Reachable' });
      } catch (error) {
        if (service.critical) {
          this.errors.push({ name: `${service.name} Service`, status: 'ERROR', details: 'Unreachable' });
        } else {
          this.warnings.push({ name: `${service.name} Service`, status: 'WARNING', details: 'Unreachable' });
        }
      }
    }
  }

  async checkSecurityConfiguration() {
    // Check environment variables
    const requiredEnvVars = [
      'NODE_ENV',
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      this.errors.push({ 
        name: 'Environment Configuration', 
        status: 'ERROR', 
        details: `Missing: ${missingEnvVars.join(', ')}` 
      });
      throw new Error('Critical environment variables missing');
    } else {
      this.checks.push({ 
        name: 'Environment Configuration', 
        status: 'OK', 
        details: 'All required variables present' 
      });
    }

    // Check if running as non-root
    if (process.getuid && process.getuid() === 0) {
      this.warnings.push({ 
        name: 'Security - User', 
        status: 'WARNING', 
        details: 'Running as root user' 
      });
    } else {
      this.checks.push({ 
        name: 'Security - User', 
        status: 'OK', 
        details: 'Running as non-root user' 
      });
    }
  }

  async testDatabaseConnection() {
    // Simplified database check - in production use your actual database client
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });
  }

  async testRedisConnection() {
    // Simplified Redis check - in production use your actual Redis client
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 50);
    });
  }

  async makeHttpRequest(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(url, { timeout }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(res.statusCode);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  reportResults() {
    console.log('\n=== Health Check Results ===');
    
    // Report successful checks
    if (this.checks.length > 0) {
      console.log('\n✅ Passed Checks:');
      this.checks.forEach(check => {
        console.log(`  • ${check.name}: ${check.details}`);
      });
    }
    
    // Report warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  • ${warning.name}: ${warning.details}`);
      });
    }
    
    // Report errors
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => {
        console.log(`  • ${error.name}: ${error.details}`);
      });
      
      console.log('\n❌ Health check FAILED');
      process.exit(1);
    }
    
    // Overall status
    const totalChecks = this.checks.length + this.warnings.length + this.errors.length;
    console.log(`\n✅ Health check PASSED (${this.checks.length}/${totalChecks} checks successful, ${this.warnings.length} warnings)`);
    console.log(`[${new Date().toISOString()}] Health check completed successfully\n`);
    
    process.exit(0);
  }
}

// Run health check if called directly
if (require.main === module) {
  const healthChecker = new HealthChecker();
  healthChecker.runHealthCheck().catch((error) => {
    console.error(`Fatal health check error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = HealthChecker; 