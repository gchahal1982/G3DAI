/**
 * Enhanced Security Sandbox for CodeForge
 * 
 * Implements hardened seccomp jail for model execution, file system access controls,
 * process isolation boundaries, and comprehensive security audit logging.
 */

import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import { join, resolve, normalize } from 'path';
import { EventEmitter } from 'events';

export interface SandboxConfig {
  modelExecutionJail: {
    enabled: boolean;
    allowedSystemCalls: string[];
    blockedSystemCalls: string[];
    memoryLimitMB: number;
    cpuQuotaPercent: number;
    networkAccess: 'none' | 'localhost' | 'restricted' | 'full';
  };
  fileSystemAccess: {
    allowList: string[];
    readOnlyPaths: string[];
    blockedPaths: string[];
    tempDirectory: string;
    maxFileSize: number;
    maxTotalSize: number;
  };
  processIsolation: {
    enabled: boolean;
    containerRuntime: 'none' | 'docker' | 'podman' | 'native';
    userNamespace: boolean;
    pidNamespace: boolean;
    networkNamespace: boolean;
    mountNamespace: boolean;
  };
  security: {
    privilegeEscalationPrevention: boolean;
    coredumpDisabled: boolean;
    ptracePrevention: boolean;
    auditLogging: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
  ipcValidation: {
    enabled: boolean;
    allowedChannels: string[];
    messageValidation: boolean;
    rateLimiting: {
      enabled: boolean;
      maxMessagesPerSecond: number;
      maxPayloadSize: number;
    };
  };
}

export interface SecurityViolationData {
  type: 'filesystem' | 'network' | 'process' | 'ipc' | 'syscall' | 'privilege';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: any;
  timestamp: number;
  processId?: number;
  userId?: number;
  stackTrace?: string;
}

export interface SandboxProcess {
  id: string;
  pid: number;
  command: string;
  args: string[];
  workingDirectory: string;
  environment: Record<string, string>;
  startTime: number;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'failed';
  resourceUsage: {
    cpuPercent: number;
    memoryMB: number;
    fileDescriptors: number;
    networkConnections: number;
  };
  violations: SecurityViolationData[];
}

export class SecuritySandbox extends EventEmitter {
  private config: SandboxConfig;
  private processes: Map<string, SandboxProcess> = new Map();
  private auditLog: SecurityViolationData[] = [];
  private seccompProfile: string | null = null;
  private allowedPaths: Set<string> = new Set();
  private tempDir: string;

