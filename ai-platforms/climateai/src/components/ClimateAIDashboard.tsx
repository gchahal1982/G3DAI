import React, { useState, useEffect } from 'react';


// ClimateAI - Environmental Modeling and Prediction Platform
export const ClimateAIDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'monitoring' | 'forecasting' | 'modeling' | 'analytics'>('monitoring');
    const [selectedRegion, setSelectedRegion] = useState<ClimateRegion | null>(null);
    const [climateData, setClimateData] = useState<ClimateData[]>([]);

    // Mock data - in real implementation, this would come from climate APIs
    const dashboardStats = {
        globalTemperature: 14.8,
        co2Levels: 421.3,
        seaLevelRise: 3.4,
        extremeEvents: 47,
        forecastAccuracy: 94.7,
        dataPoints: 2847293
    };

    const climateModels = [
        {
            name: 'Global Temperature Projection',
            scenario: 'RCP 4.5',
            timeframe: '2024-2100',
            confidence: 92.4,
            status: 'Running',
            progress: 78
        },
        {
            name: 'Sea Level Rise Analysis',
            scenario: 'RCP 8.5',
            timeframe: '2024-2080',
            confidence: 89.7,
            status: 'Complete',
            progress: 100
        },
        {
            name: 'Precipitation Patterns',
            scenario: 'RCP 2.6',
            timeframe: '2024-2060',
            confidence: 87.2,
            status: 'Running',
            progress: 45
        },
        {
            name: 'Extreme Weather Events',
            scenario: 'RCP 6.0',
            timeframe: '2024-2090',
            confidence: 91.8,
            status: 'Queued',
            progress: 12
        }
    ];

    const environmentalIndicators = [
        { name: 'Arctic Sea Ice Extent', value: '4.92M km²', trend: -2.8, status: 'Critical' },
        { name: 'Global Forest Cover', value: '31.2%', trend: -0.4, status: 'Warning' },
        { name: 'Ocean pH Level', value: '8.05', trend: -0.02, status: 'Warning' },
        { name: 'Atmospheric CO₂', value: '421.3 ppm', trend: +2.1, status: 'Critical' },
        { name: 'Biodiversity Index', value: '0.68', trend: -0.03, status: 'Critical' },
        { name: 'Renewable Energy %', value: '29.4%', trend: +1.8, status: 'Good' }
    ];

    const weatherStations = [
        { id: 'WS001', location: 'Arctic Research Station', temp: -12.4, humidity: 78, status: 'Online' },
        { id: 'WS002', location: 'Amazon Rainforest', temp: 26.8, humidity: 94, status: 'Online' },
        { id: 'WS003', location: 'Sahara Desert', temp: 42.1, humidity: 12, status: 'Online' },
        { id: 'WS004', location: 'Antarctic Base', temp: -28.9, humidity: 65, status: 'Maintenance' },
        { id: 'WS005', location: 'Himalayan Peak', temp: -8.2, humidity: 45, status: 'Online' },
        { id: 'WS006', location: 'Pacific Ocean Buoy', temp: 18.7, humidity: 85, status: 'Online' }
    ];

    const climateAlerts = [
        { type: 'Heat Wave', location: 'Western Europe', severity: 'High', duration: '7 days', affected: '45M people' },
        { type: 'Drought', location: 'California', severity: 'Extreme', duration: '120 days', affected: '12M people' },
        { type: 'Flooding', location: 'Bangladesh', severity: 'Severe', duration: '14 days', affected: '8M people' },
        { type: 'Hurricane', location: 'Atlantic Basin', severity: 'Category 3', duration: '5 days', affected: '2M people' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-slate-900 to-blue-900">
            {/* Header */}
            <div className="bg-green-800/20 backdrop-blur-md border-b border-green-700/30 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            🌍 ClimateAI
                        </h1>
                        <p className="text-green-200">Environmental Modeling and Prediction Platform - Monitor and predict climate change</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-green-800/30 backdrop-blur-md border border-green-600/30 rounded-lg px-4 py-2">
                            <div className="text-green-200 text-sm">Global Temp</div>
                            <div className="text-white text-xl font-bold">{dashboardStats.globalTemperature}°C</div>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
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
                            <div className="text-3xl font-bold text-white">{dashboardStats.globalTemperature}°C</div>
                            <div className="text-green-200 text-sm">Global Temperature</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-400">{dashboardStats.co2Levels}</div>
                            <div className="text-green-200 text-sm">CO₂ ppm</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{dashboardStats.seaLevelRise}mm</div>
                            <div className="text-green-200 text-sm">Sea Level Rise</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-400">{dashboardStats.extremeEvents}</div>
                            <div className="text-green-200 text-sm">Extreme Events</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{dashboardStats.forecastAccuracy}%</div>
                            <div className="text-green-200 text-sm">Forecast Accuracy</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400">{dashboardStats.dataPoints.toLocaleString()}</div>
                            <div className="text-green-200 text-sm">Data Points</div>
                        </div>
                    </GlassCard>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-green-800/10 backdrop-blur-md border border-green-700/20 rounded-lg mb-8">
                    <div className="flex space-x-8 p-6">
                        {[
                            { id: 'monitoring', label: 'Environmental Monitoring', icon: '🌡️' },
                            { id: 'forecasting', label: 'Climate Forecasting', icon: '🌤️' },
                            { id: 'modeling', label: 'Climate Modeling', icon: '🔬' },
                            { id: 'analytics', label: 'Impact Analytics', icon: '📊' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-green-600 text-white'
                                        : 'text-green-200 hover:bg-green-800/30'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Environmental Monitoring Tab */}
                {activeTab === 'monitoring' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Global Climate Map">
                                <div className="bg-slate-900/50 rounded-lg p-6 mb-4">
                                    <div className="text-center text-white mb-4">
                                        <div className="text-6xl mb-4">🗺️</div>
                                        <h3 className="text-xl font-semibold mb-2">Real-time Global Climate Monitoring</h3>
                                        <p className="text-green-200">Interactive map with live environmental data</p>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-4 min-h-80 border-2 border-dashed border-green-600/30">
                                        <div className="text-green-300 text-center py-16">
                                            <div className="text-4xl mb-4">🌍</div>
                                            <div>Interactive Climate Map</div>
                                            <div className="text-sm mt-2">Temperature, precipitation, and weather patterns worldwide</div>

                                            {/* Climate Legend */}
                                            <div className="mt-6 flex justify-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                                    <span className="text-xs">Hot</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                                    <span className="text-xs">Cold</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                                    <span className="text-xs">Normal</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                                    <span className="text-xs">Drought</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
                                        Temperature View
                                    </button>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                        Precipitation
                                    </button>
                                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg">
                                        Extreme Events
                                    </button>
                                </div>
                            </GlassCard>

                            <GlassCard title="Environmental Indicators">
                                <div className="space-y-4">
                                    {environmentalIndicators.map((indicator, index) => (
                                        <div key={index} className="bg-green-800/20 backdrop-blur-md border border-green-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white font-semibold">{indicator.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${indicator.status === 'Critical' ? 'bg-red-900 text-red-300' :
                                                        indicator.status === 'Warning' ? 'bg-yellow-900 text-yellow-300' :
                                                            'bg-green-900 text-green-300'
                                                    }`}>
                                                    {indicator.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-2xl font-bold text-white">{indicator.value}</div>
                                                <div className={`flex items-center gap-1 ${indicator.trend > 0 ? 'text-red-400' :
                                                        indicator.trend < 0 ? 'text-blue-400' : 'text-gray-400'
                                                    }`}>
                                                    <span>{indicator.trend > 0 ? '↗' : indicator.trend < 0 ? '↘' : '→'}</span>
                                                    <span className="text-sm">{Math.abs(indicator.trend)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Weather Station Network">
                                <div className="space-y-3">
                                    {weatherStations.map((station, index) => (
                                        <div key={index} className="bg-green-800/20 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-medium">{station.id}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${station.status === 'Online' ? 'bg-green-900 text-green-300' :
                                                        'bg-yellow-900 text-yellow-300'
                                                    }`}>
                                                    {station.status}
                                                </span>
                                            </div>

                                            <div className="text-green-200 text-sm mb-3">{station.location}</div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-green-200 text-sm">Temperature</div>
                                                    <div className="text-white font-bold">{station.temp}°C</div>
                                                </div>
                                                <div>
                                                    <div className="text-green-200 text-sm">Humidity</div>
                                                    <div className="text-white font-bold">{station.humidity}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard title="Climate Alerts">
                                <div className="space-y-3">
                                    {climateAlerts.map((alert, index) => (
                                        <div key={index} className="bg-green-800/20 backdrop-blur-md border border-green-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white font-semibold">{alert.type}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${alert.severity === 'Extreme' || alert.severity === 'Category 3' ? 'bg-red-900 text-red-300' :
                                                        alert.severity === 'High' || alert.severity === 'Severe' ? 'bg-orange-900 text-orange-300' :
                                                            'bg-yellow-900 text-yellow-300'
                                                    }`}>
                                                    {alert.severity}
                                                </span>
                                            </div>

                                            <div className="space-y-1 text-sm">
                                                <div className="text-green-200">Location: <span className="text-white">{alert.location}</span></div>
                                                <div className="text-green-200">Duration: <span className="text-white">{alert.duration}</span></div>
                                                <div className="text-green-200">Affected: <span className="text-white">{alert.affected}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                )}

                {/* Climate Forecasting Tab */}
                {activeTab === 'forecasting' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <GlassCard title="AI Weather Forecasting">
                                    <div className="space-y-4">
                                        <div className="text-center py-6">
                                            <div className="text-6xl mb-4">🌤️</div>
                                            <h3 className="text-xl font-semibold text-white mb-2">Advanced Weather Prediction</h3>
                                            <p className="text-green-200">Machine learning-powered weather forecasting with 15-day accuracy</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { day: 'Today', temp: '22°C', condition: 'Sunny', precipitation: '0%', icon: '☀️' },
                                                { day: 'Tomorrow', temp: '19°C', condition: 'Cloudy', precipitation: '20%', icon: '☁️' },
                                                { day: 'Day 3', temp: '16°C', condition: 'Rainy', precipitation: '85%', icon: '🌧️' },
                                                { day: 'Day 4', temp: '18°C', condition: 'Partly Cloudy', precipitation: '10%', icon: '⛅' },
                                                { day: 'Day 5', temp: '21°C', condition: 'Sunny', precipitation: '5%', icon: '☀️' },
                                                { day: 'Day 6', temp: '24°C', condition: 'Hot', precipitation: '0%', icon: '🌡️' }
                                            ].map((forecast, index) => (
                                                <div key={index} className="bg-green-800/20 rounded-lg p-4 text-center">
                                                    <div className="text-green-200 text-sm mb-2">{forecast.day}</div>
                                                    <div className="text-3xl mb-2">{forecast.icon}</div>
                                                    <div className="text-white font-bold text-lg mb-1">{forecast.temp}</div>
                                                    <div className="text-green-200 text-sm mb-1">{forecast.condition}</div>
                                                    <div className="text-blue-300 text-xs">💧 {forecast.precipitation}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="space-y-6">
                                <GlassCard title="Forecast Settings">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-green-200 text-sm mb-2">Location</label>
                                            <input
                                                type="text"
                                                placeholder="Enter city or coordinates"
                                                className="w-full bg-green-800/30 text-white border border-green-600/30 rounded px-3 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-green-200 text-sm mb-2">Forecast Range</label>
                                            <select className="w-full bg-green-800/30 text-white border border-green-600/30 rounded px-3 py-2">
                                                <option>7 Days</option>
                                                <option>15 Days</option>
                                                <option>30 Days</option>
                                                <option>Seasonal (3 months)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-green-200 text-sm mb-2">Model Type</label>
                                            <select className="w-full bg-green-800/30 text-white border border-green-600/30 rounded px-3 py-2">
                                                <option>Deep Learning Ensemble</option>
                                                <option>Numerical Weather Prediction</option>
                                                <option>Hybrid AI-Physics</option>
                                                <option>Statistical Post-processing</option>
                                            </select>
                                        </div>

                                        <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                                            Generate Forecast
                                        </button>
                                    </div>
                                </GlassCard>

                                <GlassCard title="Forecast Accuracy">
                                    <div className="space-y-3">
                                        {[
                                            { metric: '24-hour Temperature', accuracy: 96.2 },
                                            { metric: '7-day Precipitation', accuracy: 89.4 },
                                            { metric: '15-day Trends', accuracy: 78.9 },
                                            { metric: 'Extreme Events', accuracy: 85.7 }
                                        ].map((metric, index) => (
                                            <div key={index} className="bg-green-800/20 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-green-200 text-sm">{metric.metric}</span>
                                                    <span className="text-white font-bold">{metric.accuracy}%</span>
                                                </div>
                                                <div className="w-full bg-green-800 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${metric.accuracy}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                )}

                {/* Climate Modeling Tab */}
                {activeTab === 'modeling' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Climate Model Simulations">
                                <div className="space-y-4">
                                    {climateModels.map((model, index) => (
                                        <div key={index} className="bg-green-800/20 backdrop-blur-md border border-green-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-white font-semibold">{model.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${model.status === 'Complete' ? 'bg-green-900 text-green-300' :
                                                        model.status === 'Running' ? 'bg-blue-900 text-blue-300' :
                                                            'bg-yellow-900 text-yellow-300'
                                                    }`}>
                                                    {model.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <div className="text-green-200 text-sm">Scenario</div>
                                                    <div className="text-white font-medium">{model.scenario}</div>
                                                </div>
                                                <div>
                                                    <div className="text-green-200 text-sm">Timeframe</div>
                                                    <div className="text-white font-medium">{model.timeframe}</div>
                                                </div>
                                                <div>
                                                    <div className="text-green-200 text-sm">Confidence</div>
                                                    <div className="text-white font-medium">{model.confidence}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-green-200 text-sm">Progress</div>
                                                    <div className="text-white font-medium">{model.progress}%</div>
                                                </div>
                                            </div>

                                            <div className="w-full bg-green-800 rounded-full h-2 mb-3">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${model.progress}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm">
                                                    View Results
                                                </button>
                                                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">
                                                    Download Data
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard title="Model Configuration">
                                <div className="space-y-4">
                                    <div className="text-center py-6">
                                        <div className="text-4xl mb-3">🔬</div>
                                        <h4 className="text-white font-medium mb-2">Climate Model Setup</h4>
                                        <p className="text-green-200 text-sm">Configure advanced climate simulation parameters</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-green-200 text-sm mb-1">Climate Scenario</label>
                                            <select className="w-full bg-green-800/30 text-white border border-green-600/30 rounded px-3 py-2">
                                                <option>RCP 2.6 (Low emissions)</option>
                                                <option>RCP 4.5 (Moderate emissions)</option>
                                                <option>RCP 6.0 (High emissions)</option>
                                                <option>RCP 8.5 (Very high emissions)</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-green-200 text-sm mb-1">Start Year</label>
                                                <input
                                                    type="number"
                                                    defaultValue={2024}
                                                    className="w-full bg-green-800/30 text-white border border-green-600/30 rounded px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-green-200 text-sm mb-1">End Year</label>
                                                <input
                                                    type="number"
                                                    defaultValue={2100}
                                                    className="w-full bg-green-800/30 text-white border border-green-600/30 rounded px-3 py-2"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-green-200 text-sm mb-1">Geographic Region</label>
                                            <select className="w-full bg-green-800/30 text-white border border-green-600/30 rounded px-3 py-2">
                                                <option>Global</option>
                                                <option>Arctic</option>
                                                <option>Tropical</option>
                                                <option>Temperate</option>
                                                <option>Custom Region</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-green-200 text-sm mb-1">Model Resolution</label>
                                            <select className="w-full bg-green-800/30 text-white border border-green-600/30 rounded px-3 py-2">
                                                <option>High (1km)</option>
                                                <option>Medium (10km)</option>
                                                <option>Low (100km)</option>
                                                <option>Custom</option>
                                            </select>
                                        </div>

                                        <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold">
                                            🚀 Start Climate Model
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Model Comparison">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { scenario: 'RCP 2.6', temp: '+1.5°C', sea: '+0.4m', co2: '450 ppm', color: 'green' },
                                    { scenario: 'RCP 4.5', temp: '+2.4°C', sea: '+0.6m', co2: '540 ppm', color: 'yellow' },
                                    { scenario: 'RCP 6.0', temp: '+3.2°C', sea: '+0.8m', co2: '670 ppm', color: 'orange' },
                                    { scenario: 'RCP 8.5', temp: '+4.8°C', sea: '+1.2m', co2: '940 ppm', color: 'red' }
                                ].map((scenario, index) => (
                                    <div key={index} className="bg-green-800/20 backdrop-blur-md border border-green-700/30 rounded-lg p-4">
                                        <div className="text-center mb-3">
                                            <h4 className="text-white font-semibold">{scenario.scenario}</h4>
                                            <div className="text-green-200 text-sm">by 2100</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-green-200 text-sm">Temperature:</span>
                                                <span className={`font-bold text-${scenario.color}-400`}>{scenario.temp}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-200 text-sm">Sea Level:</span>
                                                <span className={`font-bold text-${scenario.color}-400`}>{scenario.sea}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-200 text-sm">CO₂:</span>
                                                <span className={`font-bold text-${scenario.color}-400`}>{scenario.co2}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Impact Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Climate Impact Assessment">
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="text-4xl mb-3">📊</div>
                                        <h4 className="text-white font-medium mb-2">Impact Analysis</h4>
                                        <p className="text-green-200 text-sm">Assess climate change impacts on society and economy</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { category: 'Agriculture', impact: 'High', affected: '2.1B people', cost: '$340B' },
                                            { category: 'Water Resources', impact: 'Critical', affected: '1.8B people', cost: '$280B' },
                                            { category: 'Coastal Areas', impact: 'Severe', affected: '630M people', cost: '$150B' },
                                            { category: 'Public Health', impact: 'High', affected: '3.2B people', cost: '$420B' },
                                            { category: 'Energy Systems', impact: 'Medium', affected: '1.2B people', cost: '$190B' },
                                            { category: 'Biodiversity', impact: 'Critical', affected: 'Global', cost: '$500B' }
                                        ].map((impact, index) => (
                                            <div key={index} className="bg-green-800/20 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium">{impact.category}</span>
                                                    <span className={`px-2 py-1 rounded text-xs ${impact.impact === 'Critical' ? 'bg-red-900 text-red-300' :
                                                            impact.impact === 'Severe' || impact.impact === 'High' ? 'bg-orange-900 text-orange-300' :
                                                                'bg-yellow-900 text-yellow-300'
                                                        }`}>
                                                        {impact.impact}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="text-green-200">People Affected</div>
                                                        <div className="text-white font-bold">{impact.affected}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-green-200">Economic Cost</div>
                                                        <div className="text-white font-bold">{impact.cost}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard title="Adaptation Strategies">
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="text-4xl mb-3">🛡️</div>
                                        <h4 className="text-white font-medium mb-2">Climate Adaptation</h4>
                                        <p className="text-green-200 text-sm">AI-recommended adaptation and mitigation strategies</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { strategy: 'Renewable Energy Transition', effectiveness: 92, cost: 'High', timeframe: '10-20 years' },
                                            { strategy: 'Coastal Protection Systems', effectiveness: 78, cost: 'Very High', timeframe: '5-15 years' },
                                            { strategy: 'Water Conservation', effectiveness: 85, cost: 'Medium', timeframe: '2-5 years' },
                                            { strategy: 'Sustainable Agriculture', effectiveness: 89, cost: 'Medium', timeframe: '3-8 years' },
                                            { strategy: 'Urban Green Infrastructure', effectiveness: 76, cost: 'Low', timeframe: '1-3 years' },
                                            { strategy: 'Carbon Capture Technology', effectiveness: 68, cost: 'Very High', timeframe: '15-30 years' }
                                        ].map((strategy, index) => (
                                            <div key={index} className="bg-green-800/20 rounded-lg p-3">
                                                <div className="text-white font-medium mb-2">{strategy.strategy}</div>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <div className="text-green-200">Effectiveness</div>
                                                        <div className="text-white font-bold">{strategy.effectiveness}%</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-green-200">Cost</div>
                                                        <div className="text-white font-bold">{strategy.cost}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-green-200">Timeframe</div>
                                                        <div className="text-white font-bold">{strategy.timeframe}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 w-full bg-green-800 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${strategy.effectiveness}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Economic Impact Dashboard">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">💰</div>
                                    <h4 className="text-white font-medium mb-2">Total Economic Impact</h4>
                                    <div className="text-2xl font-bold text-red-400 mb-1">$1.9T</div>
                                    <div className="text-green-200 text-sm">Annual global cost</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🏭</div>
                                    <h4 className="text-white font-medium mb-2">Mitigation Investment</h4>
                                    <div className="text-2xl font-bold text-green-400 mb-1">$380B</div>
                                    <div className="text-green-200 text-sm">Required annually</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🌱</div>
                                    <h4 className="text-white font-medium mb-2">Green Economy</h4>
                                    <div className="text-2xl font-bold text-blue-400 mb-1">$2.5T</div>
                                    <div className="text-green-200 text-sm">Market opportunity</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">📈</div>
                                    <h4 className="text-white font-medium mb-2">ROI on Action</h4>
                                    <div className="text-2xl font-bold text-purple-400 mb-1">4.2x</div>
                                    <div className="text-green-200 text-sm">Benefit-cost ratio</div>
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
    <div className="bg-green-800/20 backdrop-blur-md border border-green-700/30 rounded-lg p-6">
        {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
        {children}
    </div>
);

// Type definitions for climate data
interface ClimateRegion {
    id: string;
    name: string;
    coordinates: [number, number];
    temperature: number;
    precipitation: number;
}

interface ClimateData {
    timestamp: number;
    temperature: number;
    humidity: number;
    precipitation: number;
    co2Level: number;
}

export default ClimateAIDashboard;