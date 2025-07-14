'use client';

import { useState } from 'react';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon,
  HeartIcon,
  BeakerIcon,
  CpuChipIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BoltIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface MedicalNotification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success' | 'ai-alert' | 'system' | 'collaboration';
  category: 'clinical' | 'ai-analysis' | 'system' | 'collaboration' | 'compliance' | 'emergency';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  source: string;
  actionRequired: boolean;
  relatedPatient?: {
    id: string;
    name: string;
    age: number;
  };
  relatedStudy?: {
    id: string;
    type: string;
    accession: string;
  };
  actions?: {
    label: string;
    action: string;
    primary?: boolean;
  }[];
  metadata?: {
    confidence?: number;
    findings?: string[];
    aiModel?: string;
  };
}

export function MedicalNotifications() {
  const [notifications, setNotifications] = useState<MedicalNotification[]>([
    {
      id: 'notif-001',
      type: 'critical',
      category: 'emergency',
      title: 'Critical Finding - Pulmonary Embolism',
      message: 'AI detected bilateral pulmonary embolism in patient John Smith (PT-789234). Immediate clinical attention required.',
      timestamp: '2024-01-15T15:30:00Z',
      isRead: false,
      priority: 'high',
      source: 'AI Analysis Engine',
      actionRequired: true,
      relatedPatient: {
        id: 'PT-789234',
        name: 'John Smith',
        age: 65
      },
      relatedStudy: {
        id: 'STU-2024-001',
        type: 'CT Chest',
        accession: 'ACC-2024-001'
      },
      actions: [
        { label: 'View Study', action: 'view-study', primary: true },
        { label: 'Contact Team', action: 'contact-team' },
        { label: 'Emergency Protocol', action: 'emergency' }
      ],
      metadata: {
        confidence: 95,
        findings: ['Bilateral segmental PE', 'Right heart strain'],
        aiModel: 'PulmonaryAI v2.1'
      }
    },
    {
      id: 'notif-002',
      type: 'ai-alert',
      category: 'ai-analysis',
      title: 'AI Analysis Complete - Brain MRI',
      message: 'AI analysis completed for Emily Davis brain MRI. Multiple sclerosis lesions detected with high confidence.',
      timestamp: '2024-01-15T14:15:00Z',
      isRead: false,
      priority: 'medium',
      source: 'NeuroAI Engine',
      actionRequired: true,
      relatedPatient: {
        id: 'PT-567890',
        name: 'Emily Davis',
        age: 42
      },
      relatedStudy: {
        id: 'STU-2024-002',
        type: 'MRI Brain',
        accession: 'ACC-2024-002'
      },
      actions: [
        { label: 'Review Findings', action: 'review-findings', primary: true },
        { label: 'Compare Prior', action: 'compare-prior' }
      ],
      metadata: {
        confidence: 87,
        findings: ['Multiple white matter lesions', 'Periventricular distribution'],
        aiModel: 'NeuroAI v3.2'
      }
    },
    {
      id: 'notif-003',
      type: 'warning',
      category: 'clinical',
      title: 'Urgent Case Assignment',
      message: 'You have been assigned an urgent case: Michael Johnson - Acute appendicitis evaluation.',
      timestamp: '2024-01-15T13:45:00Z',
      isRead: true,
      priority: 'high',
      source: 'Clinical Workflow',
      actionRequired: true,
      relatedPatient: {
        id: 'PT-123456',
        name: 'Michael Johnson',
        age: 28
      },
      relatedStudy: {
        id: 'STU-2024-003',
        type: 'CT Abdomen',
        accession: 'ACC-2024-003'
      },
      actions: [
        { label: 'Accept Case', action: 'accept-case', primary: true },
        { label: 'View Details', action: 'view-details' }
      ]
    },
    {
      id: 'notif-004',
      type: 'info',
      category: 'collaboration',
      title: 'Collaboration Request',
      message: 'Dr. Patricia Lee requested collaboration on mammography case for Sarah Wilson.',
      timestamp: '2024-01-15T12:20:00Z',
      isRead: true,
      priority: 'medium',
      source: 'Dr. Patricia Lee',
      actionRequired: true,
      relatedPatient: {
        id: 'PT-345678',
        name: 'Sarah Wilson',
        age: 55
      },
      relatedStudy: {
        id: 'STU-2024-004',
        type: 'Mammography',
        accession: 'ACC-2024-004'
      },
      actions: [
        { label: 'Join Review', action: 'join-review', primary: true },
        { label: 'View Case', action: 'view-case' },
        { label: 'Decline', action: 'decline' }
      ]
    },
    {
      id: 'notif-005',
      type: 'success',
      category: 'system',
      title: 'System Update Complete',
      message: 'DICOM processing system has been successfully updated to version 3.2.1. Performance improvements active.',
      timestamp: '2024-01-15T11:00:00Z',
      isRead: false,
      priority: 'low',
      source: 'System Administration',
      actionRequired: false,
      actions: [
        { label: 'View Changes', action: 'view-changes' }
      ]
    },
    {
      id: 'notif-006',
      type: 'warning',
      category: 'compliance',
      title: 'Medical License Expiry Warning',
      message: 'Your medical license (MD-RAD-2024-0147) expires in 30 days. Please renew to maintain system access.',
      timestamp: '2024-01-15T09:30:00Z',
      isRead: false,
      priority: 'medium',
      source: 'Compliance System',
      actionRequired: true,
      actions: [
        { label: 'Renew License', action: 'renew-license', primary: true },
        { label: 'Contact Admin', action: 'contact-admin' }
      ]
    },
    {
      id: 'notif-007',
      type: 'info',
      category: 'system',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for January 20, 2024 from 2:00 AM to 4:00 AM EST. Limited functionality expected.',
      timestamp: '2024-01-15T08:00:00Z',
      isRead: true,
      priority: 'low',
      source: 'System Administration',
      actionRequired: false,
      actions: [
        { label: 'View Details', action: 'view-maintenance' }
      ]
    }
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'ai-alert':
        return <CpuChipIcon className="w-5 h-5" />;
      case 'system':
        return <BoltIcon className="w-5 h-5" />;
      case 'collaboration':
        return <UserGroupIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clinical':
        return <HeartIcon className="w-4 h-4" />;
      case 'ai-analysis':
        return <CpuChipIcon className="w-4 h-4" />;
      case 'system':
        return <BoltIcon className="w-4 h-4" />;
      case 'collaboration':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'compliance':
        return <ShieldCheckIcon className="w-4 h-4" />;
      case 'emergency':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      default:
        return <BellIcon className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'medsight-critical';
      case 'warning':
        return 'medsight-pending';
      case 'info':
        return 'medsight-primary';
      case 'success':
        return 'medsight-normal';
      case 'ai-alert':
        return 'medsight-ai-high';
      case 'system':
        return 'medsight-accent';
      case 'collaboration':
        return 'medsight-secondary';
      default:
        return 'medsight-primary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'medsight-critical';
      case 'medium':
        return 'medsight-pending';
      case 'low':
        return 'medsight-normal';
      default:
        return 'medsight-primary';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'action-required') return notification.actionRequired;
    return notification.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const handleNotificationAction = (notificationId: string, action: string) => {
    console.log(`Notification ${notificationId}: ${action}`);
    // In production, this would trigger appropriate medical workflow actions
    markAsRead(notificationId);
  };

  const toggleExpanded = (notificationId: string) => {
    setExpandedNotification(expandedNotification === notificationId ? null : notificationId);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center relative">
            <BellIcon className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">
              Medical Notifications
            </h3>
            <p className="text-sm text-gray-600">
              {filteredNotifications.length} notifications • {unreadCount} unread
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-medical px-3 py-1 text-sm"
            >
              Mark All Read
            </button>
          )}
          <div className="text-sm text-gray-600">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filter === 'all' 
              ? 'bg-primary text-white' 
              : 'text-primary hover:bg-primary/10'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filter === 'unread' 
              ? 'bg-danger text-white' 
              : 'text-danger hover:bg-danger/10'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('action-required')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filter === 'action-required' 
              ? 'bg-warning text-white' 
              : 'text-warning hover:bg-warning/10'
          }`}
        >
          Action Required ({actionRequiredCount})
        </button>
        <button
          onClick={() => setFilter('emergency')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filter === 'emergency' 
              ? 'bg-danger text-white' 
              : 'text-danger hover:bg-danger/10'
          }`}
        >
          Emergency
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`medsight-glass p-4 rounded-xl ${
              !notification.isRead ? 'border-l-4 border-l-medsight-primary' : ''
            } ${
              notification.type === 'critical' ? 'bg-medsight-critical/5' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Notification Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${getNotificationColor(notification.type)}/10`}>
                <div className={`text-${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-medsight-primary">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-medsight-primary rounded-full"></div>
                    )}
                    {notification.actionRequired && (
                      <span className="text-xs px-2 py-1 bg-medsight-pending/10 text-medsight-pending rounded-full">
                        ACTION REQUIRED
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-${getPriorityColor(notification.priority)}/10 text-${getPriorityColor(notification.priority)}`}>
                      {getCategoryIcon(notification.category)}
                      <span className="text-xs font-medium">
                        {notification.category.toUpperCase()}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="text-medsight-primary/50 hover:text-medsight-primary/70 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-medsight-primary/80 mb-3">
                  {notification.message}
                </p>

                {/* Patient and Study Info */}
                {(notification.relatedPatient || notification.relatedStudy) && (
                  <div className="mb-3 p-3 medsight-control-glass rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {notification.relatedPatient && (
                        <div>
                          <div className="font-medium text-medsight-primary mb-1">Patient:</div>
                          <div className="text-medsight-primary/70">
                            {notification.relatedPatient.name} ({notification.relatedPatient.id})
                          </div>
                          <div className="text-medsight-primary/70">
                            Age: {notification.relatedPatient.age}
                          </div>
                        </div>
                      )}
                      {notification.relatedStudy && (
                        <div>
                          <div className="font-medium text-medsight-primary mb-1">Study:</div>
                          <div className="text-medsight-primary/70">
                            {notification.relatedStudy.type} ({notification.relatedStudy.accession})
                          </div>
                          <div className="text-medsight-primary/70">
                            ID: {notification.relatedStudy.id}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Analysis Metadata */}
                {notification.metadata && expandedNotification === notification.id && (
                  <div className="mb-3 p-3 medsight-ai-glass rounded-lg">
                    <div className="font-medium text-medsight-ai-high mb-2">AI Analysis Details:</div>
                    <div className="text-sm space-y-1">
                      {notification.metadata.confidence && (
                        <div className="text-medsight-ai-high/80">
                          Confidence: {notification.metadata.confidence}%
                        </div>
                      )}
                      {notification.metadata.aiModel && (
                        <div className="text-medsight-ai-high/80">
                          Model: {notification.metadata.aiModel}
                        </div>
                      )}
                      {notification.metadata.findings && (
                        <div>
                          <div className="font-medium text-medsight-ai-high">Findings:</div>
                          {notification.metadata.findings.map((finding, index) => (
                            <div key={index} className="text-medsight-ai-high/80">• {finding}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-medsight-primary/60">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatTimeAgo(notification.timestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BeakerIcon className="w-3 h-3" />
                      <span>Source: {notification.source}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {notification.metadata && (
                      <button
                        onClick={() => toggleExpanded(notification.id)}
                        className="btn-medsight px-2 py-1 text-xs"
                      >
                        {expandedNotification === notification.id ? (
                          <ChevronUpIcon className="w-3 h-3" />
                        ) : (
                          <ChevronDownIcon className="w-3 h-3" />
                        )}
                      </button>
                    )}
                    
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="btn-medsight px-2 py-1 text-xs"
                      >
                        <EyeIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                <div className="flex items-center space-x-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleNotificationAction(notification.id, action.action)}
                      className={`btn-medical px-3 py-1 text-sm ${
                        action.primary
                          ? `bg-gradient-${getNotificationColor(notification.type)}`
                          : 'btn-secondary'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="medsight-glass p-8 rounded-xl text-center">
          <BellIcon className="w-12 h-12 text-medsight-primary/50 mx-auto mb-4" />
          <div className="text-lg font-medium text-medsight-primary mb-2">
            No Notifications
          </div>
          <div className="text-sm text-medsight-primary/70">
            {filter === 'all' 
              ? 'No notifications at this time' 
              : `No ${filter.replace('-', ' ')} notifications`
            }
          </div>
        </div>
      )}
    </div>
  );
} 
export interface MedicalNotificationsProps {
  notifications?: MedicalNotification[];
  onNotificationClick?: (notification: MedicalNotification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
} 