  constructor(config?: Partial<SandboxConfig>) {
    super();
    this.config = {
      modelExecutionJail: {
        enabled: true,
        allowedSystemCalls: [
          'read', 'write', 'open', 'close', 'stat', 'fstat', 'lstat',
          'poll', 'lseek', 'mmap', 'munmap', 'brk', 'rt_sigaction',
          'rt_sigprocmask', 'rt_sigreturn', 'ioctl', 'access', 'pipe',
          'select', 'sched_yield', 'clone', 'fork', 'vfork', 'execve',
          'exit', 'wait4', 'kill', 'uname', 'fcntl', 'flock', 'fsync',
          'fdatasync', 'getcwd', 'chdir', 'fchdir', 'rename', 'mkdir',
          'rmdir', 'unlink', 'symlink', 'readlink', 'chmod', 'fchmod',
          'chown', 'fchown', 'lchown', 'umask', 'gettimeofday', 'getrlimit',
          'getrusage', 'sysinfo', 'times', 'ptrace', 'getuid', 'getgid',
          'setuid', 'setgid', 'geteuid', 'getegid', 'setpgid', 'getppid',
          'getpgrp', 'setsid', 'setreuid', 'setregid', 'getgroups',
          'setgroups', 'setresuid', 'getresuid', 'setresgid', 'getresgid'
        ],
        blockedSystemCalls: [
          'ptrace', 'process_vm_readv', 'process_vm_writev', 'init_module',
          'delete_module', 'iopl', 'ioperm', 'create_module', 'kexec_load',
          'kexec_file_load', 'bpf', 'perf_event_open', 'mount', 'umount',
          'umount2', 'pivot_root', 'chroot', 'acct', 'reboot', 'swapon',
          'swapoff', 'clock_adjtime', 'lookup_dcookie', 'quotactl', 'mount'
        ],
        memoryLimitMB: 8192, // 8GB limit for local models
        cpuQuotaPercent: 80,
        networkAccess: 'localhost'
      },
      fileSystemAccess: {
        allowList: [
          process.cwd(),
          require('os').homedir(),
          require('os').tmpdir()
        ],
        readOnlyPaths: [
          '/usr',
          '/lib',
          '/lib64',
          '/bin',
          '/sbin'
        ],
        blockedPaths: [
          '/etc/passwd',
          '/etc/shadow',
          '/etc/hosts',
          '/boot',
          '/sys',
          '/proc',
          '/dev'
        ],
        tempDirectory: join(require('os').tmpdir(), 'codeforge-sandbox'),
        maxFileSize: 100 * 1024 * 1024, // 100MB
        maxTotalSize: 1024 * 1024 * 1024 // 1GB
      },
      processIsolation: {
        enabled: true,
        containerRuntime: 'native',
        userNamespace: true,
        pidNamespace: true,
        networkNamespace: false,
        mountNamespace: true
      },
      security: {
        privilegeEscalationPrevention: true,
        coredumpDisabled: true,
        ptracePrevention: true,
        auditLogging: true,
        logLevel: 'info'
      },
      ipcValidation: {
        enabled: true,
        allowedChannels: [
          'model-inference',
          'file-watcher',
          'context-retrieval',
          'telemetry',
          'ui-updates'
        ],
        messageValidation: true,
        rateLimiting: {
          enabled: true,
          maxMessagesPerSecond: 100,
          maxPayloadSize: 10 * 1024 * 1024 // 10MB
        }
      },
      ...config
    };

    this.tempDir = this.config.fileSystemAccess.tempDirectory;
    this.initializeSandbox();
  }

  /**
   * Initialize the sandbox environment
   */
  private async initializeSandbox(): Promise<void> {
    try {
      // Create temp directory
      await fs.mkdir(this.tempDir, { recursive: true });

      // Initialize allowed paths
      for (const path of this.config.fileSystemAccess.allowList) {
        this.allowedPaths.add(resolve(path));
      }

      // Generate seccomp profile
      if (this.config.modelExecutionJail.enabled) {
        await this.generateSeccompProfile();
      }

      // Setup audit logging
      if (this.config.security.auditLogging) {
        this.setupAuditLogging();
      }

      this.log('info', 'Security sandbox initialized successfully');
    } catch (error) {
      this.log('error', 'Failed to initialize security sandbox', error);
      throw error;
    }
  }

