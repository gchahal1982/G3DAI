'use client';

/**
 * MedSight Pro - Disaster Recovery Interface
 * Comprehensive disaster recovery and backup management interface
 * 
 * Features:
 * - Backup management and monitoring
 * - Recovery plan execution
 * - Business continuity oversight
 * - Medical data protection
 * - Compliance monitoring
 * - Emergency response protocols
 * - Testing and validation
 * - Reporting and analytics
 * 
 * Medical Standards: FDA Class II, HIPAA, DICOM, HL7 FHIR
 * @version 1.0.0
 * @author MedSight Pro Development Team
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BeakerIcon,
  BellIcon,
  ServerIcon,
  CircleStackIcon as DatabaseIcon,
  HeartIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Types
interface BackupJob {
  id: string;
  name: string;
  type: 'database' | 'files' | 'dicom' | 'system' | 'logs' | 'medical_records';
  status: 'active' | 'paused' | 'running' | 'completed' | 'failed';
  lastRun: Date;
  nextRun: Date;
  dataSize: number; // bytes
  compressionRatio: number;
  encrypted: boolean;
  verified: boolean;
  medicalData: boolean;
  hipaaCompliant: boolean;
}

interface RestoreJob {
  id: string;
  name: string;
  backupSource: string;
  targetLocation: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  startTime: Date;
  estimatedCompletion?: Date;
  medicalEmergency: boolean;
  dataSize: number;
}

interface RecoveryPlan {
  id: string;
  name: string;
  scenario: 'system_failure' | 'data_corruption' | 'security_breach' | 'natural_disaster' | 'cyber_attack';
  severity: 'minor' | 'major' | 'critical' | 'catastrophic';
  estimatedRTO: number; // minutes
  estimatedRPO: number; // minutes
  autoExecute: boolean;
  lastTested: Date;
  testStatus: 'passed' | 'failed' | 'partial' | 'not_tested';
  medicalPriority: boolean;
  steps: number;
}

interface BackupTarget {
  id: string;
  name: string;
  type: 'local' | 'cloud' | 'hybrid' | 'offsite';
  capacity: number; // GB
  usedSpace: number; // GB
  encrypted: boolean;
  medicalCertified: boolean;
  hipaaCompliant: boolean;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastBackup: Date;
}

interface DRMetrics {
  rtoCompliance: number; // percentage
  rpoCompliance: number; // percentage
  backupSuccessRate: number; // percentage
  testSuccessRate: number; // percentage
  totalBackups: number;
  failedBackups: number;
  totalRestores: number;
  successfulRestores: number;
  lastSuccessfulTest: Date;
  nextScheduledTest: Date;
}

const DisasterRecovery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'backups' | 'restores' | 'plans' | 'testing' | 'monitoring'>('overview');
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [restoreJobs, setRestoreJobs] = useState<RestoreJob[]>([]);
  const [recoveryPlans, setRecoveryPlans] = useState<RecoveryPlan[]>([]);
  const [backupTargets, setBackupTargets] = useState<BackupTarget[]>([]);
  const [drMetrics, setDrMetrics] = useState<DRMetrics | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeMockData = () => {
      // Mock backup jobs
      const mockBackupJobs: BackupJob[] = [
        {
          id: 'backup-1',
          name: 'Medical Database Backup',
          type: 'database',
          status: 'completed',
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          nextRun: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          dataSize: 15728640000, // 15GB
          compressionRatio: 0.7,
          encrypted: true,
          verified: true,
          medicalData: true,
          hipaaCompliant: true
        },
        {
          id: 'backup-2',
          name: 'DICOM Storage Backup',
          type: 'dicom',
          status: 'running',
          lastRun: new Date(),
          nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          dataSize: 107374182400, // 100GB
          compressionRatio: 0.85,
          encrypted: true,
          verified: false,
          medicalData: true,
          hipaaCompliant: true
        },
        {
          id: 'backup-3',
          name: 'Medical Reports Backup',
          type: 'files',
          status: 'completed',
          lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
          dataSize: 5368709120, // 5GB
          compressionRatio: 0.6,
          encrypted: true,
          verified: true,
          medicalData: true,
          hipaaCompliant: true
        },
        {
          id: 'backup-4',
          name: 'Audit Logs Backup',
          type: 'logs',
          status: 'failed',
          lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          nextRun: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          dataSize: 1073741824, // 1GB
          compressionRatio: 0.5,
          encrypted: true,
          verified: false,
          medicalData: false,
          hipaaCompliant: true
        }
      ];
      setBackupJobs(mockBackupJobs);

      // Mock restore jobs
      const mockRestoreJobs: RestoreJob[] = [
        {
          id: 'restore-1',
          name: 'Emergency Patient Data Restore',
          backupSource: 'Medical Database Backup',
          targetLocation: '/recovery/medical-db',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          estimatedCompletion: new Date(Date.now() - 3 * 60 * 60 * 1000),
          medicalEmergency: true,
          dataSize: 10737418240 // 10GB
        },
        {
          id: 'restore-2',
          name: 'DICOM Archive Restore',
          backupSource: 'DICOM Storage Backup',
          targetLocation: '/recovery/dicom-archive',
          status: 'running',
          progress: 65,
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000),
          medicalEmergency: false,
          dataSize: 53687091200 // 50GB
        }
      ];
      setRestoreJobs(mockRestoreJobs);

      // Mock recovery plans
      const mockRecoveryPlans: RecoveryPlan[] = [
        {
          id: 'plan-1',
          name: 'Medical System Failure Recovery',
          scenario: 'system_failure',
          severity: 'critical',
          estimatedRTO: 240, // 4 hours
          estimatedRPO: 15, // 15 minutes
          autoExecute: false,
          lastTested: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          testStatus: 'passed',
          medicalPriority: true,
          steps: 8
        },
        {
          id: 'plan-2',
          name: 'Data Corruption Recovery',
          scenario: 'data_corruption',
          severity: 'major',
          estimatedRTO: 180, // 3 hours
          estimatedRPO: 60, // 1 hour
          autoExecute: true,
          lastTested: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          testStatus: 'passed',
          medicalPriority: true,
          steps: 6
        },
        {
          id: 'plan-3',
          name: 'Cyber Attack Response',
          scenario: 'cyber_attack',
          severity: 'catastrophic',
          estimatedRTO: 480, // 8 hours
          estimatedRPO: 30, // 30 minutes
          autoExecute: false,
          lastTested: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          testStatus: 'partial',
          medicalPriority: true,
          steps: 12
        }
      ];
      setRecoveryPlans(mockRecoveryPlans);

      // Mock backup targets
      const mockBackupTargets: BackupTarget[] = [
        {
          id: 'target-1',
          name: 'Local Primary Storage',
          type: 'local',
          capacity: 10240, // 10TB
          usedSpace: 3072, // 3TB
          encrypted: true,
          medicalCertified: true,
          hipaaCompliant: true,
          status: 'active',
          lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 'target-2',
          name: 'Cloud Secondary Storage',
          type: 'cloud',
          capacity: 51200, // 50TB
          usedSpace: 15360, // 15TB
          encrypted: true,
          medicalCertified: true,
          hipaaCompliant: true,
          status: 'active',
          lastBackup: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: 'target-3',
          name: 'Offsite Archive',
          type: 'offsite',
          capacity: 20480, // 20TB
          usedSpace: 5120, // 5TB
          encrypted: true,
          medicalCertified: true,
          hipaaCompliant: true,
          status: 'maintenance',
          lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];
      setBackupTargets(mockBackupTargets);

      // Mock DR metrics
      const mockMetrics: DRMetrics = {
        rtoCompliance: 95.8,
        rpoCompliance: 98.2,
        backupSuccessRate: 96.5,
        testSuccessRate: 89.3,
        totalBackups: 1247,
        failedBackups: 44,
        totalRestores: 23,
        successfulRestores: 22,
        lastSuccessfulTest: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextScheduledTest: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      setDrMetrics(mockMetrics);

      setLoading(false);
    };

    initializeMockData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-medsight-normal" />;
      case 'running':
        return <ArrowPathIcon className="w-5 h-5 text-medsight-primary animate-spin" />;
      case 'failed':
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-medsight-abnormal" />;
      case 'paused':
      case 'maintenance':
        return <StopIcon className="w-5 h-5 text-medsight-pending" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-medsight-pending" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <DatabaseIcon className="w-5 h-5" />;
      case 'dicom':
        return <HeartIcon className="w-5 h-5" />;
      case 'files':
      case 'medical_records':
        return <DocumentIcon className="w-5 h-5" />;
      case 'system':
        return <ServerIcon className="w-5 h-5" />;
      case 'logs':
        return <DocumentIcon className="w-5 h-5" />;
      default:
        return <DocumentIcon className="w-5 h-5" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor':
        return 'text-blue-400';
      case 'major':
        return 'text-medsight-pending';
      case 'critical':
        return 'text-medsight-abnormal';
      case 'catastrophic':
        return 'text-medsight-critical';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="medsight-glass p-8 rounded-xl animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-medsight-primary/20 rounded w-1/3"></div>
          <div className="h-64 bg-medsight-primary/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-medsight-primary">
            Disaster Recovery & Business Continuity
          </h1>
          <p className="text-medsight-primary/70 mt-2">
            Medical data protection and business continuity management
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-medsight px-4 py-2 rounded-lg flex items-center space-x-2 bg-medsight-primary/20"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Backup</span>
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-medsight-primary/70">
            <ClockIcon className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      {drMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-medsight-primary/70 text-sm font-medium">RTO Compliance</h3>
                <p className="text-2xl font-bold text-medsight-primary mt-1">
                  {drMetrics.rtoCompliance.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-medsight-normal/20">
                <ClockIcon className="w-6 h-6 text-medsight-normal" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-medsight-primary/10 rounded-full h-2">
                <div 
                  className="bg-medsight-normal h-2 rounded-full"
                  style={{ width: `${drMetrics.rtoCompliance}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-medsight-primary/70 text-sm font-medium">RPO Compliance</h3>
                <p className="text-2xl font-bold text-medsight-primary mt-1">
                  {drMetrics.rpoCompliance.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-medsight-normal/20">
                <ShieldCheckIcon className="w-6 h-6 text-medsight-normal" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-medsight-primary/10 rounded-full h-2">
                <div 
                  className="bg-medsight-normal h-2 rounded-full"
                  style={{ width: `${drMetrics.rpoCompliance}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-medsight-primary/70 text-sm font-medium">Backup Success Rate</h3>
                <p className="text-2xl font-bold text-medsight-primary mt-1">
                  {drMetrics.backupSuccessRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-medsight-primary/20">
                <CloudArrowUpIcon className="w-6 h-6 text-medsight-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-medsight-primary/70">
              <span>{drMetrics.totalBackups - drMetrics.failedBackups}/{drMetrics.totalBackups} successful</span>
            </div>
          </div>

          <div className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-medsight-primary/70 text-sm font-medium">Test Success Rate</h3>
                <p className="text-2xl font-bold text-medsight-primary mt-1">
                  {drMetrics.testSuccessRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-medsight-pending/20">
                <BeakerIcon className="w-6 h-6 text-medsight-pending" />
              </div>
            </div>
            <div className="mt-4 text-sm text-medsight-primary/70">
              <span>Next test: {formatDuration(drMetrics.nextScheduledTest)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="medsight-glass rounded-xl">
        <div className="flex border-b border-medsight-primary/10">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'backups', label: 'Backup Jobs', icon: CloudArrowUpIcon },
            { id: 'restores', label: 'Restore Jobs', icon: CloudArrowDownIcon },
            { id: 'plans', label: 'Recovery Plans', icon: DocumentIcon },
            { id: 'testing', label: 'DR Testing', icon: BeakerIcon },
            { id: 'monitoring', label: 'Monitoring', icon: BellIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-medsight-primary text-medsight-primary'
                  : 'border-transparent text-medsight-primary/70 hover:text-medsight-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Backup Jobs Tab */}
          {activeTab === 'backups' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-medsight-primary">Backup Jobs</h3>
                <div className="flex space-x-2">
                  <span className="text-sm text-medsight-primary/70">
                    {backupJobs.filter(j => j.status === 'active').length} active,{' '}
                    {backupJobs.filter(j => j.status === 'running').length} running
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {backupJobs.map((job) => (
                  <div
                    key={job.id}
                    className="medsight-control-glass p-4 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-medsight-primary/20 rounded-lg">
                          {getTypeIcon(job.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-medsight-primary">{job.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(job.status)}
                            <span className="text-sm text-medsight-primary/70 capitalize">
                              {job.status}
                            </span>
                            {job.medicalData && (
                              <span className="px-2 py-1 bg-medsight-abnormal/20 text-medsight-abnormal text-xs rounded-full">
                                Medical Data
                              </span>
                            )}
                            {job.hipaaCompliant && (
                              <ShieldCheckIcon className="w-4 h-4 text-medsight-normal" />
                            )}
                            {job.encrypted && (
                              <span className="px-2 py-1 bg-medsight-normal/20 text-medsight-normal text-xs rounded-full">
                                Encrypted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-medsight-primary">
                          {formatBytes(job.dataSize)}
                        </div>
                        <div className="text-sm text-medsight-primary/70">
                          Last: {formatDuration(job.lastRun)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-medsight-primary/10">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-medsight-primary/70">Next Run:</span>
                          <p className="text-medsight-primary mt-1">
                            {job.nextRun.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-medsight-primary/70">Compression:</span>
                          <p className="text-medsight-primary mt-1">
                            {(job.compressionRatio * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-medsight-primary/70">Verified:</span>
                          <p className={`mt-1 ${job.verified ? 'text-medsight-normal' : 'text-medsight-pending'}`}>
                            {job.verified ? 'Yes' : 'Pending'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4">
                        <button className="btn-medsight px-3 py-1 text-sm">
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Run Now
                        </button>
                        <button className="btn-medsight px-3 py-1 text-sm">
                          <Cog6ToothIcon className="w-4 h-4 mr-1" />
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restore Jobs Tab */}
          {activeTab === 'restores' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-medsight-primary">Restore Jobs</h3>
                <div className="flex space-x-2">
                  <span className="text-sm text-medsight-primary/70">
                    {restoreJobs.filter(j => j.status === 'running').length} active
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {restoreJobs.map((job) => (
                  <div key={job.id} className="medsight-control-glass p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-medsight-primary/20 rounded-lg">
                          <CloudArrowDownIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-medsight-primary">{job.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusIcon(job.status)}
                            <span className="text-sm text-medsight-primary/70 capitalize">
                              {job.status}
                            </span>
                            {job.medicalEmergency && (
                              <span className="px-2 py-1 bg-medsight-critical/20 text-medsight-critical text-xs rounded-full">
                                Emergency
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-medsight-primary">
                          {job.progress}%
                        </div>
                        <div className="text-sm text-medsight-primary/70">
                          {formatBytes(job.dataSize)}
                        </div>
                      </div>
                    </div>
                    
                    {job.status === 'running' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-medsight-primary/70 mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <div className="w-full bg-medsight-primary/10 rounded-full h-2">
                          <div 
                            className="bg-medsight-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                        {job.estimatedCompletion && (
                          <p className="text-sm text-medsight-primary/70 mt-2">
                            Estimated completion: {job.estimatedCompletion.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-medsight-primary/10">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-medsight-primary/70">Source:</span>
                          <p className="text-medsight-primary mt-1">{job.backupSource}</p>
                        </div>
                        <div>
                          <span className="text-medsight-primary/70">Target:</span>
                          <p className="text-medsight-primary mt-1">{job.targetLocation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recovery Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-medsight-primary">Disaster Recovery Plans</h3>
                <span className="text-sm text-medsight-primary/70">{recoveryPlans.length} plans</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recoveryPlans.map((plan) => (
                  <div key={plan.id} className="medsight-control-glass p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-medsight-primary mb-2">{plan.name}</h4>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(plan.severity)}`}>
                            {plan.severity.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-medsight-primary/20 text-medsight-primary text-xs rounded-full">
                            {plan.scenario.replace('_', ' ').toUpperCase()}
                          </span>
                          {plan.medicalPriority && (
                            <HeartIcon className="w-4 h-4 text-medsight-abnormal" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-medsight-primary/70">RTO:</span>
                            <p className="text-medsight-primary">{plan.estimatedRTO} minutes</p>
                          </div>
                          <div>
                            <span className="text-medsight-primary/70">RPO:</span>
                            <p className="text-medsight-primary">{plan.estimatedRPO} minutes</p>
                          </div>
                          <div>
                            <span className="text-medsight-primary/70">Steps:</span>
                            <p className="text-medsight-primary">{plan.steps}</p>
                          </div>
                          <div>
                            <span className="text-medsight-primary/70">Auto Execute:</span>
                            <p className={plan.autoExecute ? 'text-medsight-normal' : 'text-medsight-pending'}>
                              {plan.autoExecute ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-medsight-primary/70">Last Test:</span>
                          <span className="text-medsight-primary">{formatDuration(plan.lastTested)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            plan.testStatus === 'passed' ? 'bg-medsight-normal/20 text-medsight-normal' :
                            plan.testStatus === 'failed' ? 'bg-medsight-abnormal/20 text-medsight-abnormal' :
                            plan.testStatus === 'partial' ? 'bg-medsight-pending/20 text-medsight-pending' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {plan.testStatus.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <button className="btn-medsight px-3 py-1 text-sm">
                          <PlayIcon className="w-4 h-4 mr-1" />
                          Execute
                        </button>
                        <button className="btn-medsight px-3 py-1 text-sm">
                          <BeakerIcon className="w-4 h-4 mr-1" />
                          Test
                        </button>
                        <button className="btn-medsight px-3 py-1 text-sm">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-medsight-primary">Disaster Recovery Overview</h3>
              
              {/* Backup Targets */}
              <div>
                <h4 className="text-lg font-medium text-medsight-primary mb-4">Backup Targets</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {backupTargets.map((target) => (
                    <div key={target.id} className="medsight-control-glass p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-medsight-primary">{target.name}</h5>
                        {getStatusIcon(target.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-medsight-primary/70">Type:</span>
                          <span className="text-medsight-primary capitalize">{target.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-medsight-primary/70">Usage:</span>
                          <span className="text-medsight-primary">
                            {formatBytes(target.usedSpace * 1024 * 1024 * 1024)} / {formatBytes(target.capacity * 1024 * 1024 * 1024)}
                          </span>
                        </div>
                        <div className="w-full bg-medsight-primary/10 rounded-full h-2 mt-2">
                          <div 
                            className="bg-medsight-primary h-2 rounded-full"
                            style={{ width: `${(target.usedSpace / target.capacity) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {target.encrypted && (
                            <span className="px-2 py-1 bg-medsight-normal/20 text-medsight-normal text-xs rounded-full">
                              Encrypted
                            </span>
                          )}
                          {target.hipaaCompliant && (
                            <ShieldCheckIcon className="w-4 h-4 text-medsight-normal" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-medium text-medsight-primary mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {[...backupJobs.slice(0, 3), ...restoreJobs.slice(0, 2)].map((item, index) => (
                    <div key={index} className="medsight-control-glass p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-medsight-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-medsight-primary">{item.name}</p>
                          <p className="text-xs text-medsight-primary/70">
                            {'lastRun' in item ? formatDuration(item.lastRun) : formatDuration(item.startTime)}
                          </p>
                        </div>
                        {getStatusIcon(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Testing Tab */}
          {activeTab === 'testing' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-medsight-primary">Disaster Recovery Testing</h3>
              
              <div className="medsight-control-glass p-6 rounded-lg text-center">
                <BeakerIcon className="w-12 h-12 text-medsight-primary mx-auto mb-4" />
                <h4 className="text-lg font-medium text-medsight-primary mb-2">Schedule DR Test</h4>
                <p className="text-medsight-primary/70 mb-4">
                  Regular testing ensures your disaster recovery plans work when needed
                </p>
                <button className="btn-medsight px-6 py-2">Schedule Test</button>
              </div>
            </div>
          )}

          {/* Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-medsight-primary">DR Monitoring</h3>
              
              <div className="medsight-control-glass p-6 rounded-lg text-center">
                <BellIcon className="w-12 h-12 text-medsight-primary mx-auto mb-4" />
                <h4 className="text-lg font-medium text-medsight-primary mb-2">Real-time Monitoring</h4>
                <p className="text-medsight-primary/70 mb-4">
                  Monitor backup health, compliance metrics, and system status
                </p>
                <button className="btn-medsight px-6 py-2">View Monitoring</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterRecovery; 