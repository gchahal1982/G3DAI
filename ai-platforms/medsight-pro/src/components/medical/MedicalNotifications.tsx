'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  HeartIcon,
  BeakerIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export interface MedicalNotification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success' | 'ai_result' | 'collaboration' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  source: string;
  actionUrl?: string;
  patientId?: string;
  studyId?: string;
  aiConfidence?: number;
}

export interface MedicalNotificationsProps {
  notifications?: MedicalNotification[];
  onNotificationClick?: (notification: MedicalNotification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
}

export function MedicalNotifications({ 
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onDismiss
}: MedicalNotificationsProps) {
  const [localNotifications, setLocalNotifications] = useState<MedicalNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  useEffect(() => {
    // Initialize with mock data if no notifications provided
    if (notifications.length === 0) {
      setLocalNotifications([
        {
          id: '1',
          type: 'critical',
          title: 'Critical Finding Detected',
          message: 'AI analysis detected potential pneumothorax in Study #MR-2024-001',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          isRead: false,
          priority: 'high',
          source: 'AI Analysis Engine',
          actionUrl: '/workspace/ai-analysis',
          patientId: 'PT-2024-001',
          studyId: 'MR-2024-001',
          aiConfidence: 0.94
        },
        {
          id: '2',
          type: 'ai_result',
          title: 'AI Analysis Complete',
          message: 'Computer vision analysis completed for chest X-ray study',
          timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
          isRead: false,
          priority: 'medium',
          source: 'Computer Vision',
          actionUrl: '/workspace/ai-analysis',
          patientId: 'PT-2024-002',
          studyId: 'XR-2024-003',
          aiConfidence: 0.87
        },
        {
          id: '3',
          type: 'collaboration',
          title: 'Consultation Request',
          message: 'Dr. Johnson requests consultation on complex cardiac case',
          timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
          isRead: false,
          priority: 'medium',
          source: 'Dr. Johnson',
          actionUrl: '/workspace/collaboration',
          patientId: 'PT-2024-003',
          studyId: 'CT-2024-005'
        },
        {
          id: '4',
          type: 'system',
          title: 'DICOM Server Maintenance',
          message: 'Scheduled maintenance completed successfully',
          timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          isRead: true,
          priority: 'low',
          source: 'System Administrator',
          actionUrl: '/admin/system-health'
        },
        {
          id: '5',
          type: 'warning',
          title: 'Image Quality Warning',
          message: 'Low contrast detected in mammography study - review recommended',
          timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          isRead: false,
          priority: 'medium',
          source: 'Quality Assurance',
          actionUrl: '/workspace/imaging',
          patientId: 'PT-2024-004',
          studyId: 'MG-2024-002'
        },
        {
          id: '6',
          type: 'success',
          title: 'Study Review Complete',
          message: 'Successfully completed review of 15 radiology studies',
          timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
          isRead: true,
          priority: 'low',
          source: 'Clinical Workflow',
          actionUrl: '/reports'
        }
      ]);
    } else {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  const getNotificationIcon = (type: MedicalNotification['type']) => {
    switch (type) {
      case 'critical':
        return ExclamationTriangleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'info':
        return BellIcon;
      case 'success':
        return CheckCircleIcon;
      case 'ai_result':
        return BeakerIcon;
      case 'collaboration':
        return UserGroupIcon;
      case 'system':
        return ComputerDesktopIcon;
      default:
        return BellIcon;
    }
  };

  const getNotificationColor = (type: MedicalNotification['type']) => {
    switch (type) {
      case 'critical':
        return 'text-medsight-critical';
      case 'warning':
        return 'text-medsight-pending';
      case 'info':
        return 'text-medsight-primary';
      case 'success':
        return 'text-medsight-normal';
      case 'ai_result':
        return 'text-medsight-ai-high';
      case 'collaboration':
        return 'text-medsight-secondary';
      case 'system':
        return 'text-medsight-primary';
      default:
        return 'text-medsight-primary';
    }
  };

  const getNotificationBg = (type: MedicalNotification['type']) => {
    switch (type) {
      case 'critical':
        return 'border-medsight-critical/20 bg-medsight-critical/5';
      case 'warning':
        return 'border-medsight-pending/20 bg-medsight-pending/5';
      case 'info':
        return 'border-medsight-primary/20 bg-medsight-primary/5';
      case 'success':
        return 'border-medsight-normal/20 bg-medsight-normal/5';
      case 'ai_result':
        return 'border-medsight-ai-high/20 bg-medsight-ai-high/5';
      case 'collaboration':
        return 'border-medsight-secondary/20 bg-medsight-secondary/5';
      case 'system':
        return 'border-medsight-primary/20 bg-medsight-primary/5';
      default:
        return 'border-medsight-primary/20 bg-medsight-primary/5';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
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

  const handleNotificationClick = (notification: MedicalNotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setLocalNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    onMarkAsRead?.(notificationId);
  };

  const handleDismiss = (notificationId: string) => {
    setLocalNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    onDismiss?.(notificationId);
  };

  const filteredNotifications = localNotifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'critical':
        return notification.type === 'critical' || notification.priority === 'high';
      default:
        return true;
    }
  });

  const unreadCount = localNotifications.filter(n => !n.isRead).length;
  const criticalCount = localNotifications.filter(n => n.type === 'critical').length;

  return (
    <div className="space-y-4">
      {/* Notifications Header */}
      <div className="medsight-glass p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="medsight-control-glass p-2 rounded-lg">
              <BellIcon className="w-5 h-5 text-medsight-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-medsight-primary">
                Medical Notifications
              </h3>
              <div className="flex items-center space-x-4 text-xs text-medsight-primary/70">
                <span>{unreadCount} unread</span>
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
                Critical Alert
              </span>
            </div>
          )}
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
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'unread' 
                ? 'bg-medsight-primary text-white' 
                : 'text-medsight-primary hover:bg-medsight-primary/10'
            }`}
          >
            Unread ({unreadCount})
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
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="medsight-glass p-6 rounded-xl text-center">
            <BellIcon className="w-8 h-8 text-medsight-primary/50 mx-auto mb-2" />
            <p className="text-sm text-medsight-primary/70">
              No notifications match your filter
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            const bgClass = getNotificationBg(notification.type);
            
            return (
              <div
                key={notification.id}
                className={`medsight-glass p-4 rounded-xl border ${bgClass} ${
                  !notification.isRead ? 'border-l-4 border-l-medsight-primary' : ''
                } hover:scale-[1.02] transition-all cursor-pointer`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`medsight-control-glass p-2 rounded-lg ${
                    notification.priority === 'high' ? 'animate-pulse' : ''
                  }`}>
                    <IconComponent className={`w-4 h-4 ${colorClass}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${colorClass}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-medsight-primary/60">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(notification.id);
                          }}
                          className="text-medsight-primary/40 hover:text-medsight-primary/70 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-medsight-primary/70 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-medsight-primary/60">
                        <span>From: {notification.source}</span>
                        {notification.patientId && (
                          <span>Patient: {notification.patientId}</span>
                        )}
                        {notification.studyId && (
                          <span>Study: {notification.studyId}</span>
                        )}
                      </div>
                      
                      {notification.aiConfidence && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-medsight-ai-high/70">
                            AI Confidence:
                          </span>
                          <span className={`text-xs font-medium ${
                            notification.aiConfidence >= 0.9 ? 'text-medsight-ai-high' :
                            notification.aiConfidence >= 0.7 ? 'text-medsight-ai-medium' :
                            'text-medsight-ai-low'
                          }`}>
                            {(notification.aiConfidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="mt-2 text-xs text-medsight-primary/60 hover:text-medsight-primary transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Medical Compliance Notice */}
      <div className="medsight-glass p-3 rounded-xl border-medsight-primary/20">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="w-4 h-4 text-medsight-primary" />
          <span className="text-xs text-medsight-primary/70">
            All medical notifications are HIPAA compliant and audit-logged
          </span>
        </div>
      </div>
    </div>
  );
} 