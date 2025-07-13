/**
 * MedSight Pro - Quality Assurance Dashboard
 * Comprehensive quality monitoring and assurance interface
 * 
 * Features:
 * - Medical image quality monitoring
 * - Workflow quality metrics
 * - Peer review interface
 * - Compliance reporting
 * - Performance benchmarking integration
 * - Real-time quality alerts
 * 
 * @version 1.0.0
 * @author MedSight Pro Development Team
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Types
interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  lastUpdate: Date;
}

interface QualityAlert {
  id: string;
  type: 'image_quality' | 'workflow' | 'compliance' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

interface PeerReviewItem {
  id: string;
  studyId: string;
  reviewer: string;
  reviewee: string;
  status: 'pending' | 'in_progress' | 'completed';
  score: number;
  comments: string;
  timestamp: Date;
}

interface ComplianceCheck {
  id: string;
  category: 'FDA' | 'HIPAA' | 'DICOM' | 'HL7';
  status: 'compliant' | 'non_compliant' | 'warning';
  lastCheck: Date;
  nextCheck: Date;
  details: string;
}

/**
 * Quality Assurance Dashboard Component
 */
export default function QualityDashboard() {
  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'reviews' | 'compliance' | 'alerts'>('overview');
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  const [peerReviews, setPeerReviews] = useState<PeerReviewItem[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Initialize dashboard data
  useEffect(() => {
    initializeDashboard();
    const interval = setInterval(refreshDashboard, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const initializeDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load quality metrics
      const metricsData = await loadQualityMetrics();
      setQualityMetrics(metricsData);

      // Load quality alerts
      const alertsData = await loadQualityAlerts();
      setQualityAlerts(alertsData);

      // Load peer reviews
      const reviewsData = await loadPeerReviews();
      setPeerReviews(reviewsData);

      // Load compliance checks
      const complianceData = await loadComplianceChecks();
      setComplianceChecks(complianceData);
    } catch (error) {
      console.error('Error initializing quality dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      const [metrics, alerts, reviews, compliance] = await Promise.all([
        loadQualityMetrics(),
        loadQualityAlerts(),
        loadPeerReviews(),
        loadComplianceChecks()
      ]);

      setQualityMetrics(metrics);
      setQualityAlerts(alerts);
      setPeerReviews(reviews);
      setComplianceChecks(compliance);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  }, []);

  // Mock data loading functions (replace with actual API calls)
  const loadQualityMetrics = async (): Promise<QualityMetric[]> => {
    return [
      {
        id: 'image_quality_score',
        name: 'Image Quality Score',
        value: 92.5,
        target: 90,
        unit: '%',
        trend: 'up',
        status: 'good',
        lastUpdate: new Date()
      },
      {
        id: 'workflow_efficiency',
        name: 'Workflow Efficiency',
        value: 87.2,
        target: 85,
        unit: '%',
        trend: 'stable',
        status: 'good',
        lastUpdate: new Date()
      },
      {
        id: 'diagnostic_accuracy',
        name: 'Diagnostic Accuracy',
        value: 94.8,
        target: 95,
        unit: '%',
        trend: 'up',
        status: 'warning',
        lastUpdate: new Date()
      },
      {
        id: 'peer_review_score',
        name: 'Peer Review Score',
        value: 4.2,
        target: 4.0,
        unit: '/5',
        trend: 'up',
        status: 'good',
        lastUpdate: new Date()
      }
    ];
  };

  const loadQualityAlerts = async (): Promise<QualityAlert[]> => {
    return [
      {
        id: 'alert_001',
        type: 'image_quality',
        severity: 'medium',
        title: 'Image Quality Below Threshold',
        description: 'CT study #12345 shows image quality metrics below acceptable threshold',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        acknowledged: false,
        source: 'Image Quality Analyzer'
      },
      {
        id: 'alert_002',
        type: 'compliance',
        severity: 'high',
        title: 'DICOM Conformance Issue',
        description: 'Non-compliant DICOM tags detected in recent studies',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        acknowledged: false,
        source: 'DICOM Validator'
      }
    ];
  };

  const loadPeerReviews = async (): Promise<PeerReviewItem[]> => {
    return [
      {
        id: 'review_001',
        studyId: 'study_12345',
        reviewer: 'Dr. Smith',
        reviewee: 'Dr. Johnson',
        status: 'pending',
        score: 0,
        comments: '',
        timestamp: new Date()
      },
      {
        id: 'review_002',
        studyId: 'study_12346',
        reviewer: 'Dr. Brown',
        reviewee: 'Dr. Davis',
        status: 'completed',
        score: 4.5,
        comments: 'Excellent diagnostic accuracy and clear reporting',
        timestamp: new Date(Date.now() - 3600000)
      }
    ];
  };

  const loadComplianceChecks = async (): Promise<ComplianceCheck[]> => {
    return [
      {
        id: 'fda_compliance',
        category: 'FDA',
        status: 'compliant',
        lastCheck: new Date(Date.now() - 86400000), // 1 day ago
        nextCheck: new Date(Date.now() + 86400000 * 30), // 30 days from now
        details: 'All FDA Class II requirements met'
      },
      {
        id: 'hipaa_compliance',
        category: 'HIPAA',
        status: 'compliant',
        lastCheck: new Date(Date.now() - 86400000),
        nextCheck: new Date(Date.now() + 86400000 * 7), // 7 days from now
        details: 'HIPAA technical safeguards verified'
      },
      {
        id: 'dicom_compliance',
        category: 'DICOM',
        status: 'warning',
        lastCheck: new Date(Date.now() - 3600000),
        nextCheck: new Date(Date.now() + 86400000),
        details: 'Minor DICOM tag inconsistencies detected'
      }
    ];
  };

  // Event handlers
  const handleAcknowledgeAlert = (alertId: string) => {
    setQualityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': case 'compliant': return 'text-medsight-normal';
      case 'warning': return 'text-medsight-pending';
      case 'critical': case 'non_compliant': return 'text-medsight-critical';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Render components
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qualityMetrics.map((metric) => (
          <div key={metric.id} className="medsight-glass p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)}`} />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-medsight-primary">
                {metric.value}
              </span>
              <span className="ml-1 text-sm text-gray-500">{metric.unit}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Target: {metric.target}{metric.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Alerts */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-medsight-primary">Recent Quality Alerts</h3>
          <button className="btn-medsight text-sm">View All</button>
        </div>
        <div className="space-y-3">
          {qualityAlerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className={`w-5 h-5 ${getSeverityColor(alert.severity)}`} />
                <div>
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-500">{alert.description}</p>
                </div>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => handleAcknowledgeAlert(alert.id)}
                  className="btn-medsight text-xs"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {complianceChecks.map((check) => (
            <div key={check.id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {check.status === 'compliant' ? (
                  <CheckCircleIcon className="w-8 h-8 text-medsight-normal" />
                ) : (
                  <ExclamationTriangleIcon className="w-8 h-8 text-medsight-pending" />
                )}
              </div>
              <p className="font-medium text-gray-900">{check.category}</p>
              <p className={`text-sm ${getStatusColor(check.status)}`}>{check.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Quality Metrics Detail</h3>
        <div className="space-y-4">
          {qualityMetrics.map((metric) => (
            <div key={metric.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{metric.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current</p>
                  <p className="text-xl font-bold text-medsight-primary">
                    {metric.value}{metric.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Target</p>
                  <p className="text-xl font-bold text-gray-700">
                    {metric.target}{metric.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trend</p>
                  <p className="text-xl font-bold text-gray-700">{metric.trend}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Peer Reviews</h3>
        <div className="space-y-4">
          {peerReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Study: {review.studyId}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  review.status === 'completed' ? 'bg-green-100 text-green-800' :
                  review.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {review.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-500">Reviewer</p>
                  <p className="font-medium text-gray-900">{review.reviewer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reviewee</p>
                  <p className="font-medium text-gray-900">{review.reviewee}</p>
                </div>
              </div>
              {review.status === 'completed' && (
                <div>
                  <p className="text-sm text-gray-500">Score: {review.score}/5</p>
                  <p className="text-sm text-gray-700 mt-1">{review.comments}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Compliance Monitoring</h3>
        <div className="space-y-4">
          {complianceChecks.map((check) => (
            <div key={check.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{check.category} Compliance</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(check.status)}`}>
                  {check.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Last Check</p>
                  <p className="text-sm text-gray-700">{formatDate(check.lastCheck)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Next Check</p>
                  <p className="text-sm text-gray-700">{formatDate(check.nextCheck)}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{check.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Quality Alerts</h3>
        <div className="space-y-4">
          {qualityAlerts.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className={`w-5 h-5 ${getSeverityColor(alert.severity)}`} />
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{formatDate(alert.timestamp)}</p>
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="btn-medsight text-xs"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-medsight-primary/5 to-medsight-secondary/5 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="medsight-glass p-6 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-medsight-primary">Quality Assurance Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and maintain medical quality standards</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshDashboard}
                className="btn-medsight"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>Last updated: {formatDate(new Date())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="medsight-glass p-2 rounded-xl mb-6">
          <nav className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'metrics', label: 'Metrics', icon: DocumentChartBarIcon },
              { id: 'reviews', label: 'Peer Reviews', icon: UserGroupIcon },
              { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
              { id: 'alerts', label: 'Alerts', icon: ExclamationTriangleIcon }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === id
                    ? 'bg-medsight-primary text-white'
                    : 'text-gray-600 hover:bg-medsight-primary/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'metrics' && renderMetrics()}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'compliance' && renderCompliance()}
          {activeTab === 'alerts' && renderAlerts()}
        </div>
      </div>
    </div>
  );
} 