/**
 * Completion Latency Validation System
 * 
 * Automated testing for <60ms local completion latency:
 * - Cross-platform validation (Windows, macOS, Linux)
 * - Hardware-specific performance benchmarks
 * - Continuous latency monitoring in CI
 * - Performance regression detection
 * - Latency optimization recommendations
 */

import { performance, PerformanceObserver } from 'perf_hooks';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface LatencyTestConfig {
  targetLatencyMs: number;
  maxIterations: number;
  warmupIterations: number;
  concurrentRequests: number;
  testModels: string[];
  testPrompts: TestPrompt[];
  platforms: Platform[];
  hardwareProfiles: HardwareProfile[];
}

export interface TestPrompt {
  id: string;
  description: string;
  prompt: string;
  contextLength: number;
  expectedTokens: number;
  complexity: 'simple' | 'medium' | 'complex';
}

export interface Platform {
  os: 'windows' | 'macos' | 'linux';
  arch: 'x64' | 'arm64';
  nodeVersion: string;
}

export interface HardwareProfile {
  name: string;
  cpu: string;
  memoryGB: number;
  gpu?: {
    model: string;
    memoryGB: number;
    computeCapability: string;
  };
  storage: 'hdd' | 'ssd' | 'nvme';
  minExpectedLatency: number;
  maxExpectedLatency: number;
}

export interface LatencyTestResult {
  testId: string;
  timestamp: Date;
  platform: Platform;
  hardware: HardwareProfile;
  model: string;
  prompt: TestPrompt;
  metrics: LatencyMetrics;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export interface LatencyMetrics {
  firstTokenLatency: number;
  averageTokenLatency: number;
  totalLatency: number;
  throughputTokensPerSecond: number;
  memoryUsageMB: number;
  gpuUtilizationPercent: number;
  cpuUtilizationPercent: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
}

export interface PerformanceRegression {
  testId: string;
  baseline: LatencyMetrics;
  current: LatencyMetrics;
  regressionPercent: number;
  affectedMetrics: string[];
  severity: 'minor' | 'major' | 'critical';
}

export interface OptimizationRecommendation {
  category: 'hardware' | 'software' | 'configuration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  expectedImprovement: string;
}

export interface CertificationResult {
  certificationId: string;
  timestamp: Date;
  platform: Platform;
  hardware: HardwareProfile;
  overallResult: 'pass' | 'fail' | 'conditional';
  testResults: LatencyTestResult[];
  recommendations: OptimizationRecommendation[];
  certificationLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
}

export class LatencyValidation {
  private config: LatencyTestConfig;
  private testResults: Map<string, LatencyTestResult[]> = new Map();
  private baselineResults: Map<string, LatencyMetrics> = new Map();
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializePerformanceMonitoring();
  }

