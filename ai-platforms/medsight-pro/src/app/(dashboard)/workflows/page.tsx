'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  EyeIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  BeakerIcon,
  CpuChipIcon,
  StarIcon,
  LightBulbIcon,
  BuildingOfficeIcon,
  UserIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

// Import workflow components
import PatientWorkflowManager from '@/components/workflow/PatientWorkflowManager';
import MedicalReportGenerator from '@/components/workflow/MedicalReportGenerator';
import ClinicalDecisionSupport from '@/components/workflow/ClinicalDecisionSupport';
import MedicalCollaborationHub from '@/components/workflow/MedicalCollaborationHub';
import QualityAssuranceSystem from '@/components/workflow/QualityAssuranceSystem';
import ComplianceAuditTrail from '@/components/workflow/ComplianceAuditTrail';
import WorkflowAutomationEngine from '@/components/workflow/WorkflowAutomationEngine';

interface WorkflowStats {
  activePatientCases: number;
  pendingReports: number;
  clinicalDecisions: number;
  activeConsultations: number;
  qualityReviews: number;
  complianceAlerts: number;
  automationRules: number;
  teamUtilization: number;
}

interface RecentActivity {
  id: string;
  type: 'patient' | 'report' | 'decision' | 'consultation' | 'quality' | 'compliance' | 'automation';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
}

interface DashboardAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
  relatedComponent?: string;
}

type ActiveComponent = 
  | 'dashboard' 
  | 'patient-workflow' 
  | 'report-generator' 
  | 'clinical-decision' 
  | 'collaboration-hub' 
  | 'quality-assurance' 
  | 'compliance-audit' 
  | 'automation-engine';

