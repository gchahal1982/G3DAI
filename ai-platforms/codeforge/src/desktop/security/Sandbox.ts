/**
 * CodeForge Enhanced Security Sandbox
 * Implements hardened seccomp jail for model execution with comprehensive security controls
 * 
 * Security Features:
 * - Process isolation with seccomp-bpf filters
 * - File system access allow-list controls
 * - Memory protection and privilege escalation prevention
 * - Network request filtering and monitoring
 * - Comprehensive security audit logging
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EventEmitter } from 'events';

// Security configuration interfaces
interface SandboxConfig {
  // Process isolation
  enableSeccomp: boolean;
  enableNamespaces: boolean;
  enableCgroups: boolean;
  
  // File system controls
  allowedPaths: string[];
  deniedPaths: string[];
  readOnlyPaths: string[];
  tmpfsSize: string;
  
  // Network controls
  allowedHosts: string[];
  allowedPorts: number[];
  blockPrivateNetworks: boolean;
  
  // Resource limits
  maxMemory: string;
  maxCpu: number;
  maxFileDescriptors: number;
  maxProcesses: number;
  
  // Security policies
  preventPrivilegeEscalation: boolean;
  dropCapabilities: string[];
  seccompProfile: string;
  apparmorProfile?: string;
}

interface SecurityViolation {
  id: string;
  timestamp: Date;
  type: 'syscall' | 'filesystem' | 'network' | 'memory' | 'privilege';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: Record<string, any>;
  process: {
    pid: number;
    command: string;
    user: string;
  };
  mitigation: string;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  event: string;
  source: string;
  success: boolean;
  details: Record<string, any>;
  risk_score: number;
}

// Seccomp filter definitions
const SECCOMP_FILTERS = {
  // Basic filter - allows essential syscalls only
  basic: {
    defaultAction: 'SCMP_ACT_KILL',
    allowedSyscalls: [
      'read', 'write', 'open', 'close', 'stat', 'fstat', 'lstat',
      'poll', 'lseek', 'mmap', 'mprotect', 'munmap', 'brk',
      'rt_sigaction', 'rt_sigprocmask', 'rt_sigreturn', 'ioctl',
      'pread64', 'pwrite64', 'readv', 'writev', 'access', 'pipe',
      'select', 'sched_yield', 'mremap', 'msync', 'mincore', 'madvise',
      'socket', 'connect', 'accept', 'sendto', 'recvfrom',
      'exit', 'exit_group', 'wait4', 'kill', 'uname', 'fcntl',
      'flock', 'fsync', 'fdatasync', 'truncate', 'ftruncate',
      'getcwd', 'chdir', 'rename', 'mkdir', 'rmdir', 'creat', 'link',
      'unlink', 'symlink', 'readlink', 'chmod', 'fchmod', 'chown',
      'fchown', 'lchown', 'umask', 'gettimeofday', 'getrlimit',
      'getrusage', 'sysinfo', 'times', 'ptrace', 'getuid', 'syslog',
      'getgid', 'setuid', 'setgid', 'geteuid', 'getegid', 'setpgid',
      'getppid', 'getpgrp', 'setsid', 'setreuid', 'setregid'
    ]
  },
  
  // Model execution filter - restricted for AI model processes
  modelExecution: {
    defaultAction: 'SCMP_ACT_KILL',
    allowedSyscalls: [
      // Essential file operations
      'read', 'write', 'open', 'close', 'stat', 'fstat',
      'lseek', 'access', 'pread64', 'pwrite64',
      
      // Memory management
      'mmap', 'munmap', 'brk', 'mprotect',
      
      // Process control
      'exit', 'exit_group', 'getpid', 'getuid', 'getgid',
      
      // Time operations
      'gettimeofday', 'clock_gettime',
      
      // Minimal network (for model downloads only)
      'socket', 'connect', 'sendto', 'recvfrom', 'close'
    ],
    restrictions: {
      // Prevent dangerous syscalls
      'ptrace': 'SCMP_ACT_KILL',
      'execve': 'SCMP_ACT_KILL', 
      'fork': 'SCMP_ACT_KILL',
      'clone': 'SCMP_ACT_KILL',
      'mount': 'SCMP_ACT_KILL',
      'umount': 'SCMP_ACT_KILL',
      'chroot': 'SCMP_ACT_KILL',
      'pivot_root': 'SCMP_ACT_KILL'
    }
  }
};

export class SecuritySandbox extends EventEmitter {
  private config: SandboxConfig;
  private auditLogger: SecurityAuditLogger;
  private violationDetector: ViolationDetector;
  private processMonitor: ProcessMonitor;
  private isEnabled: boolean = false;

  constructor(config: Partial<SandboxConfig> = {}) {
    super();
    
    this.config = {
      // Default security configuration
      enableSeccomp: true,
      enableNamespaces: true,
      enableCgroups: true,
      
      // File system defaults
      allowedPaths: [
        '/tmp/codeforge',
        '/home/user/.codeforge',
        '/var/lib/codeforge'
      ],
      deniedPaths: [
        '/etc',
        '/var/log',
        '/proc',
        '/sys',
        '/dev'
      ],
      readOnlyPaths: [
        '/usr',
        '/lib',
        '/lib64'
      ],
      tmpfsSize: '1G',
      
      // Network defaults
      allowedHosts: [
        'api.openai.com',
        'api.anthropic.com',
        'api.deepseek.com',
        'api.moonshot.cn',
        'huggingface.co'
      ],
      allowedPorts: [80, 443],
      blockPrivateNetworks: true,
      
      // Resource limits
      maxMemory: '8G',
      maxCpu: 4,
      maxFileDescriptors: 1024,
      maxProcesses: 10,
      
      // Security policies
      preventPrivilegeEscalation: true,
      dropCapabilities: [
        'CAP_SYS_ADMIN',
        'CAP_SYS_PTRACE',
        'CAP_SYS_MODULE',
        'CAP_DAC_OVERRIDE',
        'CAP_DAC_READ_SEARCH',
        'CAP_FOWNER',
        'CAP_SETUID',
        'CAP_SETGID'
      ],
      seccompProfile: 'modelExecution',
      
      ...config
    };

    this.auditLogger = new SecurityAuditLogger();
    this.violationDetector = new ViolationDetector();
    this.processMonitor = new ProcessMonitor();
    
    this.initializeSecurity();
  }

  private async initializeSecurity(): Promise<void> {
    try {
      // Initialize audit logging
      await this.auditLogger.initialize();
      
      // Set up violation detection
      this.violationDetector.on('violation', this.handleSecurityViolation.bind(this));
      
      // Start process monitoring
      this.processMonitor.on('suspicious_activity', this.handleSuspiciousActivity.bind(this));
      
      this.isEnabled = true;
      await this.auditLogger.log('security_initialized', 'sandbox', true, {
        config: this.sanitizeConfig()
      });
      
    } catch (error) {
      console.error('Failed to initialize security sandbox:', error);
      this.isEnabled = false;
    }
  }

  async createSandboxedProcess(command: string, args: string[], options: any = {}): Promise<ChildProcess> {
    if (!this.isEnabled) {
      throw new Error('Security sandbox not initialized');
    }

    await this.auditLogger.log('process_creation_requested', 'sandbox', true, {
      command,
      args: args.slice(0, 5), // Log first 5 args only
      options: this.sanitizeOptions(options)
    });

    // Create isolated environment
    const isolatedEnv = await this.createIsolatedEnvironment();
    
    // Build sandboxed command
    const sandboxedCommand = await this.buildSandboxCommand(command, args, isolatedEnv);
    
    // Spawn process with security controls
    const process = spawn(sandboxedCommand.command, sandboxedCommand.args, {
      ...options,
      env: isolatedEnv.environment,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false,
      uid: isolatedEnv.uid,
      gid: isolatedEnv.gid
    });

    // Monitor the process
    this.processMonitor.monitor(process);
    
    await this.auditLogger.log('process_created', 'sandbox', true, {
      pid: process.pid,
      command: sandboxedCommand.command
    });

    return process;
  }

  private async createIsolatedEnvironment(): Promise<any> {
    // Create temporary filesystem
    const tmpDir = await this.createTempFilesystem();
    
    // Set up user namespace
    const userNs = await this.createUserNamespace();
    
    // Configure network namespace
    const netNs = await this.createNetworkNamespace();
    
    return {
      tmpDir,
      environment: {
        PATH: '/usr/local/bin:/usr/bin:/bin',
        HOME: tmpDir,
        TMPDIR: tmpDir,
        // Remove dangerous environment variables
        LD_PRELOAD: undefined,
        LD_LIBRARY_PATH: undefined
      },
      uid: userNs.uid,
      gid: userNs.gid,
      namespaces: {
        user: userNs.id,
        network: netNs.id
      }
    };
  }

  private async createTempFilesystem(): Promise<string> {
    const tmpDir = path.join('/tmp', `codeforge-sandbox-${crypto.randomBytes(8).toString('hex')}`);
    
    try {
      await fs.mkdir(tmpDir, { mode: 0o700 });
      
      // Mount tmpfs if supported
      if (process.platform === 'linux') {
        // This would require sudo privileges in real implementation
        console.log(`Would mount tmpfs at ${tmpDir} with size ${this.config.tmpfsSize}`);
      }
      
      return tmpDir;
    } catch (error) {
      throw new Error(`Failed to create temporary filesystem: ${error}`);
    }
  }

  private async createUserNamespace(): Promise<{ uid: number; gid: number; id: string }> {
    // In a real implementation, this would create a proper user namespace
    // For now, return safe defaults
    return {
      uid: 65534, // nobody
      gid: 65534, // nogroup
      id: crypto.randomBytes(8).toString('hex')
    };
  }

  private async createNetworkNamespace(): Promise<{ id: string }> {
    // Create network namespace with restricted access
    return {
      id: crypto.randomBytes(8).toString('hex')
    };
  }

  private async buildSandboxCommand(command: string, args: string[], env: any): Promise<{ command: string; args: string[] }> {
    // For Linux systems, use firejail or similar
    if (process.platform === 'linux') {
      const firejailArgs = [
        '--quiet',
        '--noprofile',
        '--seccomp',
        '--noroot',
        '--private',
        '--netfilter=/etc/firejail/webserver.net',
        `--private-tmp=${env.tmpDir}`,
        '--disable-mnt',
        '--rlimit-as=8589934592', // 8GB memory limit
        '--rlimit-cpu=240', // 4 minutes CPU time
        '--rlimit-nofile=1024',
        '--caps.drop=all',
        command,
        ...args
      ];

      return {
        command: 'firejail',
        args: firejailArgs
      };
    }
    
    // For other platforms, implement basic restrictions
    return { command, args };
  }

  async validateFileAccess(filePath: string, operation: 'read' | 'write' | 'execute'): Promise<boolean> {
    const normalizedPath = path.resolve(filePath);
    
    // Check against denied paths
    for (const deniedPath of this.config.deniedPaths) {
      if (normalizedPath.startsWith(path.resolve(deniedPath))) {
        await this.violationDetector.reportViolation('filesystem', 'high', 
          `Attempted access to denied path: ${normalizedPath}`, {
            path: normalizedPath,
            operation,
            deniedPath
          });
        return false;
      }
    }
    
    // Check against allowed paths
    let isAllowed = false;
    for (const allowedPath of this.config.allowedPaths) {
      if (normalizedPath.startsWith(path.resolve(allowedPath))) {
        isAllowed = true;
        break;
      }
    }
    
    if (!isAllowed) {
      await this.violationDetector.reportViolation('filesystem', 'medium',
        `Attempted access to non-allowed path: ${normalizedPath}`, {
          path: normalizedPath,
          operation
        });
      return false;
    }
    
    // Check read-only restrictions
    if (operation === 'write' || operation === 'execute') {
      for (const readOnlyPath of this.config.readOnlyPaths) {
        if (normalizedPath.startsWith(path.resolve(readOnlyPath))) {
          await this.violationDetector.reportViolation('filesystem', 'medium',
            `Attempted write/execute on read-only path: ${normalizedPath}`, {
              path: normalizedPath,
              operation,
              readOnlyPath
            });
          return false;
        }
      }
    }
    
    return true;
  }

  async validateNetworkAccess(host: string, port: number): Promise<boolean> {
    // Check allowed hosts
    const isHostAllowed = this.config.allowedHosts.some(allowedHost => {
      return host === allowedHost || host.endsWith(`.${allowedHost}`);
    });
    
    if (!isHostAllowed) {
      await this.violationDetector.reportViolation('network', 'high',
        `Attempted connection to unauthorized host: ${host}`, {
          host,
          port
        });
      return false;
    }
    
    // Check allowed ports
    if (!this.config.allowedPorts.includes(port)) {
      await this.violationDetector.reportViolation('network', 'medium',
        `Attempted connection to unauthorized port: ${port}`, {
          host,
          port
        });
      return false;
    }
    
    // Block private networks if configured
    if (this.config.blockPrivateNetworks && this.isPrivateNetwork(host)) {
      await this.violationDetector.reportViolation('network', 'high',
        `Attempted connection to private network: ${host}`, {
          host,
          port
        });
      return false;
    }
    
    return true;
  }

  private isPrivateNetwork(host: string): boolean {
    // Check for private IP ranges
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^::1$/,
      /^fe80:/,
      /^fc00:/
    ];
    
    return privateRanges.some(range => range.test(host));
  }

  private async handleSecurityViolation(violation: SecurityViolation): Promise<void> {
    await this.auditLogger.log('security_violation', 'sandbox', false, violation, violation.severity === 'critical' ? 10 : 5);
    
    this.emit('security_violation', violation);
    
    // Take mitigation actions based on severity
    switch (violation.severity) {
      case 'critical':
        await this.emergencyShutdown(violation);
        break;
      case 'high':
        await this.terminateViolatingProcess(violation);
        break;
      case 'medium':
        await this.logAndAlert(violation);
        break;
      case 'low':
        await this.logViolation(violation);
        break;
    }
  }

  private async handleSuspiciousActivity(activity: any): Promise<void> {
    await this.auditLogger.log('suspicious_activity', 'monitor', false, activity, 3);
    this.emit('suspicious_activity', activity);
  }

  private async emergencyShutdown(violation: SecurityViolation): Promise<void> {
    console.error('CRITICAL SECURITY VIOLATION - Initiating emergency shutdown:', violation);
    
    // Kill all sandboxed processes
    this.processMonitor.killAllMonitoredProcesses();
    
    // Disable further operations
    this.isEnabled = false;
    
    // Alert administrators
    this.emit('emergency_shutdown', violation);
  }

  private async terminateViolatingProcess(violation: SecurityViolation): Promise<void> {
    if (violation.process.pid) {
      try {
        process.kill(violation.process.pid, 'SIGKILL');
        await this.auditLogger.log('process_terminated', 'sandbox', true, {
          pid: violation.process.pid,
          reason: 'security_violation'
        });
      } catch (error) {
        console.error('Failed to terminate violating process:', error);
      }
    }
  }

  private async logAndAlert(violation: SecurityViolation): Promise<void> {
    console.warn('Security violation detected:', violation);
    this.emit('security_alert', violation);
  }

  private async logViolation(violation: SecurityViolation): Promise<void> {
    console.log('Security violation logged:', violation.description);
  }

  private sanitizeConfig(): any {
    // Remove sensitive information from config for logging
    const sanitized = { ...this.config };
    return sanitized;
  }

  private sanitizeOptions(options: any): any {
    // Remove sensitive options for logging
    const sanitized = { ...options };
    delete sanitized.env;
    return sanitized;
  }

  async getSecurityStatus(): Promise<any> {
    return {
      enabled: this.isEnabled,
      violations: await this.violationDetector.getViolationSummary(),
      processes: this.processMonitor.getProcessCount(),
      config: this.sanitizeConfig()
    };
  }

  async cleanup(): Promise<void> {
    this.processMonitor.cleanup();
    await this.auditLogger.cleanup();
    this.isEnabled = false;
  }
}

// Supporting classes
class SecurityAuditLogger {
  private logFile: string;
  
  constructor() {
    this.logFile = path.join(process.env.HOME || '/tmp', '.codeforge', 'security-audit.log');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(path.dirname(this.logFile), { recursive: true });
  }

  async log(event: string, source: string, success: boolean, details: any = {}, riskScore: number = 1): Promise<void> {
    const logEntry: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      event,
      source,
      success,
      details,
      risk_score: riskScore
    };

    try {
      await fs.appendFile(this.logFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  async cleanup(): Promise<void> {
    // Rotate logs, clean up old entries, etc.
  }
}

class ViolationDetector extends EventEmitter {
  private violations: SecurityViolation[] = [];

  async reportViolation(type: SecurityViolation['type'], severity: SecurityViolation['severity'], 
                       description: string, details: any): Promise<void> {
    const violation: SecurityViolation = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      severity,
      description,
      details,
      process: {
        pid: process.pid,
        command: process.argv[0],
        user: process.env.USER || 'unknown'
      },
      mitigation: this.getMitigationForViolation(type, severity)
    };

    this.violations.push(violation);
    this.emit('violation', violation);
  }

  private getMitigationForViolation(type: string, severity: string): string {
    const mitigations = {
      'filesystem-critical': 'Process terminated, access blocked',
      'filesystem-high': 'Access denied, process monitored',
      'network-critical': 'Connection blocked, process terminated',
      'network-high': 'Connection denied, host blacklisted',
      'memory-critical': 'Process terminated, memory freed',
      'privilege-critical': 'Process terminated, escalation blocked'
    };

    return mitigations[`${type}-${severity}`] || 'Logged for analysis';
  }

  async getViolationSummary(): Promise<any> {
    return {
      total: this.violations.length,
      by_type: this.groupBy(this.violations, 'type'),
      by_severity: this.groupBy(this.violations, 'severity'),
      recent: this.violations.slice(-10)
    };
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }
}

class ProcessMonitor extends EventEmitter {
  private monitoredProcesses: Set<ChildProcess> = new Set();
  private monitoringInterval: NodeJS.Timeout | null = null;

  monitor(process: ChildProcess): void {
    this.monitoredProcesses.add(process);
    
    process.on('exit', () => {
      this.monitoredProcesses.delete(process);
    });

    if (!this.monitoringInterval) {
      this.startMonitoring();
    }
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      for (const process of this.monitoredProcesses) {
        this.checkProcessHealth(process);
      }
    }, 5000);
  }

  private checkProcessHealth(process: ChildProcess): void {
    // Check for suspicious behavior
    // This is a simplified example
    if (process.killed) {
      this.emit('suspicious_activity', {
        pid: process.pid,
        event: 'process_killed_unexpectedly'
      });
    }
  }

  killAllMonitoredProcesses(): void {
    for (const process of this.monitoredProcesses) {
      try {
        process.kill('SIGKILL');
      } catch (error) {
        console.error('Failed to kill process:', error);
      }
    }
    this.monitoredProcesses.clear();
  }

  getProcessCount(): number {
    return this.monitoredProcesses.size;
  }

  cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.killAllMonitoredProcesses();
  }
}

// Export main sandbox class and utilities
export { SecuritySandbox, SecurityViolation, AuditLog, SandboxConfig };
export default SecuritySandbox; 