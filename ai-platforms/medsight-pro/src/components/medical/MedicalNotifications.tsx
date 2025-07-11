'use client';

import { useState } from 'react';

// Simple icon components
const Bell = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🔔</div>;
const AlertTriangle = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⚠️</div>;
const CheckCircle = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>✅</div>;
const Info = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>ℹ️</div>;
const Clock = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⏰</div>;
const Brain = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🧠</div>;
const Heart = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>❤️</div>;
const Shield = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🛡️</div>;
const Users = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>👥</div>;
const Zap = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⚡</div>;
const X = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>❌</div>;

// Simple component definitions
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'primary', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{children}</span>
);

const Button = ({ children, className = '', variant = 'primary', size = 'md', onClick, ...props }: any) => (
  <button 
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

interface MedicalNotificationsProps {
  className?: string;
}

// Mock medical notifications data
const mockNotifications = [
  {
    id: 'NOTIF-001',
    type: 'critical',
    category: 'emergency',
    title: 'STAT Read Required',
    message: 'Emergency CT scan requires immediate attention - possible stroke',
    caseId: 'CASE-2024-001',
    patientName: 'John Doe',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    priority: 'critical',
    source: 'Emergency Department',
    actionRequired: true,
    estimatedTime: '< 5 min'
  },
  {
    id: 'NOTIF-002',
    type: 'warning',
    category: 'ai-analysis',
    title: 'AI Analysis Complete',
    message: 'High confidence detection of pulmonary embolism in CT chest study',
    caseId: 'CASE-2024-002',
    patientName: 'Jane Smith',
    timestamp: '2024-01-15T10:15:00Z',
    isRead: false,
    priority: 'high',
    source: 'AI Inference Engine',
    actionRequired: true,
    aiConfidence: 94,
    estimatedTime: '10 min'
  },
  {
    id: 'NOTIF-003',
    type: 'info',
    category: 'collaboration',
    title: 'Peer Review Request',
    message: 'Dr. Mike Chen requests second opinion on complex brain MRI',
    caseId: 'CASE-2024-003',
    patientName: 'Robert Johnson',
    timestamp: '2024-01-15T09:45:00Z',
    isRead: false,
    priority: 'normal',
    source: 'Dr. Mike Chen',
    actionRequired: true,
    estimatedTime: '15 min'
  },
  {
    id: 'NOTIF-004',
    type: 'success',
    category: 'system',
    title: 'System Update Complete',
    message: 'DICOM processing system updated successfully - improved performance',
    timestamp: '2024-01-15T09:00:00Z',
    isRead: true,
    priority: 'low',
    source: 'System Administrator',
    actionRequired: false
  },
  {
    id: 'NOTIF-005',
    type: 'warning',
    category: 'compliance',
    title: 'License Renewal Reminder',
    message: 'Medical license expires in 30 days - renewal required',
    timestamp: '2024-01-15T08:30:00Z',
    isRead: false,
    priority: 'high',
    source: 'Compliance System',
    actionRequired: true,
    estimatedTime: '30 min'
  },
  {
    id: 'NOTIF-006',
    type: 'info',
    category: 'workflow',
    title: 'Workload Alert',
    message: 'High case volume detected - consider break or delegation',
    timestamp: '2024-01-15T08:00:00Z',
    isRead: false,
    priority: 'normal',
    source: 'Workflow Manager',
    actionRequired: false
  }
];

export function MedicalNotifications({ className }: MedicalNotificationsProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filterType, setFilterType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.category === filterType;
    const matchesRead = !showUnreadOnly || !notification.isRead;
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'emergency') return <Heart className="h-4 w-4" />;
    if (category === 'ai-analysis') return <Brain className="h-4 w-4" />;
    if (category === 'collaboration') return <Users className="h-4 w-4" />;
    if (category === 'compliance') return <Shield className="h-4 w-4" />;
    if (category === 'system') return <Zap className="h-4 w-4" />;
    
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'critical') return 'bg-red-100 text-red-600 border-red-200';
    if (type === 'warning') return 'bg-amber-100 text-amber-600 border-amber-200';
    if (type === 'success') return 'bg-green-100 text-green-600 border-green-200';
    return 'bg-blue-100 text-blue-600 border-blue-200';
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="medsight-glass border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <span>Medical Notifications</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {criticalCount > 0 && (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 animate-pulse">
                  {criticalCount} Critical
                </Badge>
              )}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {unreadCount} Unread
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="emergency">Emergency</option>
                <option value="ai-analysis">AI Analysis</option>
                <option value="collaboration">Collaboration</option>
                <option value="compliance">Compliance</option>
                <option value="system">System</option>
                <option value="workflow">Workflow</option>
              </select>
              <label className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded"
                />
                <span>Unread only</span>
              </label>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`medsight-glass rounded-lg p-4 transition-colors ${
                  !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-white/70 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full flex-shrink-0 ${getNotificationColor(notification.type, notification.priority)}`}>
                    {getNotificationIcon(notification.type, notification.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant="outline" className={getPriorityBadgeColor(notification.priority)}>
                          {notification.priority.toUpperCase()}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeAgo(notification.timestamp)}</span>
                        </div>
                        <span>•</span>
                        <span>{notification.source}</span>
                        {notification.caseId && (
                          <>
                            <span>•</span>
                            <span>{notification.caseId}</span>
                          </>
                        )}
                        {notification.aiConfidence && (
                          <>
                            <span>•</span>
                            <span>AI: {notification.aiConfidence}%</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {notification.actionRequired && notification.estimatedTime && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Est: {notification.estimatedTime}
                          </Badge>
                        )}
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs px-2 py-1 h-6"
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissNotification(notification.id)}
                          className="text-xs px-2 py-1 h-6 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {notification.actionRequired && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Button size="sm" className="glass-button bg-blue-100 text-blue-700 border-blue-200">
                          Take Action
                        </Button>
                        {notification.caseId && (
                          <Button size="sm" variant="outline" className="glass-button">
                            View Case
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                <Bell className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 