import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



// G3D RetailAI - Retail Intelligence Suite
export const RetailAIDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'customers' | 'sales' | 'insights'>('inventory');
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
    const [loading, setLoading] = useState(false);

    // Mock data - in real implementation, this would come from APIs
    const inventoryData = {
        totalProducts: 12847,
        lowStockItems: 45,
        outOfStock: 12,
        overstocked: 23,
        turnoverRate: 4.2,
        categories: [
            { name: 'Electronics', stock: 2400, sold: 1200, revenue: 450000 },
            { name: 'Clothing', stock: 3200, sold: 2100, revenue: 320000 },
            { name: 'Home & Garden', stock: 1800, sold: 900, revenue: 180000 },
            { name: 'Sports', stock: 1500, sold: 800, revenue: 150000 },
            { name: 'Books', stock: 2200, sold: 1100, revenue: 85000 }
        ]
    };

    const customerData = {
        totalCustomers: 45678,
        activeCustomers: 12456,
        newCustomers: 1234,
        churnRate: 2.3,
        avgOrderValue: 127.50,
        lifetimeValue: 890.25,
        segments: [
            { segment: 'VIP', count: 1234, revenue: 450000, avgOrder: 285 },
            { segment: 'Loyal', count: 5678, revenue: 680000, avgOrder: 145 },
            { segment: 'Regular', count: 8901, revenue: 520000, avgOrder: 95 },
            { segment: 'New', count: 3456, revenue: 180000, avgOrder: 65 }
        ]
    };

    const salesData = {
        todayRevenue: 23450,
        weekRevenue: 145600,
        monthRevenue: 567800,
        growth: 15.6,
        topProducts: [
            { name: 'Wireless Earbuds', sales: 234, revenue: 23400 },
            { name: 'Smart Watch', sales: 189, revenue: 45600 },
            { name: 'Laptop Stand', sales: 156, revenue: 7800 },
            { name: 'Coffee Maker', sales: 134, revenue: 16800 },
            { name: 'Desk Lamp', sales: 123, revenue: 6150 }
        ]
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-900">
            {/* Header */}
            <div className="bg-emerald-800/20 backdrop-blur-md border-b border-emerald-700/30 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            🛍️ G3D RetailAI
                        </h1>
                        <p className="text-emerald-200">Retail Intelligence Suite - Optimize inventory, understand customers, boost sales</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="bg-emerald-800/50 text-white border border-emerald-600 rounded px-3 py-2"
                        >
                            <option value="24h">Last 24 hours</option>
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>

                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-emerald-800/10 backdrop-blur-md border-b border-emerald-700/20">
                <div className="flex space-x-8 p-6">
                    {[
                        { id: 'inventory', label: 'Inventory Management', icon: '📦' },
                        { id: 'customers', label: 'Customer Analytics', icon: '👥' },
                        { id: 'sales', label: 'Sales Performance', icon: '📈' },
                        { id: 'insights', label: 'AI Insights', icon: '🧠' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-emerald-200 hover:bg-emerald-800/30'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6">
                {/* Inventory Management Tab */}
                {activeTab === 'inventory' && (
                    <div className="space-y-6">
                        {/* Inventory Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">{inventoryData.totalProducts.toLocaleString()}</div>
                                    <div className="text-emerald-200 text-sm">Total Products</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-400">{inventoryData.lowStockItems}</div>
                                    <div className="text-emerald-200 text-sm">Low Stock Items</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-red-400">{inventoryData.outOfStock}</div>
                                    <div className="text-emerald-200 text-sm">Out of Stock</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-400">{inventoryData.overstocked}</div>
                                    <div className="text-emerald-200 text-sm">Overstocked</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-400">{inventoryData.turnoverRate}</div>
                                    <div className="text-emerald-200 text-sm">Turnover Rate</div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Inventory Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Category Performance">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={inventoryData.categories}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                                        <XAxis dataKey="name" stroke="#a7f3d0" />
                                        <YAxis stroke="#a7f3d0" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#064e3b',
                                                border: '1px solid #059669',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="stock" fill="#10b981" name="Stock" />
                                        <Bar dataKey="sold" fill="#34d399" name="Sold" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </GlassCard>

                            <GlassCard title="Stock Distribution">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={inventoryData.categories}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="stock"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {inventoryData.categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getInventoryColor(index)} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </GlassCard>
                        </div>

                        {/* Inventory Alerts */}
                        <GlassCard title="Inventory Alerts & Recommendations">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <div className="text-red-400 text-xl">⚠️</div>
                                    <div>
                                        <div className="text-white font-medium">12 items out of stock</div>
                                        <div className="text-red-200 text-sm">Immediate restocking required for high-demand products</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                    <div className="text-yellow-400 text-xl">📦</div>
                                    <div>
                                        <div className="text-white font-medium">45 items low on stock</div>
                                        <div className="text-yellow-200 text-sm">Consider reordering within next 7 days</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                    <div className="text-blue-400 text-xl">🎯</div>
                                    <div>
                                        <div className="text-white font-medium">AI Recommendation: Seasonal adjustment</div>
                                        <div className="text-blue-200 text-sm">Increase electronics inventory by 25% for upcoming holiday season</div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Customer Analytics Tab */}
                {activeTab === 'customers' && (
                    <div className="space-y-6">
                        {/* Customer Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">{customerData.totalCustomers.toLocaleString()}</div>
                                    <div className="text-emerald-200 text-sm">Total Customers</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-400">{customerData.activeCustomers.toLocaleString()}</div>
                                    <div className="text-emerald-200 text-sm">Active Customers</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-400">{customerData.newCustomers.toLocaleString()}</div>
                                    <div className="text-emerald-200 text-sm">New Customers</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-red-400">{customerData.churnRate}%</div>
                                    <div className="text-emerald-200 text-sm">Churn Rate</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-400">${customerData.avgOrderValue}</div>
                                    <div className="text-emerald-200 text-sm">Avg Order Value</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-400">${customerData.lifetimeValue}</div>
                                    <div className="text-emerald-200 text-sm">Lifetime Value</div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Customer Segmentation */}
                        <GlassCard title="Customer Segmentation Analysis">
                            <div className="overflow-x-auto">
                                <table className="w-full text-white">
                                    <thead>
                                        <tr className="border-b border-emerald-600">
                                            <th className="text-left py-3 px-4">Segment</th>
                                            <th className="text-left py-3 px-4">Customers</th>
                                            <th className="text-left py-3 px-4">Revenue</th>
                                            <th className="text-left py-3 px-4">Avg Order</th>
                                            <th className="text-left py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerData.segments.map((segment) => (
                                            <tr key={segment.segment} className="border-b border-emerald-700/50 hover:bg-emerald-800/20">
                                                <td className="py-3 px-4 font-medium">{segment.segment}</td>
                                                <td className="py-3 px-4">{segment.count.toLocaleString()}</td>
                                                <td className="py-3 px-4">${segment.revenue.toLocaleString()}</td>
                                                <td className="py-3 px-4">${segment.avgOrder}</td>
                                                <td className="py-3 px-4">
                                                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm">
                                                        Target Campaign
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Sales Performance Tab */}
                {activeTab === 'sales' && (
                    <div className="space-y-6">
                        {/* Sales Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">${salesData.todayRevenue.toLocaleString()}</div>
                                    <div className="text-emerald-200 text-sm">Today's Revenue</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-400">${salesData.weekRevenue.toLocaleString()}</div>
                                    <div className="text-emerald-200 text-sm">Week Revenue</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-400">${salesData.monthRevenue.toLocaleString()}</div>
                                    <div className="text-emerald-200 text-sm">Month Revenue</div>
                                </div>
                            </GlassCard>
                            <GlassCard>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-400">+{salesData.growth}%</div>
                                    <div className="text-emerald-200 text-sm">Growth Rate</div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Top Products */}
                        <GlassCard title="Top Performing Products">
                            <div className="space-y-4">
                                {salesData.topProducts.map((product, index) => (
                                    <div key={product.name} className="flex items-center justify-between p-3 bg-emerald-800/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{product.name}</div>
                                                <div className="text-emerald-200 text-sm">{product.sales} units sold</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-bold">${product.revenue.toLocaleString()}</div>
                                            <div className="text-emerald-200 text-sm">Revenue</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* AI Insights Tab */}
                {activeTab === 'insights' && (
                    <div className="space-y-6">
                        <GlassCard title="AI-Powered Retail Insights">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">🎯 Demand Forecasting</h3>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                            <div className="text-white font-medium">Electronics demand will increase 35% next month</div>
                                            <div className="text-blue-200 text-sm">Based on seasonal trends and market analysis</div>
                                        </div>
                                        <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                                            <div className="text-white font-medium">Clothing category showing steady 12% growth</div>
                                            <div className="text-green-200 text-sm">Recommend expanding winter collection</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white">💡 Optimization Recommendations</h3>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                                            <div className="text-white font-medium">Price optimization opportunity</div>
                                            <div className="text-purple-200 text-sm">Adjust pricing on 23 products for 8% revenue increase</div>
                                        </div>
                                        <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                            <div className="text-white font-medium">Cross-selling potential identified</div>
                                            <div className="text-yellow-200 text-sm">Bundle wireless earbuds with phone cases</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard title="Predictive Analytics Dashboard">
                            <div className="text-center py-8">
                                <div className="text-6xl mb-4">🔮</div>
                                <h3 className="text-xl font-semibold text-white mb-2">Advanced Predictive Models</h3>
                                <p className="text-emerald-200 mb-4">AI-powered forecasting for inventory, sales, and customer behavior</p>
                                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg">
                                    Run Prediction Models
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
};

// Glass Card Component
const GlassCard: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-emerald-800/20 backdrop-blur-md border border-emerald-700/30 rounded-lg p-6">
        {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
        {children}
    </div>
);

// Helper function for inventory colors
const getInventoryColor = (index: number): string => {
    const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
    return colors[index % colors.length];
};

export default RetailAIDashboard;