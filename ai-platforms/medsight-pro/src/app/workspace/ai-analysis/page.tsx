'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BeakerIcon,
  CpuChipIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BoltIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

export default function AIAnalysisWorkspacePage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState('general-radiology');
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    totalAnalyses: 2847,
    accuracy: 97.3,
    avgProcessingTime: 2.4,
    modelsActive: 6
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        ...prev,
        totalAnalyses: prev.totalAnalyses + Math.floor(Math.random() * 3),
        accuracy: Math.min(100, Math.max(95, prev.accuracy + (Math.random() - 0.5) * 0.1)),
        avgProcessingTime: Math.max(1.5, Math.min(4, prev.avgProcessingTime + (Math.random() - 0.5) * 0.2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const aiModels = [
    {
      id: 'general-radiology',
      name: 'General Radiology AI',
      description: 'Multi-modal analysis for common radiological findings',
      accuracy: 97.3,
      modalities: ['CT', 'MRI', 'X-Ray'],
      status: 'active',
      version: 'v2.1.0'
    },
    {
      id: 'chest-ct',
      name: 'Chest CT Specialist',
      description: 'Specialized model for chest CT analysis',
      accuracy: 98.7,
      modalities: ['CT'],
      status: 'active',
      version: 'v1.8.2'
    },
    {
      id: 'brain-mri',
      name: 'Brain MRI Analyzer',
      description: 'Advanced brain pathology detection',
      accuracy: 96.1,
      modalities: ['MRI'],
      status: 'active',
      version: 'v3.0.1'
    },
    {
      id: 'mammography',
      name: 'Mammography Screening',
      description: 'Breast cancer detection and analysis',
      accuracy: 95.8,
      modalities: ['Mammography'],
      status: 'active',
      version: 'v2.3.0'
    }
  ];

  const pendingAnalyses = [
    {
      id: 'AN001',
      patientId: 'P001234',
      studyId: 'ST001',
      modality: 'CT',
      bodyPart: 'Chest',
      priority: 'urgent',
      submittedAt: '10:30 AM',
      estimatedCompletion: '2 min'
    },
    {
      id: 'AN002',
      patientId: 'P001235',
      studyId: 'ST002',
      modality: 'MRI',
      bodyPart: 'Brain',
      priority: 'routine',
      submittedAt: '10:25 AM',
      estimatedCompletion: '4 min'
    }
  ];

  const completedAnalyses = [
    {
      id: 'AN100',
      patientId: 'P001200',
      studyId: 'ST100',
      modality: 'X-Ray',
      bodyPart: 'Chest',
      confidence: 98.7,
      findings: ['Normal chest', 'No acute findings'],
      completedAt: '10:15 AM',
      processingTime: '1.8s'
    },
    {
      id: 'AN101',
      patientId: 'P001201',
      studyId: 'ST101',
      modality: 'CT',
      bodyPart: 'Abdomen',
      confidence: 89.2,
      findings: ['Possible hepatic lesion', 'Recommend further evaluation'],
      completedAt: '10:12 AM',
      processingTime: '3.2s'
    }
  ];

  const runAnalysis = () => {
    setAnalysisStatus('running');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalysisStatus('completed');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-700 border-green-200/50';
      case 'busy': return 'bg-yellow-500/20 text-yellow-700 border-yellow-200/50';
      case 'offline': return 'bg-red-500/20 text-red-700 border-red-200/50';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BeakerIcon className="w-8 h-8 text-purple-600 mr-3" />
              AI Analysis Workspace
            </h1>
            <p className="text-gray-700 mt-1">Medical AI Diagnostic Tools and Analysis Platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm text-gray-600">System Load</div>
              <div className="text-lg font-bold text-gray-900">23%</div>
            </div>
            <div className="w-2 h-8 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-600">Total Analyses</div>
              <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.totalAnalyses.toLocaleString()}</div>
              <div className="text-sm text-blue-700 font-medium">Today</div>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <ChartBarIcon className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-600">AI Accuracy</div>
              <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.accuracy.toFixed(1)}%</div>
              <div className="text-sm text-green-700 font-medium">Average</div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircleIcon className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-600">Avg Processing</div>
              <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.avgProcessingTime.toFixed(1)}s</div>
              <div className="text-sm text-purple-700 font-medium">Per study</div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <ClockIcon className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-600">Active Models</div>
              <div className="text-2xl font-bold text-gray-900">{realTimeMetrics.modelsActive}</div>
              <div className="text-sm text-orange-700 font-medium">Online</div>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <CpuChipIcon className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Models */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Available AI Models</h2>
            <div className="space-y-4">
              {aiModels.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                    selectedModel === model.id 
                      ? 'bg-blue-500/20 border-blue-200/50' 
                      : 'bg-white/50 border-white/30 hover:bg-white/70'
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{model.name}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(model.status)}`}>
                          {model.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Accuracy: {model.accuracy}%</span>
                        <span>Version: {model.version}</span>
                        <span>Modalities: {model.modalities.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-green-500/20 text-green-700 rounded-lg hover:bg-green-500/30 transition-colors">
                        <PlayIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors">
                        <CpuChipIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Controls */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Run Analysis</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <select className="flex-1 px-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-900">
                  <option>Select Study to Analyze</option>
                  <option>CT Chest - John Smith (P001234)</option>
                  <option>MRI Brain - Sarah Johnson (P001235)</option>
                  <option>X-Ray Chest - Robert Wilson (P001236)</option>
                </select>
                <button
                  onClick={runAnalysis}
                  disabled={analysisStatus === 'running'}
                  className="px-6 py-2 bg-purple-500/20 text-purple-700 rounded-xl border border-purple-200/50 hover:bg-purple-500/30 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {analysisStatus === 'running' ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>Run Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {analysisStatus === 'running' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Queue & Results */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Analysis Queue</h3>
            <div className="space-y-3">
              {pendingAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-3 bg-white/50 rounded-xl border border-white/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{analysis.patientId}</span>
                    <span className={`text-xs px-2 py-1 rounded-lg ${
                      analysis.priority === 'urgent' ? 'bg-red-500/20 text-red-700' : 'bg-blue-500/20 text-blue-700'
                    }`}>
                      {analysis.priority}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{analysis.modality} - {analysis.bodyPart}</div>
                    <div>Submitted: {analysis.submittedAt}</div>
                    <div>ETA: {analysis.estimatedCompletion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Results</h3>
            <div className="space-y-3">
              {completedAnalyses.map((result) => (
                <div key={result.id} className="p-3 bg-white/50 rounded-xl border border-white/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{result.patientId}</span>
                    <span className="text-xs text-green-700 font-medium">{result.confidence}%</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{result.modality} - {result.bodyPart}</div>
                    <div>Completed: {result.completedAt}</div>
                    <div>Processing: {result.processingTime}</div>
                  </div>
                  <div className="mt-2 text-xs">
                    {result.findings.map((finding, index) => (
                      <div key={index} className="text-gray-700">• {finding}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 