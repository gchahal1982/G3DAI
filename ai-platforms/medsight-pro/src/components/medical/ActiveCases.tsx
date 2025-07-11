'use client';

import { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  HeartIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  BeakerIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export interface MedicalCase {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F' | 'O';
  studyId: string;
  studyType: 'CT' | 'MRI' | 'X-Ray' | 'Ultrasound' | 'Mammography' | 'PET' | 'Nuclear';
  studyDate: Date;
  priority: 'critical' | 'urgent' | 'routine' | 'stat';
  status: 'pending' | 'in_progress' | 'reviewing' | 'completed' | 'on_hold';
  assignedTo: string;
  findings: string[];
  aiAnalysis?: {
    confidence: number;
    findings: string[];
    recommendations: string[];
  };
  lastActivity: Date;
  estimatedTime: number; // in minutes
  bodyPart: string;
  indication: string;
  urgent: boolean;
  collaborators: string[];
  notes: string;
}

export interface ActiveCasesProps {
  cases?: MedicalCase[];
  user?: {
    id: string;
    name: string;
    role: string;
  };
  onCaseClick?: (caseId: string) => void;
  onCaseUpdate?: (caseId: string, updates: Partial<MedicalCase>) => void;
  onAssignCase?: (caseId: string, assigneeId: string) => void;
}

export function ActiveCases({ 
  cases = [],
  user = { id: 'current-user', name: 'Dr. Smith', role: 'Radiologist' },
  onCaseClick,
  onCaseUpdate,
  onAssignCase
}: ActiveCasesProps) {
  const [localCases, setLocalCases] = useState<MedicalCase[]>([]);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'critical' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'status'>('priority');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initialize with mock data if no cases provided
    if (cases.length === 0) {
      setLocalCases([
        {
          id: 'case-001',
          patientId: 'PT-2024-001',
          patientName: 'John Doe',
          patientAge: 45,
          patientGender: 'M',
          studyId: 'CT-2024-001',
          studyType: 'CT',
          studyDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          priority: 'critical',
          status: 'pending',
          assignedTo: 'Dr. Smith',
          findings: ['Potential pneumothorax', 'Chest pain evaluation'],
          aiAnalysis: {
            confidence: 0.94,
            findings: ['Pneumothorax detected in left lung', 'Pleural effusion'],
            recommendations: ['Immediate chest tube placement', 'Cardiothoracic surgery consult']
          },
          lastActivity: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          estimatedTime: 15,
          bodyPart: 'Chest',
          indication: 'Chest pain, shortness of breath',
          urgent: true,
          collaborators: ['Dr. Johnson', 'Dr. Williams'],
          notes: 'Patient presents with acute chest pain and dyspnea'
        },
        {
          id: 'case-002',
          patientId: 'PT-2024-002',
          patientName: 'Jane Smith',
          patientAge: 32,
          patientGender: 'F',
          studyId: 'MRI-2024-002',
          studyType: 'MRI',
          studyDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          priority: 'urgent',
          status: 'in_progress',
          assignedTo: 'Dr. Smith',
          findings: ['Brain lesion evaluation'],
          aiAnalysis: {
            confidence: 0.87,
            findings: ['Multiple white matter lesions', 'Consistent with demyelinating disease'],
            recommendations: ['Neurology consultation', 'Consider MS workup']
          },
          lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          estimatedTime: 25,
          bodyPart: 'Brain',
          indication: 'Headache, vision changes',
          urgent: false,
          collaborators: ['Dr. Brown'],
          notes: 'Follow-up MRI for lesion monitoring'
        },
        {
          id: 'case-003',
          patientId: 'PT-2024-003',
          patientName: 'Robert Johnson',
          patientAge: 67,
          patientGender: 'M',
          studyId: 'XR-2024-003',
          studyType: 'X-Ray',
          studyDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          priority: 'routine',
          status: 'reviewing',
          assignedTo: 'Dr. Wilson',
          findings: ['Orthopedic evaluation'],
          lastActivity: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          estimatedTime: 10,
          bodyPart: 'Knee',
          indication: 'Knee pain, trauma',
          urgent: false,
          collaborators: [],
          notes: 'Post-surgical follow-up'
        },
        {
          id: 'case-004',
          patientId: 'PT-2024-004',
          patientName: 'Mary Williams',
          patientAge: 55,
          patientGender: 'F',
          studyId: 'MG-2024-004',
          studyType: 'Mammography',
          studyDate: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          priority: 'urgent',
          status: 'pending',
          assignedTo: 'Dr. Davis',
          findings: ['Screening mammography'],
          aiAnalysis: {
            confidence: 0.76,
            findings: ['Suspicious mass in upper outer quadrant'],
            recommendations: ['Additional imaging recommended', 'Consider biopsy']
          },
          lastActivity: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          estimatedTime: 20,
          bodyPart: 'Breast',
          indication: 'Routine screening',
          urgent: false,
          collaborators: ['Dr. Miller'],
          notes: 'Annual screening mammogram'
        }
      ]);
    } else {
      setLocalCases(cases);
    }
  }, [cases]);

  const getPriorityColor = (priority: MedicalCase['priority']) => {
    switch (priority) {
      case 'critical':
      case 'stat':
        return 'text-medsight-critical';
      case 'urgent':
        return 'text-medsight-pending';
      case 'routine':
        return 'text-medsight-normal';
      default:
        return 'text-medsight-primary';
    }
  };

  const getPriorityBg = (priority: MedicalCase['priority']) => {
    switch (priority) {
      case 'critical':
      case 'stat':
        return 'bg-medsight-critical/10 border-medsight-critical/20';
      case 'urgent':
        return 'bg-medsight-pending/10 border-medsight-pending/20';
      case 'routine':
        return 'bg-medsight-normal/10 border-medsight-normal/20';
      default:
        return 'bg-medsight-primary/10 border-medsight-primary/20';
    }
  };

  const getStatusColor = (status: MedicalCase['status']) => {
    switch (status) {
      case 'completed':
        return 'text-medsight-normal';
      case 'in_progress':
        return 'text-medsight-ai-high';
      case 'reviewing':
        return 'text-medsight-pending';
      case 'on_hold':
        return 'text-medsight-critical';
      case 'pending':
        return 'text-medsight-primary';
      default:
        return 'text-medsight-primary';
    }
  };

  const getStatusBg = (status: MedicalCase['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-medsight-normal';
      case 'in_progress':
        return 'bg-medsight-ai-high';
      case 'reviewing':
        return 'bg-medsight-pending';
      case 'on_hold':
        return 'bg-medsight-critical';
      case 'pending':
        return 'bg-medsight-primary';
      default:
        return 'bg-medsight-primary';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const handleCaseClick = (caseId: string) => {
    onCaseClick?.(caseId);
  };

  const handleStatusChange = (caseId: string, newStatus: MedicalCase['status']) => {
    setLocalCases(prev => 
      prev.map(case_ => 
        case_.id === caseId 
          ? { ...case_, status: newStatus, lastActivity: new Date() }
          : case_
      )
    );
    onCaseUpdate?.(caseId, { status: newStatus });
  };

  const filteredCases = localCases
    .filter(case_ => {
      // Filter by search term
      if (searchTerm && !case_.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !case_.patientId.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !case_.studyId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by category
      switch (filter) {
        case 'assigned':
          return case_.assignedTo === user.name;
        case 'critical':
          return case_.priority === 'critical' || case_.priority === 'stat';
        case 'pending':
          return case_.status === 'pending';
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'critical': 4, 'stat': 4, 'urgent': 3, 'routine': 2 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'date':
          return new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const criticalCount = localCases.filter(c => c.priority === 'critical' || c.priority === 'stat').length;
  const assignedCount = localCases.filter(c => c.assignedTo === user.name).length;
  const pendingCount = localCases.filter(c => c.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Active Cases Header */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <FolderIcon className="w-5 h-5 text-medsight-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-medsight-primary">
                Active Medical Cases
              </h3>
              <div className="flex items-center space-x-4 text-xs text-medsight-primary/70">
                <span>{localCases.length} total cases</span>
                <span>{assignedCount} assigned to you</span>
                {criticalCount > 0 && (
                  <span className="text-medsight-critical">
                    {criticalCount} critical
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Emergency Alert */}
          {criticalCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-medsight-critical/10 border border-medsight-critical/20 rounded-lg">
              <ExclamationTriangleIcon className="w-4 h-4 text-medsight-critical" />
              <span className="text-sm font-medium text-medsight-critical">
                {criticalCount} Critical
              </span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medsight-primary/50" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-medsight pl-10 w-full"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="input-medsight"
          >
            <option value="all">All Cases</option>
            <option value="assigned">Assigned to Me ({assignedCount})</option>
            <option value="critical">Critical ({criticalCount})</option>
            <option value="pending">Pending ({pendingCount})</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-medsight"
          >
            <option value="priority">Sort by Priority</option>
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'all' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'assigned' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            }`}
          >
            My Cases ({assignedCount})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'critical' 
                ? 'bg-medsight-critical text-white' 
                : 'text-medsight-critical hover:bg-medsight-critical/10'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'pending' 
                ? 'bg-medsight-pending text-white' 
                : 'text-medsight-pending hover:bg-medsight-pending/10'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCases.length === 0 ? (
          <div className="medsight-glass p-6 rounded-xl text-center">
            <FolderIcon className="w-8 h-8 text-medsight-primary/50 mx-auto mb-2" />
            <p className="text-sm text-medsight-primary/70">
              No cases match your filter criteria
            </p>
          </div>
        ) : (
          filteredCases.map((case_) => (
            <div
              key={case_.id}
              className={`medsight-glass p-4 rounded-xl border ${getPriorityBg(case_.priority)} ${
                case_.urgent ? 'animate-pulse' : ''
              } hover:scale-[1.02] transition-all cursor-pointer`}
              onClick={() => handleCaseClick(case_.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="medsight-control-glass p-2 rounded-lg">
                    <HeartIcon className={`w-5 h-5 ${getPriorityColor(case_.priority)}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-medsight-primary">
                        {case_.patientName}
                      </h4>
                      <span className="text-xs text-medsight-primary/60">
                        ({case_.patientAge}{case_.patientGender})
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(case_.priority)}`}>
                        {case_.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-medsight-primary/70 mb-2">
                      <span>Patient: {case_.patientId}</span>
                      <span>Study: {case_.studyId}</span>
                      <span>{case_.studyType}</span>
                      <span>{case_.bodyPart}</span>
                    </div>
                    
                    <p className="text-xs text-medsight-primary/70 mb-2">
                      {case_.indication}
                    </p>
                    
                    {case_.aiAnalysis && (
                      <div className="medsight-ai-glass p-2 rounded-lg mb-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <BeakerIcon className="w-4 h-4 text-medsight-ai-high" />
                          <span className="text-xs font-medium text-medsight-ai-high">
                            AI Analysis Complete
                          </span>
                          <span className={`text-xs ${
                            case_.aiAnalysis.confidence >= 0.9 ? 'text-medsight-ai-high' :
                            case_.aiAnalysis.confidence >= 0.7 ? 'text-medsight-ai-medium' :
                            'text-medsight-ai-low'
                          }`}>
                            {(case_.aiAnalysis.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-medsight-ai-high/70">
                          {case_.aiAnalysis.findings.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusBg(case_.status)}`}></div>
                  <span className={`text-xs font-medium ${getStatusColor(case_.status)}`}>
                    {case_.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-medsight-primary/60">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-3 h-3" />
                    <span>{case_.assignedTo}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{formatTimeAgo(case_.studyDate)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{case_.estimatedTime}m</span>
                  </div>
                  {case_.collaborators.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="w-3 h-3" />
                      <span>{case_.collaborators.length} collaborators</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={case_.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(case_.id, e.target.value as MedicalCase['status']);
                    }}
                    className="text-xs border border-medsight-primary/20 rounded px-2 py-1 bg-medsight-glass"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCaseClick(case_.id);
                    }}
                    className="text-medsight-primary hover:text-medsight-primary/70 transition-colors"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="btn-medsight text-sm">
              <EyeIcon className="w-4 h-4 mr-2" />
              View All Cases
            </button>
            <button className="btn-medsight text-sm">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Generate Report
            </button>
          </div>
          
          <div className="text-xs text-medsight-primary/70">
            Last updated: {formatTimeAgo(new Date(Date.now() - 5 * 60 * 1000))}
          </div>
        </div>
      </div>
    </div>
  );
} 