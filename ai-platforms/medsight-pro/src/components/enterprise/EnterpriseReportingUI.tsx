'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, ChartBarIcon, CalendarIcon, ClockIcon,
  FunnelIcon, MagnifyingGlassIcon, ArrowPathIcon, CloudArrowDownIcon,
  PrinterIcon, ShareIcon, EyeIcon, PencilIcon, TrashIcon,
  PlusIcon, CheckCircleIcon, ExclamationTriangleIcon,
  InformationCircleIcon, XMarkIcon, ChevronDownIcon,
  ChartPieIcon, PresentationChartLineIcon, TableCellsIcon,
  BanknotesIcon, UsersIcon, HeartIcon, BeakerIcon,
  ShieldCheckIcon, LockClosedIcon, AcademicCapIcon,
  BuildingOfficeIcon, GlobeAltIcon, CpuChipIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, StarIcon,
  FireIcon, BoltIcon, SparklesIcon, LightBulbIcon,
  PhotoIcon, FilmIcon, DocumentArrowDownIcon,
  FolderOpenIcon, ArchiveBoxIcon, TagIcon,
  ClipboardDocumentListIcon, ClipboardDocumentCheckIcon,
  EnvelopeIcon, PhoneIcon, MapPinIcon, HomeIcon,
  CreditCardIcon, BanknotesIcon as CurrencyIcon,
  ScaleIcon, ScaleIcon as GavelIcon, DocumentCheckIcon, PlayIcon
} from '@heroicons/react/24/outline';

interface ReportTemplate {
  id: string;
  name: string;
  category: 'financial' | 'medical' | 'operational' | 'compliance' | 'performance' | 'executive';
  type: 'automated' | 'custom' | 'scheduled';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'on-demand';
  lastGenerated: string;
  nextScheduled?: string;
  parameters: {
    dateRange: string;
    organizations: string[];
    metrics: string[];
    format: 'pdf' | 'excel' | 'powerpoint' | 'dashboard';
  };
  metrics: {
    sections: number;
    charts: number;
    tables: number;
    pages: number;
  };
  access: {
    roles: string[];
    users: string[];
    public: boolean;
  };
  status: 'active' | 'draft' | 'archived' | 'generating';
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    sox: boolean;
    medical: boolean;
  };
}

interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  title: string;
  category: string;
  generatedDate: string;
  generatedBy: string;
  dataRange: {
    startDate: string;
    endDate: string;
  };
  format: string;
  size: string;
  pages: number;
  status: 'completed' | 'generating' | 'failed' | 'queued';
  downloadUrl?: string;
  summary: {
    keyFindings: string[];
    recommendations: string[];
    riskFactors: string[];
  };
  metadata: {
    version: string;
    confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
    retention: string;
    classification: string;
  };
  recipients: {
    internal: string[];
    external: string[];
    distribution: 'automatic' | 'manual' | 'approval-required';
  };
  compliance: {
    approved: boolean;
    reviewer: string;
    approvalDate: string;
    complianceNotes: string[];
  };
}

interface ReportMetrics {
  generated: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
  };
  categories: {
    financial: number;
    medical: number;
    operational: number;
    compliance: number;
    performance: number;
    executive: number;
  };
  formats: {
    pdf: number;
    excel: number;
    powerpoint: number;
    dashboard: number;
  };
  usage: {
    downloads: number;
    views: number;
    shares: number;
    prints: number;
  };
  performance: {
    avgGenerationTime: number;
    successRate: number;
    failureRate: number;
    queueTime: number;
  };
}

