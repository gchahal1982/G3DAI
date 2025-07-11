'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Calendar, 
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface ComplianceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  status: 'compliant' | 'warning' | 'non-compliant';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface ComplianceAudit {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  assignee: string;
  dueDate: Date;
  createdAt: Date;
}

interface ComplianceReport {
  id: string;
  title: string;
  type: 'HIPAA' | 'GDPR' | 'SOC2' | 'Internal';
  status: 'draft' | 'review' | 'approved' | 'published';
  completionRate: number;
  dueDate: Date;
  assignee: string;
}

const ComplianceAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockMetrics: ComplianceMetric[] = [
          {
            id: '1',
            name: 'HIPAA Compliance Score',
            value: 96,
            target: 95,
            status: 'compliant',
            trend: 'up',
            lastUpdated: new Date()
          },
          {
            id: '2',
            name: 'Data Access Controls',
            value: 98,
            target: 100,
            status: 'warning',
            trend: 'stable',
            lastUpdated: new Date()
          },
          {
            id: '3',
            name: 'Audit Trail Coverage',
            value: 92,
            target: 95,
            status: 'warning',
            trend: 'up',
            lastUpdated: new Date()
          },
          {
            id: '4',
            name: 'Encryption Compliance',
            value: 100,
            target: 100,
            status: 'compliant',
            trend: 'stable',
            lastUpdated: new Date()
          },
          {
            id: '5',
            name: 'Privacy Controls',
            value: 89,
            target: 95,
            status: 'non-compliant',
            trend: 'down',
            lastUpdated: new Date()
          },
          {
            id: '6',
            name: 'Staff Training Completion',
            value: 94,
            target: 100,
            status: 'warning',
            trend: 'up',
            lastUpdated: new Date()
          }
        ];

        const mockAudits: ComplianceAudit[] = [
          {
            id: '1',
            type: 'HIPAA Privacy Rule',
            description: 'Review patient data access logs for unauthorized access',
            severity: 'high',
            status: 'open',
            assignee: 'Dr. Sarah Johnson',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            type: 'GDPR Data Processing',
            description: 'Verify consent management system compliance',
            severity: 'medium',
            status: 'in-progress',
            assignee: 'Mark Chen',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          },
          {
            id: '3',
            type: 'SOC2 Security',
            description: 'Test backup and recovery procedures',
            severity: 'critical',
            status: 'open',
            assignee: 'Lisa Rodriguez',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ];

        const mockReports: ComplianceReport[] = [
          {
            id: '1',
            title: 'Q4 2024 HIPAA Compliance Report',
            type: 'HIPAA',
            status: 'review',
            completionRate: 85,
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            assignee: 'Dr. Sarah Johnson'
          },
          {
            id: '2',
            title: 'GDPR Annual Assessment',
            type: 'GDPR',
            status: 'draft',
            completionRate: 42,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            assignee: 'Mark Chen'
          },
          {
            id: '3',
            title: 'SOC2 Type II Audit',
            type: 'SOC2',
            status: 'approved',
            completionRate: 100,
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            assignee: 'Lisa Rodriguez'
          }
        ];

        setMetrics(mockMetrics);
        setAudits(mockAudits);
        setReports(mockReports);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching compliance data:', error);
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, [selectedTimeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'non-compliant': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const overallComplianceScore = metrics.reduce((sum, metric) => sum + metric.value, 0) / metrics.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Analytics</h1>
          <p className="text-gray-600 mt-1">Monitor regulatory compliance and audit requirements</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Overall Compliance Score
          </CardTitle>
          <CardDescription>
            Aggregate compliance rating across all frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-green-600">
              {overallComplianceScore.toFixed(1)}%
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Target: 95%</div>
              <div className="flex items-center mt-1">
                {overallComplianceScore >= 95 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mr-1" />
                )}
                <span className="text-sm">
                  {overallComplianceScore >= 95 ? 'Compliant' : 'Needs Attention'}
                </span>
              </div>
            </div>
          </div>
          <Progress value={overallComplianceScore} className="mt-4" />
        </CardContent>
      </Card>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {metric.name}
                {getStatusIcon(metric.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{metric.value}%</div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <Badge className={getStatusColor(metric.status)} variant="secondary">
                    {metric.status}
                  </Badge>
                </div>
              </div>
              <Progress value={metric.value} className="mb-2" />
              <div className="text-sm text-gray-600">
                Target: {metric.target}% | Last updated: {metric.lastUpdated.toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Audits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Active Audits
          </CardTitle>
          <CardDescription>
            Ongoing compliance audits and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {audits.map((audit) => (
              <div key={audit.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{audit.type}</h3>
                    <Badge className={getSeverityColor(audit.severity)} variant="secondary">
                      {audit.severity}
                    </Badge>
                    <Badge className={getStatusColor(audit.status)} variant="secondary">
                      {audit.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Due: {audit.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{audit.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Assigned to: {audit.assignee}</span>
                  </div>
                  <span>Created: {audit.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Compliance Reports
          </CardTitle>
          <CardDescription>
            Scheduled and ongoing compliance reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{report.title}</h3>
                    <Badge variant="outline">{report.type}</Badge>
                    <Badge className={getStatusColor(report.status)} variant="secondary">
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Due: {report.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Assigned to: {report.assignee}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Progress: {report.completionRate}%
                  </div>
                </div>
                <Progress value={report.completionRate} className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy Controls compliance is below target (89%).</strong> 
            Immediate action required to address patient data access controls.
          </AlertDescription>
        </Alert>
        
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>SOC2 Type II audit due in 2 days.</strong> 
            Ensure all backup and recovery procedures are tested and documented.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ComplianceAnalytics; 