#!/usr/bin/env node

/**
 * Health check script for AnnotateAI Background Worker
 * Monitors job processing, queue health, and system resources
 */

const fs = require('fs');
const os = require('os');

const MAX_MEMORY_USAGE_PERCENT = 85;
const MAX_QUEUE_SIZE = 1000;
const MAX_FAILED_JOBS_PERCENT = 10;

class WorkerHealthChecker {
  constructor() {
    this.checks = [];
    this.warnings = [];
    this.errors = [];
    this.startTime = Date.now();
  }

  async runHealthCheck() {
    console.log(`[${new Date().toISOString()}] Starting worker health check...`);
    
    try {
      // Core worker checks
      await this.checkWorkerProcess();
      await this.checkJobQueue();
      await this.checkSystemResources();
      await this.checkFileSystemAccess();
      await this.checkDependencies();
      
      this.reportResults();
      
    } catch (error) {
      console.error(`Worker health check failed: ${error.message}`);
      process.exit(1);
    }
  }

  async checkWorkerProcess() {
    try {
      // Check if worker process is responsive
      const pidFile = '/app/worker.pid';
      const statusFile = '/app/worker.status';
      
      if (fs.existsSync(statusFile)) {
        const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
        const lastHeartbeat = new Date(status.lastHeartbeat);
        const timeSinceHeartbeat = Date.now() - lastHeartbeat.getTime();
        
        if (timeSinceHeartbeat < 60000) { // 1 minute
          this.checks.push({
            name: 'Worker Process',
            status: 'OK',
            details: `Active, last heartbeat ${Math.round(timeSinceHeartbeat / 1000)}s ago`
          });
        } else {
          this.errors.push({
            name: 'Worker Process',
            status: 'ERROR',
            details: `Stale heartbeat, last seen ${Math.round(timeSinceHeartbeat / 1000)}s ago`
          });
          throw new Error('Worker process appears to be stalled');
        }
      } else {
        this.errors.push({
          name: 'Worker Process',
          status: 'ERROR',
          details: 'Status file not found'
        });
        throw new Error('Worker process status unknown');
      }
    } catch (error) {
      this.errors.push({
        name: 'Worker Process',
        status: 'ERROR',
        details: error.message
      });
      throw error;
    }
  }

  async checkJobQueue() {
    try {
      // Check job queue health
      const queueStatsFile = '/app/queue.stats';
      
      if (fs.existsSync(queueStatsFile)) {
        const stats = JSON.parse(fs.readFileSync(queueStatsFile, 'utf8'));
        
        // Check queue size
        if (stats.waiting > MAX_QUEUE_SIZE) {
          this.warnings.push({
            name: 'Job Queue Size',
            status: 'WARNING',
            details: `${stats.waiting} jobs waiting (>${MAX_QUEUE_SIZE})`
          });
        } else {
          this.checks.push({
            name: 'Job Queue Size',
            status: 'OK',
            details: `${stats.waiting} jobs waiting`
          });
        }
        
        // Check failure rate
        const totalJobs = stats.completed + stats.failed;
        const failureRate = totalJobs > 0 ? (stats.failed / totalJobs) * 100 : 0;
        
        if (failureRate > MAX_FAILED_JOBS_PERCENT) {
          this.warnings.push({
            name: 'Job Failure Rate',
            status: 'WARNING',
            details: `${failureRate.toFixed(1)}% failure rate`
          });
        } else {
          this.checks.push({
            name: 'Job Failure Rate',
            status: 'OK',
            details: `${failureRate.toFixed(1)}% failure rate`
          });
        }
        
        // Check processing status
        if (stats.active > 0) {
          this.checks.push({
            name: 'Job Processing',
            status: 'OK',
            details: `${stats.active} jobs in progress`
          });
        } else {
          this.checks.push({
            name: 'Job Processing',
            status: 'OK',
            details: 'No jobs currently processing'
          });
        }
        
      } else {
        this.warnings.push({
          name: 'Job Queue',
          status: 'WARNING',
          details: 'Queue statistics not available'
        });
      }
    } catch (error) {
      this.warnings.push({
        name: 'Job Queue',
        status: 'WARNING',
        details: error.message
      });
    }
  }

