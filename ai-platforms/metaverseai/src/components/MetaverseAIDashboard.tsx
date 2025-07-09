import React, { useState } from 'react';
import { GlassCard } from '@shared/ui/components';


// G3D MetaverseAI - Immersive Virtual World Builder Platform
export const MetaverseAIDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'worlds' | 'avatars' | 'economy' | 'analytics'>('worlds');

    const dashboardStats = {
        activeWorlds: 2847,
        totalUsers: 156789,
        virtualAssets: 89432,
        economyValue: 12.7, // Million USD
        dailyTransactions: 45623,
        contentCreators: 8934
    };

    const virtualWorlds = [
        {
            name: 'Neo Tokyo 2087',
            category: 'Cyberpunk City',
            users: 15647,
            size: '50km²',
            status: 'Live',
            revenue: 245000,
            rating: 4.8
        },
        {
            name: 'Fantasy Realm',
            category: 'Medieval Fantasy',
            users: 23891,
            size: '75km²',
            status: 'Live',
            revenue: 387000,
            rating: 4.9
        },
        {
            name: 'Space Station Alpha',
            category: 'Sci-Fi Space',
            users: 8934,
            size: '25km²',
            status: 'Beta',
            revenue: 156000,
            rating: 4.6
        },
        {
            name: 'Tropical Paradise',
            category: 'Resort & Leisure',
            users: 34567,
            size: '40km²',
            status: 'Live',
            revenue: 498000,
            rating: 4.7
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-900 via-slate-900 to-indigo-900">
            {/* Header */}
            <div className="bg-violet-800/20 backdrop-blur-md border-b border-violet-700/30 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            🌐 G3D MetaverseAI
                        </h1>
                        <p className="text-violet-200">Immersive Virtual World Builder Platform - Create infinite digital universes</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-violet-800/30 backdrop-blur-md border border-violet-600/30 rounded-lg px-4 py-2">
                            <div className="text-violet-200 text-sm">Economy Value</div>
                            <div className="text-white text-xl font-bold">${dashboardStats.economyValue}M</div>
                        </div>
                        <button className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors">
                            Create World
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{dashboardStats.activeWorlds.toLocaleString()}</div>
                            <div className="text-violet-200 text-sm">Active Worlds</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-400">{dashboardStats.totalUsers.toLocaleString()}</div>
                            <div className="text-violet-200 text-sm">Total Users</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{dashboardStats.virtualAssets.toLocaleString()}</div>
                            <div className="text-violet-200 text-sm">Virtual Assets</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">${dashboardStats.economyValue}M</div>
                            <div className="text-violet-200 text-sm">Economy Value</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400">{dashboardStats.dailyTransactions.toLocaleString()}</div>
                            <div className="text-violet-200 text-sm">Daily Transactions</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{dashboardStats.contentCreators.toLocaleString()}</div>
                            <div className="text-violet-200 text-sm">Creators</div>
                        </div>
                    </GlassCard>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-violet-800/10 backdrop-blur-md border border-violet-700/20 rounded-lg mb-8">
                    <div className="flex space-x-8 p-6">
                        {[
                            { id: 'worlds', label: 'Virtual Worlds', icon: '🌍' },
                            { id: 'avatars', label: 'Avatar Studio', icon: '👤' },
                            { id: 'economy', label: 'Virtual Economy', icon: '💰' },
                            { id: 'analytics', label: 'Analytics', icon: '📊' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-violet-600 text-white'
                                        : 'text-violet-200 hover:bg-violet-800/30'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Virtual Worlds Tab */}
                {activeTab === 'worlds' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="World Builder Studio">
                                <div className="bg-slate-900/50 rounded-lg p-6 mb-4">
                                    <div className="text-center text-white mb-4">
                                        <div className="text-6xl mb-4">🏗️</div>
                                        <h3 className="text-xl font-semibold mb-2">AI-Powered World Generation</h3>
                                        <p className="text-violet-200">Create immersive 3D worlds with advanced AI assistance</p>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-4 min-h-80 border-2 border-dashed border-violet-600/30">
                                        <div className="text-violet-300 text-center py-16">
                                            <div className="text-4xl mb-4">🎨</div>
                                            <div>3D World Preview</div>
                                            <div className="text-sm mt-2">Real-time world generation and editing</div>

                                            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-violet-800/30 rounded p-3">
                                                    <div className="font-medium">Terrain Generation</div>
                                                    <div className="text-xs mt-1">Procedural landscapes</div>
                                                </div>
                                                <div className="bg-indigo-800/30 rounded p-3">
                                                    <div className="font-medium">Asset Placement</div>
                                                    <div className="text-xs mt-1">AI-guided object positioning</div>
                                                </div>
                                                <div className="bg-purple-800/30 rounded p-3">
                                                    <div className="font-medium">Lighting System</div>
                                                    <div className="text-xs mt-1">Dynamic environmental lighting</div>
                                                </div>
                                                <div className="bg-blue-800/30 rounded p-3">
                                                    <div className="font-medium">Physics Engine</div>
                                                    <div className="text-xs mt-1">Realistic world interactions</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg">
                                        Generate World
                                    </button>
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                                        Import Assets
                                    </button>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                        Publish World
                                    </button>
                                </div>
                            </GlassCard>

                            <GlassCard title="Popular Virtual Worlds">
                                <div className="space-y-4">
                                    {virtualWorlds.map((world, index) => (
                                        <div key={index} className="bg-violet-800/20 backdrop-blur-md border border-violet-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-white font-semibold">{world.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${world.status === 'Live' ? 'bg-green-900 text-green-300' :
                                                        world.status === 'Beta' ? 'bg-yellow-900 text-yellow-300' :
                                                            'bg-blue-900 text-blue-300'
                                                    }`}>
                                                    {world.status}
                                                </span>
                                            </div>

                                            <div className="text-violet-200 text-sm mb-3">{world.category}</div>

                                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                <div>
                                                    <div className="text-violet-200">Active Users</div>
                                                    <div className="text-white font-medium">{world.users.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-violet-200">World Size</div>
                                                    <div className="text-white font-medium">{world.size}</div>
                                                </div>
                                                <div>
                                                    <div className="text-violet-200">Revenue</div>
                                                    <div className="text-white font-medium">${world.revenue.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div className="text-violet-200">Rating</div>
                                                    <div className="text-white font-medium">⭐ {world.rating}</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded text-sm">
                                                    Enter World
                                                </button>
                                                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
                                                    Edit World
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="World Creation Tools">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">🏔️</div>
                                    <h4 className="text-white font-medium mb-2">Terrain Generator</h4>
                                    <div className="text-violet-200 text-sm mb-3">AI-powered landscape creation</div>
                                    <div className="text-2xl font-bold text-green-400">2,847</div>
                                    <div className="text-violet-200 text-xs">Terrains created</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🏢</div>
                                    <h4 className="text-white font-medium mb-2">Architecture Studio</h4>
                                    <div className="text-violet-200 text-sm mb-3">Building and structure design</div>
                                    <div className="text-2xl font-bold text-blue-400">15,692</div>
                                    <div className="text-violet-200 text-xs">Buildings designed</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🌿</div>
                                    <h4 className="text-white font-medium mb-2">Nature Toolkit</h4>
                                    <div className="text-violet-200 text-sm mb-3">Flora and fauna placement</div>
                                    <div className="text-2xl font-bold text-purple-400">89,432</div>
                                    <div className="text-violet-200 text-xs">Natural elements</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h4 className="text-white font-medium mb-2">Physics Engine</h4>
                                    <div className="text-violet-200 text-sm mb-3">Realistic world interactions</div>
                                    <div className="text-2xl font-bold text-cyan-400">99.7%</div>
                                    <div className="text-violet-200 text-xs">Physics accuracy</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Avatar Studio Tab */}
                {activeTab === 'avatars' && (
                    <div className="space-y-6">
                        <GlassCard title="Avatar Creation & Customization">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">👤</div>
                                    <h4 className="text-white font-medium mb-2">Custom Avatars</h4>
                                    <div className="text-2xl font-bold text-green-400 mb-1">156,789</div>
                                    <div className="text-violet-200 text-sm">Unique avatars created</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">👕</div>
                                    <h4 className="text-white font-medium mb-2">Fashion Items</h4>
                                    <div className="text-2xl font-bold text-blue-400 mb-1">89,432</div>
                                    <div className="text-violet-200 text-sm">Clothing & accessories</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🎭</div>
                                    <h4 className="text-white font-medium mb-2">Expressions</h4>
                                    <div className="text-2xl font-bold text-purple-400 mb-1">2,847</div>
                                    <div className="text-violet-200 text-sm">Facial animations</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🏃</div>
                                    <h4 className="text-white font-medium mb-2">Animations</h4>
                                    <div className="text-2xl font-bold text-cyan-400 mb-1">15,692</div>
                                    <div className="text-violet-200 text-sm">Movement styles</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Virtual Economy Tab */}
                {activeTab === 'economy' && (
                    <div className="space-y-6">
                        <GlassCard title="Virtual Economy Overview">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">💰</div>
                                    <h4 className="text-white font-medium mb-2">Total Value</h4>
                                    <div className="text-2xl font-bold text-green-400 mb-1">${dashboardStats.economyValue}M</div>
                                    <div className="text-violet-200 text-sm">Virtual economy size</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🔄</div>
                                    <h4 className="text-white font-medium mb-2">Daily Transactions</h4>
                                    <div className="text-2xl font-bold text-blue-400 mb-1">{dashboardStats.dailyTransactions.toLocaleString()}</div>
                                    <div className="text-violet-200 text-sm">Asset exchanges</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🏪</div>
                                    <h4 className="text-white font-medium mb-2">Marketplace</h4>
                                    <div className="text-2xl font-bold text-purple-400 mb-1">89,432</div>
                                    <div className="text-violet-200 text-sm">Items for sale</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">👨‍💼</div>
                                    <h4 className="text-white font-medium mb-2">Creators</h4>
                                    <div className="text-2xl font-bold text-cyan-400 mb-1">{dashboardStats.contentCreators.toLocaleString()}</div>
                                    <div className="text-violet-200 text-sm">Active creators</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <GlassCard title="Platform Analytics">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">📈</div>
                                    <h4 className="text-white font-medium mb-2">User Growth</h4>
                                    <div className="text-2xl font-bold text-green-400 mb-1">+23.4%</div>
                                    <div className="text-violet-200 text-sm">Monthly growth rate</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">⏱️</div>
                                    <h4 className="text-white font-medium mb-2">Avg Session</h4>
                                    <div className="text-2xl font-bold text-blue-400 mb-1">2.3h</div>
                                    <div className="text-violet-200 text-sm">Time spent in worlds</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🎯</div>
                                    <h4 className="text-white font-medium mb-2">Retention</h4>
                                    <div className="text-2xl font-bold text-purple-400 mb-1">89.2%</div>
                                    <div className="text-violet-200 text-sm">30-day retention rate</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">💎</div>
                                    <h4 className="text-white font-medium mb-2">Premium Users</h4>
                                    <div className="text-2xl font-bold text-cyan-400 mb-1">15,692</div>
                                    <div className="text-violet-200 text-sm">Subscription users</div>
                                </div>
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
    <div className="bg-violet-800/20 backdrop-blur-md border border-violet-700/30 rounded-lg p-6">
        {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
        {children}
    </div>
);

export default MetaverseAIDashboard;