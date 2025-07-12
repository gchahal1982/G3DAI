'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  Progress, 
  Alert, 
  AlertDescription, 
  ScrollArea, 
  Switch, 
  Input, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Textarea, 
  Separator 
} from '../../../../../shared/components/ui';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Activity, 
  BarChart3, 
  Settings, 
  Download, 
  Upload, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Target, 
  Award, 
  Database, 
  Globe, 
  Lock, 
  Key, 
  Book, 
  Bookmark, 
  Flag, 
  Archive, 
  Folder, 
  FileCheck, 
  ClipboardCheck, 
  AlertCircle, 
  Info, 
  Star, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

// Compliance Types
interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  type: 'regulatory' | 'industry' | 'internal' | 'certification';
  status: 'compliant' | 'non_compliant' | 'partial' | 'under_review' | 'not_assessed';
  description: string;
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  assessments: ComplianceAssessment[];
  deadlines: ComplianceDeadline[];
  contacts: ComplianceContact[];
  documents: ComplianceDocument[];
  lastAssessment: Date;
  nextAssessment: Date;
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

interface ComplianceRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'met' | 'not_met' | 'partial' | 'not_applicable' | 'in_progress';
  evidence: Evidence[];
  controls: string[];
  responsible: string;
  dueDate?: Date;
  completedDate?: Date;
  notes: string;
  lastReviewed: Date;
}

interface Evidence {
  id: string;
  type: 'document' | 'screenshot' | 'log' | 'certificate' | 'report' | 'other';
  name: string;
  description: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

interface ComplianceControl {
  id: string;
  name: string;
  type: 'preventive' | 'detective' | 'corrective' | 'directive';
  category: string;
  description: string;
  implementation: string;
  effectiveness: 'effective' | 'needs_improvement' | 'ineffective' | 'not_tested';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  owner: string;
  status: 'active' | 'inactive' | 'draft' | 'retired';
  lastTested: Date;
  nextTest: Date;
  testResults: ControlTest[];
  relatedRequirements: string[];
}

interface ControlTest {
  id: string;
  date: Date;
  tester: string;
  result: 'passed' | 'failed' | 'partially_passed';
  findings: string[];
  recommendations: string[];
  evidence: string[];
}

interface ComplianceAssessment {
  id: string;
  type: 'internal' | 'external' | 'self' | 'regulatory';
  assessor: string;
  startDate: Date;
  endDate: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scope: string[];
  methodology: string;
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendation[];
  score: number;
  reportUrl?: string;
  nextAssessment?: Date;
}

interface AssessmentFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo: string;
  dueDate: Date;
  resolvedDate?: Date;
  evidence: string[];
}

interface AssessmentRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  cost: 'low' | 'medium' | 'high';
  timeline: string;
  assignedTo: string;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
}

interface ComplianceDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  type: 'filing' | 'assessment' | 'renewal' | 'review' | 'training';
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  responsible: string;
  framework: string;
  reminder: boolean;
  reminderDays: number;
}

interface ComplianceContact {
  role: 'owner' | 'coordinator' | 'assessor' | 'reviewer' | 'approver';
  name: string;
  email: string;
  phone?: string;
  department: string;
}

interface ComplianceDocument {
  id: string;
  name: string;
  type: 'policy' | 'procedure' | 'standard' | 'guideline' | 'form' | 'template' | 'report';
  version: string;
  status: 'draft' | 'under_review' | 'approved' | 'active' | 'archived';
  url: string;
  description: string;
  author: string;
  reviewer?: string;
  approver?: string;
  createdAt: Date;
  updatedAt: Date;
  nextReview: Date;
  relatedFrameworks: string[];
}

interface ComplianceMetrics {
  totalFrameworks: number;
  compliantFrameworks: number;
  overallScore: number;
  highRiskCount: number;
  openFindings: number;
  upcomingDeadlines: number;
  completedAssessments: number;
  pendingActions: number;
  trendData: TrendData[];
}

