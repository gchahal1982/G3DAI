import React from 'react';
import { 
  FileText, Shield, CheckCircle, AlertTriangle, 
  Clock, Award, Book, Users, Activity, 
  Calendar, Download, RefreshCw, Settings
} from 'lucide-react';

interface MedicalComplianceProps {
  className?: string;
}

export default function MedicalCompliance({ className = '' }: MedicalComplianceProps) {
  const complianceOverview = [
    {
      category: 'HIPAA Compliance',
      score: 100,
      status: 'compliant',
      lastAudit: '2 weeks ago',
      nextAudit: '6 months',
      icon: Shield
    },
    {
      category: 'DICOM Standards',
      score: 98,
      status: 'compliant',
      lastAudit: '1 month ago',
      nextAudit: '3 months',
      icon: FileText
    },
    {
      category: 'FDA Class II',
      score: 96,
      status: 'compliant',
      lastAudit: '3 months ago',
      nextAudit: '1 year',
      icon: Award
    },
    {
      category: 'HL7 FHIR',
      score: 94,
      status: 'warning',
      lastAudit: '2 months ago',
      nextAudit: '4 months',
      icon: Activity
    },
    {
      category: 'ISO 27001',
      score: 100,
      status: 'compliant',
      lastAudit: '1 week ago',
      nextAudit: '6 months',
      icon: CheckCircle
    },
    {
      category: 'SOC 2 Type II',
      score: 97,
      status: 'compliant',
      lastAudit: '1 month ago',
      nextAudit: '1 year',
      icon: Book
    }
  ];

  const recentAudits = [
    {
      title: 'HIPAA Technical Safeguards Review',
      date: '2024-01-15',
      result: 'Passed',
      score: '100%',
      auditor: 'Internal Security Team'
    },
    {
      title: 'DICOM Conformance Testing',
      date: '2024-01-10',
      result: 'Passed',
      score: '98%',
      auditor: 'External Certification Body'
    },
    {
      title: 'FDA Software Validation',
      date: '2024-01-05',
      result: 'Passed',
      score: '96%',
      auditor: 'FDA Compliance Consultant'
    },
    {
      title: 'ISO 27001 Surveillance Audit',
      date: '2024-01-01',
      result: 'Passed',
      score: '100%',
      auditor: 'ISO Certification Body'
    }
  ];

  const upcomingRequirements = [
    {
      title: 'HIPAA Risk Assessment',
      dueDate: '2024-02-15',
      priority: 'high',
      responsible: 'Security Team',
      progress: 75
    },
    {
      title: 'DICOM Conformance Statement Update',
      dueDate: '2024-02-28',
      priority: 'medium',
      responsible: 'Engineering Team',
      progress: 50
    },
    {
      title: 'FDA Software Change Control',
      dueDate: '2024-03-15',
      priority: 'high',
      responsible: 'Quality Assurance',
      progress: 25
    },
    {
      title: 'Medical Device Reporting',
      dueDate: '2024-03-30',
      priority: 'medium',
      responsible: 'Regulatory Affairs',
      progress: 10
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-medsight-secondary';
      case 'warning': return 'text-medsight-pending';
      case 'critical': return 'text-medsight-abnormal';
      default: return 'text-slate-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-medsight-secondary/10';
      case 'warning': return 'bg-medsight-pending/10';
      case 'critical': return 'bg-medsight-abnormal/10';
      default: return 'bg-slate-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-medsight-abnormal';
      case 'medium': return 'text-medsight-pending';
      case 'low': return 'text-medsight-secondary';
      default: return 'text-slate-500';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-medsight-secondary';
    if (progress >= 50) return 'bg-medsight-pending';
    return 'bg-medsight-abnormal';
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <Shield className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Medical Compliance</h3>
            <p className="text-sm text-slate-600">Regulatory compliance monitoring and reporting</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-medsight text-xs px-3 py-1">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </button>
          <button className="btn-medsight text-xs px-3 py-1">
            <Download className="w-3 h-3 mr-1" />
            Export Report
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {complianceOverview.map((item, index) => (
          <div key={index} className="medsight-control-glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <item.icon className={`w-4 h-4 ${getStatusColor(item.status)}`} />
                <span className="text-sm font-medium text-slate-800">{item.category}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)} ${getStatusBg(item.status)}`}>
                {item.score}%
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Last Audit:</span>
                <span>{item.lastAudit}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Next Audit:</span>
                <span>{item.nextAudit}</span>
              </div>
              <div className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Audits & Upcoming Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Audits</h4>
          <div className="space-y-3">
            {recentAudits.map((audit, index) => (
              <div key={index} className="medsight-control-glass rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800 text-sm">{audit.title}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${audit.result === 'Passed' ? 'text-medsight-secondary bg-medsight-secondary/10' : 'text-medsight-abnormal bg-medsight-abnormal/10'}`}>
                    {audit.result}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Date:</span>
                    <span>{audit.date}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Score:</span>
                    <span className="font-medium">{audit.score}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Auditor:</span>
                    <span>{audit.auditor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Requirements */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Upcoming Requirements</h4>
          <div className="space-y-3">
            {upcomingRequirements.map((req, index) => (
              <div key={index} className="medsight-control-glass rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800 text-sm">{req.title}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(req.priority)} bg-current bg-opacity-10`}>
                    {req.priority}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Due Date:</span>
                    <span>{req.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Responsible:</span>
                    <span>{req.responsible}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Progress:</span>
                      <span>{req.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(req.progress)}`}
                        style={{ width: `${req.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-medsight-primary" />
            <span className="text-sm text-slate-700">Compliance Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-medsight text-xs px-3 py-1">
              <Calendar className="w-3 h-3 mr-1" />
              Schedule Audit
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Users className="w-3 h-3 mr-1" />
              Training
            </button>
            <button className="btn-medsight text-xs px-3 py-1">
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 