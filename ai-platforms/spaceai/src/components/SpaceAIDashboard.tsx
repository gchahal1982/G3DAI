import React, { useState, useEffect } from 'react';
import { GlassCard } from '@shared/ui/components';


// G3D SpaceAI - Satellite Imagery and Space Data Analysis Platform
export const SpaceAIDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'satellites' | 'imagery' | 'missions' | 'analytics'>('satellites');
    const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
    const [spaceData, setSpaceData] = useState<SpaceData[]>([]);

    // Mock data - in real implementation, this would come from space APIs
    const dashboardStats = {
        activeSatellites: 8247,
        dailyImages: 15632,
        orbitingObjects: 34567,
        spaceDebris: 2891,
        missionSuccess: 97.3,
        dataVolume: 847.2
    };

    const satelliteFleet = [
        {
            name: 'Terra (EOS AM-1)',
            type: 'Earth Observation',
            orbit: 'Sun-synchronous',
            altitude: 705,
            status: 'Active',
            coverage: 'Global',
            instruments: 5
        },
        {
            name: 'Landsat 9',
            type: 'Land Imaging',
            orbit: 'Sun-synchronous',
            altitude: 705,
            status: 'Active',
            coverage: 'Global Land',
            instruments: 2
        },
        {
            name: 'Sentinel-2A',
            type: 'Multispectral',
            orbit: 'Sun-synchronous',
            altitude: 786,
            status: 'Active',
            coverage: 'Global',
            instruments: 1
        },
        {
            name: 'GOES-16',
            type: 'Weather',
            orbit: 'Geostationary',
            altitude: 35786,
            status: 'Active',
            coverage: 'Americas',
            instruments: 6
        },
        {
            name: 'WorldView-3',
            type: 'Commercial',
            orbit: 'Sun-synchronous',
            altitude: 617,
            status: 'Active',
            coverage: 'Global',
            instruments: 2
        },
        {
            name: 'ICESat-2',
            type: 'Ice Monitoring',
            orbit: 'Near-polar',
            altitude: 496,
            status: 'Active',
            coverage: 'Polar',
            instruments: 1
        }
    ];

    const spaceDebrisTracking = [
        { id: 'DB-001', size: 'Large (>10cm)', quantity: 34000, risk: 'High', tracked: true },
        { id: 'DB-002', size: 'Medium (1-10cm)', quantity: 900000, risk: 'Medium', tracked: false },
        { id: 'DB-003', size: 'Small (<1cm)', quantity: 128000000, risk: 'Low', tracked: false },
        { id: 'DB-004', size: 'Defunct Satellites', quantity: 3000, risk: 'Critical', tracked: true }
    ];

    const activeMissions = [
        {
            name: 'James Webb Space Telescope',
            type: 'Deep Space Observatory',
            status: 'Operational',
            progress: 100,
            discoveries: 247,
            dataCollected: '12.4 TB'
        },
        {
            name: 'Perseverance Mars Rover',
            type: 'Planetary Exploration',
            status: 'Active',
            progress: 89,
            discoveries: 34,
            dataCollected: '847 GB'
        },
        {
            name: 'Parker Solar Probe',
            type: 'Solar Research',
            status: 'En Route',
            progress: 67,
            discoveries: 18,
            dataCollected: '2.1 TB'
        },
        {
            name: 'Artemis Lunar Program',
            type: 'Human Spaceflight',
            status: 'In Development',
            progress: 45,
            discoveries: 0,
            dataCollected: '0 GB'
        }
    ];

    const earthObservations = [
        { region: 'Amazon Rainforest', type: 'Deforestation', severity: 'High', change: -2.8, lastUpdate: '2 hours ago' },
        { region: 'Arctic Ice Cap', type: 'Ice Melt', severity: 'Critical', change: -4.2, lastUpdate: '1 hour ago' },
        { region: 'Sahara Desert', type: 'Dust Storm', severity: 'Medium', change: +1.5, lastUpdate: '30 minutes ago' },
        { region: 'Pacific Ocean', type: 'Hurricane Formation', severity: 'High', change: +3.1, lastUpdate: '15 minutes ago' },
        { region: 'Himalayan Glaciers', type: 'Glacier Retreat', severity: 'High', change: -1.9, lastUpdate: '3 hours ago' },
        { region: 'Urban Heat Islands', type: 'Temperature Rise', severity: 'Medium', change: +0.8, lastUpdate: '1 hour ago' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900">
            {/* Header */}
            <div className="bg-indigo-800/20 backdrop-blur-md border-b border-indigo-700/30 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            🚀 G3D SpaceAI
                        </h1>
                        <p className="text-indigo-200">Satellite Imagery and Space Data Analysis Platform - Monitor Earth from space</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-800/30 backdrop-blur-md border border-indigo-600/30 rounded-lg px-4 py-2">
                            <div className="text-indigo-200 text-sm">Active Satellites</div>
                            <div className="text-white text-xl font-bold">{dashboardStats.activeSatellites.toLocaleString()}</div>
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                            New Analysis
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{dashboardStats.activeSatellites.toLocaleString()}</div>
                            <div className="text-indigo-200 text-sm">Active Satellites</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-400">{dashboardStats.dailyImages.toLocaleString()}</div>
                            <div className="text-indigo-200 text-sm">Daily Images</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{dashboardStats.orbitingObjects.toLocaleString()}</div>
                            <div className="text-indigo-200 text-sm">Orbiting Objects</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-400">{dashboardStats.spaceDebris.toLocaleString()}</div>
                            <div className="text-indigo-200 text-sm">Space Debris</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400">{dashboardStats.missionSuccess}%</div>
                            <div className="text-indigo-200 text-sm">Mission Success</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{dashboardStats.dataVolume} TB</div>
                            <div className="text-indigo-200 text-sm">Data Volume</div>
                        </div>
                    </GlassCard>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-indigo-800/10 backdrop-blur-md border border-indigo-700/20 rounded-lg mb-8">
                    <div className="flex space-x-8 p-6">
                        {[
                            { id: 'satellites', label: 'Satellite Tracking', icon: '🛰️' },
                            { id: 'imagery', label: 'Earth Imagery', icon: '🌍' },
                            { id: 'missions', label: 'Space Missions', icon: '🚀' },
                            { id: 'analytics', label: 'Space Analytics', icon: '📊' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-indigo-200 hover:bg-indigo-800/30'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Satellite Tracking Tab */}
                {activeTab === 'satellites' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Orbital Visualization">
                                <div className="bg-slate-900/50 rounded-lg p-6 mb-4">
                                    <div className="text-center text-white mb-4">
                                        <div className="text-6xl mb-4">🌍</div>
                                        <h3 className="text-xl font-semibold mb-2">Real-time Satellite Tracking</h3>
                                        <p className="text-indigo-200">3D visualization of satellites and space objects</p>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-4 min-h-80 border-2 border-dashed border-indigo-600/30">
                                        <div className="text-indigo-300 text-center py-16">
                                            <div className="text-4xl mb-4">🛰️</div>
                                            <div>3D Orbital Tracking System</div>
                                            <div className="text-sm mt-2">Real-time positions of {dashboardStats.activeSatellites.toLocaleString()} satellites</div>

                                            {/* Orbital Layers Legend */}
                                            <div className="mt-6 flex justify-center gap-4 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <span>LEO (160-2000km)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                    <span>MEO (2000-35786km)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                    <span>GEO (35786km)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg">
                                        Track Satellite
                                    </button>
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                                        Predict Pass
                                    </button>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                        Collision Alert
                                    </button>
                                </div>
                            </GlassCard>

                            <GlassCard title="Satellite Fleet">
                                <div className="space-y-3">
                                    {satelliteFleet.map((satellite, index) => (
                                        <div key={index} className="bg-indigo-800/20 backdrop-blur-md border border-indigo-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white font-semibold">{satellite.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${satellite.status === 'Active' ? 'bg-green-900 text-green-300' :
                                                        'bg-yellow-900 text-yellow-300'
                                                    }`}>
                                                    {satellite.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-indigo-200">Type</div>
                                                    <div className="text-white font-medium">{satellite.type}</div>
                                                </div>
                                                <div>
                                                    <div className="text-indigo-200">Orbit</div>
                                                    <div className="text-white font-medium">{satellite.orbit}</div>
                                                </div>
                                                <div>
                                                    <div className="text-indigo-200">Altitude</div>
                                                    <div className="text-white font-medium">{satellite.altitude} km</div>
                                                </div>
                                                <div>
                                                    <div className="text-indigo-200">Instruments</div>
                                                    <div className="text-white font-medium">{satellite.instruments}</div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex gap-2">
                                                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm">
                                                    Track
                                                </button>
                                                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
                                                    Data
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Space Debris Monitoring">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {spaceDebrisTracking.map((debris, index) => (
                                    <div key={index} className="bg-indigo-800/20 backdrop-blur-md border border-indigo-700/30 rounded-lg p-4">
                                        <div className="text-center mb-3">
                                            <div className="text-3xl mb-2">
                                                {debris.risk === 'Critical' ? '🚨' :
                                                    debris.risk === 'High' ? '⚠️' :
                                                        debris.risk === 'Medium' ? '🟡' : '🟢'}
                                            </div>
                                            <h4 className="text-white font-semibold">{debris.size}</h4>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-indigo-200">Quantity:</span>
                                                <span className="text-white font-bold">{debris.quantity.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-indigo-200">Risk Level:</span>
                                                <span className={`font-bold ${debris.risk === 'Critical' ? 'text-red-400' :
                                                        debris.risk === 'High' ? 'text-orange-400' :
                                                            debris.risk === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                                                    }`}>
                                                    {debris.risk}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-indigo-200">Tracked:</span>
                                                <span className={`font-bold ${debris.tracked ? 'text-green-400' : 'text-red-400'}`}>
                                                    {debris.tracked ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Earth Imagery Tab */}
                {activeTab === 'imagery' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <GlassCard title="Satellite Imagery Viewer">
                                    <div className="bg-slate-900/50 rounded-lg p-6 mb-4">
                                        <div className="text-center text-white mb-4">
                                            <div className="text-6xl mb-4">🗺️</div>
                                            <h3 className="text-xl font-semibold mb-2">High-Resolution Earth Imagery</h3>
                                            <p className="text-indigo-200">Real-time satellite imagery with AI analysis</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-4 min-h-96 border-2 border-dashed border-indigo-600/30">
                                            <div className="text-indigo-300 text-center py-20">
                                                <div className="text-4xl mb-4">🛰️</div>
                                                <div>Interactive Satellite Map</div>
                                                <div className="text-sm mt-2">Browse {dashboardStats.dailyImages.toLocaleString()} daily images</div>

                                                {/* Image Controls */}
                                                <div className="mt-6 flex justify-center gap-4">
                                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">
                                                        🌈 Multispectral
                                                    </button>
                                                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                                                        🌿 Vegetation
                                                    </button>
                                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                                                        🌊 Water Bodies
                                                    </button>
                                                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                                                        🔥 Heat Signature
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg">
                                            Search Location
                                        </button>
                                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                                            Time Series
                                        </button>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                            Download
                                        </button>
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="space-y-6">
                                <GlassCard title="Image Analysis Tools">
                                    <div className="space-y-4">
                                        <div className="text-center py-4">
                                            <div className="text-4xl mb-3">🔍</div>
                                            <h4 className="text-white font-medium mb-2">AI-Powered Analysis</h4>
                                            <p className="text-indigo-200 text-sm">Automated image processing and insights</p>
                                        </div>

                                        <div className="space-y-3">
                                            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm">
                                                🌳 Forest Change Detection
                                            </button>
                                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                                                🏙️ Urban Growth Analysis
                                            </button>
                                            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                                                🌾 Crop Health Monitoring
                                            </button>
                                            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm">
                                                🔥 Wildfire Detection
                                            </button>
                                            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm">
                                                🌊 Flood Mapping
                                            </button>
                                            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                                                ⛰️ Geological Surveys
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard title="Recent Observations">
                                    <div className="space-y-3">
                                        {earthObservations.map((obs, index) => (
                                            <div key={index} className="bg-indigo-800/20 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium text-sm">{obs.region}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${obs.severity === 'Critical' ? 'bg-red-900 text-red-300' :
                                                            obs.severity === 'High' ? 'bg-orange-900 text-orange-300' :
                                                                'bg-yellow-900 text-yellow-300'
                                                        }`}>
                                                        {obs.severity}
                                                    </span>
                                                </div>

                                                <div className="text-indigo-200 text-xs mb-2">{obs.type}</div>

                                                <div className="flex justify-between items-center text-xs">
                                                    <span className={`${obs.change > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                                        {obs.change > 0 ? '↗' : '↘'} {Math.abs(obs.change)}%
                                                    </span>
                                                    <span className="text-indigo-300">{obs.lastUpdate}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                )}

                {/* Space Missions Tab */}
                {activeTab === 'missions' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Active Space Missions">
                                <div className="space-y-4">
                                    {activeMissions.map((mission, index) => (
                                        <div key={index} className="bg-indigo-800/20 backdrop-blur-md border border-indigo-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-white font-semibold">{mission.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${mission.status === 'Operational' ? 'bg-green-900 text-green-300' :
                                                        mission.status === 'Active' ? 'bg-blue-900 text-blue-300' :
                                                            mission.status === 'En Route' ? 'bg-yellow-900 text-yellow-300' :
                                                                'bg-purple-900 text-purple-300'
                                                    }`}>
                                                    {mission.status}
                                                </span>
                                            </div>

                                            <div className="text-indigo-200 text-sm mb-3">{mission.type}</div>

                                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                <div>
                                                    <div className="text-indigo-200">Progress</div>
                                                    <div className="text-white font-bold">{mission.progress}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-indigo-200">Discoveries</div>
                                                    <div className="text-white font-bold">{mission.discoveries}</div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <div className="text-indigo-200 text-sm">Data Collected</div>
                                                <div className="text-white font-bold">{mission.dataCollected}</div>
                                            </div>

                                            <div className="w-full bg-indigo-800 rounded-full h-2 mb-3">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${mission.progress}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm">
                                                    View Details
                                                </button>
                                                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
                                                    Data Stream
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard title="Mission Planning">
                                <div className="space-y-4">
                                    <div className="text-center py-6">
                                        <div className="text-4xl mb-3">🚀</div>
                                        <h4 className="text-white font-medium mb-2">Mission Design Studio</h4>
                                        <p className="text-indigo-200 text-sm">Plan and optimize space missions with AI</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-indigo-200 text-sm mb-1">Mission Type</label>
                                            <select className="w-full bg-indigo-800/30 text-white border border-indigo-600/30 rounded px-3 py-2">
                                                <option>Earth Observation</option>
                                                <option>Deep Space Exploration</option>
                                                <option>Planetary Landing</option>
                                                <option>Space Station Resupply</option>
                                                <option>Asteroid Mining</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-indigo-200 text-sm mb-1">Launch Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-indigo-800/30 text-white border border-indigo-600/30 rounded px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-indigo-200 text-sm mb-1">Duration</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., 2 years"
                                                    className="w-full bg-indigo-800/30 text-white border border-indigo-600/30 rounded px-3 py-2"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-indigo-200 text-sm mb-1">Target Destination</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Mars, Jupiter, LEO"
                                                className="w-full bg-indigo-800/30 text-white border border-indigo-600/30 rounded px-3 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-indigo-200 text-sm mb-1">Budget (USD)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., $500M"
                                                className="w-full bg-indigo-800/30 text-white border border-indigo-600/30 rounded px-3 py-2"
                                            />
                                        </div>

                                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold">
                                            🚀 Optimize Mission Plan
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Launch Schedule">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { mission: 'Artemis III', date: '2026-09-15', type: 'Lunar Landing', agency: 'NASA' },
                                    { mission: 'Europa Clipper', date: '2024-10-10', type: 'Planetary', agency: 'NASA' },
                                    { mission: 'ExoMars Rover', date: '2028-07-25', type: 'Mars Exploration', agency: 'ESA' },
                                    { mission: 'Dragonfly', date: '2027-06-05', type: 'Titan Mission', agency: 'NASA' }
                                ].map((launch, index) => (
                                    <div key={index} className="bg-indigo-800/20 backdrop-blur-md border border-indigo-700/30 rounded-lg p-4">
                                        <div className="text-center mb-3">
                                            <div className="text-3xl mb-2">🚀</div>
                                            <h4 className="text-white font-semibold">{launch.mission}</h4>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="text-center">
                                                <div className="text-indigo-200">Launch Date</div>
                                                <div className="text-white font-bold">{launch.date}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-indigo-200">Type</div>
                                                <div className="text-white font-medium">{launch.type}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-indigo-200">Agency</div>
                                                <div className="text-white font-medium">{launch.agency}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Space Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Space Traffic Analysis">
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="text-4xl mb-3">📊</div>
                                        <h4 className="text-white font-medium mb-2">Orbital Traffic Management</h4>
                                        <p className="text-indigo-200 text-sm">AI-powered space traffic control and collision avoidance</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { metric: 'Collision Risk Assessment', value: '0.003%', status: 'Low' },
                                            { metric: 'Orbital Congestion Index', value: '67/100', status: 'Medium' },
                                            { metric: 'Debris Tracking Accuracy', value: '99.7%', status: 'High' },
                                            { metric: 'Launch Window Optimization', value: '94.2%', status: 'High' },
                                            { metric: 'Satellite Lifespan Prediction', value: '12.4 years', status: 'Normal' },
                                            { metric: 'Ground Station Efficiency', value: '89.6%', status: 'Good' }
                                        ].map((metric, index) => (
                                            <div key={index} className="bg-indigo-800/20 rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-indigo-200 text-sm">{metric.metric}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${metric.status === 'High' || metric.status === 'Good' ? 'bg-green-900 text-green-300' :
                                                            metric.status === 'Medium' || metric.status === 'Normal' ? 'bg-yellow-900 text-yellow-300' :
                                                                'bg-red-900 text-red-300'
                                                        }`}>
                                                        {metric.status}
                                                    </span>
                                                </div>
                                                <div className="text-white font-bold text-lg">{metric.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard title="Earth Observation Insights">
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="text-4xl mb-3">🌍</div>
                                        <h4 className="text-white font-medium mb-2">Global Change Detection</h4>
                                        <p className="text-indigo-200 text-sm">AI analysis of Earth's environmental changes</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { change: 'Global Forest Cover', trend: -0.8, impact: 'Critical', region: 'Amazon Basin' },
                                            { change: 'Arctic Sea Ice', trend: -2.1, impact: 'Severe', region: 'Arctic Ocean' },
                                            { change: 'Urban Expansion', trend: +1.4, impact: 'Moderate', region: 'Asia-Pacific' },
                                            { change: 'Coral Reef Health', trend: -1.2, impact: 'High', region: 'Great Barrier Reef' },
                                            { change: 'Agricultural Land', trend: +0.6, impact: 'Positive', region: 'Sub-Saharan Africa' },
                                            { change: 'Glacier Volume', trend: -1.8, impact: 'Critical', region: 'Himalayas' }
                                        ].map((change, index) => (
                                            <div key={index} className="bg-indigo-800/20 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-white font-medium text-sm">{change.change}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${change.impact === 'Critical' || change.impact === 'Severe' ? 'bg-red-900 text-red-300' :
                                                            change.impact === 'High' || change.impact === 'Moderate' ? 'bg-orange-900 text-orange-300' :
                                                                'bg-green-900 text-green-300'
                                                        }`}>
                                                        {change.impact}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-indigo-200">{change.region}</span>
                                                    <span className={`${change.trend > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                                                        {change.trend > 0 ? '↗' : '↘'} {Math.abs(change.trend)}%/year
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Space Economy Dashboard">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">💰</div>
                                    <h4 className="text-white font-medium mb-2">Space Economy Size</h4>
                                    <div className="text-2xl font-bold text-green-400 mb-1">$469B</div>
                                    <div className="text-indigo-200 text-sm">Global market value</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🚀</div>
                                    <h4 className="text-white font-medium mb-2">Annual Launches</h4>
                                    <div className="text-2xl font-bold text-blue-400 mb-1">180+</div>
                                    <div className="text-indigo-200 text-sm">Successful launches</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">📡</div>
                                    <h4 className="text-white font-medium mb-2">Commercial Satellites</h4>
                                    <div className="text-2xl font-bold text-purple-400 mb-1">5,400+</div>
                                    <div className="text-indigo-200 text-sm">Active commercial sats</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">📈</div>
                                    <h4 className="text-white font-medium mb-2">Market Growth</h4>
                                    <div className="text-2xl font-bold text-cyan-400 mb-1">8.2%</div>
                                    <div className="text-indigo-200 text-sm">Annual growth rate</div>
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
    <div className="bg-indigo-800/20 backdrop-blur-md border border-indigo-700/30 rounded-lg p-6">
        {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
        {children}
    </div>
);

// Type definitions for space data
interface Satellite {
    id: string;
    name: string;
    type: string;
    altitude: number;
    status: string;
}

interface SpaceData {
    timestamp: number;
    satelliteId: string;
    coordinates: [number, number];
    telemetry: any;
}

export default SpaceAIDashboard;