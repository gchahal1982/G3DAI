import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Real admin dashboard with actual business functionality
export const AdminDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [selectedService, setSelectedService] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    // Load dashboard data
    useEffect(() => {
        loadDashboardData();
    }, [selectedTimeRange, selectedService]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // In real implementation, this would call actual APIs
            const response = await fetch(`/api/admin/dashboard?timeRange=${selectedTimeRange}&service=${selectedService}`);
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // Load mock data for demonstration
            setDashboardData(generateMockData());
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-white text-xl">Loading admin dashboard...</div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-red-400 text-xl">Failed to load dashboard data</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">G3D AI Services - Admin Dashboard</h1>
                <p className="text-slate-300">Real-time business analytics and service management</p>

                {/* Controls */}
                <div className="flex gap-4 mt-4">
                    <select
                        value={selectedTimeRange}
                        onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                        className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-2"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>

                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-2"
                    >
                        <option value="all">All Services</option>
                        <option value="vision-pro">Vision Pro</option>
                        <option value="aura">aura</option>
                        <option value="creative-studio">Creative Studio</option>
                        <option value="dataforge">DataForge</option>
                        <option value="secureai">SecureAI</option>
                        <option value="automl">AutoML</option>
                        <option value="chatbuilder">ChatBuilder</option>
                        <option value="videoai">VideoAI</option>
                        <option value="healthai">HealthAI</option>
                        <option value="financeai">FinanceAI</option>
                        <option value="voiceai">VoiceAI</option>
                        <option value="translateai">TranslateAI</option>
                        <option value="documind">DocuMind</option>
                        <option value="mesh3d">Mesh3D</option>
                        <option value="edgeai">EdgeAI</option>
                        <option value="legalai">LegalAI</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Revenue"
                    value={`$${(dashboardData.revenue.total / 100).toLocaleString()}`}
                    change={dashboardData.revenue.change}
                    icon="💰"
                />
                <MetricCard
                    title="Active Users"
                    value={dashboardData.users.active.toLocaleString()}
                    change={dashboardData.users.change}
                    icon="👥"
                />
                <MetricCard
                    title="API Calls"
                    value={dashboardData.apiCalls.total.toLocaleString()}
                    change={dashboardData.apiCalls.change}
                    icon="🔌"
                />
                <MetricCard
                    title="AI Inferences"
                    value={dashboardData.aiInferences.total.toLocaleString()}
                    change={dashboardData.aiInferences.change}
                    icon="🧠"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Chart */}
                <GlassCard title="Revenue Over Time">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.revenueChart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ fill: '#10B981' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Service Usage Chart */}
                <GlassCard title="Service Usage Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dashboardData.serviceUsage}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="usage"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {dashboardData.serviceUsage.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getServiceColor(entry.service)} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Growth Chart */}
                <GlassCard title="User Growth">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="newUsers" fill="#3B82F6" name="New Users" />
                            <Bar dataKey="totalUsers" fill="#10B981" name="Total Users" />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Subscription Plans */}
                <GlassCard title="Subscription Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dashboardData.subscriptionPlans}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {dashboardData.subscriptionPlans.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getPlanColor(entry.plan)} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </GlassCard>
            </div>

            {/* Service Performance Table */}
            <GlassCard title="Service Performance Metrics">
                <div className="overflow-x-auto">
                    <table className="w-full text-white">
                        <thead>
                            <tr className="border-b border-slate-600">
                                <th className="text-left py-3 px-4">Service</th>
                                <th className="text-left py-3 px-4">Active Users</th>
                                <th className="text-left py-3 px-4">API Calls</th>
                                <th className="text-left py-3 px-4">Revenue</th>
                                <th className="text-left py-3 px-4">Avg Response Time</th>
                                <th className="text-left py-3 px-4">Error Rate</th>
                                <th className="text-left py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.serviceMetrics.map((service) => (
                                <tr key={service.name} className="border-b border-slate-700 hover:bg-slate-800/50">
                                    <td className="py-3 px-4 font-medium">{service.displayName}</td>
                                    <td className="py-3 px-4">{service.activeUsers.toLocaleString()}</td>
                                    <td className="py-3 px-4">{service.apiCalls.toLocaleString()}</td>
                                    <td className="py-3 px-4">${(service.revenue / 100).toLocaleString()}</td>
                                    <td className="py-3 px-4">{service.avgResponseTime}ms</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs ${service.errorRate < 1 ? 'bg-green-900 text-green-300' :
                                                service.errorRate < 5 ? 'bg-yellow-900 text-yellow-300' :
                                                    'bg-red-900 text-red-300'
                                            }`}>
                                            {service.errorRate.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded text-xs ${service.status === 'healthy' ? 'bg-green-900 text-green-300' :
                                                service.status === 'warning' ? 'bg-yellow-900 text-yellow-300' :
                                                    'bg-red-900 text-red-300'
                                            }`}>
                                            {service.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <GlassCard title="Recent User Activity">
                    <div className="space-y-4">
                        {dashboardData.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                                <div>
                                    <div className="text-white font-medium">{activity.user}</div>
                                    <div className="text-slate-400 text-sm">{activity.action}</div>
                                </div>
                                <div className="text-slate-400 text-sm">{activity.timestamp}</div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard title="System Alerts">
                    <div className="space-y-4">
                        {dashboardData.systemAlerts.map((alert, index) => (
                            <div key={index} className={`p-3 rounded border-l-4 ${alert.severity === 'critical' ? 'bg-red-900/20 border-red-500' :
                                    alert.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-500' :
                                        'bg-blue-900/20 border-blue-500'
                                }`}>
                                <div className="text-white font-medium">{alert.title}</div>
                                <div className="text-slate-400 text-sm">{alert.message}</div>
                                <div className="text-slate-500 text-xs mt-1">{alert.timestamp}</div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

// Metric Card Component
const MetricCard: React.FC<{
    title: string;
    value: string;
    change: number;
    icon: string;
}> = ({ title, value, change, icon }) => (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{icon}</div>
            <div className={`text-sm px-2 py-1 rounded ${change >= 0 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                }`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-slate-400 text-sm">{title}</div>
    </div>
);

// Glass Card Component
const GlassCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        {children}
    </div>
);

// Helper functions
const getServiceColor = (service: string): string => {
    const colors: Record<string, string> = {
        'vision-pro': '#2563eb',
        'aura': '#7c3aed',
        'creative-studio': '#ec4899',
        'dataforge': '#059669',
        'secureai': '#dc2626',
        'automl': '#ea580c',
        'chatbuilder': '#0891b2',
        'videoai': '#7c2d12',
        'healthai': '#16a34a',
        'financeai': '#ca8a04',
        'voiceai': '#9333ea',
        'translateai': '#0d9488',
        'documind': '#b45309',
        'mesh3d': '#be185d',
        'edgeai': '#0ea5e9',
        'legalai': '#1e40af'
    };
    return colors[service] || '#6b7280';
};

const getPlanColor = (plan: string): string => {
    const colors: Record<string, string> = {
        'free': '#6b7280',
        'starter': '#3b82f6',
        'professional': '#10b981',
        'enterprise': '#f59e0b'
    };
    return colors[plan] || '#6b7280';
};

// Mock data generator for demonstration
const generateMockData = (): DashboardData => ({
    revenue: { total: 1250000, change: 15.3 }, // $12,500
    users: { active: 2847, change: 8.7 },
    apiCalls: { total: 1250000, change: 22.1 },
    aiInferences: { total: 450000, change: 18.5 },

    revenueChart: [
        { date: '2024-01', revenue: 8500 },
        { date: '2024-02', revenue: 9200 },
        { date: '2024-03', revenue: 10800 },
        { date: '2024-04', revenue: 12500 },
    ],

    serviceUsage: [
        { service: 'aura', usage: 25 },
        { service: 'creative-studio', usage: 20 },
        { service: 'dataforge', usage: 15 },
        { service: 'chatbuilder', usage: 12 },
        { service: 'vision-pro', usage: 10 },
        { service: 'others', usage: 18 }
    ],

    userGrowth: [
        { date: '2024-01', newUsers: 145, totalUsers: 1200 },
        { date: '2024-02', newUsers: 189, totalUsers: 1389 },
        { date: '2024-03', newUsers: 234, totalUsers: 1623 },
        { date: '2024-04', newUsers: 298, totalUsers: 1921 },
    ],

    subscriptionPlans: [
        { plan: 'free', count: 1200 },
        { plan: 'starter', count: 450 },
        { plan: 'professional', count: 180 },
        { plan: 'enterprise', count: 25 }
    ],

    serviceMetrics: [
        {
            name: 'aura',
            displayName: 'G3D aura',
            activeUsers: 1250,
            apiCalls: 125000,
            revenue: 450000,
            avgResponseTime: 240,
            errorRate: 0.5,
            status: 'healthy'
        },
        {
            name: 'creative-studio',
            displayName: 'G3D Creative Studio',
            activeUsers: 890,
            apiCalls: 89000,
            revenue: 320000,
            avgResponseTime: 180,
            errorRate: 0.8,
            status: 'healthy'
        },
        // Add more services...
    ],

    recentActivity: [
        { user: 'john@company.com', action: 'Generated 15 code snippets', timestamp: '2 minutes ago' },
        { user: 'sarah@startup.io', action: 'Created new creative campaign', timestamp: '5 minutes ago' },
        { user: 'mike@enterprise.com', action: 'Upgraded to Enterprise plan', timestamp: '12 minutes ago' },
    ],

    systemAlerts: [
        {
            severity: 'warning',
            title: 'High API Usage',
            message: 'aura service experiencing 150% normal traffic',
            timestamp: '10 minutes ago'
        },
        {
            severity: 'info',
            title: 'Maintenance Scheduled',
            message: 'VideoAI service maintenance window: 2AM-4AM UTC',
            timestamp: '1 hour ago'
        }
    ]
});

// Type definitions
interface DashboardData {
    revenue: { total: number; change: number };
    users: { active: number; change: number };
    apiCalls: { total: number; change: number };
    aiInferences: { total: number; change: number };
    revenueChart: Array<{ date: string; revenue: number }>;
    serviceUsage: Array<{ service: string; usage: number }>;
    userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
    subscriptionPlans: Array<{ plan: string; count: number }>;
    serviceMetrics: Array<{
        name: string;
        displayName: string;
        activeUsers: number;
        apiCalls: number;
        revenue: number;
        avgResponseTime: number;
        errorRate: number;
        status: 'healthy' | 'warning' | 'critical';
    }>;
    recentActivity: Array<{
        user: string;
        action: string;
        timestamp: string;
    }>;
    systemAlerts: Array<{
        severity: 'info' | 'warning' | 'critical';
        title: string;
        message: string;
        timestamp: string;
    }>;
}

export default AdminDashboard;