  private getDefaultConfig(): LatencyTestConfig {
    return {
      targetLatencyMs: 60,
      maxIterations: 100,
      warmupIterations: 10,
      concurrentRequests: 1,
      testModels: [
        'qwen3-coder-4b',
        'qwen3-coder-8b',
        'phi-4-mini',
        'deepseek-coder-1.3b',
        'starcoder2-3b'
      ],
      testPrompts: [
        {
          id: 'simple-completion',
          description: 'Simple function completion',
          prompt: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return',
          contextLength: 50,
          expectedTokens: 20,
          complexity: 'simple'
        },
        {
          id: 'medium-completion',
          description: 'Class method implementation',
          prompt: 'class DataProcessor {\n  constructor(data) {\n    this.data = data;\n  }\n  \n  async processData() {\n    // Process the data and return',
          contextLength: 150,
          expectedTokens: 50,
          complexity: 'medium'
        },
        {
          id: 'complex-completion',
          description: 'Algorithm implementation with context',
          prompt: '// Implement a binary search tree with balance operations\nclass BinarySearchTree {\n  constructor() {\n    this.root = null;\n  }\n  \n  insert(value) {\n    if (!this.root) {\n      this.root = new Node(value);\n      return;\n    }\n    \n    const insertNode = (node, value) => {\n      if (value < node.value) {\n        if (!node.left) {\n          node.left = new Node(value);\n        } else {\n          insertNode(node.left, value);\n        }\n      } else {\n        if (!node.right) {\n          node.right = new Node(value);\n        } else {',
          contextLength: 500,
          expectedTokens: 100,
          complexity: 'complex'
        }
      ],
      platforms: [
        { os: 'linux', arch: 'x64', nodeVersion: '18.x' },
        { os: 'macos', arch: 'arm64', nodeVersion: '18.x' },
        { os: 'windows', arch: 'x64', nodeVersion: '18.x' }
      ],
      hardwareProfiles: [
        {
          name: 'Basic Laptop',
          cpu: 'Intel Core i5-8250U',
          memoryGB: 8,
          storage: 'ssd',
          minExpectedLatency: 45,
          maxExpectedLatency: 80
        },
        {
          name: 'Developer Workstation',
          cpu: 'Intel Core i7-12700K',
          memoryGB: 32,
          gpu: {
            model: 'NVIDIA RTX 3070',
            memoryGB: 8,
            computeCapability: '8.6'
          },
          storage: 'nvme',
          minExpectedLatency: 20,
          maxExpectedLatency: 45
        },
        {
          name: 'High-End Workstation',
          cpu: 'AMD Ryzen 9 5950X',
          memoryGB: 64,
          gpu: {
            model: 'NVIDIA RTX 4090',
            memoryGB: 24,
            computeCapability: '8.9'
          },
          storage: 'nvme',
          minExpectedLatency: 15,
          maxExpectedLatency: 35
        },
        {
          name: 'Apple Silicon',
          cpu: 'Apple M2 Pro',
          memoryGB: 32,
          storage: 'nvme',
          minExpectedLatency: 25,
          maxExpectedLatency: 50
        }
      ]
    };
  }

  /**
   * Run comprehensive latency validation tests
   */
  public async runValidationSuite(): Promise<CertificationResult> {
    const currentPlatform = this.detectCurrentPlatform();
    const currentHardware = await this.detectCurrentHardware();
    const certificationId = this.generateCertificationId();

    console.log(`🚀 Starting latency validation suite for ${currentPlatform.os}-${currentPlatform.arch}`);
    console.log(`📊 Hardware: ${currentHardware.name}`);
    console.log(`🎯 Target latency: <${this.config.targetLatencyMs}ms`);

    const testResults: LatencyTestResult[] = [];
    const recommendations: OptimizationRecommendation[] = [];

    // Warmup phase
    console.log('🔥 Warming up models...');
    await this.warmupModels();

    // Run tests for each model and prompt combination
    for (const model of this.config.testModels) {
      console.log(`\n🧠 Testing model: ${model}`);
      
      for (const prompt of this.config.testPrompts) {
        console.log(`  📝 Testing prompt: ${prompt.description}`);
        
        const result = await this.runLatencyTest(
          model,
          prompt,
          currentPlatform,
          currentHardware
        );
        
        testResults.push(result);
        
        // Real-time feedback
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`    ${status} ${result.metrics.totalLatency.toFixed(1)}ms (target: <${this.config.targetLatencyMs}ms)`);
        
        if (!result.passed) {
          console.log(`    ⚠️  ${result.errors.join(', ')}`);
        }
      }
    }

    // Detect performance regressions
    const regressions = await this.detectRegressions(testResults);
    if (regressions.length > 0) {
      console.log(`\n⚠️  Detected ${regressions.length} performance regressions`);
      regressions.forEach(regression => {
        console.log(`   • ${regression.testId}: +${regression.regressionPercent.toFixed(1)}% slower`);
      });
    }

    // Generate optimization recommendations
    recommendations.push(...await this.generateRecommendations(testResults, currentHardware));

    // Determine certification level
    const certificationLevel = this.determineCertificationLevel(testResults);
    const overallResult = this.determineOverallResult(testResults);

    const certification: CertificationResult = {
      certificationId,
      timestamp: new Date(),
      platform: currentPlatform,
      hardware: currentHardware,
      overallResult,
      testResults,
      recommendations,
      certificationLevel
    };

    // Save results
    await this.saveResults(certification);

