"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  CpuIcon, 
  Database, 
  HardDrive, 
  Monitor, 
  Network, 
  Shield, 
  Thermometer, 
  TrendingUp,
  Users,
  Zap,
  Heart,
  AlertCircle,
  RefreshCw,
  Settings,
  Download,
  BarChart3,
  Server,
  Wifi,
  Lock,
  Eye,
  BookOpen,
  Globe,
  Smartphone,
  Tablet,
  UserCheck,
  FileText,
  Search,
  Filter,
  Calendar,
  Bell,
  Info,
  X,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  Copy,
  Share,
  TrendingDown,
  Gauge,
  Target,
  Zap as Lightning,
  Cpu,
  HardDrive as Memory,
  HardDrive as HardDisk,
  Layers,
  Settings as Optimize,
  Rocket,
  BarChart,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Timer,
  Flame,
  Snowflake,
  Wind,
  Wrench,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Power,
  Battery,
  Wifi as WifiIcon,
  CloudLightning,
  Aperture,
  Maximize,
  Minimize,
  Focus,
  Crosshair,
  Target as TargetIcon,
  Zap as ZapIcon,
  Zap as Flash,
  Sparkles,
  Star,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Hexagon,
  Triangle,
  Square,
  Circle,
  Octagon,
  Pentagon
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  category: 'cpu' | 'memory' | 'storage' | 'network' | 'database' | 'application';
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'degrading' | 'stable';
  impact: 'high' | 'medium' | 'low';
  lastOptimized: Date;
  optimizationPotential: number;
  recommendations: string[];
}

interface OptimizationTask {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'security' | 'scalability' | 'reliability' | 'medical';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedImpact: number;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  prerequisites: string[];
  medicalCompliance: boolean;
  automationAvailable: boolean;
}

interface SystemResource {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'storage' | 'network' | 'gpu';
  usage: number;
  capacity: number;
  efficiency: number;
  temperature?: number;
  powerConsumption?: number;
  optimizationScore: number;
  recommendations: string[];
}

interface OptimizationProfile {
  id: string;
  name: string;
  description: string;
  category: 'balanced' | 'performance' | 'efficiency' | 'medical_imaging' | 'ai_processing';
  settings: {
    cpuThrottling: boolean;
    memoryOptimization: boolean;
    storageCompression: boolean;
    networkOptimization: boolean;
    cacheSettings: string;
  };
  medicalCompliance: boolean;
  active: boolean;
}

