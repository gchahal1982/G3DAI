#!/usr/bin/env node

/**
 * G3D AI Services Health Check Script
 * Used for Docker health checks and Kubernetes probes
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    port: process.env.PORT || 3000,
    serviceName: process.env.SERVICE_NAME || 'unknown',
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
    maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB) || 2048,
    maxCpuPercent: parseInt(process.env.MAX_CPU_PERCENT) || 90,
    checkDatabase: process.env.CHECK_DATABASE === 'true',
    checkRedis: process.env.CHECK_REDIS === 'true',
    checkGPU: process.env.CHECK_GPU === 'true',
    dbUrl: process.env.MONGODB_URL,
    redisUrl: process.env.REDIS_URL
};

// Health check results
const healthStatus = {
    status: 'unknown',
    timestamp: new Date().toISOString(),
    service: CONFIG.serviceName,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
        http: { status: 'unknown', message: '', duration: 0 },
        memory: { status: 'unknown', message: '', duration: 0 },
        cpu: { status: 'unknown', message: '', duration: 0 },
        disk: { status: 'unknown', message: '', duration: 0 },
        database: { status: 'unknown', message: '', duration: 0 },
        redis: { status: 'unknown', message: '', duration: 0 },
        gpu: { status: 'unknown', message: '', duration: 0 }
    },
    metrics: {
        memoryUsageMB: 0,
        cpuUsagePercent: 0,
        diskUsagePercent: 0,
        requestCount: 0,
        errorCount: 0
    }
};

// Utility functions
const logger = {
    info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
    warn: (msg) => console.log(`[${new Date().toISOString()}] WARN: ${msg}`),
    error: (msg) => console.log(`[${new Date().toISOString()}] ERROR: ${msg}`)
};

const timeCheck = async (name, checkFunction) => {
    const start = Date.now();
    try {
        await checkFunction();
        const duration = Date.now() - start;
        healthStatus.checks[name] = {
            status: 'healthy',
            message: 'OK',
            duration
        };
        logger.info(`${name} check passed (${duration}ms)`);
    } catch (error) {
        const duration = Date.now() - start;
        healthStatus.checks[name] = {
            status: 'unhealthy',
            message: error.message,
            duration
        };
        logger.error(`${name} check failed: ${error.message} (${duration}ms)`);
    }
};

// Health check functions
const checkHTTP = () => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: CONFIG.port,
            path: '/health',
            method: 'GET',
            timeout: CONFIG.timeout
        }, (res) => {
            if (res.statusCode === 200) {
                resolve();
            } else {
                reject(new Error(`HTTP check failed with status ${res.statusCode}`));
            }
        });

        req.on('error', (error) => {
            reject(new Error(`HTTP request failed: ${error.message}`));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('HTTP request timeout'));
        });

        req.end();
    });
};

const checkMemory = () => {
    return new Promise((resolve, reject) => {
        const memUsage = process.memoryUsage();
        const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);

        healthStatus.metrics.memoryUsageMB = memUsageMB;

        if (memUsageMB > CONFIG.maxMemoryMB) {
            reject(new Error(`Memory usage ${memUsageMB}MB exceeds limit ${CONFIG.maxMemoryMB}MB`));
        } else {
            resolve();
        }
    });
};

const checkCPU = () => {
    return new Promise((resolve, reject) => {
        const cpuUsage = process.cpuUsage();
        const cpuPercent = Math.round((cpuUsage.user + cpuUsage.system) / 1000000 * 100);

        healthStatus.metrics.cpuUsagePercent = cpuPercent;

        if (cpuPercent > CONFIG.maxCpuPercent) {
            reject(new Error(`CPU usage ${cpuPercent}% exceeds limit ${CONFIG.maxCpuPercent}%`));
        } else {
            resolve();
        }
    });
};

const checkDisk = () => {
    return new Promise((resolve, reject) => {
        try {
            const stats = fs.statSync('/app');
            const diskUsage = Math.round((stats.size / (1024 * 1024 * 1024)) * 100);

            healthStatus.metrics.diskUsagePercent = diskUsage;

            if (diskUsage > 90) {
                reject(new Error(`Disk usage ${diskUsage}% exceeds 90%`));
            } else {
                resolve();
            }
        } catch (error) {
            reject(new Error(`Disk check failed: ${error.message}`));
        }
    });
};

const checkDatabase = () => {
    if (!CONFIG.checkDatabase || !CONFIG.dbUrl) {
        healthStatus.checks.database.status = 'skipped';
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        // Simple MongoDB connection check
        const { MongoClient } = require('mongodb');

        MongoClient.connect(CONFIG.dbUrl, {
            serverSelectionTimeoutMS: CONFIG.timeout,
            connectTimeoutMS: CONFIG.timeout
        })
            .then(client => {
                client.close();
                resolve();
            })
            .catch(error => {
                reject(new Error(`Database connection failed: ${error.message}`));
            });
    });
};

const checkRedis = () => {
    if (!CONFIG.checkRedis || !CONFIG.redisUrl) {
        healthStatus.checks.redis.status = 'skipped';
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        // Simple Redis connection check
        const redis = require('redis');
        const client = redis.createClient({
            url: CONFIG.redisUrl,
            socket: {
                connectTimeout: CONFIG.timeout,
                commandTimeout: CONFIG.timeout
            }
        });

        client.connect()
            .then(() => client.ping())
            .then(() => {
                client.disconnect();
                resolve();
            })
            .catch(error => {
                reject(new Error(`Redis connection failed: ${error.message}`));
            });
    });
};

const checkGPU = () => {
    if (!CONFIG.checkGPU) {
        healthStatus.checks.gpu.status = 'skipped';
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        // Check if NVIDIA GPU is available
        const { spawn } = require('child_process');

        const nvidia_smi = spawn('nvidia-smi', ['--query-gpu=utilization.gpu', '--format=csv,noheader,nounits'], {
            timeout: CONFIG.timeout
        });

        let output = '';

        nvidia_smi.stdout.on('data', (data) => {
            output += data.toString();
        });

        nvidia_smi.on('close', (code) => {
            if (code === 0) {
                const utilization = parseInt(output.trim());
                if (utilization >= 0 && utilization <= 100) {
                    resolve();
                } else {
                    reject(new Error('Invalid GPU utilization reading'));
                }
            } else {
                reject(new Error('nvidia-smi command failed'));
            }
        });

        nvidia_smi.on('error', (error) => {
            reject(new Error(`GPU check failed: ${error.message}`));
        });
    });
};

// Main health check function
const runHealthChecks = async () => {
    logger.info(`Starting health checks for ${CONFIG.serviceName}`);

    // Update timestamp and uptime
    healthStatus.timestamp = new Date().toISOString();
    healthStatus.uptime = process.uptime();

    // Run all health checks
    await Promise.all([
        timeCheck('http', checkHTTP),
        timeCheck('memory', checkMemory),
        timeCheck('cpu', checkCPU),
        timeCheck('disk', checkDisk),
        timeCheck('database', checkDatabase),
        timeCheck('redis', checkRedis),
        timeCheck('gpu', checkGPU)
    ]);

    // Determine overall health status
    const checks = Object.values(healthStatus.checks);
    const unhealthyChecks = checks.filter(check => check.status === 'unhealthy');

    if (unhealthyChecks.length === 0) {
        healthStatus.status = 'healthy';
        logger.info('All health checks passed');
    } else {
        healthStatus.status = 'unhealthy';
        logger.error(`${unhealthyChecks.length} health checks failed`);
    }

    return healthStatus;
};

// CLI execution
const main = async () => {
    try {
        const result = await runHealthChecks();

        // Output results
        if (process.env.HEALTH_CHECK_OUTPUT === 'json') {
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(`Health Status: ${result.status.toUpperCase()}`);
            console.log(`Service: ${result.service}`);
            console.log(`Uptime: ${Math.round(result.uptime)}s`);

            Object.entries(result.checks).forEach(([name, check]) => {
                if (check.status !== 'skipped') {
                    const status = check.status === 'healthy' ? '✓' : '✗';
                    console.log(`${status} ${name}: ${check.message} (${check.duration}ms)`);
                }
            });
        }

        // Exit with appropriate code
        process.exit(result.status === 'healthy' ? 0 : 1);

    } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled rejection at ${promise}: ${reason}`);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    runHealthChecks,
    healthStatus,
    CONFIG
};