    // Print summary
    this.printSummary(certification);

    return certification;
  }

  /**
   * Run a single latency test
   */
  private async runLatencyTest(
    model: string,
    prompt: TestPrompt,
    platform: Platform,
    hardware: HardwareProfile
  ): Promise<LatencyTestResult> {
    const testId = `${model}-${prompt.id}-${Date.now()}`;
    const latencies: number[] = [];
    const firstTokenLatencies: number[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    let totalMemoryUsage = 0;
    let totalGpuUtilization = 0;
    let totalCpuUtilization = 0;

    // Run multiple iterations for statistical significance
    for (let i = 0; i < this.config.maxIterations; i++) {
      try {
        const iterationResult = await this.runSingleIteration(model, prompt);
        
        latencies.push(iterationResult.totalLatency);
        firstTokenLatencies.push(iterationResult.firstTokenLatency);
        totalMemoryUsage += iterationResult.memoryUsage;
        totalGpuUtilization += iterationResult.gpuUtilization;
        totalCpuUtilization += iterationResult.cpuUtilization;

        // Check for immediate failures
        if (iterationResult.totalLatency > this.config.targetLatencyMs * 2) {
          warnings.push(`Iteration ${i + 1} exceeded 2x target latency: ${iterationResult.totalLatency.toFixed(1)}ms`);
        }

      } catch (error) {
        errors.push(`Iteration ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Calculate metrics
    const metrics = this.calculateMetrics(
      latencies,
      firstTokenLatencies,
      prompt.expectedTokens,
      totalMemoryUsage / this.config.maxIterations,
      totalGpuUtilization / this.config.maxIterations,
      totalCpuUtilization / this.config.maxIterations
    );

    // Determine if test passed
    const passed = this.evaluateTestResult(metrics, hardware, errors);

    return {
      testId,
      timestamp: new Date(),
      platform,
      hardware,
      model,
      prompt,
      metrics,
      passed,
      errors,
      warnings
    };
  }

  private async runSingleIteration(model: string, prompt: TestPrompt): Promise<{
    totalLatency: number;
    firstTokenLatency: number;
    memoryUsage: number;
    gpuUtilization: number;
    cpuUtilization: number;
  }> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();

    // Simulate model inference (in real implementation, this would call the actual model)
    const mockFirstTokenDelay = 15 + Math.random() * 10; // 15-25ms
    const mockTokenDelay = 2 + Math.random() * 3; // 2-5ms per token
    
    await new Promise(resolve => setTimeout(resolve, mockFirstTokenDelay));
    const firstTokenTime = performance.now();
    
    // Simulate remaining tokens
    for (let i = 1; i < prompt.expectedTokens; i++) {
      await new Promise(resolve => setTimeout(resolve, mockTokenDelay));
    }
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage();

    return {
      totalLatency: endTime - startTime,
      firstTokenLatency: firstTokenTime - startTime,
      memoryUsage: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024, // MB
      gpuUtilization: Math.random() * 100, // Mock GPU utilization
      cpuUtilization: Math.random() * 80 + 20 // Mock CPU utilization 20-100%
    };
  }

  private calculateMetrics(
    latencies: number[],
    firstTokenLatencies: number[],
    expectedTokens: number,
    memoryUsage: number,
    gpuUtilization: number,
    cpuUtilization: number
  ): LatencyMetrics {
    latencies.sort((a, b) => a - b);
    firstTokenLatencies.sort((a, b) => a - b);

    const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
    const avgFirstToken = firstTokenLatencies.reduce((sum, lat) => sum + lat, 0) / firstTokenLatencies.length;

    return {
      firstTokenLatency: avgFirstToken,
      averageTokenLatency: (avgLatency - avgFirstToken) / (expectedTokens - 1),
      totalLatency: avgLatency,
      throughputTokensPerSecond: expectedTokens / (avgLatency / 1000),
      memoryUsageMB: memoryUsage,
      gpuUtilizationPercent: gpuUtilization,
      cpuUtilizationPercent: cpuUtilization,
      p50Latency: latencies[Math.floor(latencies.length * 0.5)],
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)]
    };
  }

  private evaluateTestResult(
    metrics: LatencyMetrics,
    hardware: HardwareProfile,
    errors: string[]
  ): boolean {
    // Fail if there were errors
    if (errors.length > 0) {
      return false;
    }

    // Check if latency is within target
    if (metrics.p95Latency > this.config.targetLatencyMs) {
      return false;
    }

    // Check if latency is within hardware-specific expectations
    if (metrics.totalLatency < hardware.minExpectedLatency || 
        metrics.totalLatency > hardware.maxExpectedLatency) {
      return false;
    }

    return true;
  }

  private async warmupModels(): Promise<void> {
    const warmupPrompt = this.config.testPrompts[0]; // Use simple prompt for warmup
    
    for (let i = 0; i < this.config.warmupIterations; i++) {
      for (const model of this.config.testModels) {
        await this.runSingleIteration(model, warmupPrompt);
      }
    }
  }

  private async detectRegressions(testResults: LatencyTestResult[]): Promise<PerformanceRegression[]> {
    const regressions: PerformanceRegression[] = [];

    for (const result of testResults) {
      const baselineKey = `${result.model}-${result.prompt.id}`;
      const baseline = this.baselineResults.get(baselineKey);

      if (baseline) {
        const regressionPercent = ((result.metrics.totalLatency - baseline.totalLatency) / baseline.totalLatency) * 100;
        
        if (regressionPercent > 10) { // 10% regression threshold
          const affectedMetrics = this.identifyAffectedMetrics(baseline, result.metrics);
          
          regressions.push({
            testId: result.testId,
            baseline,
            current: result.metrics,
            regressionPercent,
            affectedMetrics,
            severity: regressionPercent > 50 ? 'critical' : regressionPercent > 25 ? 'major' : 'minor'
          });
        }
      }

      // Update baseline with current results
      this.baselineResults.set(baselineKey, result.metrics);
    }

    return regressions;
  }

  private identifyAffectedMetrics(baseline: LatencyMetrics, current: LatencyMetrics): string[] {
    const affected: string[] = [];
    const threshold = 0.1; // 10% change threshold

    if (Math.abs(current.firstTokenLatency - baseline.firstTokenLatency) / baseline.firstTokenLatency > threshold) {
      affected.push('firstTokenLatency');
    }
    
    if (Math.abs(current.totalLatency - baseline.totalLatency) / baseline.totalLatency > threshold) {
      affected.push('totalLatency');
    }
    
    if (Math.abs(current.throughputTokensPerSecond - baseline.throughputTokensPerSecond) / baseline.throughputTokensPerSecond > threshold) {
      affected.push('throughput');
    }

    return affected;
  }

  private async generateRecommendations(
    testResults: LatencyTestResult[],
    hardware: HardwareProfile
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];
    const failedTests = testResults.filter(test => !test.passed);

    if (failedTests.length > 0) {
      const avgLatency = failedTests.reduce((sum, test) => sum + test.metrics.totalLatency, 0) / failedTests.length;
      
      if (avgLatency > this.config.targetLatencyMs * 1.5) {
        recommendations.push({
          category: 'hardware',
          priority: 'high',
          title: 'GPU Upgrade Recommended',
          description: `Current hardware shows ${avgLatency.toFixed(1)}ms latency, significantly above target`,
          implementation: 'Consider upgrading to RTX 3070 or better for optimal performance',
          expectedImprovement: '40-60% latency reduction'
        });
      }

      if (hardware.memoryGB < 16) {
        recommendations.push({
          category: 'hardware',
          priority: 'medium',
          title: 'Memory Upgrade',
          description: 'Insufficient system memory may cause performance issues',
          implementation: 'Upgrade to at least 16GB RAM for better model caching',
          expectedImprovement: '20-30% latency reduction'
        });
      }

      if (hardware.storage === 'hdd') {
        recommendations.push({
          category: 'hardware',
          priority: 'high',
          title: 'Storage Upgrade Critical',
          description: 'HDD storage significantly impacts model loading times',
          implementation: 'Upgrade to NVMe SSD for model storage',
          expectedImprovement: '50-80% model loading improvement'
        });
      }
    }

    // Software optimizations
    const highMemoryUsage = testResults.some(test => test.metrics.memoryUsageMB > 1000);
    if (highMemoryUsage) {
      recommendations.push({
        category: 'software',
        priority: 'medium',
        title: 'Memory Optimization',
        description: 'High memory usage detected during inference',
        implementation: 'Enable model quantization and optimize batch sizes',
        expectedImprovement: '15-25% memory reduction'
      });
    }

    return recommendations;
  }

  private determineCertificationLevel(testResults: LatencyTestResult[]): 'basic' | 'standard' | 'premium' | 'enterprise' {
    const passRate = testResults.filter(test => test.passed).length / testResults.length;
    const avgLatency = testResults.reduce((sum, test) => sum + test.metrics.totalLatency, 0) / testResults.length;

    if (passRate >= 0.95 && avgLatency <= 30) {
      return 'enterprise';
    } else if (passRate >= 0.90 && avgLatency <= 45) {
      return 'premium';
    } else if (passRate >= 0.80 && avgLatency <= 60) {
      return 'standard';
    } else {
      return 'basic';
    }
  }

  private determineOverallResult(testResults: LatencyTestResult[]): 'pass' | 'fail' | 'conditional' {
    const passRate = testResults.filter(test => test.passed).length / testResults.length;
    
    if (passRate >= 0.90) {
      return 'pass';
    } else if (passRate >= 0.70) {
      return 'conditional';
    } else {
      return 'fail';
    }
  }

  private detectCurrentPlatform(): Platform {
    return {
      os: os.platform() as any,
      arch: os.arch() as any,
      nodeVersion: process.version
    };
  }

  private async detectCurrentHardware(): Promise<HardwareProfile> {
    const cpus = os.cpus();
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024; // GB

    // This is a simplified hardware detection
    // In a real implementation, you'd use more sophisticated hardware detection
    return {
      name: 'Detected Hardware',
      cpu: cpus[0]?.model || 'Unknown CPU',
      memoryGB: Math.round(totalMemory),
      storage: 'ssd', // Default assumption
      minExpectedLatency: 30,
      maxExpectedLatency: 80
    };
  }

  private async saveResults(certification: CertificationResult): Promise<void> {
    const resultsDir = path.join(process.cwd(), 'test-results', 'performance');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const filename = `latency-validation-${certification.certificationId}.json`;
    const filepath = path.join(resultsDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(certification, null, 2));
    console.log(`\n💾 Results saved to: ${filepath}`);
  }

  private printSummary(certification: CertificationResult): void {
    const { testResults, overallResult, certificationLevel, recommendations } = certification;
    
    console.log('\n' + '='.repeat(80));
    console.log('🏆 LATENCY VALIDATION SUMMARY');
    console.log('='.repeat(80));
    
    const passCount = testResults.filter(test => test.passed).length;
    const passRate = (passCount / testResults.length) * 100;
    
    console.log(`📊 Test Results: ${passCount}/${testResults.length} passed (${passRate.toFixed(1)}%)`);
    console.log(`🎯 Overall Result: ${overallResult.toUpperCase()}`);
    console.log(`🏅 Certification Level: ${certificationLevel.toUpperCase()}`);
    
    const avgLatency = testResults.reduce((sum, test) => sum + test.metrics.totalLatency, 0) / testResults.length;
    console.log(`⚡ Average Latency: ${avgLatency.toFixed(1)}ms (target: <${this.config.targetLatencyMs}ms)`);
    
    if (recommendations.length > 0) {
      console.log(`\n💡 Optimization Recommendations (${recommendations.length}):`);
      recommendations.forEach(rec => {
        console.log(`   • [${rec.priority.toUpperCase()}] ${rec.title}`);
        console.log(`     ${rec.description}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }

  private generateCertificationId(): string {
    return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`.toUpperCase();
  }

  private initializePerformanceMonitoring(): void {
    this.performanceObserver = new PerformanceObserver((list) => {
      // Performance monitoring implementation
    });
    
    this.performanceObserver.observe({ entryTypes: ['measure', 'mark'] });
  }

  public destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

export default LatencyValidation; 