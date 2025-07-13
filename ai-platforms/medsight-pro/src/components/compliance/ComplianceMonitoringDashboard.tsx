'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Import compliance frameworks
import HIPAATechnicalSafeguards from '@/lib/compliance/hipaa-technical-safeguards';
import FDAComplianceFramework from '@/lib/regulatory/fda-compliance';
import DICOMConformanceStatement from '@/lib/dicom/dicom-conformance';
import HL7FHIRIntegration from '@/lib/fhir/fhir-integration';
import MedicalDataSecurity from '@/lib/security/medical-encryption';
import ClinicalValidationFramework from '@/lib/validation/clinical-validation';

interface ComplianceStatus {
  overall: number;
  hipaa: number;
  fda: number;
  dicom: number;
  fhir: number;
  security: number;
  clinical: number;
  lastUpdated: string;
}

interface ComplianceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  framework: 'HIPAA' | 'FDA' | 'DICOM' | 'FHIR' | 'SECURITY' | 'CLINICAL';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  priority: number;
  actionRequired: boolean;
  dueDate?: string;
}

interface ComplianceMetrics {
  auditTrailCompliance: number;
  dataEncryptionCompliance: number;
  accessControlCompliance: number;
  regulatorySubmissions: number;
  clinicalValidationProgress: number;
  securityIncidents: number;
  totalAlerts: number;
  resolvedAlerts: number;
}

interface ComplianceReport {
  id: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'regulatory';
  framework: string[];
  generatedDate: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  summary: {
    overallCompliance: number;
    criticalIssues: number;
    recommendations: number;
  };
}