  async checkSystemResources() {
    // Memory check
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const usedMemory = totalMemory - os.freemem();
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    const workerMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const maxMemoryMB = parseInt(process.env.WORKER_MAX_MEMORY || '1024');
    const workerMemoryPercent = (workerMemoryMB / maxMemoryMB) * 100;

    if (workerMemoryPercent > MAX_MEMORY_USAGE_PERCENT) {
      this.warnings.push({
        name: 'Worker Memory Usage',
        status: 'WARNING',
        details: `${workerMemoryPercent.toFixed(1)}% of limit (${workerMemoryMB}MB/${maxMemoryMB}MB)`
      });
    } else {
      this.checks.push({
        name: 'Worker Memory Usage',
        status: 'OK',
        details: `${workerMemoryPercent.toFixed(1)}% of limit (${workerMemoryMB}MB/${maxMemoryMB}MB)`
      });
    }

    // CPU check
    const loadAverage = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const cpuUsagePercent = (loadAverage / cpuCount) * 100;

    if (cpuUsagePercent > 90) {
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
  }

  async checkFileSystemAccess() {
    const directories = ['/app/uploads', '/app/temp', '/app/exports', '/app/logs'];
    
    for (const dir of directories) {
      try {
        const testFile = `${dir}/worker_health_test.txt`;
        const testContent = `Worker health test - ${Date.now()}`;
        
        fs.writeFileSync(testFile, testContent);
        const readContent = fs.readFileSync(testFile, 'utf8');
        
        if (readContent === testContent) {
          fs.unlinkSync(testFile);
          this.checks.push({
            name: `File System Access (${dir})`,
            status: 'OK',
            details: 'Read/write access verified'
          });
        } else {
          this.errors.push({
            name: `File System Access (${dir})`,
            status: 'ERROR',
            details: 'File content mismatch'
          });
        }
      } catch (error) {
        this.errors.push({
          name: `File System Access (${dir})`,
          status: 'ERROR',
          details: error.message
        });
      }
    }
  }

  async checkDependencies() {
    // Check if required binaries are available
    const requiredBinaries = [
      { name: 'ImageMagick', command: 'convert' },
      { name: 'FFmpeg', command: 'ffmpeg' }
    ];

    for (const binary of requiredBinaries) {
      try {
        const { execSync } = require('child_process');
        execSync(`which ${binary.command}`, { stdio: 'ignore' });
        this.checks.push({
          name: `Dependency (${binary.name})`,
          status: 'OK',
          details: 'Available'
        });
      } catch (error) {
        this.warnings.push({
          name: `Dependency (${binary.name})`,
          status: 'WARNING',
          details: 'Not available'
        });
      }
    }
  }

  reportResults() {
    console.log('\n=== Worker Health Check Results ===');
    
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
      
      console.log('\n❌ Worker health check FAILED');
      process.exit(1);
    }
    
    // Overall status
    const totalChecks = this.checks.length + this.warnings.length + this.errors.length;
    const uptime = Math.round((Date.now() - this.startTime) / 1000);
    
    console.log(`\n✅ Worker health check PASSED (${this.checks.length}/${totalChecks} checks successful, ${this.warnings.length} warnings)`);
    console.log(`[${new Date().toISOString()}] Worker health check completed (${uptime}s)\n`);
    
    process.exit(0);
  }
}

// Run health check if called directly
if (require.main === module) {
  const healthChecker = new WorkerHealthChecker();
  healthChecker.runHealthCheck().catch((error) => {
    console.error(`Fatal worker health check error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = WorkerHealthChecker; 