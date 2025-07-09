import React, { useState, useEffect } from 'react';

// G3D NeuroAI - Brain-Computer Interface Applications Platform
export const NeuroAIDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'signals' | 'interfaces' | 'training' | 'applications'>('signals');
    const [selectedDevice, setSelectedDevice] = useState<BCIDevice | null>(null);
    const [neuralData, setNeuralData] = useState<NeuralSignal[]>([]);

    // Mock data - in real implementation, this would come from BCI APIs
    const dashboardStats = {
        connectedDevices: 47,
        activeUsers: 1834,
        signalAccuracy: 94.7,
        trainingHours: 28456,
        applicationsDeployed: 127,
        neuralPatterns: 15692
    };

    const bciDevices = [
        {
            name: 'NeuroLink Pro X1',
            type: 'Invasive ECoG',
            channels: 1024,
            resolution: '16-bit',
            status: 'Active',
            accuracy: 97.2,
            user: 'Patient-001'
        },
        {
            name: 'OpenBCI Cyton',
            type: 'Non-invasive EEG',
            channels: 8,
            resolution: '24-bit',
            status: 'Active',
            accuracy: 89.4,
            user: 'Researcher-A'
        },
        {
            name: 'Emotiv EPOC X',
            type: 'Wireless EEG',
            channels: 14,
            resolution: '16-bit',
            status: 'Active',
            accuracy: 85.7,
            user: 'Student-042'
        },
        {
            name: 'NeuroSky MindWave',
            type: 'Consumer EEG',
            channels: 1,
            resolution: '12-bit',
            status: 'Training',
            accuracy: 78.3,
            user: 'User-789'
        },
        {
            name: 'g.tec Unicorn',
            type: 'Research EEG',
            channels: 8,
            resolution: '24-bit',
            status: 'Active',
            accuracy: 91.6,
            user: 'Lab-Tech-05'
        },
        {
            name: 'Kernel Flow',
            type: 'fNIRS',
            channels: 52,
            resolution: '16-bit',
            status: 'Calibrating',
            accuracy: 88.9,
            user: 'Subject-156'
        }
    ];

    const neuralApplications = [
        {
            name: 'Prosthetic Limb Control',
            category: 'Motor Restoration',
            users: 234,
            accuracy: 96.8,
            status: 'Deployed',
            description: 'Direct neural control of robotic prosthetics'
        },
        {
            name: 'Wheelchair Navigation',
            category: 'Mobility Assistance',
            users: 567,
            accuracy: 92.3,
            status: 'Active',
            description: 'Thought-controlled wheelchair movement'
        },
        {
            name: 'Communication Aid',
            category: 'Speech Restoration',
            users: 189,
            accuracy: 89.7,
            status: 'Beta',
            description: 'Text generation from neural signals'
        },
        {
            name: 'Cognitive Training',
            category: 'Rehabilitation',
            users: 1245,
            accuracy: 87.4,
            status: 'Active',
            description: 'Brain training for cognitive enhancement'
        },
        {
            name: 'Seizure Prediction',
            category: 'Medical Monitoring',
            users: 456,
            accuracy: 94.1,
            status: 'Clinical Trial',
            description: 'Early epileptic seizure detection'
        },
        {
            name: 'Memory Enhancement',
            category: 'Cognitive Augmentation',
            users: 78,
            accuracy: 82.6,
            status: 'Research',
            description: 'Neural stimulation for memory improvement'
        }
    ];

    const brainwavePatterns = [
        { frequency: 'Delta (0.5-4 Hz)', activity: 'Deep Sleep', amplitude: 45, color: 'purple' },
        { frequency: 'Theta (4-8 Hz)', activity: 'Meditation', amplitude: 32, color: 'blue' },
        { frequency: 'Alpha (8-13 Hz)', activity: 'Relaxed', amplitude: 28, color: 'green' },
        { frequency: 'Beta (13-30 Hz)', activity: 'Active Thinking', amplitude: 38, color: 'yellow' },
        { frequency: 'Gamma (30-100 Hz)', activity: 'High Cognition', amplitude: 22, color: 'red' }
    ];

    const trainingProtocols = [
        {
            name: 'Motor Imagery Training',
            duration: '4 weeks',
            sessions: 20,
            success: 89.2,
            participants: 156,
            difficulty: 'Intermediate'
        },
        {
            name: 'P300 Speller Training',
            duration: '2 weeks',
            sessions: 14,
            success: 92.7,
            participants: 89,
            difficulty: 'Beginner'
        },
        {
            name: 'SSVEP Control Training',
            duration: '3 weeks',
            sessions: 18,
            success: 87.4,
            participants: 203,
            difficulty: 'Advanced'
        },
        {
            name: 'Neurofeedback Protocol',
            duration: '6 weeks',
            sessions: 30,
            success: 85.9,
            participants: 134,
            difficulty: 'Intermediate'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-slate-900 to-rose-900">
            {/* Header */}
            <div className="bg-pink-800/20 backdrop-blur-md border-b border-pink-700/30 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            🧠 G3D NeuroAI
                        </h1>
                        <p className="text-pink-200">Brain-Computer Interface Applications Platform - Connect minds with technology</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-pink-800/30 backdrop-blur-md border border-pink-600/30 rounded-lg px-4 py-2">
                            <div className="text-pink-200 text-sm">Signal Accuracy</div>
                            <div className="text-white text-xl font-bold">{dashboardStats.signalAccuracy}%</div>
                        </div>
                        <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors">
                            New Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{dashboardStats.connectedDevices}</div>
                            <div className="text-pink-200 text-sm">Connected Devices</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-400">{dashboardStats.activeUsers.toLocaleString()}</div>
                            <div className="text-pink-200 text-sm">Active Users</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{dashboardStats.signalAccuracy}%</div>
                            <div className="text-pink-200 text-sm">Signal Accuracy</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">{dashboardStats.trainingHours.toLocaleString()}</div>
                            <div className="text-pink-200 text-sm">Training Hours</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400">{dashboardStats.applicationsDeployed}</div>
                            <div className="text-pink-200 text-sm">Applications</div>
                        </div>
                    </GlassCard>
                    <GlassCard>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{dashboardStats.neuralPatterns.toLocaleString()}</div>
                            <div className="text-pink-200 text-sm">Neural Patterns</div>
                        </div>
                    </GlassCard>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-pink-800/10 backdrop-blur-md border border-pink-700/20 rounded-lg mb-8">
                    <div className="flex space-x-8 p-6">
                        {[
                            { id: 'signals', label: 'Neural Signals', icon: '📡' },
                            { id: 'interfaces', label: 'BCI Devices', icon: '🔌' },
                            { id: 'training', label: 'Training Protocols', icon: '🎯' },
                            { id: 'applications', label: 'Applications', icon: '🚀' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-pink-600 text-white'
                                        : 'text-pink-200 hover:bg-pink-800/30'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Neural Signals Tab */}
                {activeTab === 'signals' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Real-time Neural Activity">
                                <div className="bg-slate-900/50 rounded-lg p-6 mb-4">
                                    <div className="text-center text-white mb-4">
                                        <div className="text-6xl mb-4">🧠</div>
                                        <h3 className="text-xl font-semibold mb-2">Live Brain Signal Monitoring</h3>
                                        <p className="text-pink-200">Real-time EEG/ECoG signal visualization and analysis</p>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-4 min-h-80 border-2 border-dashed border-pink-600/30">
                                        <div className="text-pink-300 text-center py-16">
                                            <div className="text-4xl mb-4">📈</div>
                                            <div>Neural Signal Waveforms</div>
                                            <div className="text-sm mt-2">Monitoring {dashboardStats.connectedDevices} active BCI devices</div>

                                            {/* Signal Visualization Mockup */}
                                            <div className="mt-6 space-y-2">
                                                {['Channel 1', 'Channel 2', 'Channel 3', 'Channel 4'].map((channel, index) => (
                                                    <div key={index} className="flex items-center gap-4">
                                                        <span className="text-xs w-16">{channel}</span>
                                                        <div className="flex-1 h-8 bg-slate-700 rounded relative overflow-hidden">
                                                            <div
                                                                className="h-full bg-pink-500 opacity-60 animate-pulse"
                                                                style={{
                                                                    width: `${Math.random() * 100}%`,
                                                                    animation: `pulse 0.${index + 5}s infinite`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg">
                                        Start Recording
                                    </button>
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                                        Analyze Patterns
                                    </button>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                                        Export Data
                                    </button>
                                </div>
                            </GlassCard>

                            <GlassCard title="Brainwave Analysis">
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="text-4xl mb-3">🌊</div>
                                        <h4 className="text-white font-medium mb-2">Frequency Band Analysis</h4>
                                        <p className="text-pink-200 text-sm">Real-time brainwave pattern classification</p>
                                    </div>

                                    <div className="space-y-3">
                                        {brainwavePatterns.map((pattern, index) => (
                                            <div key={index} className="bg-pink-800/20 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium">{pattern.frequency}</span>
                                                    <span className="text-pink-200 text-sm">{pattern.activity}</span>
                                                </div>

                                                <div className="w-full bg-pink-800 rounded-full h-3 mb-2">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-300 bg-${pattern.color}-500`}
                                                        style={{ width: `${pattern.amplitude}%` }}
                                                    ></div>
                                                </div>

                                                <div className="text-pink-200 text-xs">{pattern.amplitude}μV amplitude</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Signal Processing Pipeline">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">🔧</div>
                                    <h4 className="text-white font-medium mb-2">Preprocessing</h4>
                                    <div className="text-pink-200 text-sm mb-3">Filtering, artifact removal, normalization</div>
                                    <div className="text-2xl font-bold text-green-400">98.7%</div>
                                    <div className="text-pink-200 text-xs">Clean signal rate</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🧮</div>
                                    <h4 className="text-white font-medium mb-2">Feature Extraction</h4>
                                    <div className="text-pink-200 text-sm mb-3">Time-frequency analysis, spectral features</div>
                                    <div className="text-2xl font-bold text-blue-400">1,247</div>
                                    <div className="text-pink-200 text-xs">Features extracted</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🤖</div>
                                    <h4 className="text-white font-medium mb-2">Classification</h4>
                                    <div className="text-pink-200 text-sm mb-3">Machine learning pattern recognition</div>
                                    <div className="text-2xl font-bold text-purple-400">94.7%</div>
                                    <div className="text-pink-200 text-xs">Classification accuracy</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h4 className="text-white font-medium mb-2">Control Output</h4>
                                    <div className="text-pink-200 text-sm mb-3">Real-time command generation</div>
                                    <div className="text-2xl font-bold text-cyan-400">12ms</div>
                                    <div className="text-pink-200 text-xs">Response latency</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* BCI Devices Tab */}
                {activeTab === 'interfaces' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Connected BCI Devices">
                                <div className="space-y-3">
                                    {bciDevices.map((device, index) => (
                                        <div key={index} className="bg-pink-800/20 backdrop-blur-md border border-pink-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white font-semibold">{device.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${device.status === 'Active' ? 'bg-green-900 text-green-300' :
                                                        device.status === 'Training' ? 'bg-yellow-900 text-yellow-300' :
                                                            'bg-blue-900 text-blue-300'
                                                    }`}>
                                                    {device.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                <div>
                                                    <div className="text-pink-200">Type</div>
                                                    <div className="text-white font-medium">{device.type}</div>
                                                </div>
                                                <div>
                                                    <div className="text-pink-200">Channels</div>
                                                    <div className="text-white font-medium">{device.channels}</div>
                                                </div>
                                                <div>
                                                    <div className="text-pink-200">Resolution</div>
                                                    <div className="text-white font-medium">{device.resolution}</div>
                                                </div>
                                                <div>
                                                    <div className="text-pink-200">Accuracy</div>
                                                    <div className="text-white font-medium">{device.accuracy}%</div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <div className="text-pink-200 text-sm">Current User</div>
                                                <div className="text-white font-medium">{device.user}</div>
                                            </div>

                                            <div className="w-full bg-pink-800 rounded-full h-2 mb-3">
                                                <div
                                                    className="bg-pink-500 h-2 rounded-full"
                                                    style={{ width: `${device.accuracy}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded text-sm">
                                                    Monitor
                                                </button>
                                                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
                                                    Calibrate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard title="Device Configuration">
                                <div className="space-y-4">
                                    <div className="text-center py-6">
                                        <div className="text-4xl mb-3">🔌</div>
                                        <h4 className="text-white font-medium mb-2">BCI Setup Wizard</h4>
                                        <p className="text-pink-200 text-sm">Configure and calibrate brain-computer interfaces</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-pink-200 text-sm mb-1">Device Type</label>
                                            <select className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2">
                                                <option>EEG (Non-invasive)</option>
                                                <option>ECoG (Semi-invasive)</option>
                                                <option>Microelectrode Array (Invasive)</option>
                                                <option>fNIRS (Optical)</option>
                                                <option>fMRI (Magnetic Resonance)</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-pink-200 text-sm mb-1">Channels</label>
                                                <input
                                                    type="number"
                                                    defaultValue={8}
                                                    className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-pink-200 text-sm mb-1">Sample Rate (Hz)</label>
                                                <input
                                                    type="number"
                                                    defaultValue={256}
                                                    className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-pink-200 text-sm mb-1">Application Type</label>
                                            <select className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2">
                                                <option>Motor Control</option>
                                                <option>Communication</option>
                                                <option>Cognitive Monitoring</option>
                                                <option>Neurofeedback</option>
                                                <option>Research</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-pink-200 text-sm mb-1">Signal Processing</label>
                                            <select className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2">
                                                <option>Real-time</option>
                                                <option>Offline Analysis</option>
                                                <option>Hybrid Processing</option>
                                            </select>
                                        </div>

                                        <button className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg font-semibold">
                                            🚀 Start Calibration
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Device Performance Metrics">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { metric: 'Signal Quality', value: '94.7%', trend: '+2.3%', color: 'green' },
                                    { metric: 'Response Latency', value: '12ms', trend: '-1.5ms', color: 'blue' },
                                    { metric: 'Classification Accuracy', value: '89.2%', trend: '+4.1%', color: 'purple' },
                                    { metric: 'Session Duration', value: '47min', trend: '+8min', color: 'cyan' }
                                ].map((metric, index) => (
                                    <div key={index} className="bg-pink-800/20 backdrop-blur-md border border-pink-700/30 rounded-lg p-4">
                                        <div className="text-center">
                                            <h4 className="text-white font-semibold mb-2">{metric.metric}</h4>
                                            <div className={`text-2xl font-bold text-${metric.color}-400 mb-1`}>{metric.value}</div>
                                            <div className={`text-sm ${metric.trend.startsWith('+') ? 'text-green-400' : 'text-blue-400'}`}>
                                                {metric.trend} from last session
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Training Protocols Tab */}
                {activeTab === 'training' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="Training Protocols">
                                <div className="space-y-4">
                                    {trainingProtocols.map((protocol, index) => (
                                        <div key={index} className="bg-pink-800/20 backdrop-blur-md border border-pink-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-white font-semibold">{protocol.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${protocol.difficulty === 'Beginner' ? 'bg-green-900 text-green-300' :
                                                        protocol.difficulty === 'Intermediate' ? 'bg-yellow-900 text-yellow-300' :
                                                            'bg-red-900 text-red-300'
                                                    }`}>
                                                    {protocol.difficulty}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                <div>
                                                    <div className="text-pink-200">Duration</div>
                                                    <div className="text-white font-medium">{protocol.duration}</div>
                                                </div>
                                                <div>
                                                    <div className="text-pink-200">Sessions</div>
                                                    <div className="text-white font-medium">{protocol.sessions}</div>
                                                </div>
                                                <div>
                                                    <div className="text-pink-200">Success Rate</div>
                                                    <div className="text-white font-medium">{protocol.success}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-pink-200">Participants</div>
                                                    <div className="text-white font-medium">{protocol.participants}</div>
                                                </div>
                                            </div>

                                            <div className="w-full bg-pink-800 rounded-full h-2 mb-3">
                                                <div
                                                    className="bg-pink-500 h-2 rounded-full"
                                                    style={{ width: `${protocol.success}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded text-sm">
                                                    Start Training
                                                </button>
                                                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard title="Adaptive Learning">
                                <div className="space-y-4">
                                    <div className="text-center py-6">
                                        <div className="text-4xl mb-3">🎯</div>
                                        <h4 className="text-white font-medium mb-2">AI-Powered Training</h4>
                                        <p className="text-pink-200 text-sm">Personalized BCI training with adaptive algorithms</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="bg-pink-800/20 rounded-lg p-4">
                                            <h5 className="text-white font-medium mb-2">🧠 Neural Plasticity Tracking</h5>
                                            <p className="text-pink-200 text-sm mb-3">Monitor brain adaptation during training</p>
                                            <div className="w-full bg-pink-800 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                            </div>
                                            <div className="text-pink-200 text-xs mt-1">Adaptation Progress: 78%</div>
                                        </div>

                                        <div className="bg-pink-800/20 rounded-lg p-4">
                                            <h5 className="text-white font-medium mb-2">📈 Performance Optimization</h5>
                                            <p className="text-pink-200 text-sm mb-3">Dynamic difficulty adjustment</p>
                                            <div className="w-full bg-pink-800 rounded-full h-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                            <div className="text-pink-200 text-xs mt-1">Optimization Level: 92%</div>
                                        </div>

                                        <div className="bg-pink-800/20 rounded-lg p-4">
                                            <h5 className="text-white font-medium mb-2">🎮 Gamification Elements</h5>
                                            <p className="text-pink-200 text-sm mb-3">Engaging training experiences</p>
                                            <div className="w-full bg-pink-800 rounded-full h-2">
                                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                            </div>
                                            <div className="text-pink-200 text-xs mt-1">Engagement Score: 85%</div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Training Progress Analytics">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">⏱️</div>
                                    <h4 className="text-white font-medium mb-2">Average Session Time</h4>
                                    <div className="text-2xl font-bold text-green-400 mb-1">47 min</div>
                                    <div className="text-pink-200 text-sm">+8 min from last week</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🎯</div>
                                    <h4 className="text-white font-medium mb-2">Accuracy Improvement</h4>
                                    <div className="text-2xl font-bold text-blue-400 mb-1">+12.3%</div>
                                    <div className="text-pink-200 text-sm">Per training session</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">👥</div>
                                    <h4 className="text-white font-medium mb-2">Active Trainees</h4>
                                    <div className="text-2xl font-bold text-purple-400 mb-1">1,834</div>
                                    <div className="text-pink-200 text-sm">Across all protocols</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🏆</div>
                                    <h4 className="text-white font-medium mb-2">Completion Rate</h4>
                                    <div className="text-2xl font-bold text-cyan-400 mb-1">89.2%</div>
                                    <div className="text-pink-200 text-sm">Training success rate</div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <GlassCard title="BCI Applications">
                                <div className="space-y-4">
                                    {neuralApplications.map((app, index) => (
                                        <div key={index} className="bg-pink-800/20 backdrop-blur-md border border-pink-700/30 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-white font-semibold">{app.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs ${app.status === 'Deployed' ? 'bg-green-900 text-green-300' :
                                                        app.status === 'Active' ? 'bg-blue-900 text-blue-300' :
                                                            app.status === 'Beta' ? 'bg-yellow-900 text-yellow-300' :
                                                                app.status === 'Clinical Trial' ? 'bg-purple-900 text-purple-300' :
                                                                    'bg-orange-900 text-orange-300'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>

                                            <div className="text-pink-200 text-sm mb-3">{app.category}</div>
                                            <div className="text-white text-sm mb-3">{app.description}</div>

                                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                <div>
                                                    <div className="text-pink-200">Active Users</div>
                                                    <div className="text-white font-bold">{app.users}</div>
                                                </div>
                                                <div>
                                                    <div className="text-pink-200">Accuracy</div>
                                                    <div className="text-white font-bold">{app.accuracy}%</div>
                                                </div>
                                            </div>

                                            <div className="w-full bg-pink-800 rounded-full h-2 mb-3">
                                                <div
                                                    className="bg-pink-500 h-2 rounded-full"
                                                    style={{ width: `${app.accuracy}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded text-sm">
                                                    Launch App
                                                </button>
                                                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
                                                    Analytics
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard title="Application Development">
                                <div className="space-y-4">
                                    <div className="text-center py-6">
                                        <div className="text-4xl mb-3">🚀</div>
                                        <h4 className="text-white font-medium mb-2">BCI App Builder</h4>
                                        <p className="text-pink-200 text-sm">Create custom brain-computer interface applications</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-pink-200 text-sm mb-1">Application Type</label>
                                            <select className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2">
                                                <option>Motor Control</option>
                                                <option>Communication Aid</option>
                                                <option>Cognitive Training</option>
                                                <option>Medical Monitoring</option>
                                                <option>Entertainment</option>
                                                <option>Research Tool</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-pink-200 text-sm mb-1">Target Users</label>
                                            <select className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2">
                                                <option>Spinal Cord Injury Patients</option>
                                                <option>Stroke Survivors</option>
                                                <option>ALS Patients</option>
                                                <option>Healthy Individuals</option>
                                                <option>Researchers</option>
                                                <option>General Public</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-pink-200 text-sm mb-1">Signal Type</label>
                                            <select className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2">
                                                <option>Motor Imagery (ERD/ERS)</option>
                                                <option>P300 Event-Related Potential</option>
                                                <option>SSVEP (Visual Evoked)</option>
                                                <option>Slow Cortical Potentials</option>
                                                <option>Hybrid Signals</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-pink-200 text-sm mb-1">Platform</label>
                                            <select className="w-full bg-pink-800/30 text-white border border-pink-600/30 rounded px-3 py-2">
                                                <option>Desktop Application</option>
                                                <option>Mobile App</option>
                                                <option>Web Platform</option>
                                                <option>Embedded System</option>
                                                <option>VR/AR Interface</option>
                                            </select>
                                        </div>

                                        <button className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-lg font-semibold">
                                            🛠️ Build Application
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        <GlassCard title="Impact Metrics">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">♿</div>
                                    <h4 className="text-white font-medium mb-2">Lives Improved</h4>
                                    <div className="text-2xl font-bold text-green-400 mb-1">12,847</div>
                                    <div className="text-pink-200 text-sm">Patients helped worldwide</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🏥</div>
                                    <h4 className="text-white font-medium mb-2">Clinical Deployments</h4>
                                    <div className="text-2xl font-bold text-blue-400 mb-1">89</div>
                                    <div className="text-pink-200 text-sm">Hospitals & clinics</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">🔬</div>
                                    <h4 className="text-white font-medium mb-2">Research Studies</h4>
                                    <div className="text-2xl font-bold text-purple-400 mb-1">156</div>
                                    <div className="text-pink-200 text-sm">Active research projects</div>
                                </div>

                                <div className="text-center">
                                    <div className="text-4xl mb-3">📈</div>
                                    <h4 className="text-white font-medium mb-2">Success Rate</h4>
                                    <div className="text-2xl font-bold text-cyan-400 mb-1">91.4%</div>
                                    <div className="text-pink-200 text-sm">Application effectiveness</div>
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
    <div className="bg-pink-800/20 backdrop-blur-md border border-pink-700/30 rounded-lg p-6">
        {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
        {children}
    </div>
);

// Type definitions for BCI data
interface BCIDevice {
    id: string;
    name: string;
    type: string;
    channels: number;
    status: string;
}

interface NeuralSignal {
    timestamp: number;
    channel: number;
    amplitude: number;
    frequency: number;
}

export default NeuroAIDashboard;