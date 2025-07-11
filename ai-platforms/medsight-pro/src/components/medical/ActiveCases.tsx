'use client';

import { useState } from 'react';
import { 
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  UserIcon,
  CalendarDaysIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface MedicalCase {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: 'M' | 'F';
  studyType: string;
  studyDate: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'new' | 'in-progress' | 'pending-review' | 'completed' | 'on-hold';
  assignedTo: string;
  modality: string;
  bodyPart: string;
  timeAssigned: string;
  estimatedCompletion: string;
  findings: string;
  aiConfidence?: number;
  criticalFlags: string[];
  lastActivity: string;
  collaborators: string[];
  notes: number;
}

export function ActiveCases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Mock data for active cases
  const activeCases: MedicalCase[] = [
    {
      id: 'CASE-2024-001',
      patientId: 'PT-789234',
      patientName: 'John Smith',
      patientAge: 65,
      patientSex: 'M',
      studyType: 'Chest CT',
      studyDate: '2024-01-15',
      priority: 'critical',
      status: 'in-progress',
      assignedTo: 'Dr. Sarah Johnson',
      modality: 'CT',
      bodyPart: 'Chest',
      timeAssigned: '2024-01-15T08:30:00Z',
      estimatedCompletion: '2024-01-15T12:00:00Z',
      findings: 'Possible pulmonary embolism',
      aiConfidence: 92,
      criticalFlags: ['PE Risk', 'Urgent'],
      lastActivity: '5 minutes ago',
      collaborators: ['Dr. Mike Chen', 'Dr. Lisa Wang'],
      notes: 3
    },
    {
      id: 'CASE-2024-002',
      patientId: 'PT-567890',
      patientName: 'Emily Davis',
      patientAge: 42,
      patientSex: 'F',
      studyType: 'Brain MRI',
      studyDate: '2024-01-15',
      priority: 'high',
      status: 'pending-review',
      assignedTo: 'Dr. Robert Kim',
      modality: 'MRI',
      bodyPart: 'Brain',
      timeAssigned: '2024-01-15T09:00:00Z',
      estimatedCompletion: '2024-01-15T14:30:00Z',
      findings: 'Multiple sclerosis follow-up',
      aiConfidence: 87,
      criticalFlags: [],
      lastActivity: '15 minutes ago',
      collaborators: ['Dr. Jennifer Liu'],
      notes: 1
    },
    {
      id: 'CASE-2024-003',
      patientId: 'PT-123456',
      patientName: 'Michael Johnson',
      patientAge: 28,
      patientSex: 'M',
      studyType: 'Abdominal CT',
      studyDate: '2024-01-15',
      priority: 'normal',
      status: 'new',
      assignedTo: 'Dr. Amanda Rodriguez',
      modality: 'CT',
      bodyPart: 'Abdomen',
      timeAssigned: '2024-01-15T10:15:00Z',
      estimatedCompletion: '2024-01-15T16:00:00Z',
      findings: 'Appendicitis evaluation',
      aiConfidence: 78,
      criticalFlags: [],
      lastActivity: '1 hour ago',
      collaborators: [],
      notes: 0
    },
    {
      id: 'CASE-2024-004',
      patientId: 'PT-345678',
      patientName: 'Sarah Wilson',
      patientAge: 55,
      patientSex: 'F',
      studyType: 'Mammography',
      studyDate: '2024-01-15',
      priority: 'high',
      status: 'in-progress',
      assignedTo: 'Dr. David Brown',
      modality: 'MG',
      bodyPart: 'Breast',
      timeAssigned: '2024-01-15T07:45:00Z',
      estimatedCompletion: '2024-01-15T11:30:00Z',
      findings: 'Screening mammography',
      aiConfidence: 95,
      criticalFlags: ['Callback Required'],
      lastActivity: '30 minutes ago',
      collaborators: ['Dr. Patricia Lee'],
      notes: 2
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'medsight-critical';
      case 'high':
        return 'medsight-pending';
      case 'normal':
        return 'medsight-normal';
      case 'low':
        return 'medsight-primary';
      default:
        return 'medsight-primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'medsight-primary';
      case 'in-progress':
        return 'medsight-pending';
      case 'pending-review':
        return 'medsight-ai-medium';
      case 'completed':
        return 'medsight-normal';
      case 'on-hold':
        return 'medsight-abnormal';
      default:
        return 'medsight-primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <ClipboardDocumentListIcon className="w-4 h-4" />;
      case 'in-progress':
        return <ClockIcon className="w-4 h-4" />;
      case 'pending-review':
        return <EyeIcon className="w-4 h-4" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'on-hold':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <ClipboardDocumentListIcon className="w-4 h-4" />;
    }
  };

  const filteredCases = activeCases.filter(caseItem => {
    const matchesSearch = caseItem.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.studyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.findings.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || caseItem.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCaseAction = (caseId: string, action: string) => {
    console.log(`Case ${caseId}: ${action}`);
    // In production, this would trigger appropriate medical workflow actions
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-secondary/10 rounded-full flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-4 h-4 text-medsight-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-medsight-primary">
                Active Cases
              </h3>
              <p className="text-sm text-medsight-primary/70">
                {filteredCases.length} of {activeCases.length} cases
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-medsight-primary/70">
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medsight-primary/50" />
              <input
                type="text"
                placeholder="Search cases, patients, or findings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-medsight pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="pending-review">Pending Review</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.map((caseItem) => (
          <div key={caseItem.id} className="medsight-glass p-4 rounded-xl hover:bg-medsight-primary/5 transition-colors">
            <div className="flex items-start space-x-4">
              {/* Priority Flag */}
              <div className="flex-shrink-0">
                <div className={`w-3 h-8 rounded-full bg-${getPriorityColor(caseItem.priority)}`}></div>
              </div>

              {/* Case Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-medium text-medsight-primary">
                        {caseItem.patientName}
                      </h4>
                      <span className="text-sm text-medsight-primary/70">
                        {caseItem.patientAge}yr {caseItem.patientSex}
                      </span>
                      <span className="text-sm text-medsight-primary/70">
                        {caseItem.patientId}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-medsight-primary/70">
                      <span>{caseItem.studyType}</span>
                      <span>{caseItem.modality}</span>
                      <span>{caseItem.bodyPart}</span>
                      <span>{new Date(caseItem.studyDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* AI Confidence */}
                    {caseItem.aiConfidence && (
                      <div className={`medsight-ai-glass px-2 py-1 rounded-full text-xs ${
                        caseItem.aiConfidence >= 90 ? 'text-medsight-ai-high' :
                        caseItem.aiConfidence >= 70 ? 'text-medsight-ai-medium' :
                        'text-medsight-ai-low'
                      }`}>
                        AI: {caseItem.aiConfidence}%
                      </div>
                    )}

                    {/* Status */}
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${getStatusColor(caseItem.status)}/10 text-${getStatusColor(caseItem.status)}`}>
                      {getStatusIcon(caseItem.status)}
                      <span className="text-xs font-medium">
                        {caseItem.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${getPriorityColor(caseItem.priority)}/10 text-${getPriorityColor(caseItem.priority)}`}>
                      <FlagIcon className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {caseItem.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Critical Flags */}
                {caseItem.criticalFlags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-medsight-critical" />
                      <div className="flex space-x-2">
                        {caseItem.criticalFlags.map((flag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-medsight-critical/10 text-medsight-critical rounded-full">
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Findings */}
                <div className="mb-3">
                  <div className="text-sm text-medsight-primary">
                    <span className="font-medium">Findings:</span> {caseItem.findings}
                  </div>
                </div>

                {/* Case Details */}
                <div className="flex items-center justify-between text-sm text-medsight-primary/70">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>Assigned to: {caseItem.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>Est. completion: {new Date(caseItem.estimatedCompletion).toLocaleTimeString()}</span>
                    </div>
                    {caseItem.collaborators.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>+{caseItem.collaborators.length} collaborators</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs">
                    Last activity: {caseItem.lastActivity}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                <button
                  onClick={() => handleCaseAction(caseItem.id, 'view')}
                  className="btn-medsight px-3 py-1 text-sm"
                  title="View Case"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleCaseAction(caseItem.id, 'dicom')}
                  className="btn-medsight px-3 py-1 text-sm"
                  title="Open DICOM Viewer"
                >
                  <BeakerIcon className="w-4 h-4" />
                </button>
                
                {caseItem.notes > 0 && (
                  <button
                    onClick={() => handleCaseAction(caseItem.id, 'notes')}
                    className="btn-medsight px-3 py-1 text-sm relative"
                    title="View Notes"
                  >
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-medsight-pending text-white text-xs rounded-full flex items-center justify-center">
                      {caseItem.notes}
                    </span>
                  </button>
                )}
                
                <button
                  onClick={() => handleCaseAction(caseItem.id, 'report')}
                  className="btn-medsight px-3 py-1 text-sm"
                  title="Generate Report"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCases.length === 0 && (
        <div className="medsight-glass p-8 rounded-xl text-center">
          <ClipboardDocumentListIcon className="w-12 h-12 text-medsight-primary/50 mx-auto mb-4" />
          <div className="text-lg font-medium text-medsight-primary mb-2">
            No Active Cases Found
          </div>
          <div className="text-sm text-medsight-primary/70">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No cases currently assigned or in progress'
            }
          </div>
        </div>
      )}
    </div>
  );
} 