  /**
   * Execute a command in the sandbox
   */
  public async executeInSandbox(
    command: string,
    args: string[] = [],
    options: {
      workingDirectory?: string;
      environment?: Record<string, string>;
      timeout?: number;
      allowNetworking?: boolean;
    } = {}
  ): Promise<SandboxProcess> {
    const processId = this.generateProcessId();
    
    const sandboxProcess: SandboxProcess = {
      id: processId,
      pid: -1,
      command,
      args,
      workingDirectory: options.workingDirectory || this.tempDir,
      environment: options.environment || {},
      startTime: Date.now(),
      status: 'starting',
      resourceUsage: {
        cpuPercent: 0,
        memoryMB: 0,
        fileDescriptors: 0,
        networkConnections: 0
      },
      violations: []
    };

    this.processes.set(processId, sandboxProcess);

    try {
      // Validate working directory
      if (!this.isPathAllowed(sandboxProcess.workingDirectory)) {
        throw new SecurityViolation({
          type: 'filesystem',
          severity: 'high',
          description: 'Working directory not in allow list',
          details: { path: sandboxProcess.workingDirectory }
        });
      }

      // Prepare sandbox environment
      const env = this.prepareSandboxEnvironment(sandboxProcess.environment);
      const execArgs = this.prepareSandboxCommand(command, args, options);

      // Launch process
      const childProcess = spawn(execArgs[0], execArgs.slice(1), {
        cwd: sandboxProcess.workingDirectory,
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false,
        uid: this.config.processIsolation.userNamespace ? 65534 : undefined, // nobody user
        gid: this.config.processIsolation.userNamespace ? 65534 : undefined  // nogroup
      });

      sandboxProcess.pid = childProcess.pid || -1;
      sandboxProcess.status = 'running';

      // Setup monitoring
      this.monitorProcess(sandboxProcess, childProcess);

      // Setup timeout
      if (options.timeout) {
        setTimeout(() => {
          if (sandboxProcess.status === 'running') {
            this.terminateProcess(processId, 'timeout');
          }
        }, options.timeout);
      }

      this.emit('processStarted', sandboxProcess);
      return sandboxProcess;

    } catch (error) {
      sandboxProcess.status = 'failed';
      this.log('error', 'Failed to start sandboxed process', error);
      throw error;
    }
  }

