import { Metadata } from 'next';
import { Suspense } from 'react';
import { SystemHealth } from '@/components/admin/SystemHealth';
import { UserManagement } from '@/components/admin/UserManagement';
import { MedicalCompliance } from '@/components/admin/MedicalCompliance';
import { SecurityMonitoring } from '@/components/admin/SecurityMonitoring';
import { SystemMetrics } from '@/components/admin/SystemMetrics';

// Simple icon components
const Shield = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🛡️</div>;
const Users = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>👥</div>;
const Activity = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📊</div>;
const Settings = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⚙️</div>;
const AlertTriangle = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⚠️</div>;
const CheckCircle = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>✅</div>;
const Heart = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>❤️</div>;
const Database = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>💾</div>;
const Server = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🖥️</div>;
const Lock = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🔒</div>;

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

const Tabs = ({ defaultValue, children, className = '' }: { defaultValue: string; children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>
);

const TabsTrigger = ({ children, value, className = '' }: { children: React.ReactNode; value: string; className?: string }) => (
  <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}>{children}</button>
);

const TabsContent = ({ children, value, className = '' }: { children: React.ReactNode; value: string; className?: string }) => (
  <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>{children}</div>
);

export const metadata: Metadata = {
  title: 'Admin Dashboard - MedSight Pro',
  description: 'System administration interface for medical platform management',
};

// Mock admin dashboard data
const mockAdminData = {
  systemOverview: {
    totalUsers: 1247,
    activeUsers: 892,
    totalOrganizations: 34,
    activeOrganizations: 32,
    systemUptime: '99.97%',
    lastIncident: '12 days ago',
    criticalAlerts: 2,
    warnings: 8
  },
  systemHealth: {
    cpuUsage: 68,
    memoryUsage: 74,
    diskUsage: 45,
    networkLatency: 23,
    databaseHealth: 'healthy',
    apiResponseTime: 145,
    errorRate: 0.02
  },
  userStats: {
    newUsersToday: 12,
    activeSessionsNow: 234,
    failedLogins: 8,
    suspendedAccounts: 3,
    pendingVerifications: 15,
    licenseExpirations: 7
  },
  complianceStats: {
    hipaaCompliance: 100,
    dataRetentionCompliance: 98,
    accessControlCompliance: 99,
    auditLogCompliance: 100,
    encryptionCompliance: 100,
    backupCompliance: 97
  },
  recentActivity: [
    { type: 'user', action: 'New user registration', details: 'Dr. Sarah Johnson - Radiology', time: '5 min ago', severity: 'info' },
    { type: 'security', action: 'Failed login attempt', details: 'Multiple attempts from IP 192.168.1.100', time: '12 min ago', severity: 'warning' },
    { type: 'system', action: 'System backup completed', details: 'Daily backup - 2.4TB processed', time: '25 min ago', severity: 'success' },
    { type: 'compliance', action: 'HIPAA audit log generated', details: 'Monthly compliance report', time: '1 hour ago', severity: 'info' },
    { type: 'alert', action: 'High memory usage detected', details: 'Server cluster-03 at 85% memory', time: '2 hours ago', severity: 'warning' }
  ]
};

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Admin Dashboard Header */}
      <div className="medsight-glass border-b border-white/10 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                System Administration & Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className={`${
              mockAdminData.systemOverview.criticalAlerts > 0 
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' 
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {mockAdminData.systemOverview.criticalAlerts > 0 ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {mockAdminData.systemOverview.criticalAlerts} Critical
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  System Healthy
                </>
              )}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Heart className="h-4 w-4 mr-1" />
              Uptime: {mockAdminData.systemOverview.systemUptime}
            </Badge>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Content */}
      <div className="px-6 pb-6">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="medsight-glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockAdminData.systemOverview.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    {mockAdminData.systemOverview.activeUsers} active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medsight-glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Organizations</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockAdminData.systemOverview.totalOrganizations}
                  </p>
                  <p className="text-xs text-green-600">
                    {mockAdminData.systemOverview.activeOrganizations} active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medsight-glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">System Health</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockAdminData.systemHealth.databaseHealth === 'healthy' ? 'Healthy' : 'Issues'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    CPU: {mockAdminData.systemHealth.cpuUsage}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medsight-glass border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Security Status</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockAdminData.systemOverview.criticalAlerts + mockAdminData.systemOverview.warnings}
                  </p>
                  <p className="text-xs text-amber-600">
                    {mockAdminData.systemOverview.warnings} warnings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - System Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Admin Tabs */}
            <Tabs defaultValue="system-health" className="w-full">
              <TabsList className="grid w-full grid-cols-4 medsight-glass">
                <TabsTrigger value="system-health">System Health</TabsTrigger>
                <TabsTrigger value="user-management">User Management</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="system-health" className="space-y-4">
                <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
                  <SystemHealth />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="user-management" className="space-y-4">
                <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
                  <UserManagement />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="compliance" className="space-y-4">
                <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
                  <MedicalCompliance />
                </Suspense>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
                  <SecurityMonitoring />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Metrics & Activity */}
          <div className="space-y-6">
            {/* System Metrics */}
            <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
              <SystemMetrics />
            </Suspense>

            {/* Recent Admin Activity */}
            <Card className="medsight-glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAdminData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        activity.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                        activity.severity === 'success' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'user' && <Users className="h-4 w-4" />}
                        {activity.type === 'security' && <Lock className="h-4 w-4" />}
                        {activity.type === 'system' && <Server className="h-4 w-4" />}
                        {activity.type === 'compliance' && <Shield className="h-4 w-4" />}
                        {activity.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {activity.details}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Admin Actions */}
            <Card className="medsight-glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Manage Users</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Database className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">System Backup</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Security Audit</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">System Settings</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 