interface TrendData {
  period: string;
  score: number;
  compliantCount: number;
  findingsCount: number;
}

interface CompliancePolicy {
  id: string;
  name: string;
  version: string;
  type: 'security' | 'privacy' | 'operational' | 'financial' | 'hr' | 'it' | 'legal';
  status: 'draft' | 'under_review' | 'approved' | 'active' | 'archived';
  description: string;
  scope: string;
  applicability: string;
  content: string;
  owner: string;
  reviewer: string;
  approver: string;
  effectiveDate: Date;
  reviewDate: Date;
  nextReview: Date;
  relatedFrameworks: string[];
  relatedPolicies: string[];
  trainingRequired: boolean;
  acknowledgmentRequired: boolean;
  exceptions: PolicyException[];
  violations: PolicyViolation[];
  createdAt: Date;
  updatedAt: Date;
}

interface PolicyException {
  id: string;
  requestor: string;
  reason: string;
  approver: string;
  approvedDate: Date;
  expiryDate: Date;
  conditions: string[];
}

interface PolicyViolation {
  id: string;
  violator: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  reportedDate: Date;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution: string;
  resolvedBy?: string;
  resolvedDate?: Date;
}

export default function ComplianceManager() {
  // State management
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [policies, setPolicies] = useState<CompliancePolicy[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Backend connection
  const complianceRef = useRef<any>(null);

  // Initialize
  useEffect(() => {
    const initializeCompliance = async () => {
      try {
        complianceRef.current = {
          getFrameworks: async () => generateMockFrameworks(),
          getPolicies: async () => generateMockPolicies(),
          getMetrics: async () => generateMockMetrics(),
          updateFramework: async (id: string, data: Partial<ComplianceFramework>) => {
            setFrameworks(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
          },
          runAssessment: async (frameworkId: string) => {
            const framework = frameworks.find(f => f.id === frameworkId);
            if (framework) {
              const newScore = 75 + Math.random() * 20;
              setFrameworks(prev => prev.map(f => 
                f.id === frameworkId ? {
                  ...f,
                  score: newScore,
                  status: newScore >= 90 ? 'compliant' : newScore >= 70 ? 'partial' : 'non_compliant',
                  lastAssessment: new Date()
                } : f
              ));
            }
          },
          createFramework: async (frameworkData: Partial<ComplianceFramework>) => {
            const newFramework = {
              ...frameworkData,
              id: `framework_${Date.now()}`,
              status: 'not_assessed' as const,
              score: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setFrameworks(prev => [...prev, newFramework as ComplianceFramework]);
          }
        };

        const [frameworksData, policiesData, metricsData] = await Promise.all([
          complianceRef.current.getFrameworks(),
          complianceRef.current.getPolicies(),
          complianceRef.current.getMetrics()
        ]);

        setFrameworks(frameworksData);
        setPolicies(policiesData);
        setMetrics(metricsData);
        setSelectedFramework(frameworksData[0] || null);

      } catch (error) {
        console.error('Failed to initialize compliance:', error);
        setError('Failed to initialize compliance management');
      }
    };

    initializeCompliance();
  }, []);

  // Actions
  const runAssessment = useCallback(async (frameworkId: string) => {
    try {
      await complianceRef.current?.runAssessment(frameworkId);
      setShowAssessmentModal(false);
    } catch (error) {
      console.error('Failed to run assessment:', error);
      setError('Failed to run compliance assessment');
    }
  }, []);

  const createFramework = useCallback(async (frameworkData: Partial<ComplianceFramework>) => {
    try {
      await complianceRef.current?.createFramework(frameworkData);
      setShowFrameworkModal(false);
    } catch (error) {
      console.error('Failed to create framework:', error);
      setError('Failed to create compliance framework');
    }
  }, []);

  // Utilities
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': case 'met': case 'passed': case 'effective': return 'bg-green-500';
      case 'partial': case 'partially_passed': case 'needs_improvement': return 'bg-yellow-500';
      case 'non_compliant': case 'not_met': case 'failed': case 'ineffective': return 'bg-red-500';
      case 'under_review': case 'in_progress': case 'scheduled': return 'bg-blue-500';
      case 'not_assessed': case 'not_applicable': case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter frameworks
  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = framework.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         framework.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || framework.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Mock data generators
  const generateMockFrameworks = (): ComplianceFramework[] => {
    return [
      {
        id: 'soc2',
        name: 'SOC 2 Type II',
        version: '2017',
        type: 'certification',
        status: 'compliant',
        description: 'Service Organization Control 2 Type II audit for security, availability, and confidentiality',
        requirements: [
          {
            id: 'cc1.1',
            code: 'CC1.1',
            title: 'Control Environment',
            description: 'The entity demonstrates a commitment to integrity and ethical values',
            category: 'Control Environment',
            priority: 'high',
            status: 'met',
            evidence: [
              {
                id: 'ev1',
                type: 'document',
                name: 'Code of Conduct',
                description: 'Company code of conduct document',
                url: '/documents/code-of-conduct.pdf',
                uploadedBy: 'admin@company.com',
                uploadedAt: new Date(),
                verified: true,
                verifiedBy: 'auditor@company.com',
                verifiedAt: new Date()
              }
            ],
            controls: ['ctrl1'],
            responsible: 'CISO',
            completedDate: new Date(),
            notes: 'Documented and implemented across organization',
            lastReviewed: new Date()
          }
        ],
        controls: [
          {
            id: 'ctrl1',
            name: 'Access Review Process',
            type: 'detective',
            category: 'Access Control',
            description: 'Quarterly review of user access rights',
            implementation: 'Automated review process with manual validation',
            effectiveness: 'effective',
            frequency: 'quarterly',
            owner: 'IT Security Team',
            status: 'active',
            lastTested: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextTest: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            testResults: [
              {
                id: 'test1',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                tester: 'Security Auditor',
                result: 'passed',
                findings: [],
                recommendations: ['Consider automating more of the review process'],
                evidence: ['audit-report-q1.pdf']
              }
            ],
            relatedRequirements: ['cc1.1']
          }
        ],
        assessments: [
          {
            id: 'assess1',
            type: 'external',
            assessor: 'Big Four Auditing Firm',
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            status: 'completed',
            scope: ['Security', 'Availability', 'Confidentiality'],
            methodology: 'SOC 2 Type II Audit Standards',
            findings: [
              {
                id: 'finding1',
                category: 'Access Control',
                severity: 'medium',
                title: 'Privileged Access Review',
                description: 'Some privileged accounts not reviewed within required timeframe',
                impact: 'Potential for unauthorized access',
                recommendation: 'Implement automated alerts for overdue reviews',
                status: 'resolved',
                assignedTo: 'IT Security Team',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                resolvedDate: new Date(),
                evidence: ['access-review-report.pdf']
              }
            ],
            recommendations: [
              {
                id: 'rec1',
                priority: 'medium',
                title: 'Automated Access Reviews',
                description: 'Implement automated access review system',
                implementation: 'Deploy identity governance solution',
                effort: 'medium',
                cost: 'medium',
                timeline: '3 months',
                assignedTo: 'IT Team',
                status: 'in_progress'
              }
            ],
            score: 94.2,
            reportUrl: '/reports/soc2-audit-2023.pdf',
            nextAssessment: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        ],
        deadlines: [
          {
            id: 'deadline1',
            title: 'Annual SOC 2 Audit',
            description: 'Annual SOC 2 Type II audit requirement',
            dueDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
            type: 'assessment',
            status: 'upcoming',
            responsible: 'CISO',
            framework: 'soc2',
            reminder: true,
            reminderDays: 30
          }
        ],
        contacts: [
          { role: 'owner', name: 'Chief Information Security Officer', email: 'ciso@company.com', department: 'Security' },
          { role: 'coordinator', name: 'Compliance Manager', email: 'compliance@company.com', phone: '+1-555-0123', department: 'Risk' }
        ],
        documents: [
          {
            id: 'doc1',
            name: 'Information Security Policy',
            type: 'policy',
            version: '2.1',
            status: 'active',
            url: '/policies/information-security-policy.pdf',
            description: 'Comprehensive information security policy',
            author: 'CISO',
            reviewer: 'Legal Team',
            approver: 'CEO',
            createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextReview: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
            relatedFrameworks: ['soc2']
          }
        ],
        lastAssessment: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        score: 94.2,
        riskLevel: 'low',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: 'gdpr',
        name: 'GDPR',
        version: '2018',
        type: 'regulatory',
        status: 'partial',
        description: 'General Data Protection Regulation compliance framework',
        requirements: [
          {
            id: 'art25',
            code: 'Article 25',
            title: 'Data Protection by Design and by Default',
            description: 'Implement appropriate technical and organizational measures',
            category: 'Data Protection',
            priority: 'critical',
            status: 'partial',
            evidence: [],
            controls: [],
            responsible: 'Data Protection Officer',
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            notes: 'Implementation in progress',
            lastReviewed: new Date()
          }
        ],
        controls: [],
        assessments: [],
        deadlines: [],
        contacts: [
          { role: 'owner', name: 'Data Protection Officer', email: 'dpo@company.com', department: 'Legal' }
        ],
        documents: [],
        lastAssessment: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        score: 72.8,
        riskLevel: 'medium',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
  };

  const generateMockPolicies = (): CompliancePolicy[] => {
    return [
      {
        id: 'policy1',
        name: 'Information Security Policy',
        version: '2.1',
        type: 'security',
        status: 'active',
        description: 'Comprehensive information security policy covering all aspects of data protection',
        scope: 'All employees, contractors, and third parties with access to company systems',
        applicability: 'Entire organization',
        content: 'Detailed policy content...',
        owner: 'CISO',
        reviewer: 'Legal Team',
        approver: 'CEO',
        effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        reviewDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextReview: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
        relatedFrameworks: ['soc2', 'iso27001'],
        relatedPolicies: [],
        trainingRequired: true,
        acknowledgmentRequired: true,
        exceptions: [],
        violations: [],
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ];
  };

  const generateMockMetrics = (): ComplianceMetrics => {
    return {
      totalFrameworks: frameworks.length || 2,
      compliantFrameworks: 1,
      overallScore: 83.5,
      highRiskCount: 1,
      openFindings: 3,
      upcomingDeadlines: 2,
      completedAssessments: 1,
      pendingActions: 5,
      trendData: Array.from({ length: 6 }, (_, i) => ({
        period: `Q${i + 1}`,
        score: 70 + Math.random() * 25,
        compliantCount: Math.floor(Math.random() * 3),
        findingsCount: Math.floor(Math.random() * 10)
      }))
    };
  };

  if (!metrics) {
    return (
      <div className="compliance-manager p-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Loading Compliance Data</h3>
          <p className="text-gray-600">Initializing compliance management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="compliance-manager p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Compliance Management</h2>
            <p className="text-gray-600">Monitor and manage regulatory compliance frameworks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAssessmentModal(true)}>
            <Activity className="h-4 w-4 mr-2" />
            Run Assessment
          </Button>
          <Button onClick={() => setShowFrameworkModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Framework
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.overallScore.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliant Frameworks</p>
                <p className="text-2xl font-bold text-green-600">{metrics.compliantFrameworks}/{metrics.totalFrameworks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Findings</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.openFindings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-red-600">{metrics.upcomingDeadlines}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Compliance Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{metrics.overallScore.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Overall Compliance Score</div>
                  <Progress value={metrics.overallScore} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{metrics.compliantFrameworks}</div>
                  <div className="text-sm text-gray-600">Fully Compliant</div>
                  <div className="text-xs text-gray-500 mt-1">out of {metrics.totalFrameworks} frameworks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{metrics.highRiskCount}</div>
                  <div className="text-sm text-gray-600">High Risk Items</div>
                  <div className="text-xs text-gray-500 mt-1">require immediate attention</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {frameworks.slice(0, 3).map((framework) => (
                    <div key={framework.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{framework.name}</div>
                        <div className="text-sm text-gray-600">
                          Last assessed: {framework.lastAssessment.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(framework.status)} text-white`}>
                          {framework.status}
                        </Badge>
                        <span className="text-sm font-medium">{framework.score.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {frameworks.flatMap(f => f.deadlines).slice(0, 3).map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{deadline.title}</div>
                        <div className="text-sm text-gray-600">
                          Due: {deadline.dueDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(deadline.status)} text-white`}>
                          {deadline.status}
                        </Badge>
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          {/* Framework Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search frameworks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Frameworks List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFrameworks.map((framework) => (
              <Card key={framework.id} className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFramework?.id === framework.id ? 'ring-2 ring-primary' : ''
              }`} onClick={() => setSelectedFramework(framework)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{framework.name}</CardTitle>
                      <p className="text-sm text-gray-600">{framework.type} • v{framework.version}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRiskColor(framework.riskLevel)} text-white`}>
                        {framework.riskLevel} risk
                      </Badge>
                      <Badge className={`${getStatusColor(framework.status)} text-white`}>
                        {framework.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{framework.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Score:</span>
                      <span className="ml-2 font-bold text-blue-600">{framework.score.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Requirements:</span>
                      <span className="ml-2 font-medium">{framework.requirements.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Assessment:</span>
                      <span className="ml-2 font-medium">{framework.lastAssessment.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Next Assessment:</span>
                      <span className="ml-2 font-medium">{framework.nextAssessment.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Progress</Label>
                    <Progress value={framework.score} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
                      e.stopPropagation();
                      runAssessment(framework.id);
                    }}>
                      <Activity className="h-4 w-4 mr-2" />
                      Assess
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frameworks.flatMap(f => f.assessments).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{assessment.type} Assessment</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {assessment.assessor} • {assessment.startDate.toLocaleDateString()} - {assessment.endDate.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Scope: {assessment.scope.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{assessment.score.toFixed(1)}%</div>
                      <Badge className={`${getStatusColor(assessment.status)} text-white`}>
                        {assessment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          {/* Policies List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{policy.name}</CardTitle>
                      <p className="text-sm text-gray-600">{policy.type} • v{policy.version}</p>
                    </div>
                    <Badge className={`${getStatusColor(policy.status)} text-white`}>
                      {policy.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{policy.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Owner:</span>
                      <span className="ml-2 font-medium">{policy.owner}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Effective:</span>
                      <span className="ml-2 font-medium">{policy.effectiveDate.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Next Review:</span>
                      <span className="ml-2 font-medium">{policy.nextReview.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Training:</span>
                      <span className="ml-2 font-medium">{policy.trainingRequired ? 'Required' : 'Optional'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-6">
          {/* Compliance Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">Executive Summary</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Framework Status</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="text-sm">Risk Assessment</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Audit Trail</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Clock className="h-6 w-6" />
                  <span className="text-sm">Deadline Report</span>
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Target className="h-6 w-6" />
                  <span className="text-sm">KPI Dashboard</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Framework Modal */}
      {showFrameworkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Add Compliance Framework</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Framework Name</Label>
                  <Input placeholder="e.g., ISO 27001" />
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input placeholder="e.g., 2013" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="industry">Industry Standard</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="internal">Internal Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Risk Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the compliance framework..." rows={3} />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowFrameworkModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => createFramework({
                  name: 'New Framework',
                  version: '1.0',
                  type: 'industry',
                  description: 'New compliance framework',
                  riskLevel: 'medium'
                })}>
                  Add Framework
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 