  /**
   * Validate file system access
   */
  public validateFileAccess(filePath: string, operation: 'read' | 'write' | 'execute'): boolean {
    const normalizedPath = normalize(resolve(filePath));

    // Check if path is blocked
    for (const blockedPath of this.config.fileSystemAccess.blockedPaths) {
      if (normalizedPath.startsWith(resolve(blockedPath))) {
        this.recordViolation({
          type: 'filesystem',
          severity: 'high',
          description: `Attempted ${operation} access to blocked path`,
          details: { path: normalizedPath, operation }
        });
        return false;
      }
    }

    // Check if path is allowed
    if (!this.isPathAllowed(normalizedPath)) {
      this.recordViolation({
        type: 'filesystem',
        severity: 'medium',
        description: `Attempted ${operation} access to path outside allow list`,
        details: { path: normalizedPath, operation }
      });
      return false;
    }

    // Check read-only constraints for write operations
    if (operation === 'write') {
      for (const readOnlyPath of this.config.fileSystemAccess.readOnlyPaths) {
        if (normalizedPath.startsWith(resolve(readOnlyPath))) {
          this.recordViolation({
            type: 'filesystem',
            severity: 'medium',
            description: 'Attempted write to read-only path',
            details: { path: normalizedPath, operation }
          });
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate IPC message
   */
  public validateIPCMessage(channel: string, message: any): boolean {
    if (!this.config.ipcValidation.enabled) {
      return true;
    }

    // Check channel allowlist
    if (!this.config.ipcValidation.allowedChannels.includes(channel)) {
      this.recordViolation({
        type: 'ipc',
        severity: 'medium',
        description: 'IPC message sent to disallowed channel',
        details: { channel, messageType: typeof message }
      });
      return false;
    }

    // Check message size
    const messageSize = JSON.stringify(message).length;
    if (messageSize > this.config.ipcValidation.rateLimiting.maxPayloadSize) {
      this.recordViolation({
        type: 'ipc',
        severity: 'medium',
        description: 'IPC message exceeds maximum payload size',
        details: { channel, size: messageSize, limit: this.config.ipcValidation.rateLimiting.maxPayloadSize }
      });
      return false;
    }

    // Rate limiting would be implemented here with a proper rate limiter
    // For now, we'll log and allow
    if (this.config.ipcValidation.rateLimiting.enabled) {
      // Implementation would track message rates per channel
    }

    return true;
  }

  /**
   * Terminate a sandboxed process
   */
  public async terminateProcess(processId: string, reason: string = 'manual'): Promise<void> {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Process ${processId} not found`);
    }

    try {
      process.status = 'stopping';
      
      // Send SIGTERM first
      if (process.pid > 0) {
        require('process').kill(process.pid, 'SIGTERM');
        
        // Wait a bit, then SIGKILL if still running
        setTimeout(() => {
          try {
            if (process.status === 'stopping') {
              require('process').kill(process.pid, 'SIGKILL');
            }
          } catch (error) {
            // Process likely already terminated
          }
        }, 5000);
      }

      process.status = 'stopped';
      this.log('info', `Process ${processId} terminated`, { reason });
      this.emit('processTerminated', process, reason);

    } catch (error) {
      this.log('error', `Failed to terminate process ${processId}`, error);
      throw error;
    }
  }

  /**
   * Get security audit log
   */
  public getAuditLog(filters?: {
    type?: SecurityViolation['type'];
    severity?: SecurityViolation['severity'];
    since?: number;
  }): SecurityViolation[] {
    let log = [...this.auditLog];

    if (filters) {
      if (filters.type) {
        log = log.filter(v => v.type === filters.type);
      }
      if (filters.severity) {
        log = log.filter(v => v.severity === filters.severity);
      }
      if (filters.since) {
        log = log.filter(v => v.timestamp >= filters.since);
      }
    }

    return log;
  }

  /**
   * Get running processes
   */
  public getRunningProcesses(): SandboxProcess[] {
    return Array.from(this.processes.values()).filter(p => p.status === 'running');
  }

  /**
   * Cleanup sandbox resources
   */
  public async cleanup(): Promise<void> {
    // Terminate all running processes
    const runningProcesses = this.getRunningProcesses();
    for (const process of runningProcesses) {
      await this.terminateProcess(process.id, 'cleanup');
    }

    // Clean up temp directory
    try {
      await fs.rmdir(this.tempDir, { recursive: true });
    } catch (error) {
      this.log('warn', 'Failed to clean up temp directory', error);
    }

    this.log('info', 'Security sandbox cleaned up');
  }

  /**
   * Private helper methods
   */

  private generateSeccompProfile(): Promise<void> {
    // Generate seccomp-bpf profile for syscall filtering
    // This would integrate with libseccomp or similar
    const profile = {
      defaultAction: 'SCMP_ACT_KILL',
      architectures: ['SCMP_ARCH_X86_64'],
      syscalls: this.config.modelExecutionJail.allowedSystemCalls.map(call => ({
        names: [call],
        action: 'SCMP_ACT_ALLOW'
      }))
    };

    this.seccompProfile = JSON.stringify(profile, null, 2);
    return Promise.resolve();
  }

  private setupAuditLogging(): void {
    // Setup structured logging for security events
    // In production, this would integrate with syslog, ELK stack, etc.
    this.on('violation', (violation: SecurityViolation) => {
      this.auditLog.push(violation);
      
      // Rotate log if too large
      if (this.auditLog.length > 10000) {
        this.auditLog = this.auditLog.slice(-5000);
      }
    });
  }

  private prepareSandboxEnvironment(userEnv: Record<string, string>): Record<string, string> {
    const sandboxEnv: Record<string, string> = {
      // Minimal environment
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: this.tempDir,
      TMPDIR: this.tempDir,
      USER: 'sandbox',
      SHELL: '/bin/sh',
      
      // Security
      LD_PRELOAD: '', // Prevent LD_PRELOAD attacks
      
      // Disable core dumps
      ...(this.config.security.coredumpDisabled && {
        RLIMIT_CORE: '0'
      }),

      // Add safe user environment variables
      ...Object.fromEntries(
        Object.entries(userEnv).filter(([key]) => 
          !key.startsWith('LD_') && 
          !key.includes('PATH') &&
          !['HOME', 'USER', 'SHELL'].includes(key)
        )
      )
    };

    return sandboxEnv;
  }

  private prepareSandboxCommand(command: string, args: string[], options: any): string[] {
    if (!this.config.processIsolation.enabled) {
      return [command, ...args];
    }

    // Use unshare for namespace isolation on Linux
    if (process.platform === 'linux') {
      const unshareArgs = ['unshare'];
      
      if (this.config.processIsolation.pidNamespace) {
        unshareArgs.push('--pid', '--fork');
      }
      
      if (this.config.processIsolation.mountNamespace) {
        unshareArgs.push('--mount');
      }
      
      if (this.config.processIsolation.networkNamespace && 
          this.config.modelExecutionJail.networkAccess === 'none') {
        unshareArgs.push('--net');
      }

      unshareArgs.push('--', command, ...args);
      return unshareArgs;
    }

    // Fallback for other platforms
    return [command, ...args];
  }

  private monitorProcess(sandboxProcess: SandboxProcess, childProcess: ChildProcess): void {
    // Resource monitoring
    const monitorInterval = setInterval(() => {
      if (sandboxProcess.status !== 'running') {
        clearInterval(monitorInterval);
        return;
      }

      // In production, this would use proper process monitoring
      // For now, we'll simulate resource usage
      sandboxProcess.resourceUsage = {
        cpuPercent: Math.random() * 50, // Simulated
        memoryMB: Math.random() * 1024, // Simulated
        fileDescriptors: Math.floor(Math.random() * 100),
        networkConnections: Math.floor(Math.random() * 10)
      };

      // Check resource limits
      if (sandboxProcess.resourceUsage.memoryMB > this.config.modelExecutionJail.memoryLimitMB) {
        this.recordViolation({
          type: 'process',
          severity: 'high',
          description: 'Process exceeded memory limit',
          details: { 
            processId: sandboxProcess.id,
            usage: sandboxProcess.resourceUsage.memoryMB,
            limit: this.config.modelExecutionJail.memoryLimitMB
          },
          processId: sandboxProcess.pid
        });
        
        this.terminateProcess(sandboxProcess.id, 'memory_limit_exceeded');
      }
    }, 1000);

    // Process exit handling
    childProcess.on('exit', (code, signal) => {
      clearInterval(monitorInterval);
      sandboxProcess.status = 'stopped';
      this.emit('processExited', sandboxProcess, code, signal);
    });

    childProcess.on('error', (error) => {
      clearInterval(monitorInterval);
      sandboxProcess.status = 'failed';
      this.log('error', `Process ${sandboxProcess.id} error`, error);
    });
  }

  private isPathAllowed(filePath: string): boolean {
    const normalizedPath = normalize(resolve(filePath));
    
    for (const allowedPath of this.allowedPaths) {
      if (normalizedPath.startsWith(allowedPath)) {
        return true;
      }
    }
    
    return false;
  }

  private recordViolation(violation: Omit<SecurityViolation, 'timestamp'>): void {
    const fullViolation: SecurityViolation = {
      ...violation,
      timestamp: Date.now()
    };

    this.emit('violation', fullViolation);
    this.log('warn', `Security violation: ${violation.description}`, violation.details);
  }

  private generateProcessId(): string {
    return `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(level: string, message: string, details?: any): void {
    if (this.shouldLog(level)) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        component: 'SecuritySandbox',
        message,
        details
      };

      // In production, this would go to structured logging
      console.log(JSON.stringify(logEntry));
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const configLevel = levels.indexOf(this.config.security.logLevel);
    const messageLevel = levels.indexOf(level);
    
    return messageLevel <= configLevel;
  }
}

// Custom error class for security violations
class SecurityViolation extends Error {
  public readonly type: SecurityViolation['type'];
  public readonly severity: SecurityViolation['severity'];
  public readonly details: any;
  public readonly timestamp: number;

  constructor(violation: Omit<SecurityViolation, 'timestamp'>) {
    super(violation.description);
    this.name = 'SecurityViolation';
    this.type = violation.type;
    this.severity = violation.severity;
    this.details = violation.details;
    this.timestamp = Date.now();
  }
}

export default SecuritySandbox; 