const PerformanceOptimization = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'tasks' | 'resources' | 'profiles' | 'settings'>('overview');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [optimizationTasks, setOptimizationTasks] = useState<OptimizationTask[]>([]);
  const [systemResources, setSystemResources] = useState<SystemResource[]>([]);
  const [optimizationProfiles, setOptimizationProfiles] = useState<OptimizationProfile[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('balanced');
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([]);

  // Initialize performance optimization data
  useEffect(() => {
    const initializeOptimization = () => {
      // Initialize performance metrics
      const metrics: PerformanceMetric[] = [
        {
          id: 'cpu-performance',
          name: 'CPU Performance',
          category: 'cpu',
          currentValue: 72.5,
          targetValue: 85.0,
          unit: '%',
          trend: 'improving',
          impact: 'high',
          lastOptimized: new Date(Date.now() - 1000 * 60 * 60 * 2),
          optimizationPotential: 15.2,
          recommendations: [
            'Enable CPU frequency scaling',
            'Optimize process scheduling',
            'Implement CPU affinity for critical tasks'
          ]
        },
        {
          id: 'memory-efficiency',
          name: 'Memory Efficiency',
          category: 'memory',
          currentValue: 68.3,
          targetValue: 80.0,
          unit: '%',
          trend: 'stable',
          impact: 'high',
          lastOptimized: new Date(Date.now() - 1000 * 60 * 60 * 4),
          optimizationPotential: 12.8,
          recommendations: [
            'Implement memory pooling',
            'Enable garbage collection optimization',
            'Configure memory caching strategies'
          ]
        },
        {
          id: 'storage-throughput',
          name: 'Storage Throughput',
          category: 'storage',
          currentValue: 89.2,
          targetValue: 95.0,
          unit: 'MB/s',
          trend: 'improving',
          impact: 'medium',
          lastOptimized: new Date(Date.now() - 1000 * 60 * 60 * 6),
          optimizationPotential: 8.5,
          recommendations: [
            'Enable SSD caching',
            'Optimize file system settings',
            'Implement data deduplication'
          ]
        },
        {
          id: 'network-latency',
          name: 'Network Latency',
          category: 'network',
          currentValue: 245,
          targetValue: 150,
          unit: 'ms',
          trend: 'degrading',
          impact: 'high',
          lastOptimized: new Date(Date.now() - 1000 * 60 * 60 * 8),
          optimizationPotential: 25.3,
          recommendations: [
            'Optimize network buffer sizes',
            'Enable TCP window scaling',
            'Implement connection pooling'
          ]
        },
        {
          id: 'database-performance',
          name: 'Database Performance',
          category: 'database',
          currentValue: 76.8,
          targetValue: 90.0,
          unit: 'QPS',
          trend: 'stable',
          impact: 'high',
          lastOptimized: new Date(Date.now() - 1000 * 60 * 60 * 12),
          optimizationPotential: 18.7,
          recommendations: [
            'Optimize query execution plans',
            'Enable connection pooling',
            'Implement database caching'
          ]
        },
        {
          id: 'application-response',
          name: 'Application Response Time',
          category: 'application',
          currentValue: 320,
          targetValue: 200,
          unit: 'ms',
          trend: 'improving',
          impact: 'high',
          lastOptimized: new Date(Date.now() - 1000 * 60 * 60 * 1),
          optimizationPotential: 22.1,
          recommendations: [
            'Enable application caching',
            'Optimize API endpoints',
            'Implement lazy loading'
          ]
        }
      ];

      // Initialize optimization tasks
      const tasks: OptimizationTask[] = [
        {
          id: 'cpu-optimization',
          title: 'CPU Frequency Scaling',
          description: 'Implement dynamic CPU frequency scaling to improve performance while maintaining power efficiency',
          category: 'performance',
          priority: 'high',
          estimatedImpact: 15.2,
          estimatedTime: '2 hours',
          difficulty: 'medium',
          status: 'pending',
          prerequisites: ['System reboot required'],
          medicalCompliance: true,
          automationAvailable: true
        },
        {
          id: 'memory-pooling',
          title: 'Memory Pool Implementation',
          description: 'Configure memory pooling to reduce allocation overhead and improve DICOM processing performance',
          category: 'performance',
          priority: 'high',
          estimatedImpact: 12.8,
          estimatedTime: '3 hours',
          difficulty: 'hard',
          status: 'in_progress',
          prerequisites: ['Memory analysis complete'],
          medicalCompliance: true,
          automationAvailable: false
        },
        {
          id: 'database-indexing',
          title: 'Database Index Optimization',
          description: 'Optimize database indexes for medical record queries and patient data retrieval',
          category: 'performance',
          priority: 'medium',
          estimatedImpact: 18.7,
          estimatedTime: '4 hours',
          difficulty: 'medium',
          status: 'pending',
          prerequisites: ['Database backup required'],
          medicalCompliance: true,
          automationAvailable: true
        },
        {
          id: 'network-tuning',
          title: 'Network Buffer Optimization',
          description: 'Tune network buffer sizes for optimal DICOM transfer and medical imaging performance',
          category: 'performance',
          priority: 'high',
          estimatedImpact: 25.3,
          estimatedTime: '1 hour',
          difficulty: 'easy',
          status: 'completed',
          prerequisites: [],
          medicalCompliance: true,
          automationAvailable: true
        },
        {
          id: 'cache-implementation',
          title: 'Medical Data Caching',
          description: 'Implement HIPAA-compliant caching for frequently accessed medical data and imaging studies',
          category: 'medical',
          priority: 'critical',
          estimatedImpact: 30.5,
          estimatedTime: '6 hours',
          difficulty: 'hard',
          status: 'pending',
          prerequisites: ['Security audit required', 'HIPAA compliance review'],
          medicalCompliance: true,
          automationAvailable: false
        }
      ];

      // Initialize system resources
      const resources: SystemResource[] = [
        {
          id: 'cpu-cores',
          name: 'CPU Cores',
          type: 'cpu',
          usage: 68.5,
          capacity: 100,
          efficiency: 82.3,
          temperature: 65,
          powerConsumption: 125,
          optimizationScore: 78.5,
          recommendations: [
            'Enable CPU affinity for medical imaging processes',
            'Implement CPU throttling during low usage periods',
            'Optimize process scheduling for real-time tasks'
          ]
        },
        {
          id: 'system-memory',
          name: 'System Memory',
          type: 'memory',
          usage: 72.1,
          capacity: 64,
          efficiency: 75.8,
          optimizationScore: 71.2,
          recommendations: [
            'Implement memory compression',
            'Configure swap file optimization',
            'Enable memory deduplication'
          ]
        },
        {
          id: 'storage-nvme',
          name: 'NVMe Storage',
          type: 'storage',
          usage: 45.3,
          capacity: 2048,
          efficiency: 91.2,
          optimizationScore: 88.7,
          recommendations: [
            'Enable write caching',
            'Implement storage tiering',
            'Configure automatic defragmentation'
          ]
        },
        {
          id: 'network-adapter',
          name: 'Network Adapter',
          type: 'network',
          usage: 34.7,
          capacity: 1000,
          efficiency: 89.5,
          optimizationScore: 85.3,
          recommendations: [
            'Enable jumbo frames',
            'Optimize receive buffer scaling',
            'Configure network adapter offloading'
          ]
        },
        {
          id: 'gpu-compute',
          name: 'GPU Compute',
          type: 'gpu',
          usage: 58.9,
          capacity: 100,
          efficiency: 87.4,
          temperature: 72,
          powerConsumption: 220,
          optimizationScore: 83.6,
          recommendations: [
            'Enable GPU memory optimization',
            'Implement CUDA stream optimization',
            'Configure GPU frequency scaling'
          ]
        }
      ];

      // Initialize optimization profiles
      const profiles: OptimizationProfile[] = [
        {
          id: 'balanced',
          name: 'Balanced Performance',
          description: 'Optimal balance between performance and efficiency for general medical workflows',
          category: 'balanced',
          settings: {
            cpuThrottling: true,
            memoryOptimization: true,
            storageCompression: false,
            networkOptimization: true,
            cacheSettings: 'moderate'
          },
          medicalCompliance: true,
          active: true
        },
        {
          id: 'high-performance',
          name: 'High Performance',
          description: 'Maximum performance for intensive medical imaging and AI processing tasks',
          category: 'performance',
          settings: {
            cpuThrottling: false,
            memoryOptimization: true,
            storageCompression: false,
            networkOptimization: true,
            cacheSettings: 'aggressive'
          },
          medicalCompliance: true,
          active: false
        },
        {
          id: 'efficiency',
          name: 'Power Efficiency',
          description: 'Optimized for power efficiency during low-usage periods',
          category: 'efficiency',
          settings: {
            cpuThrottling: true,
            memoryOptimization: true,
            storageCompression: true,
            networkOptimization: false,
            cacheSettings: 'conservative'
          },
          medicalCompliance: true,
          active: false
        },
        {
          id: 'medical-imaging',
          name: 'Medical Imaging',
          description: 'Specialized optimization for DICOM processing and medical imaging workflows',
          category: 'medical_imaging',
          settings: {
            cpuThrottling: false,
            memoryOptimization: true,
            storageCompression: false,
            networkOptimization: true,
            cacheSettings: 'medical_optimized'
          },
          medicalCompliance: true,
          active: false
        },
        {
          id: 'ai-processing',
          name: 'AI Processing',
          description: 'Optimized for machine learning inference and AI-assisted diagnostics',
          category: 'ai_processing',
          settings: {
            cpuThrottling: false,
            memoryOptimization: true,
            storageCompression: false,
            networkOptimization: true,
            cacheSettings: 'ai_optimized'
          },
          medicalCompliance: true,
          active: false
        }
      ];

      setPerformanceMetrics(metrics);
      setOptimizationTasks(tasks);
      setSystemResources(resources);
      setOptimizationProfiles(profiles);
    };

    initializeOptimization();
  }, []);

  // Calculate overall performance score
  const calculateOverallScore = () => {
    const totalScore = performanceMetrics.reduce((sum, metric) => {
      return sum + (metric.currentValue / metric.targetValue) * 100;
    }, 0);
    return Math.min(100, totalScore / performanceMetrics.length);
  };

  // Get status color based on performance
  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'degrading':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'memory':
        return <Memory className="w-5 h-5" />;
      case 'storage':
        return <HardDisk className="w-5 h-5" />;
      case 'network':
        return <Network className="w-5 h-5" />;
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'application':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500 bg-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'low':
        return 'text-green-500 bg-green-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  // Execute optimization task
  const executeOptimization = async (taskId: string) => {
    setIsOptimizing(true);
    setOptimizationTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'in_progress' } : task
    ));

    // Simulate optimization process
    setTimeout(() => {
      setOptimizationTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      ));
      setIsOptimizing(false);
    }, 3000);
  };

  // Switch optimization profile
  const switchProfile = (profileId: string) => {
    setOptimizationProfiles(prev => prev.map(profile => ({
      ...profile,
      active: profile.id === profileId
    })));
    setSelectedProfile(profileId);
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Performance Optimization
              </h1>
              <p className="text-slate-300">
                Optimize medical platform performance and resource utilization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Gauge className="w-6 h-6 text-blue-400" />
                <div className="text-right">
                  <div className={`text-xl font-bold ${getPerformanceColor(overallScore)}`}>
                    {overallScore.toFixed(1)}%
                  </div>
                  <div className="text-slate-400 text-sm">Overall Performance</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${autoOptimization ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-white">
                  Auto-Optimization {autoOptimization ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                onClick={() => setAutoOptimization(!autoOptimization)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor },
              { id: 'metrics', label: 'Metrics', icon: BarChart3 },
              { id: 'tasks', label: 'Tasks', icon: Wrench },
              { id: 'resources', label: 'Resources', icon: Server },
              { id: 'profiles', label: 'Profiles', icon: Layers },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Overall Performance</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(overallScore)}`}>
                      {overallScore.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-blue-400/20 p-3 rounded-full">
                    <Gauge className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-blue-400 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+3.2% from last week</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Active Tasks</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {optimizationTasks.filter(t => t.status === 'in_progress').length}
                    </p>
                  </div>
                  <div className="bg-orange-400/20 p-3 rounded-full">
                    <Wrench className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-orange-400 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Est. completion: 4 hours</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Resource Efficiency</p>
                    <p className="text-2xl font-bold text-green-400">87.3%</p>
                  </div>
                  <div className="bg-green-400/20 p-3 rounded-full">
                    <Rocket className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-400 text-sm">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+5.8% efficiency gain</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm">Optimization Potential</p>
                    <p className="text-2xl font-bold text-yellow-400">22.1%</p>
                  </div>
                  <div className="bg-yellow-400/20 p-3 rounded-full">
                    <Target className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-yellow-400 text-sm">
                  <Lightning className="w-4 h-4 mr-1" />
                  <span>Performance boost available</span>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Optimizations</h3>
                <div className="space-y-3">
                  {optimizationTasks.filter(t => t.automationAvailable && t.status === 'pending').slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{task.title}</p>
                        <p className="text-slate-400 text-sm">Impact: +{task.estimatedImpact}%</p>
                      </div>
                      <button
                        onClick={() => executeOptimization(task.id)}
                        disabled={isOptimizing}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        {isOptimizing ? 'Optimizing...' : 'Optimize'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  {performanceMetrics.slice(0, 3).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-400">
                          {getCategoryIcon(metric.category)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{metric.name}</p>
                          <p className="text-slate-400 text-sm">{metric.currentValue}{metric.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(metric.trend)}
                          <span className="text-white">{((metric.currentValue / metric.targetValue) * 100).toFixed(0)}%</span>
                        </div>
                        <p className="text-slate-400 text-xs">Target: {metric.targetValue}{metric.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Performance Metrics</h2>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Data</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {performanceMetrics.map(metric => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">
                        {getCategoryIcon(metric.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{metric.name}</h3>
                        <p className="text-slate-400 text-sm capitalize">{metric.category}</p>
                      </div>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-white">
                        {metric.currentValue}{metric.unit}
                      </span>
                      <span className="text-slate-400">
                        Target: {metric.targetValue}{metric.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          metric.currentValue >= metric.targetValue ? 'bg-green-500' :
                          metric.currentValue >= metric.targetValue * 0.8 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (metric.currentValue / metric.targetValue) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Optimization Potential</span>
                      <span className="text-yellow-400 font-semibold">+{metric.optimizationPotential}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Last Optimized</span>
                      <span className="text-slate-400">{metric.lastOptimized.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-slate-300 text-sm mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {metric.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-slate-400 text-sm flex items-start">
                          <ArrowRight className="w-3 h-3 mr-1 mt-0.5 text-blue-400" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Optimization Tasks</h2>
              <div className="flex items-center space-x-4">
                <div className="text-slate-400">
                  {optimizationTasks.filter(t => t.status === 'pending').length} pending tasks
                </div>
                <button
                  onClick={() => setIsOptimizing(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Run All Automated</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {optimizationTasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border-l-4 ${
                    task.priority === 'critical' ? 'border-red-500' :
                    task.priority === 'high' ? 'border-orange-500' :
                    task.priority === 'medium' ? 'border-yellow-500' :
                    'border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {task.medicalCompliance && (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                            Medical Compliant
                          </span>
                        )}
                        {task.automationAvailable && (
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                            Automated
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 mb-3">{task.description}</p>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-400">Impact: +{task.estimatedImpact}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-400">Time: {task.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Gauge className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-400">Difficulty: {task.difficulty}</span>
                        </div>
                      </div>
                      {task.prerequisites.length > 0 && (
                        <div className="mt-3">
                          <p className="text-slate-400 text-sm">Prerequisites:</p>
                          <ul className="mt-1 space-y-1">
                            {task.prerequisites.map((prereq, index) => (
                              <li key={index} className="text-slate-500 text-sm flex items-start">
                                <ArrowRight className="w-3 h-3 mr-1 mt-0.5" />
                                {prereq}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`px-3 py-1 rounded text-sm font-medium ${
                        task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        task.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </div>
                      {task.status === 'pending' && (
                        <button
                          onClick={() => executeOptimization(task.id)}
                          disabled={isOptimizing}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                        >
                          {isOptimizing ? 'Running...' : 'Execute'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">System Resources</h2>
              <div className="text-slate-400">
                Average efficiency: {(systemResources.reduce((sum, r) => sum + r.efficiency, 0) / systemResources.length).toFixed(1)}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemResources.map(resource => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">
                        {getCategoryIcon(resource.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{resource.name}</h3>
                        <p className="text-slate-400 text-sm capitalize">{resource.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(resource.optimizationScore)}`}>
                        {resource.optimizationScore.toFixed(1)}%
                      </div>
                      <div className="text-slate-400 text-sm">Optimization Score</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Usage</span>
                      <span className="text-white">{resource.usage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          resource.usage >= 90 ? 'bg-red-500' :
                          resource.usage >= 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${resource.usage}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Efficiency</p>
                      <p className="text-white font-semibold">{resource.efficiency.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Capacity</p>
                      <p className="text-white font-semibold">
                        {resource.type === 'memory' ? `${resource.capacity}GB` :
                         resource.type === 'storage' ? `${resource.capacity}GB` :
                         resource.type === 'network' ? `${resource.capacity}Mbps` :
                         `${resource.capacity}%`}
                      </p>
                    </div>
                    {resource.temperature && (
                      <div>
                        <p className="text-slate-400 text-sm">Temperature</p>
                        <p className="text-white font-semibold">{resource.temperature}°C</p>
                      </div>
                    )}
                    {resource.powerConsumption && (
                      <div>
                        <p className="text-slate-400 text-sm">Power</p>
                        <p className="text-white font-semibold">{resource.powerConsumption}W</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-slate-300 text-sm mb-2">Optimization Recommendations:</p>
                    <ul className="space-y-1">
                      {resource.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-slate-400 text-sm flex items-start">
                          <ArrowRight className="w-3 h-3 mr-1 mt-0.5 text-blue-400" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Profiles Tab */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Optimization Profiles</h2>
              <div className="text-slate-400">
                Active profile: {optimizationProfiles.find(p => p.active)?.name}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {optimizationProfiles.map(profile => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border-2 ${
                    profile.active ? 'border-blue-500' : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                      <p className="text-slate-400 text-sm capitalize">{profile.category.replace('_', ' ')}</p>
                    </div>
                    {profile.active && (
                      <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                        ACTIVE
                      </div>
                    )}
                  </div>

                  <p className="text-slate-300 mb-4">{profile.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">CPU Throttling</span>
                      <div className={`w-8 h-4 rounded-full ${profile.settings.cpuThrottling ? 'bg-blue-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${profile.settings.cpuThrottling ? 'translate-x-4' : ''}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Memory Optimization</span>
                      <div className={`w-8 h-4 rounded-full ${profile.settings.memoryOptimization ? 'bg-blue-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${profile.settings.memoryOptimization ? 'translate-x-4' : ''}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Network Optimization</span>
                      <div className={`w-8 h-4 rounded-full ${profile.settings.networkOptimization ? 'bg-blue-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${profile.settings.networkOptimization ? 'translate-x-4' : ''}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cache Settings</span>
                      <span className="text-white capitalize">{profile.settings.cacheSettings.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Medical Compliant</span>
                      </div>
                      <button
                        onClick={() => switchProfile(profile.id)}
                        disabled={profile.active}
                        className={`px-4 py-2 rounded text-sm font-medium ${
                          profile.active
                            ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {profile.active ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Optimization Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">Automation Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Auto-Optimization</p>
                      <p className="text-slate-400 text-sm">Automatically execute safe optimizations</p>
                    </div>
                    <button
                      onClick={() => setAutoOptimization(!autoOptimization)}
                      className={`w-12 h-6 rounded-full ${autoOptimization ? 'bg-blue-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform ${autoOptimization ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Maintenance Mode</p>
                      <p className="text-slate-400 text-sm">Schedule optimizations during low usage</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-gray-600">
                      <div className="w-6 h-6 rounded-full bg-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Medical Compliance Check</p>
                      <p className="text-slate-400 text-sm">Verify medical compliance before optimization</p>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-blue-500">
                      <div className="w-6 h-6 rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-4">Performance Thresholds</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-white font-medium">CPU Usage Warning</label>
                    <div className="mt-2 flex items-center space-x-4">
                      <input
                        type="range"
                        min="50"
                        max="95"
                        defaultValue="75"
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-white">75%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-medium">Memory Usage Warning</label>
                    <div className="mt-2 flex items-center space-x-4">
                      <input
                        type="range"
                        min="60"
                        max="95"
                        defaultValue="80"
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-white">80%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-white font-medium">Response Time Threshold</label>
                    <div className="mt-2 flex items-center space-x-4">
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        defaultValue="1000"
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-white">1000ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Compliance Footer */}
        <div className="mt-12 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Medical Performance Standards</h3>
                <p className="text-slate-400">
                  FDA Class II • Medical Device Performance • HIPAA Compliant Optimization
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">Performance Optimized</p>
              <p className="text-slate-400 text-sm">Last optimization: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimization; 