const ComplianceMonitoringDashboard: React.FC = () => {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    overall: 0,
    hipaa: 0,
    fda: 0,
    dicom: 0,
    fhir: 0,
    security: 0,
    clinical: 0,
    lastUpdated: new Date().toISOString()
  });

  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    auditTrailCompliance: 0,
    dataEncryptionCompliance: 0,
    accessControlCompliance: 0,
    regulatorySubmissions: 0,
    clinicalValidationProgress: 0,
    securityIncidents: 0,
    totalAlerts: 0,
    resolvedAlerts: 0
  });

  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'reports' | 'frameworks'>('overview');
  const [loading, setLoading] = useState(true);

  // Initialize compliance monitoring
  useEffect(() => {
    initializeComplianceMonitoring();
    const interval = setInterval(updateComplianceStatus, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const initializeComplianceMonitoring = async () => {
    try {
      setLoading(true);
      
      // Initialize all compliance frameworks
      const hipaaFramework = HIPAATechnicalSafeguards.getInstance();
      const fdaFramework = FDAComplianceFramework.getInstance();
      const dicomFramework = DICOMConformanceStatement.getInstance();
      const fhirFramework = HL7FHIRIntegration.getInstance();
      const securityFramework = MedicalDataSecurity.getInstance();
      const clinicalFramework = ClinicalValidationFramework.getInstance();

      // Load initial compliance status
      await updateComplianceStatus();
      await loadComplianceAlerts();
      await loadComplianceMetrics();
      await loadComplianceReports();

    } catch (error) {
      console.error('Failed to initialize compliance monitoring:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplianceStatus = async () => {
    try {
      // Get compliance status from each framework
      const hipaaFramework = HIPAATechnicalSafeguards.getInstance();
      const fdaFramework = FDAComplianceFramework.getInstance();
      const dicomFramework = DICOMConformanceStatement.getInstance();
      const fhirFramework = HL7FHIRIntegration.getInstance();
      const securityFramework = MedicalDataSecurity.getInstance();
      const clinicalFramework = ClinicalValidationFramework.getInstance();

      // Calculate compliance scores
      const hipaaCompliance = await calculateHIPAACompliance(hipaaFramework);
      const fdaCompliance = await calculateFDACompliance(fdaFramework);
      const dicomCompliance = await calculateDICOMCompliance(dicomFramework);
      const fhirCompliance = 95; // Placeholder - would calculate from FHIR framework
      const securityCompliance = 98; // Placeholder - would calculate from security framework
      const clinicalCompliance = 87; // Placeholder - would calculate from clinical framework

      const overall = Math.round(
        (hipaaCompliance + fdaCompliance + dicomCompliance + fhirCompliance + securityCompliance + clinicalCompliance) / 6
      );

      setComplianceStatus({
        overall,
        hipaa: hipaaCompliance,
        fda: fdaCompliance,
        dicom: dicomCompliance,
        fhir: fhirCompliance,
        security: securityCompliance,
        clinical: clinicalCompliance,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to update compliance status:', error);
    }
  };

  const calculateHIPAACompliance = async (framework: any): Promise<number> => {
    try {
      const complianceStatus = framework.getComplianceStatus();
      const report = await framework.generateComplianceReport();
      return report.overallCompliance;
    } catch (error) {
      return 0;
    }
  };

  const calculateFDACompliance = async (framework: any): Promise<number> => {
    try {
      const validation = await framework.validate510kSubmission();
      return validation.complianceScore;
    } catch (error) {
      return 0;
    }
  };

  const calculateDICOMCompliance = async (framework: any): Promise<number> => {
    try {
      const tests = await framework.runConformanceTests();
      return Math.round((tests.passed / (tests.passed + tests.failed + tests.warnings)) * 100);
    } catch (error) {
      return 0;
    }
  };

  const loadComplianceAlerts = async () => {
    // Simulated alerts - would be loaded from compliance frameworks
    const sampleAlerts: ComplianceAlert[] = [
      {
        id: 'alert-1',
        type: 'critical',
        framework: 'HIPAA',
        title: 'Audit Log Retention Policy Violation',
        description: 'Audit logs older than 6 years detected. HIPAA requires secure deletion after retention period.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        priority: 1,
        actionRequired: true,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'alert-2',
        type: 'warning',
        framework: 'FDA',
        title: 'Clinical Validation Study Update Required',
        description: 'Annual clinical validation report due in 30 days for FDA submission.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        priority: 2,
        actionRequired: true,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'alert-3',
        type: 'info',
        framework: 'DICOM',
        title: 'DICOM Conformance Statement Updated',
        description: 'DICOM conformance statement updated to version 2.1 with new SOP classes.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        priority: 3,
        actionRequired: false
      },
      {
        id: 'alert-4',
        type: 'warning',
        framework: 'SECURITY',
        title: 'Encryption Key Rotation Due',
        description: '5 encryption keys are due for rotation within the next 7 days.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        priority: 2,
        actionRequired: true,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setAlerts(sampleAlerts);
  };

  const loadComplianceMetrics = async () => {
    // Simulated metrics - would be calculated from compliance frameworks
    setMetrics({
      auditTrailCompliance: 98.5,
      dataEncryptionCompliance: 99.2,
      accessControlCompliance: 97.8,
      regulatorySubmissions: 12,
      clinicalValidationProgress: 87.3,
      securityIncidents: 2,
      totalAlerts: 15,
      resolvedAlerts: 11
    });
  };

  const loadComplianceReports = async () => {
    // Simulated reports - would be loaded from compliance system
    const sampleReports: ComplianceReport[] = [
      {
        id: 'report-1',
        type: 'quarterly',
        framework: ['HIPAA', 'FDA', 'DICOM'],
        generatedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        downloadUrl: '/reports/q3-2024-compliance.pdf',
        summary: {
          overallCompliance: 94.2,
          criticalIssues: 1,
          recommendations: 5
        }
      },
      {
        id: 'report-2',
        type: 'regulatory',
        framework: ['FDA'],
        generatedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        downloadUrl: '/reports/fda-510k-update.pdf',
        summary: {
          overallCompliance: 96.8,
          criticalIssues: 0,
          recommendations: 3
        }
      },
      {
        id: 'report-3',
        type: 'monthly',
        framework: ['SECURITY', 'CLINICAL'],
        generatedDate: new Date().toISOString(),
        status: 'generating',
        summary: {
          overallCompliance: 0,
          criticalIssues: 0,
          recommendations: 0
        }
      }
    ];

    setReports(sampleReports);
  };

  const resolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const generateComplianceReport = async (type: ComplianceReport['type'], frameworks: string[]) => {
    const newReport: ComplianceReport = {
      id: `report-${Date.now()}`,
      type,
      framework: frameworks,
      generatedDate: new Date().toISOString(),
      status: 'generating',
      summary: {
        overallCompliance: 0,
        criticalIssues: 0,
        recommendations: 0
      }
    };

    setReports(prev => [newReport, ...prev]);

    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { 
              ...report, 
              status: 'completed', 
              downloadUrl: `/reports/${newReport.id}.pdf`,
              summary: {
                overallCompliance: complianceStatus.overall,
                criticalIssues: alerts.filter(a => a.type === 'critical' && !a.resolved).length,
                recommendations: Math.floor(Math.random() * 10) + 1
              }
            } 
          : report
      ));
    }, 3000);
  };

  const getComplianceStatusColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    if (score >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComplianceStatusBg = (score: number) => {
    if (score >= 95) return 'bg-green-50 border-green-200';
    if (score >= 85) return 'bg-yellow-50 border-yellow-200';
    if (score >= 75) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAlertIcon = (type: ComplianceAlert['type']) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="medsight-glass p-8 rounded-xl">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medsight-primary"></div>
          <span className="ml-3 text-lg font-medium text-gray-600">Loading compliance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="medsight-glass p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-medsight-primary mb-2">
                Compliance Monitoring Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time medical compliance monitoring and regulatory tracking
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-sm font-medium">{formatTimestamp(complianceStatus.lastUpdated)}</div>
              </div>
              <div className={`text-3xl font-bold ${getComplianceStatusColor(complianceStatus.overall)}`}>
                {complianceStatus.overall}%
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="medsight-glass p-4 rounded-xl">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'alerts', label: 'Alerts', icon: BellIcon },
              { key: 'reports', label: 'Reports', icon: DocumentCheckIcon },
              { key: 'frameworks', label: 'Frameworks', icon: Cog6ToothIcon }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-medsight-primary text-white'
                    : 'text-gray-600 hover:text-medsight-primary hover:bg-medsight-primary/10'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
                {tab.key === 'alerts' && alerts.filter(a => !a.resolved).length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {alerts.filter(a => !a.resolved).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Compliance Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Overall Compliance', value: complianceStatus.overall, icon: ShieldCheckIcon },
                { label: 'Active Alerts', value: alerts.filter(a => !a.resolved).length, icon: BellIcon },
                { label: 'Security Incidents', value: metrics.securityIncidents, icon: ExclamationTriangleIcon },
                { label: 'Regulatory Submissions', value: metrics.regulatorySubmissions, icon: DocumentCheckIcon }
              ].map((card, index) => (
                <div key={index} className="medsight-glass p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.label}</p>
                      <p className={`text-2xl font-bold ${
                        card.label === 'Overall Compliance' 
                          ? getComplianceStatusColor(card.value as number)
                          : 'text-gray-900'
                      }`}>
                        {card.value}{card.label === 'Overall Compliance' ? '%' : ''}
                      </p>
                    </div>
                    <card.icon className="w-8 h-8 text-medsight-primary" />
                  </div>
                </div>
              ))}
            </div>

            {/* Framework Compliance Status */}
            <div className="medsight-glass p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Framework Compliance Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'HIPAA Technical Safeguards', score: complianceStatus.hipaa, description: 'Access control, audit controls, integrity, authentication' },
                  { name: 'FDA Class II Compliance', score: complianceStatus.fda, description: 'Medical device software validation and 510(k) requirements' },
                  { name: 'DICOM Conformance', score: complianceStatus.dicom, description: 'DICOM standard compliance and interoperability' },
                  { name: 'HL7 FHIR Integration', score: complianceStatus.fhir, description: 'FHIR R4 resources and SMART on FHIR authentication' },
                  { name: 'Medical Data Security', score: complianceStatus.security, description: 'End-to-end encryption and zero-knowledge architecture' },
                  { name: 'Clinical Validation', score: complianceStatus.clinical, description: 'AI model validation and clinical evidence generation' }
                ].map((framework, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${getComplianceStatusBg(framework.score)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{framework.name}</h3>
                      <span className={`text-lg font-bold ${getComplianceStatusColor(framework.score)}`}>
                        {framework.score}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{framework.description}</p>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            framework.score >= 95 ? 'bg-green-500' :
                            framework.score >= 85 ? 'bg-yellow-500' :
                            framework.score >= 75 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${framework.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="medsight-glass p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Compliance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Audit Trail Compliance', value: metrics.auditTrailCompliance, unit: '%' },
                  { label: 'Data Encryption Compliance', value: metrics.dataEncryptionCompliance, unit: '%' },
                  { label: 'Access Control Compliance', value: metrics.accessControlCompliance, unit: '%' },
                  { label: 'Clinical Validation Progress', value: metrics.clinicalValidationProgress, unit: '%' }
                ].map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-medsight-primary">
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Compliance Alerts</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {alerts.filter(a => !a.resolved).length} active, {alerts.filter(a => a.resolved).length} resolved
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'critical' ? 'border-red-500 bg-red-50' :
                      alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    } ${alert.resolved ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{alert.title}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                              {alert.framework}
                            </span>
                            {alert.resolved && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded">
                                RESOLVED
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>{formatTimestamp(alert.timestamp)}</span>
                            {alert.dueDate && (
                              <span>Due: {formatTimestamp(alert.dueDate)}</span>
                            )}
                            <span>Priority: {alert.priority}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.actionRequired && !alert.resolved && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-medsight-primary rounded hover:bg-medsight-primary/80 transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Compliance Reports</h2>
                <button
                  onClick={() => generateComplianceReport('quarterly', ['HIPAA', 'FDA', 'DICOM', 'FHIR'])}
                  className="btn-medsight"
                >
                  Generate New Report
                </button>
              </div>

              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="card-medsight">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900 capitalize">
                            {report.type} Report
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                            {report.framework.join(', ')}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            report.status === 'completed' ? 'bg-green-100 text-green-600' :
                            report.status === 'generating' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {report.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Generated: {formatTimestamp(report.generatedDate)}
                        </div>
                        {report.status === 'completed' && (
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span className="text-green-600">
                              {report.summary.overallCompliance}% Compliance
                            </span>
                            <span className="text-red-600">
                              {report.summary.criticalIssues} Critical Issues
                            </span>
                            <span className="text-blue-600">
                              {report.summary.recommendations} Recommendations
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.status === 'completed' && report.downloadUrl && (
                          <a
                            href={report.downloadUrl}
                            download
                            className="px-3 py-1 text-xs font-medium text-medsight-primary border border-medsight-primary rounded hover:bg-medsight-primary hover:text-white transition-colors"
                          >
                            Download
                          </a>
                        )}
                        {report.status === 'generating' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-medsight-primary"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Frameworks Tab */}
        {activeTab === 'frameworks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                {
                  name: 'HIPAA Technical Safeguards',
                  description: 'Access control, audit controls, integrity, authentication, and transmission security',
                  status: complianceStatus.hipaa,
                  features: ['Automatic Logoff', 'Audit Controls', 'Data Integrity', 'User Authentication', 'Encryption'],
                  lastAudit: '2024-01-15'
                },
                {
                  name: 'FDA Class II Compliance',
                  description: 'Medical device software validation and regulatory submission requirements',
                  status: complianceStatus.fda,
                  features: ['510(k) Validation', 'Risk Management', 'Quality System', 'Clinical Studies', 'Post-Market Surveillance'],
                  lastAudit: '2024-01-10'
                },
                {
                  name: 'DICOM Conformance',
                  description: 'DICOM standard compliance for medical imaging interoperability',
                  status: complianceStatus.dicom,
                  features: ['SOP Classes', 'Transfer Syntaxes', 'Network Communication', 'Storage Services', 'Query/Retrieve'],
                  lastAudit: '2024-01-20'
                },
                {
                  name: 'HL7 FHIR Integration',
                  description: 'FHIR R4 resources and SMART on FHIR authentication for healthcare interoperability',
                  status: complianceStatus.fhir,
                  features: ['FHIR R4 Resources', 'SMART on FHIR', 'OAuth 2.0', 'Patient Resources', 'Observation Resources'],
                  lastAudit: '2024-01-18'
                },
                {
                  name: 'Medical Data Security',
                  description: 'End-to-end encryption, zero-knowledge architecture, and secure key management',
                  status: complianceStatus.security,
                  features: ['AES-256 Encryption', 'Zero-Knowledge', 'Key Management', 'Data Loss Prevention', 'Secure Deletion'],
                  lastAudit: '2024-01-22'
                },
                {
                  name: 'Clinical Validation',
                  description: 'AI model validation, clinical studies, and performance monitoring',
                  status: complianceStatus.clinical,
                  features: ['AI Validation', 'Clinical Studies', 'Performance Monitoring', 'Inter-Reader Agreement', 'Real-World Evidence'],
                  lastAudit: '2024-01-12'
                }
              ].map((framework, index) => (
                <div key={index} className="medsight-glass p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
                    <span className={`text-xl font-bold ${getComplianceStatusColor(framework.status)}`}>
                      {framework.status}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{framework.description}</p>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {framework.features.map((feature, featureIndex) => (
                        <span 
                          key={featureIndex}
                          className="px-2 py-1 text-xs font-medium bg-medsight-primary/10 text-medsight-primary rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Last Audit: {framework.lastAudit}</span>
                    <button className="text-medsight-primary hover:text-medsight-primary/80">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceMonitoringDashboard; 