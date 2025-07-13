'use client';

import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon,
  PencilIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface SecurityIncidentsProps {
  data?: any;
}

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  type: 'security-breach' | 'privacy-violation' | 'compliance-issue' | 'data-breach' | 'suspicious-activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  reportedBy: string;
  assignedTo: string;
  affectedSystems: string[];
  affectedUsers: number;
  responseTime: number; // minutes
  resolutionTime?: number; // minutes
  containmentActions: string[];
  mitigationSteps: string[];
  evidenceLinks: string[];
  tags: string[];
  comments: {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    type: 'update' | 'escalation' | 'resolution';
  }[];
}

export function SecurityIncidents({ data = {} }: SecurityIncidentsProps) {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'severity' | 'status'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadSecurityIncidents();
  }, [data]);

  const loadSecurityIncidents = async () => {
    try {
      setLoading(true);
      
      // Mock incident data
      const mockIncidents: SecurityIncident[] = [
        {
          id: 'INC-2024-001',
          title: 'Unauthorized Access to Patient Records',
          description: 'Multiple attempts to access patient records outside of normal working hours detected from external IP address.',
          type: 'security-breach',
          severity: 'critical',
          status: 'investigating',
          priority: 'urgent',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
          reportedBy: 'Security Monitoring System',
          assignedTo: 'Security Team Lead',
          affectedSystems: ['Medical Records Database', 'Patient Portal', 'Authentication Service'],
          affectedUsers: 1247,
          responseTime: 15,
          containmentActions: ['Blocked suspicious IP addresses', 'Forced password reset for affected accounts'],
          mitigationSteps: ['Enable additional MFA', 'Monitor account activities', 'Review access logs'],
          evidenceLinks: ['logs/security-001.log', 'reports/access-analysis.pdf'],
          tags: ['external-threat', 'patient-data', 'after-hours'],
          comments: [
            {
              id: 'comment-001',
              author: 'John Smith (Security Analyst)',
              content: 'Initial investigation shows coordinated attack from multiple IP addresses. Escalating to incident response team.',
              timestamp: new Date(Date.now() - 45 * 60 * 1000),
              type: 'escalation'
            },
            {
              id: 'comment-002',
              author: 'Sarah Johnson (IR Team Lead)',
              content: 'Containment measures implemented. Beginning forensic analysis of affected systems.',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              type: 'update'
            }
          ]
        },
        {
          id: 'INC-2024-002',
          title: 'HIPAA Compliance Violation',
          description: 'Medical staff member accessed patient records without proper authorization.',
          type: 'privacy-violation',
          severity: 'high',
          status: 'resolved',
          priority: 'high',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          reportedBy: 'Dr. Emily Davis',
          assignedTo: 'Compliance Officer',
          affectedSystems: ['Medical Records System'],
          affectedUsers: 1,
          responseTime: 30,
          resolutionTime: 18 * 60, // 18 hours
          containmentActions: ['Revoked unauthorized access', 'Documented violation'],
          mitigationSteps: ['Additional HIPAA training scheduled', 'Access review completed'],
          evidenceLinks: ['reports/access-violation.pdf', 'training/hipaa-remedial.pdf'],
          tags: ['hipaa', 'internal-violation', 'training-required'],
          comments: [
            {
              id: 'comment-003',
              author: 'Michael Brown (Compliance)',
              content: 'Investigation completed. Staff member has been retrained on HIPAA protocols.',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
              type: 'resolution'
            }
          ]
        },
        {
          id: 'INC-2024-003',
          title: 'Suspicious Email Campaign',
          description: 'Phishing emails targeting medical staff with malicious attachments detected.',
          type: 'suspicious-activity',
          severity: 'medium',
          status: 'contained',
          priority: 'medium',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          reportedBy: 'Email Security Gateway',
          assignedTo: 'IT Security Team',
          affectedSystems: ['Email System', 'Endpoint Protection'],
          affectedUsers: 23,
          responseTime: 20,
          containmentActions: ['Quarantined malicious emails', 'Updated email filters'],
          mitigationSteps: ['Staff awareness email sent', 'Enhanced email monitoring'],
          evidenceLinks: ['emails/phishing-samples.zip', 'analysis/malware-report.pdf'],
          tags: ['phishing', 'email-security', 'staff-training'],
          comments: []
        },
        {
          id: 'INC-2024-004',
          title: 'Data Backup Integrity Issue',
          description: 'Routine backup verification detected corrupted medical imaging data.',
          type: 'data-breach',
          severity: 'high',
          status: 'open',
          priority: 'high',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          reportedBy: 'Backup Monitoring System',
          assignedTo: 'Data Recovery Team',
          affectedSystems: ['DICOM Archive', 'Backup Systems'],
          affectedUsers: 0,
          responseTime: 45,
          containmentActions: ['Isolated affected backup systems', 'Initiated data recovery'],
          mitigationSteps: ['Restore from earlier backup', 'Verify data integrity'],
          evidenceLinks: ['logs/backup-verification.log', 'reports/data-integrity.pdf'],
          tags: ['data-integrity', 'backup-failure', 'medical-imaging'],
          comments: [
            {
              id: 'comment-004',
              author: 'Lisa Wang (Data Admin)',
              content: 'Data recovery in progress. Estimated completion in 6 hours.',
              timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
              type: 'update'
            }
          ]
        }
      ];

      setIncidents(mockIncidents);
    } catch (error) {
      console.error('Failed to load security incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'medsight-critical';
      case 'high': return 'medsight-pending';
      case 'medium': return 'medsight-secondary';
      case 'low': return 'medsight-normal';
      default: return 'medsight-primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'medsight-critical';
      case 'investigating': return 'medsight-pending';
      case 'contained': return 'medsight-secondary';
      case 'resolved': return 'medsight-normal';
      case 'closed': return 'medsight-primary';
      default: return 'medsight-primary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'medsight-critical';
      case 'high': return 'medsight-pending';
      case 'medium': return 'medsight-secondary';
      case 'low': return 'medsight-normal';
      default: return 'medsight-primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'investigating': return <PlayIcon className="w-4 h-4" />;
      case 'contained': return <CheckCircleIcon className="w-4 h-4" />;
      case 'resolved': return <CheckCircleIcon className="w-4 h-4" />;
      case 'closed': return <XCircleIcon className="w-4 h-4" />;
      default: return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesType = filterType === 'all' || incident.type === filterType;
    return matchesStatus && matchesSeverity && matchesType;
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'created':
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      case 'updated':
        aValue = a.updatedAt.getTime();
        bValue = b.updatedAt.getTime();
        break;
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        aValue = severityOrder[a.severity as keyof typeof severityOrder];
        bValue = severityOrder[b.severity as keyof typeof severityOrder];
        break;
      case 'status':
        const statusOrder = { open: 5, investigating: 4, contained: 3, resolved: 2, closed: 1 };
        aValue = statusOrder[a.status as keyof typeof statusOrder];
        bValue = statusOrder[b.status as keyof typeof statusOrder];
        break;
      default:
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleIncidentAction = (incidentId: string, action: string) => {
    console.log(`Incident ${incidentId}: ${action}`);
    // In production, this would connect to security incident management system
  };

  if (loading) {
    return (
      <div className="medsight-glass p-6 rounded-xl">
        <div className="animate-pulse">
          <div className="h-4 bg-medsight-primary/20 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-medsight-primary/20 rounded w-3/4"></div>
            <div className="h-3 bg-medsight-primary/20 rounded w-1/2"></div>
            <div className="h-3 bg-medsight-primary/20 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Incidents Overview */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-critical/10 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-4 h-4 text-medsight-critical" />
            </div>
            <h2 className="text-lg font-semibold text-medsight-primary">
              Security Incident Management
            </h2>
          </div>
          <div className="text-sm text-medsight-primary/70">
            {filteredIncidents.length} of {incidents.length} incidents
          </div>
        </div>

        {/* Incident Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-critical">
              {incidents.filter(i => i.status === 'open').length}
            </div>
            <div className="text-sm text-medsight-critical/70">Open</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-pending">
              {incidents.filter(i => i.status === 'investigating').length}
            </div>
            <div className="text-sm text-medsight-pending/70">Investigating</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-secondary">
              {incidents.filter(i => i.status === 'contained').length}
            </div>
            <div className="text-sm text-medsight-secondary/70">Contained</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-normal">
              {incidents.filter(i => i.status === 'resolved').length}
            </div>
            <div className="text-sm text-medsight-normal/70">Resolved</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-primary">
              {Math.round(incidents.filter(i => i.responseTime <= 30).length / incidents.length * 100)}%
            </div>
            <div className="text-sm text-medsight-primary/70">SLA Met</div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-medsight min-w-40"
          >
            <option value="all">All Types</option>
            <option value="security-breach">Security Breach</option>
            <option value="privacy-violation">Privacy Violation</option>
            <option value="compliance-issue">Compliance Issue</option>
            <option value="data-breach">Data Breach</option>
            <option value="suspicious-activity">Suspicious Activity</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-medsight min-w-32"
          >
            <option value="created">Sort by Created</option>
            <option value="updated">Sort by Updated</option>
            <option value="severity">Sort by Severity</option>
            <option value="status">Sort by Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn-medsight px-3 py-1 text-sm"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {sortedIncidents.map(incident => (
            <div key={incident.id} className="medsight-control-glass p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className={`text-${getStatusColor(incident.status)}`}>
                    {getStatusIcon(incident.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-medsight-primary">{incident.title}</h4>
                      <span className="text-sm text-medsight-primary/70">{incident.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getSeverityColor(incident.severity)}/10 text-${getSeverityColor(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(incident.priority)}/10 text-${getPriorityColor(incident.priority)}`}>
                        {incident.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-medsight-primary/70 capitalize">
                        {incident.type.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-medsight-primary/70 mb-3">{incident.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-medsight-primary/70">Reported By</div>
                        <div className="text-medsight-primary">{incident.reportedBy}</div>
                      </div>
                      <div>
                        <div className="text-medsight-primary/70">Assigned To</div>
                        <div className="text-medsight-primary">{incident.assignedTo}</div>
                      </div>
                      <div>
                        <div className="text-medsight-primary/70">Response Time</div>
                        <div className={`${incident.responseTime <= 30 ? 'text-medsight-normal' : 'text-medsight-critical'}`}>
                          {incident.responseTime} min
                        </div>
                      </div>
                      <div>
                        <div className="text-medsight-primary/70">Affected Users</div>
                        <div className="text-medsight-primary">{incident.affectedUsers.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(incident.status)}/10 text-${getStatusColor(incident.status)}`}>
                    {incident.status.toUpperCase()}
                  </div>
                  <button
                    onClick={() => setSelectedIncident(incident)}
                    className="btn-medsight px-3 py-1 text-sm"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-medsight-primary/60">
                <div>
                  Created: {incident.createdAt.toLocaleString()} • 
                  Updated: {incident.updatedAt.toLocaleString()}
                </div>
                <div className="flex items-center space-x-2">
                  {incident.comments.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <ChatBubbleLeftIcon className="w-3 h-3" />
                      <span>{incident.comments.length} comments</span>
                    </div>
                  )}
                  <span>Systems: {incident.affectedSystems.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-medsight-primary">
                  {selectedIncident.title}
                </h3>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-sm text-medsight-primary/70">{selectedIncident.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getSeverityColor(selectedIncident.severity)}/10 text-${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(selectedIncident.status)}/10 text-${getStatusColor(selectedIncident.status)}`}>
                    {selectedIncident.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-medsight-primary/70 hover:text-medsight-primary"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-medsight-primary mb-2">Description</h4>
                  <p className="text-sm text-medsight-primary/70">{selectedIncident.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-medsight-primary mb-2">Containment Actions</h4>
                  <div className="space-y-1">
                    {selectedIncident.containmentActions.map((action, index) => (
                      <div key={index} className="text-sm text-medsight-primary flex items-center space-x-2">
                        <CheckCircleIcon className="w-3 h-3 text-medsight-normal" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-medsight-primary mb-2">Mitigation Steps</h4>
                  <div className="space-y-1">
                    {selectedIncident.mitigationSteps.map((step, index) => (
                      <div key={index} className="text-sm text-medsight-primary flex items-center space-x-2">
                        <PlayIcon className="w-3 h-3 text-medsight-secondary" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-medsight-primary/70">Reported By</div>
                    <div className="text-sm text-medsight-primary">{selectedIncident.reportedBy}</div>
                  </div>
                  <div>
                    <div className="text-sm text-medsight-primary/70">Assigned To</div>
                    <div className="text-sm text-medsight-primary">{selectedIncident.assignedTo}</div>
                  </div>
                  <div>
                    <div className="text-sm text-medsight-primary/70">Response Time</div>
                    <div className="text-sm text-medsight-primary">{selectedIncident.responseTime} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-medsight-primary/70">Affected Users</div>
                    <div className="text-sm text-medsight-primary">{selectedIncident.affectedUsers.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-medsight-primary mb-2">Affected Systems</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.affectedSystems.map((system, index) => (
                      <span key={index} className="px-2 py-1 bg-medsight-secondary/10 text-medsight-secondary text-xs rounded-full">
                        {system}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-medsight-primary mb-2">Comments & Updates</h4>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {selectedIncident.comments.map(comment => (
                      <div key={comment.id} className="medsight-control-glass p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-medsight-primary">{comment.author}</span>
                          <span className="text-xs text-medsight-primary/70">{comment.timestamp.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-medsight-primary/70">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
 