export default function AdvancedMedicalWorkflowsPage() {
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('dashboard');
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dashboardAlerts, setDashboardAlerts] = useState<DashboardAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAlerts, setShowAlerts] = useState(true);

  // Mock data for dashboard
  const mockStats: WorkflowStats = {
    activePatientCases: 42,
    pendingReports: 15,
    clinicalDecisions: 8,
    activeConsultations: 6,
    qualityReviews: 12,
    complianceAlerts: 3,
    automationRules: 28,
    teamUtilization: 87
  };

  const mockActivity: RecentActivity[] = [
    {
      id: 'activity-001',
      type: 'patient',
      title: 'New Patient Case Assigned',
      description: 'Cardiac evaluation for Sarah Johnson assigned to Dr. Smith',
      timestamp: new Date(Date.now() - 300000),
      priority: 'high',
      status: 'in_progress',
      assignedTo: 'Dr. Smith'
    },
    {
      id: 'activity-002',
      type: 'report',
      title: 'CT Chest Report Generated',
      description: 'AI-assisted report generated for patient John Doe',
      timestamp: new Date(Date.now() - 600000),
      priority: 'medium',
      status: 'completed'
    },
    {
      id: 'activity-003',
      type: 'consultation',
      title: 'Cardiology Consultation Requested',
      description: 'Urgent consultation requested for MI patient',
      timestamp: new Date(Date.now() - 900000),
      priority: 'critical',
      status: 'pending',
      assignedTo: 'Dr. Chen'
    },
    {
      id: 'activity-004',
      type: 'automation',
      title: 'Quality Alert Triggered',
      description: 'Report turnaround time exceeded threshold',
      timestamp: new Date(Date.now() - 1200000),
      priority: 'medium',
      status: 'completed'
    },
    {
      id: 'activity-005',
      type: 'quality',
      title: 'Peer Review Completed',
      description: 'Imaging interpretation review completed by Dr. Johnson',
      timestamp: new Date(Date.now() - 1500000),
      priority: 'low',
      status: 'completed'
    }
  ];

  const mockAlerts: DashboardAlert[] = [
    {
      id: 'alert-001',
      type: 'warning',
      title: 'Compliance Alert',
      message: '3 audit trails require attention',
      timestamp: new Date(Date.now() - 1800000),
      acknowledged: false,
      actionRequired: true,
      relatedComponent: 'compliance-audit'
    },
    {
      id: 'alert-002',
      type: 'info',
      title: 'System Update',
      message: 'Workflow automation engine updated successfully',
      timestamp: new Date(Date.now() - 3600000),
      acknowledged: true,
      actionRequired: false,
      relatedComponent: 'automation-engine'
    }
  ];

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setWorkflowStats(mockStats);
      setRecentActivity(mockActivity);
      setDashboardAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const workflowComponents = [
    {
      id: 'patient-workflow',
      name: 'Patient Workflow Manager',
      description: 'Comprehensive patient case management and clinical workflow automation',
      icon: UserIcon,
      color: 'bg-blue-500',
      stats: workflowStats?.activePatientCases || 0,
      label: 'Active Cases'
    },
    {
      id: 'report-generator',
      name: 'Medical Report Generator',
      description: 'Automated report generation with templates and clinical documentation',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      stats: workflowStats?.pendingReports || 0,
      label: 'Pending Reports'
    },
    {
      id: 'clinical-decision',
      name: 'Clinical Decision Support',
      description: 'Evidence-based decision trees and clinical guidelines',
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      stats: workflowStats?.clinicalDecisions || 0,
      label: 'Decision Points'
    },
    {
      id: 'collaboration-hub',
      name: 'Medical Collaboration Hub',
      description: 'Multi-disciplinary team collaboration and consultation features',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-orange-500',
      stats: workflowStats?.activeConsultations || 0,
      label: 'Active Consultations'
    },
    {
      id: 'quality-assurance',
      name: 'Quality Assurance System',
      description: 'Peer review, quality metrics, and performance monitoring',
      icon: ShieldCheckIcon,
      color: 'bg-indigo-500',
      stats: workflowStats?.qualityReviews || 0,
      label: 'Quality Reviews'
    },
    {
      id: 'compliance-audit',
      name: 'Compliance Audit Trail',
      description: 'HIPAA compliance, audit logging, and regulatory reporting',
      icon: DocumentArrowDownIcon,
      color: 'bg-red-500',
      stats: workflowStats?.complianceAlerts || 0,
      label: 'Compliance Alerts'
    },
    {
      id: 'automation-engine',
      name: 'Workflow Automation Engine',
      description: 'Automated task scheduling, notifications, and workflow orchestration',
      icon: CogIcon,
      color: 'bg-teal-500',
      stats: workflowStats?.automationRules || 0,
      label: 'Active Rules'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <PlayIcon className="w-5 h-5 text-blue-600" />;
      case 'pending': return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      case 'failed': return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'success': return 'text-green-600 bg-green-100 border-green-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleComponentNavigation = (componentId: ActiveComponent) => {
    setActiveComponent(componentId);
  };

  const handleAlertDismiss = (alertId: string) => {
    setDashboardAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'patient-workflow':
        return <PatientWorkflowManager className="animate-fadeIn" />;
      case 'report-generator':
        return <MedicalReportGenerator className="animate-fadeIn" />;
      case 'clinical-decision':
        return <ClinicalDecisionSupport className="animate-fadeIn" />;
      case 'collaboration-hub':
        return <MedicalCollaborationHub className="animate-fadeIn" />;
      case 'quality-assurance':
        return <QualityAssuranceSystem className="animate-fadeIn" />;
      case 'compliance-audit':
        return <ComplianceAuditTrail className="animate-fadeIn" />;
      case 'automation-engine':
        return <WorkflowAutomationEngine className="animate-fadeIn" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-gray-300 rounded-xl"></div>
              <div className="h-64 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Advanced Medical Workflows
              </h1>
              <p className="text-gray-600">
                Comprehensive workflow management, automation, and collaboration platform
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white rounded-lg border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-medsight-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg transition-colors ${
                    viewMode === 'list' ? 'bg-medsight-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Alerts Toggle */}
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <BellIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Alerts ({dashboardAlerts.filter(a => !a.acknowledged).length})
                </span>
              </button>
              
              {/* Back to Dashboard */}
              {activeComponent !== 'dashboard' && (
                <button
                  onClick={() => setActiveComponent('dashboard')}
                  className="px-4 py-2 bg-medsight-primary text-white rounded-lg hover:bg-medsight-primary/90 transition-colors"
                >
                  ← Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Alerts Banner */}
          {showAlerts && dashboardAlerts.filter(a => !a.acknowledged).length > 0 && (
            <div className="mb-6 space-y-2">
              {dashboardAlerts.filter(a => !a.acknowledged).map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <InformationCircleIcon className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.relatedComponent && (
                        <button
                          onClick={() => handleComponentNavigation(alert.relatedComponent as ActiveComponent)}
                          className="text-sm font-medium hover:underline"
                        >
                          View Component
                        </button>
                      )}
                      <button
                        onClick={() => handleAlertDismiss(alert.id)}
                        className="text-sm font-medium hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dashboard View */}
        {activeComponent === 'dashboard' && (
          <div className="space-y-8">
            {/* Workflow Components Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {workflowComponents.map(component => (
                <div
                  key={component.id}
                  onClick={() => handleComponentNavigation(component.id as ActiveComponent)}
                  className={`medsight-glass p-6 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                    viewMode === 'list' ? 'flex items-center gap-6' : ''
                  }`}
                >
                  <div className={`w-12 h-12 ${component.color} rounded-lg flex items-center justify-center mb-4 ${
                    viewMode === 'list' ? 'mb-0 flex-shrink-0' : ''
                  }`}>
                    <component.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {component.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {component.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-medsight-primary">
                          {component.stats}
                        </span>
                        <span className="text-sm text-gray-500">
                          {component.label}
                        </span>
                      </div>
                      <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="medsight-glass p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Utilization</p>
                    <p className="text-2xl font-bold text-medsight-primary">
                      {workflowStats?.teamUtilization}%
                    </p>
                  </div>
                  <UserGroupIcon className="w-8 h-8 text-medsight-primary/30" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-medsight-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${workflowStats?.teamUtilization}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="medsight-glass p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Active Workflows</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(workflowStats?.activePatientCases || 0) + (workflowStats?.activeConsultations || 0)}
                    </p>
                  </div>
                  <PlayIcon className="w-8 h-8 text-green-500/30" />
                </div>
              </div>
              
              <div className="medsight-glass p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className="text-2xl font-bold text-medsight-primary">94.2%</p>
                  </div>
                  <StarIcon className="w-8 h-8 text-yellow-500/30" />
                </div>
              </div>
              
              <div className="medsight-glass p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Automation Efficiency</p>
                    <p className="text-2xl font-bold text-medsight-primary">88.7%</p>
                  </div>
                  <ArrowTrendingUpIcon className="w-8 h-8 text-green-500/30" />
                </div>
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 medsight-glass p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <button className="text-sm text-medsight-primary hover:text-medsight-primary/80">
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                            {activity.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{activity.timestamp.toLocaleString()}</span>
                          {activity.assignedTo && (
                            <span>Assigned to {activity.assignedTo}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="medsight-glass p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleComponentNavigation('patient-workflow')}
                    className="w-full flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Create Patient Case</span>
                  </button>
                  
                  <button
                    onClick={() => handleComponentNavigation('report-generator')}
                    className="w-full flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    <DocumentTextIcon className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Generate Report</span>
                  </button>
                  
                  <button
                    onClick={() => handleComponentNavigation('collaboration-hub')}
                    className="w-full flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Start Consultation</span>
                  </button>
                  
                  <button
                    onClick={() => handleComponentNavigation('clinical-decision')}
                    className="w-full flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    <LightBulbIcon className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Clinical Decision</span>
                  </button>
                  
                  <button
                    onClick={() => handleComponentNavigation('quality-assurance')}
                    className="w-full flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium">Quality Review</span>
                  </button>
                  
                  <button
                    onClick={() => handleComponentNavigation('automation-engine')}
                    className="w-full flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    <CogIcon className="w-5 h-5 text-teal-600" />
                    <span className="font-medium">Automation Rules</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Component View */}
        {activeComponent !== 'dashboard' && (
          <div className="space-y-6">
            {/* Component Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setActiveComponent('dashboard')}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ArrowRightIcon className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {workflowComponents.find(c => c.id === activeComponent)?.name}
                </h2>
                <p className="text-gray-600">
                  {workflowComponents.find(c => c.id === activeComponent)?.description}
                </p>
              </div>
            </div>

            {/* Render Active Component */}
            {renderActiveComponent()}
          </div>
        )}
      </div>
    </div>
  );
} 