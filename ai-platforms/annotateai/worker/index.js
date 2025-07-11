/**
 * AnnotateAI Background Worker
 * Processes annotation jobs, exports, and background tasks
 */

const Queue = require('bull');
const Redis = require('ioredis');
const fs = require('fs').promises;
const path = require('path');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '4');
const TIMEOUT = parseInt(process.env.WORKER_TIMEOUT || '300000');

class AnnotateAIWorker {
  constructor() {
    this.redis = new Redis(REDIS_URL);
    this.queues = {};
    this.stats = {
      processed: 0,
      failed: 0,
      active: 0,
      waiting: 0
    };
    
    this.initializeQueues();
    this.setupStatusTracking();
    this.startHealthMonitoring();
  }

  initializeQueues() {
    // Initialize different job queues
    this.queues = {
      export: new Queue('export jobs', REDIS_URL, {
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 100,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      }),
      
      annotation: new Queue('annotation processing', REDIS_URL, {
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 1000
          }
        }
      }),
      
      notification: new Queue('notifications', REDIS_URL, {
        defaultJobOptions: {
          removeOnComplete: 20,
          removeOnFail: 20,
          attempts: 3
        }
      }),
      
      cleanup: new Queue('cleanup tasks', REDIS_URL, {
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 10,
          attempts: 1
        }
      })
    };
    
    // Process jobs for each queue
    this.queues.export.process('coco-export', CONCURRENCY, this.processCocoExport.bind(this));
    this.queues.export.process('yolo-export', CONCURRENCY, this.processYoloExport.bind(this));
    this.queues.export.process('pascal-export', CONCURRENCY, this.processPascalExport.bind(this));
    this.queues.export.process('custom-export', CONCURRENCY, this.processCustomExport.bind(this));
    
    this.queues.annotation.process('quality-check', CONCURRENCY, this.processQualityCheck.bind(this));
    this.queues.annotation.process('validation', CONCURRENCY, this.processValidation.bind(this));
    this.queues.annotation.process('auto-annotation', CONCURRENCY, this.processAutoAnnotation.bind(this));
    
    this.queues.notification.process('email', CONCURRENCY, this.processEmailNotification.bind(this));
    this.queues.notification.process('webhook', CONCURRENCY, this.processWebhookNotification.bind(this));
    
    this.queues.cleanup.process('temp-files', 1, this.processTempFileCleanup.bind(this));
    this.queues.cleanup.process('expired-exports', 1, this.processExpiredExports.bind(this));
    
    console.log('Worker queues initialized');
  }

  setupStatusTracking() {
    // Track queue statistics
    Object.keys(this.queues).forEach(queueName => {
      const queue = this.queues[queueName];
      
      queue.on('completed', (job) => {
        this.stats.processed++;
        this.stats.active--;
        console.log(`[${queueName}] Job ${job.id} completed`);
      });
      
      queue.on('failed', (job, err) => {
        this.stats.failed++;
        this.stats.active--;
        console.error(`[${queueName}] Job ${job.id} failed:`, err.message);
      });
      
      queue.on('active', (job) => {
        this.stats.active++;
        console.log(`[${queueName}] Job ${job.id} started`);
      });
      
      queue.on('waiting', (job) => {
        this.stats.waiting++;
        console.log(`[${queueName}] Job ${job.id} waiting`);
      });
    });
  }

  startHealthMonitoring() {
    // Write status file for health checks
    setInterval(async () => {
      try {
        const status = {
          lastHeartbeat: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          stats: this.stats
        };
        
        await fs.writeFile('/app/worker.status', JSON.stringify(status, null, 2));
        
        // Update queue statistics
        let totalWaiting = 0;
        for (const queue of Object.values(this.queues)) {
          totalWaiting += await queue.count();
        }
        
        const queueStats = {
          ...this.stats,
          waiting: totalWaiting,
          completed: this.stats.processed,
          failed: this.stats.failed,
          active: this.stats.active
        };
        
        await fs.writeFile('/app/queue.stats', JSON.stringify(queueStats, null, 2));
        
      } catch (error) {
        console.error('Error writing status file:', error);
      }
    }, 30000); // Every 30 seconds
  }

  // Export Job Processors
  async processCocoExport(job) {
    const { projectId, annotationIds, format } = job.data;
    
    try {
      job.progress(10);
      console.log(`Processing COCO export for project ${projectId}`);
      
      // Simulate export processing
      await this.simulateExportProcessing(job, 'coco', projectId, annotationIds);
      
      job.progress(100);
      return { success: true, format: 'coco', projectId };
      
    } catch (error) {
      console.error('COCO export failed:', error);
      throw error;
    }
  }

  async processYoloExport(job) {
    const { projectId, annotationIds } = job.data;
    
    try {
      job.progress(10);
      console.log(`Processing YOLO export for project ${projectId}`);
      
      await this.simulateExportProcessing(job, 'yolo', projectId, annotationIds);
      
      job.progress(100);
      return { success: true, format: 'yolo', projectId };
      
    } catch (error) {
      console.error('YOLO export failed:', error);
      throw error;
    }
  }

  async processPascalExport(job) {
    const { projectId, annotationIds } = job.data;
    
    try {
      job.progress(10);
      console.log(`Processing Pascal VOC export for project ${projectId}`);
      
      await this.simulateExportProcessing(job, 'pascal', projectId, annotationIds);
      
      job.progress(100);
      return { success: true, format: 'pascal', projectId };
      
    } catch (error) {
      console.error('Pascal export failed:', error);
      throw error;
    }
  }

  async processCustomExport(job) {
    const { projectId, annotationIds, customFormat } = job.data;
    
    try {
      job.progress(10);
      console.log(`Processing custom export for project ${projectId}`);
      
      await this.simulateExportProcessing(job, customFormat, projectId, annotationIds);
      
      job.progress(100);
      return { success: true, format: customFormat, projectId };
      
    } catch (error) {
      console.error('Custom export failed:', error);
      throw error;
    }
  }

  // Annotation Job Processors
  async processQualityCheck(job) {
    const { annotationId, projectId } = job.data;
    
    try {
      console.log(`Processing quality check for annotation ${annotationId}`);
      
      // Simulate quality analysis
      await this.simulateProcessingDelay(2000);
      
      const qualityScore = Math.random() * 100;
      const issues = [];
      
      if (qualityScore < 70) {
        issues.push('Low confidence score');
      }
      
      return { annotationId, qualityScore, issues };
      
    } catch (error) {
      console.error('Quality check failed:', error);
      throw error;
    }
  }

  async processValidation(job) {
    const { annotationId, schema } = job.data;
    
    try {
      console.log(`Processing validation for annotation ${annotationId}`);
      
      await this.simulateProcessingDelay(1000);
      
      // Simulate validation
      const isValid = Math.random() > 0.1; // 90% valid
      const errors = isValid ? [] : ['Invalid coordinate format'];
      
      return { annotationId, isValid, errors };
      
    } catch (error) {
      console.error('Validation failed:', error);
      throw error;
    }
  }

  async processAutoAnnotation(job) {
    const { imageId, modelId, projectId } = job.data;
    
    try {
      console.log(`Processing auto-annotation for image ${imageId}`);
      
      job.progress(20);
      await this.simulateProcessingDelay(5000);
      
      job.progress(80);
      
      // Simulate AI annotation results
      const annotations = [
        {
          id: `auto_${Date.now()}`,
          type: 'bbox',
          coordinates: [100, 100, 200, 200],
          confidence: 0.85,
          category: 'object'
        }
      ];
      
      job.progress(100);
      return { imageId, annotations };
      
    } catch (error) {
      console.error('Auto-annotation failed:', error);
      throw error;
    }
  }

  // Notification Processors
  async processEmailNotification(job) {
    const { to, subject, body, type } = job.data;
    
    try {
      console.log(`Sending email notification to ${to}`);
      
      // Simulate email sending
      await this.simulateProcessingDelay(1000);
      
      return { sent: true, to, subject, type };
      
    } catch (error) {
      console.error('Email notification failed:', error);
      throw error;
    }
  }

  async processWebhookNotification(job) {
    const { url, payload, headers } = job.data;
    
    try {
      console.log(`Sending webhook notification to ${url}`);
      
      // Simulate webhook call
      await this.simulateProcessingDelay(2000);
      
      return { sent: true, url, status: 200 };
      
    } catch (error) {
      console.error('Webhook notification failed:', error);
      throw error;
    }
  }

  // Cleanup Processors
  async processTempFileCleanup(job) {
    try {
      console.log('Processing temp file cleanup');
      
      const tempDir = '/app/temp';
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stat = await fs.stat(filePath);
        
        if (now - stat.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      return { deletedCount };
      
    } catch (error) {
      console.error('Temp file cleanup failed:', error);
      throw error;
    }
  }

  async processExpiredExports(job) {
    try {
      console.log('Processing expired exports cleanup');
      
      const exportsDir = '/app/exports';
      const files = await fs.readdir(exportsDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(exportsDir, file);
        const stat = await fs.stat(filePath);
        
        if (now - stat.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      return { deletedCount };
      
    } catch (error) {
      console.error('Expired exports cleanup failed:', error);
      throw error;
    }
  }

  // Helper methods
  async simulateExportProcessing(job, format, projectId, annotationIds) {
    const steps = [
      { progress: 20, message: 'Loading annotations' },
      { progress: 40, message: 'Processing data' },
      { progress: 60, message: 'Generating export file' },
      { progress: 80, message: 'Compressing and optimizing' },
      { progress: 90, message: 'Uploading to storage' }
    ];
    
    for (const step of steps) {
      await this.simulateProcessingDelay(1000);
      job.progress(step.progress);
      console.log(`[${format}] ${step.message}`);
    }
    
    // Create export file
    const exportPath = `/app/exports/${format}_${projectId}_${Date.now()}.zip`;
    await fs.writeFile(exportPath, `Mock export data for ${format} format`);
    
    return exportPath;
  }

  async simulateProcessingDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start() {
    console.log('AnnotateAI Background Worker started');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Concurrency: ${CONCURRENCY}`);
    console.log(`Timeout: ${TIMEOUT}ms`);
    
    // Schedule periodic cleanup jobs
    setInterval(() => {
      this.queues.cleanup.add('temp-files', {});
      this.queues.cleanup.add('expired-exports', {});
    }, 60 * 60 * 1000); // Every hour
    
    // Write PID file
    await fs.writeFile('/app/worker.pid', process.pid.toString());
    
    console.log('Worker is ready to process jobs');
  }

  async shutdown() {
    console.log('Shutting down worker...');
    
    // Close all queues
    for (const queue of Object.values(this.queues)) {
      await queue.close();
    }
    
    // Close Redis connection
    await this.redis.quit();
    
    console.log('Worker shutdown complete');
  }
}

// Start the worker
const worker = new AnnotateAIWorker();
worker.start().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM');
  await worker.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT');
  await worker.shutdown();
  process.exit(0);
});

module.exports = AnnotateAIWorker; 