'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentMagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface SecurityAuditTrailProps {
  data?: any;
}

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceType: 'patient-record' | 'system-config' | 'user-account' | 'security-setting' | 'medical-data' | 'report';
  outcome: 'success' | 'failure' | 'blocked' | 'warning';
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data-access' | 'system-change' | 'security-event';
  details: string;
  riskScore: number; // 0-100
  compliance: string[]; // HIPAA, SOX, etc.
  metadata: Record<string, any>;
}

interface AuditSummary {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  blockedEvents: number;
  highRiskEvents: number;
  uniqueUsers: number;
  topRiskScore: number;
}

export function SecurityAuditTrail({ data = {} }: SecurityAuditTrailProps) {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterOutcome, setFilterOutcome] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('24h');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadAuditTrail();
  }, [data, dateRange]);

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      
      // Mock audit data
      const mockEvents: AuditEvent[] = [
        {
          id: 'audit-001',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          userId: 'user-123',
          userName: 'Dr. Sarah Johnson',
          userRole: 'Radiologist',
          action: 'Access medical record',
          resource: 'Patient Record PT-789234',
          resourceType: 'patient-record',
          outcome: 'success',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          sessionId: 'sess-abc123',
          severity: 'low',
          category: 'data-access',
          details: 'Accessed patient imaging study for diagnostic review',
          riskScore: 15,
          compliance: ['HIPAA'],
          metadata: { studyId: 'STU-456789', modality: 'CT' }
        },
        {
          id: 'audit-002',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          userId: 'admin-456',
          userName: 'System Administrator',
          userRole: 'Admin',
          action: 'Update security configuration',
          resource: 'Security Settings',
          resourceType: 'security-setting',
          outcome: 'success',
          ipAddress: '192.168.1.50',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          sessionId: 'sess-def456',
          severity: 'medium',
          category: 'system-change',
          details: 'Updated password policy requirements',
          riskScore: 45,
          compliance: ['HIPAA', 'SOX'],
          metadata: { configType: 'password-policy', oldValue: '8chars', newValue: '12chars' }
        },
        {
          id: 'audit-003',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          userId: 'unknown',
          userName: 'Unknown User',
          userRole: 'None',
          action: 'Failed login attempt',
          resource: 'Authentication System',
          resourceType: 'system-config',
          outcome: 'blocked',
          ipAddress: '203.0.113.42',
          userAgent: 'curl/7.68.0',
          sessionId: '',
          severity: 'high',
          category: 'authentication',
          details: 'Multiple failed login attempts from suspicious IP',
          riskScore: 85,
          compliance: ['HIPAA'],
          metadata: { attemptCount: 15, timeWindow: '5min' }
        },
        {
          id: 'audit-004',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          userId: 'user-789',
          userName: 'Dr. Michael Brown',
          userRole: 'Physician',
          action: 'Generate medical report',
          resource: 'Medical Report RPT-123456',
          resourceType: 'report',
          outcome: 'success',
          ipAddress: '192.168.1.75',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
          sessionId: 'sess-ghi789',
          severity: 'low',
          category: 'data-access',
          details: 'Generated patient diagnostic report',
          riskScore: 20,
          compliance: ['HIPAA'],
          metadata: { reportType: 'diagnostic', patientId: 'PT-789234' }
        },
        {
          id: 'audit-005',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          userId: 'user-321',
          userName: 'Jane Smith',
          userRole: 'Technician',
          action: 'Unauthorized access attempt',
          resource: 'Admin Panel',
          resourceType: 'system-config',
          outcome: 'blocked',
          ipAddress: '192.168.1.200',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          sessionId: 'sess-jkl012',
          severity: 'critical',
          category: 'authorization',
          details: 'Attempted to access admin functions without proper authorization',
          riskScore: 95,
          compliance: ['HIPAA', 'SOX'],
          metadata: { attemptedResource: '/admin/users', userRole: 'technician' }
        }
      ];

      // Generate more mock events
      const additionalEvents = Array.from({ length: 100 }, (_, i) => ({
        id: `audit-${String(i + 6).padStart(3, '0')}`,
        timestamp: new Date(Date.now() - (i + 6) * 10 * 60 * 1000),
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        userName: `User ${Math.floor(Math.random() * 100)}`,
        userRole: ['Doctor', 'Nurse', 'Admin', 'Technician'][Math.floor(Math.random() * 4)],
        action: ['Login', 'Logout', 'Access record', 'Update data', 'Generate report'][Math.floor(Math.random() * 5)],
        resource: `Resource-${Math.floor(Math.random() * 1000)}`,
        resourceType: ['patient-record', 'system-config', 'user-account', 'medical-data'][Math.floor(Math.random() * 4)] as any,
        outcome: ['success', 'failure', 'blocked'][Math.floor(Math.random() * 3)] as any,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        sessionId: `sess-${Math.random().toString(36).substr(2, 9)}`,
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        category: ['authentication', 'authorization', 'data-access', 'system-change'][Math.floor(Math.random() * 4)] as any,
        details: `System generated event ${i + 6}`,
        riskScore: Math.floor(Math.random() * 100),
        compliance: ['HIPAA'],
        metadata: {}
      }));

      const allEvents = [...mockEvents, ...additionalEvents];
      
      const mockSummary: AuditSummary = {
        totalEvents: allEvents.length,
        successfulEvents: allEvents.filter(e => e.outcome === 'success').length,
        failedEvents: allEvents.filter(e => e.outcome === 'failure').length,
        blockedEvents: allEvents.filter(e => e.outcome === 'blocked').length,
        highRiskEvents: allEvents.filter(e => e.riskScore >= 70).length,
        uniqueUsers: new Set(allEvents.map(e => e.userId)).size,
        topRiskScore: Math.max(...allEvents.map(e => e.riskScore))
      };

      setAuditEvents(allEvents);
      setSummary(mockSummary);
    } catch (error) {
      console.error('Failed to load audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'medsight-normal';
      case 'failure': return 'medsight-pending';
      case 'blocked': return 'medsight-critical';
      case 'warning': return 'medsight-secondary';
      default: return 'medsight-primary';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <UserIcon className="w-4 h-4" />;
      case 'authorization': return <ShieldCheckIcon className="w-4 h-4" />;
      case 'data-access': return <DocumentMagnifyingGlassIcon className="w-4 h-4" />;
      case 'system-change': return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'security-event': return <ExclamationTriangleIcon className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'medsight-critical';
    if (score >= 60) return 'medsight-pending';
    if (score >= 40) return 'medsight-secondary';
    return 'medsight-normal';
  };

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesOutcome = filterOutcome === 'all' || event.outcome === filterOutcome;
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    
    return matchesSearch && matchesCategory && matchesOutcome && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Outcome', 'IP Address', 'Risk Score'].join(','),
      ...filteredEvents.map(event => [
        event.timestamp.toISOString(),
        event.userName,
        event.action,
        event.resource,
        event.outcome,
        event.ipAddress,
        event.riskScore
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
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
      {/* Audit Trail Overview */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-secondary/10 rounded-full flex items-center justify-center">
              <DocumentMagnifyingGlassIcon className="w-4 h-4 text-medsight-secondary" />
            </div>
            <h2 className="text-lg font-semibold text-medsight-primary">
              Security Audit Trail
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportAuditLog}
              className="btn-medsight px-3 py-1 text-sm"
              title="Export Audit Log"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Audit Summary */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-primary">
              {summary?.totalEvents.toLocaleString()}
            </div>
            <div className="text-sm text-medsight-primary/70">Total Events</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-normal">
              {summary?.successfulEvents.toLocaleString()}
            </div>
            <div className="text-sm text-medsight-normal/70">Successful</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-pending">
              {summary?.failedEvents.toLocaleString()}
            </div>
            <div className="text-sm text-medsight-pending/70">Failed</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-critical">
              {summary?.blockedEvents.toLocaleString()}
            </div>
            <div className="text-sm text-medsight-critical/70">Blocked</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-secondary">
              {summary?.uniqueUsers.toLocaleString()}
            </div>
            <div className="text-sm text-medsight-secondary/70">Unique Users</div>
          </div>
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="text-2xl font-bold text-medsight-ai-high">
              {summary?.topRiskScore}
            </div>
            <div className="text-sm text-medsight-ai-high/70">Max Risk Score</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-medsight-primary/50" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-medsight pl-10 w-full"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-medsight min-w-40"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data-access">Data Access</option>
            <option value="system-change">System Change</option>
            <option value="security-event">Security Event</option>
          </select>
          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="blocked">Blocked</option>
            <option value="warning">Warning</option>
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
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-medsight min-w-32"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-medsight-primary/70">
            Showing {paginatedEvents.length} of {filteredEvents.length} events
          </div>
          <div className="text-sm text-medsight-primary/70">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Audit Events Table */}
        <div className="space-y-2">
          {paginatedEvents.map(event => (
            <div key={event.id} className="medsight-control-glass p-4 rounded-lg hover:bg-medsight-primary/5 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`text-${getSeverityColor(event.severity)}`}>
                    {getCategoryIcon(event.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-medsight-primary">{event.action}</span>
                      <span className="text-sm text-medsight-primary/70">{event.userName}</span>
                      <span className="text-sm text-medsight-primary/70">({event.userRole})</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getOutcomeColor(event.outcome)}/10 text-${getOutcomeColor(event.outcome)}`}>
                        {event.outcome.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getSeverityColor(event.severity)}/10 text-${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-medsight-primary mb-2">
                      <span className="font-medium">Resource:</span> {event.resource}
                    </div>
                    <div className="text-sm text-medsight-primary/70 mb-2">
                      {event.details}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-medsight-primary/60">
                      <span>{event.timestamp.toLocaleString()}</span>
                      <span>IP: {event.ipAddress}</span>
                      <span>Session: {event.sessionId || 'N/A'}</span>
                      <span>Risk: {event.riskScore}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${getRiskColor(event.riskScore)}/10 text-${getRiskColor(event.riskScore)}`}>
                    Risk: {event.riskScore}
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="btn-medsight px-3 py-1 text-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-medsight px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-medsight-primary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn-medsight px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="medsight-glass p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-medsight-primary">
                Audit Event Details
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-medsight-primary/70 hover:text-medsight-primary"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-medsight-primary/70">Event ID</div>
                  <div className="text-medsight-primary font-medium">{selectedEvent.id}</div>
                </div>
                <div>
                  <div className="text-sm text-medsight-primary/70">Timestamp</div>
                  <div className="text-medsight-primary font-medium">{selectedEvent.timestamp.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-medsight-primary/70">User</div>
                  <div className="text-medsight-primary font-medium">{selectedEvent.userName} ({selectedEvent.userRole})</div>
                </div>
                <div>
                  <div className="text-sm text-medsight-primary/70">Action</div>
                  <div className="text-medsight-primary font-medium">{selectedEvent.action}</div>
                </div>
                <div>
                  <div className="text-sm text-medsight-primary/70">Resource</div>
                  <div className="text-medsight-primary font-medium">{selectedEvent.resource}</div>
                </div>
                <div>
                  <div className="text-sm text-medsight-primary/70">Outcome</div>
                  <div className={`font-medium text-${getOutcomeColor(selectedEvent.outcome)}`}>
                    {selectedEvent.outcome.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-medsight-primary/70">Risk Score</div>
                  <div className={`font-medium text-${getRiskColor(selectedEvent.riskScore)}`}>
                    {selectedEvent.riskScore}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-medsight-primary/70">IP Address</div>
                  <div className="text-medsight-primary font-medium">{selectedEvent.ipAddress}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-medsight-primary/70 mb-2">Details</div>
                <div className="text-sm text-medsight-primary">{selectedEvent.details}</div>
              </div>

              <div>
                <div className="text-sm text-medsight-primary/70 mb-2">User Agent</div>
                <div className="text-sm text-medsight-primary break-all">{selectedEvent.userAgent}</div>
              </div>

              <div>
                <div className="text-sm text-medsight-primary/70 mb-2">Compliance</div>
                <div className="flex space-x-2">
                  {selectedEvent.compliance.map((comp, index) => (
                    <span key={index} className="px-2 py-1 bg-medsight-secondary/10 text-medsight-secondary text-xs rounded-full">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <div className="text-sm text-medsight-primary/70 mb-2">Metadata</div>
                  <div className="text-sm text-medsight-primary bg-medsight-primary/5 p-3 rounded-lg">
                    <pre>{JSON.stringify(selectedEvent.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
 