const EnterpriseReportingUI: React.FC = () => {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [reportMetrics, setReportMetrics] = useState<ReportMetrics | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'templates' | 'reports' | 'analytics'>('templates');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Initialize reporting data
  useEffect(() => {
    const mockTemplates: ReportTemplate[] = [
      {
        id: 'template-001',
        name: 'Executive Financial Summary',
        category: 'financial',
        type: 'scheduled',
        description: 'Comprehensive financial performance report for executive leadership',
        frequency: 'monthly',
        lastGenerated: '2024-01-31T23:59:00Z',
        nextScheduled: '2024-02-29T23:59:00Z',
        parameters: {
          dateRange: 'monthly',
          organizations: ['all'],
          metrics: ['revenue', 'growth', 'churn', 'arpu', 'ltv'],
          format: 'pdf'
        },
        metrics: {
          sections: 8,
          charts: 12,
          tables: 6,
          pages: 24
        },
        access: {
          roles: ['CEO', 'CFO', 'COO', 'Board'],
          users: [],
          public: false
        },
        status: 'active',
        compliance: {
          hipaa: false,
          gdpr: true,
          sox: true,
          medical: false
        }
      },
      {
        id: 'template-002',
        name: 'Medical Quality Assurance Report',
        category: 'medical',
        type: 'automated',
        description: 'Medical quality metrics, patient outcomes, and compliance assessment',
        frequency: 'weekly',
        lastGenerated: '2024-01-14T06:00:00Z',
        nextScheduled: '2024-01-21T06:00:00Z',
        parameters: {
          dateRange: 'weekly',
          organizations: ['medical'],
          metrics: ['quality', 'safety', 'outcomes', 'compliance'],
          format: 'pdf'
        },
        metrics: {
          sections: 6,
          charts: 8,
          tables: 10,
          pages: 18
        },
        access: {
          roles: ['Medical Director', 'Quality Assurance', 'Compliance'],
          users: [],
          public: false
        },
        status: 'active',
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: false,
          medical: true
        }
      },
      {
        id: 'template-003',
        name: 'AI Performance Analytics',
        category: 'performance',
        type: 'automated',
        description: 'AI model performance, accuracy metrics, and usage analytics',
        frequency: 'daily',
        lastGenerated: '2024-01-15T06:00:00Z',
        nextScheduled: '2024-01-16T06:00:00Z',
        parameters: {
          dateRange: 'daily',
          organizations: ['all'],
          metrics: ['accuracy', 'usage', 'performance', 'errors'],
          format: 'dashboard'
        },
        metrics: {
          sections: 4,
          charts: 15,
          tables: 8,
          pages: 12
        },
        access: {
          roles: ['AI Team', 'Data Scientists', 'Engineering'],
          users: [],
          public: false
        },
        status: 'active',
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: false,
          medical: true
        }
      },
      {
        id: 'template-004',
        name: 'Regulatory Compliance Report',
        category: 'compliance',
        type: 'scheduled',
        description: 'HIPAA, FDA, and medical compliance status across all organizations',
        frequency: 'quarterly',
        lastGenerated: '2024-01-01T00:00:00Z',
        nextScheduled: '2024-04-01T00:00:00Z',
        parameters: {
          dateRange: 'quarterly',
          organizations: ['all'],
          metrics: ['hipaa', 'fda', 'gdpr', 'audit', 'security'],
          format: 'pdf'
        },
        metrics: {
          sections: 10,
          charts: 6,
          tables: 15,
          pages: 32
        },
        access: {
          roles: ['Compliance Officer', 'Legal', 'CEO', 'Auditors'],
          users: [],
          public: false
        },
        status: 'active',
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: true,
          medical: true
        }
      },
      {
        id: 'template-005',
        name: 'Customer Success Dashboard',
        category: 'operational',
        type: 'automated',
        description: 'Customer satisfaction, usage patterns, and success metrics',
        frequency: 'weekly',
        lastGenerated: '2024-01-14T12:00:00Z',
        nextScheduled: '2024-01-21T12:00:00Z',
        parameters: {
          dateRange: 'weekly',
          organizations: ['all'],
          metrics: ['satisfaction', 'usage', 'support', 'retention'],
          format: 'dashboard'
        },
        metrics: {
          sections: 5,
          charts: 10,
          tables: 6,
          pages: 15
        },
        access: {
          roles: ['Customer Success', 'Support', 'Sales'],
          users: [],
          public: false
        },
        status: 'active',
        compliance: {
          hipaa: true,
          gdpr: true,
          sox: false,
          medical: false
        }
      }
    ];
    setReportTemplates(mockTemplates);

    const mockReports: GeneratedReport[] = [
      {
        id: 'report-001',
        templateId: 'template-001',
        templateName: 'Executive Financial Summary',
        title: 'Executive Financial Summary - January 2024',
        category: 'financial',
        generatedDate: '2024-01-31T23:59:00Z',
        generatedBy: 'System Automation',
        dataRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        },
        format: 'pdf',
        size: '2.4 MB',
        pages: 24,
        status: 'completed',
        downloadUrl: '/reports/executive-financial-jan-2024.pdf',
        summary: {
          keyFindings: [
            'Monthly revenue increased 15.2% to $2.34M',
            'Customer acquisition cost decreased 12%',
            'Enterprise segment drove 68% of growth'
          ],
          recommendations: [
            'Increase investment in enterprise sales',
            'Optimize mid-market pricing strategy',
            'Expand customer success programs'
          ],
          riskFactors: [
            'Potential economic downturn impact',
            'Increased competition in medical AI',
            'Regulatory changes in healthcare'
          ]
        },
        metadata: {
          version: '1.0',
          confidentiality: 'confidential',
          retention: '7 years',
          classification: 'Financial'
        },
        recipients: {
          internal: ['CEO', 'CFO', 'COO', 'Board Members'],
          external: [],
          distribution: 'automatic'
        },
        compliance: {
          approved: true,
          reviewer: 'CFO',
          approvalDate: '2024-01-31T23:59:00Z',
          complianceNotes: ['SOX compliance verified', 'Financial data validated']
        }
      },
      {
        id: 'report-002',
        templateId: 'template-002',
        templateName: 'Medical Quality Assurance Report',
        title: 'Medical Quality Assurance - Week 2, January 2024',
        category: 'medical',
        generatedDate: '2024-01-14T06:00:00Z',
        generatedBy: 'Quality Assurance System',
        dataRange: {
          startDate: '2024-01-08',
          endDate: '2024-01-14'
        },
        format: 'pdf',
        size: '1.8 MB',
        pages: 18,
        status: 'completed',
        downloadUrl: '/reports/medical-quality-week2-jan-2024.pdf',
        summary: {
          keyFindings: [
            'Patient satisfaction improved to 4.8/5',
            'AI diagnostic accuracy reached 94.2%',
            'Medical error rate decreased to 0.007%'
          ],
          recommendations: [
            'Implement additional AI training modules',
            'Expand peer review programs',
            'Enhance patient communication protocols'
          ],
          riskFactors: [
            'Staff shortages in radiology',
            'Equipment maintenance delays',
            'Training compliance gaps'
          ]
        },
        metadata: {
          version: '1.0',
          confidentiality: 'internal',
          retention: '10 years',
          classification: 'Medical'
        },
        recipients: {
          internal: ['Medical Director', 'Quality Team', 'Compliance'],
          external: [],
          distribution: 'automatic'
        },
        compliance: {
          approved: true,
          reviewer: 'Medical Director',
          approvalDate: '2024-01-14T08:00:00Z',
          complianceNotes: ['HIPAA compliance verified', 'Medical standards met']
        }
      },
      {
        id: 'report-003',
        templateId: 'template-003',
        templateName: 'AI Performance Analytics',
        title: 'AI Performance Analytics - January 15, 2024',
        category: 'performance',
        generatedDate: '2024-01-15T06:00:00Z',
        generatedBy: 'AI Analytics System',
        dataRange: {
          startDate: '2024-01-14',
          endDate: '2024-01-15'
        },
        format: 'dashboard',
        size: '890 KB',
        pages: 12,
        status: 'completed',
        summary: {
          keyFindings: [
            'Model accuracy stable at 94.2%',
            'Processing time improved 8%',
            'Usage increased 23% week-over-week'
          ],
          recommendations: [
            'Optimize model inference speed',
            'Expand training datasets',
            'Implement additional validation'
          ],
          riskFactors: [
            'Model drift detection needed',
            'Computational cost increases',
            'Data quality variations'
          ]
        },
        metadata: {
          version: '1.0',
          confidentiality: 'internal',
          retention: '3 years',
          classification: 'Technical'
        },
        recipients: {
          internal: ['AI Team', 'Engineering', 'Data Scientists'],
          external: [],
          distribution: 'automatic'
        },
        compliance: {
          approved: true,
          reviewer: 'AI Lead',
          approvalDate: '2024-01-15T07:00:00Z',
          complianceNotes: ['Technical review completed', 'Performance validated']
        }
      }
    ];
    setGeneratedReports(mockReports);

    const mockMetrics: ReportMetrics = {
      generated: {
        total: 1247,
        thisMonth: 89,
        thisWeek: 23,
        today: 5
      },
      categories: {
        financial: 234,
        medical: 456,
        operational: 189,
        compliance: 123,
        performance: 167,
        executive: 78
      },
      formats: {
        pdf: 678,
        excel: 234,
        powerpoint: 156,
        dashboard: 179
      },
      usage: {
        downloads: 3456,
        views: 12345,
        shares: 567,
        prints: 234
      },
      performance: {
        avgGenerationTime: 45,
        successRate: 98.7,
        failureRate: 1.3,
        queueTime: 12
      }
    };
    setReportMetrics(mockMetrics);
  }, []);

  const handleGenerateReport = async (templateId: string) => {
    setIsGeneratingReport(true);
    // Connect to backend EnterpriseReporting.ts
    console.log('Generating report from template:', templateId);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGeneratingReport(false);
  };

  const handleDeleteReport = (reportId: string) => {
    setGeneratedReports(prev => prev.filter(report => report.id !== reportId));
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    console.log('Downloading report:', report.title);
    // Implement download functionality
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'generating': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'queued': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'generating': return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      case 'failed': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'queued': return <ClockIcon className="w-4 h-4" />;
      default: return <InformationCircleIcon className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial': return <BanknotesIcon className="w-5 h-5 text-green-600" />;
      case 'medical': return <HeartIcon className="w-5 h-5 text-red-600" />;
      case 'operational': return <CpuChipIcon className="w-5 h-5 text-blue-600" />;
      case 'compliance': return <ShieldCheckIcon className="w-5 h-5 text-purple-600" />;
      case 'performance': return <ChartBarIcon className="w-5 h-5 text-orange-600" />;
      case 'executive': return <StarIcon className="w-5 h-5 text-yellow-600" />;
      default: return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800';
      case 'weekly': return 'bg-orange-100 text-orange-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annually': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const filteredTemplates = reportTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredReports = generatedReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.templateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="medsight-glass p-6 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medsight-primary/10 rounded-xl">
              <DocumentTextIcon className="w-8 h-8 text-medsight-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-medsight-primary">Enterprise Reporting</h2>
              <p className="text-gray-600">Business analytics and medical reporting system</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-medsight"
            >
              <option value="all">All Categories</option>
              <option value="financial">Financial</option>
              <option value="medical">Medical</option>
              <option value="operational">Operational</option>
              <option value="compliance">Compliance</option>
              <option value="performance">Performance</option>
              <option value="executive">Executive</option>
            </select>
            <button 
              onClick={() => setIsCreatingTemplate(true)}
              className="btn-medsight"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Template
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports and templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('templates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'templates'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ClipboardDocumentListIcon className="w-4 h-4 mr-2 inline" />
            Templates ({reportTemplates.length})
          </button>
          <button
            onClick={() => setViewMode('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'reports'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <DocumentTextIcon className="w-4 h-4 mr-2 inline" />
            Reports ({generatedReports.length})
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'analytics'
                ? 'bg-medsight-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChartBarIcon className="w-4 h-4 mr-2 inline" />
            Analytics
          </button>
        </div>
      </div>

      {/* Templates View */}
      {viewMode === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
              className="medsight-glass p-6 rounded-xl border border-gray-200 hover:border-medsight-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(template.category)}
                  <div>
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getFrequencyColor(template.frequency)}`}>
                    {template.frequency}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    template.status === 'active' ? 'bg-green-100 text-green-800' :
                    template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {template.status}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{template.description}</p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Sections:</span>
                    <span className="font-medium ml-2">{template.metrics.sections}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Charts:</span>
                    <span className="font-medium ml-2">{template.metrics.charts}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pages:</span>
                    <span className="font-medium ml-2">{template.metrics.pages}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium ml-2 uppercase">{template.parameters.format}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Last Generated:</span>
                  <span className="font-medium ml-2">
                    {new Date(template.lastGenerated).toLocaleDateString()}
                  </span>
                </div>

                {template.nextScheduled && (
                  <div className="text-sm">
                    <span className="text-gray-600">Next Scheduled:</span>
                    <span className="font-medium ml-2">
                      {new Date(template.nextScheduled).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-4 text-xs">
                  {template.compliance.hipaa && (
                    <span className="flex items-center space-x-1 text-green-600">
                      <ShieldCheckIcon className="w-3 h-3" />
                      <span>HIPAA</span>
                    </span>
                  )}
                  {template.compliance.medical && (
                    <span className="flex items-center space-x-1 text-blue-600">
                      <HeartIcon className="w-3 h-3" />
                      <span>Medical</span>
                    </span>
                  )}
                  {template.compliance.sox && (
                    <span className="flex items-center space-x-1 text-purple-600">
                      <ScaleIcon className="w-3 h-3" />
                      <span>SOX</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleGenerateReport(template.id)}
                  className="flex-1 btn-medsight text-sm"
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <PlayIcon className="w-4 h-4 mr-1" />
                  )}
                  Generate
                </button>
                <button className="p-2 text-gray-600 hover:text-medsight-primary">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports View */}
      {viewMode === 'reports' && (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id}
              className="medsight-glass p-6 rounded-xl border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getCategoryIcon(report.category)}
                    <div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.templateName}</p>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span className="font-medium capitalize">{report.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Key Findings</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.summary.keyFindings.map((finding, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircleIcon className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.summary.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <LightBulbIcon className="w-3 h-3 text-yellow-600 mt-1 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.summary.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <ExclamationTriangleIcon className="w-3 h-3 text-red-600 mt-1 flex-shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-4">
                      <span>Generated: {new Date(report.generatedDate).toLocaleDateString()}</span>
                      <span>By: {report.generatedBy}</span>
                      <span>Size: {report.size}</span>
                      <span>Pages: {report.pages}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        report.metadata.confidentiality === 'public' ? 'bg-gray-100 text-gray-800' :
                        report.metadata.confidentiality === 'internal' ? 'bg-blue-100 text-blue-800' :
                        report.metadata.confidentiality === 'confidential' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.metadata.confidentiality}
                      </span>
                      {report.compliance.approved && (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span className="text-xs">Approved</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button 
                    onClick={() => handleDownloadReport(report)}
                    className="p-2 text-gray-600 hover:text-medsight-primary"
                    disabled={report.status !== 'completed'}
                  >
                    <CloudArrowDownIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-medsight-primary">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-medsight-primary">
                    <ShareIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-medsight-primary">
                    <PrinterIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && reportMetrics && (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-medsight-primary">
                    {reportMetrics.generated.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-medsight-normal">
                    +{reportMetrics.generated.thisMonth} this month
                  </p>
                </div>
                <DocumentTextIcon className="w-8 h-8 text-medsight-primary" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-medsight-normal">
                    {reportMetrics.performance.successRate}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg: {reportMetrics.performance.avgGenerationTime}s
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-medsight-normal" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold text-medsight-accent">
                    {reportMetrics.usage.downloads.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {reportMetrics.usage.views.toLocaleString()} views
                  </p>
                </div>
                <CloudArrowDownIcon className="w-8 h-8 text-medsight-accent" />
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Queue Time</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {reportMetrics.performance.queueTime}s
                  </p>
                  <p className="text-sm text-gray-600">
                    {reportMetrics.performance.failureRate}% failed
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="medsight-glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-medsight-primary mb-4">Reports by Category</h3>
              <div className="space-y-3">
                {Object.entries(reportMetrics.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-medsight-primary h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(reportMetrics.categories))) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="medsight-glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-medsight-primary mb-4">Format Distribution</h3>
              <div className="space-y-3">
                {Object.entries(reportMetrics.formats).map(([format, count]) => (
                  <div key={format} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium uppercase">{format}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-medsight-secondary h-2 rounded-full"
                          style={{ width: `${(count / Math.max(...Object.values(reportMetrics.formats))) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Medical Compliance Footer */}
      <div className="medsight-glass p-4 rounded-xl border border-medsight-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-medsight-normal" />
            <span className="text-sm font-medium text-medsight-normal">Enterprise Reporting Compliance</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-medsight-normal">HIPAA Compliant Reports</span>
            <span className="text-medsight-normal">SOX Financial Compliance</span>
            <span className="text-medsight-normal">Medical Data Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseReportingUI; 