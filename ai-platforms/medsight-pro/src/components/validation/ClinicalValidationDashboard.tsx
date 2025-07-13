'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BeakerIcon,
  CheckBadgeIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  CogIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import {
  ClinicalStudiesManager,
  type ClinicalStudy
} from '@/lib/validation/clinical-studies';
import {
  AIValidationManager
} from '@/lib/validation/ai-validation';
import {
  UserStudiesManager,
  type UserStudy,
  type StudyResult
} from '@/lib/validation/user-studies';

// Define missing types
interface AIValidationMetrics {
  accuracy: number;
  sensitivity: number;
  specificity: number;
  performance: number;
  safety: number;
  bias: number;
  total: number;
}

interface AIModelValidation {
  modelId: string;
  status: string;
  metrics: AIValidationMetrics;
  lastUpdate: Date;
  issues: string[];
  recommendations: string[];
}

export default function ClinicalValidationDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'ai' | 'user' | 'compliance'>('overview');
  const [clinicalStudies, setClinicalStudies] = useState<ClinicalStudy[]>([]);
  const [aiValidations, setAiValidations] = useState<AIModelValidation[]>([]);
  const [userStudies, setUserStudies] = useState<UserStudy[]>([]);
  const [loading, setLoading] = useState(true);

  const clinicalStudiesManager = new ClinicalStudiesManager();
  const aiModelValidator = new AIValidationManager();
  const userStudiesManager = new UserStudiesManager();

  useEffect(() => {
    loadValidationData();
  }, []);

  const loadValidationData = async () => {
    try {
      setLoading(true);
      
      // Initialize managers
      await clinicalStudiesManager.initialize();
      await aiModelValidator.initialize();
      await userStudiesManager.initialize();

      // Load data (mock data for now)
      setClinicalStudies([]);
      setAiValidations([]);
      setUserStudies([]);
      
    } catch (error) {
      console.error('Failed to load validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverviewMetrics = () => {
    const totalStudies = clinicalStudies.length + userStudies.length;
    const completedStudies = clinicalStudies.filter(s => s.status === 'completed').length + 
                           userStudies.filter(s => s.status === 'completed').length;
    const activeStudies = clinicalStudies.filter(s => s.status === 'active').length +
                         userStudies.filter(s => s.status === 'active').length;
    const aiModelsValidated = aiValidations.length;
    const complianceScore = calculateOverallComplianceScore();

    return {
      totalStudies,
      completedStudies,
      activeStudies,
      aiModelsValidated,
      complianceScore,
      validationProgress: totalStudies > 0 ? (completedStudies / totalStudies) * 100 : 0
    };
  };

  const calculateOverallComplianceScore = (): number => {
    // Calculate based on study completion, AI validation, and regulatory compliance
    const clinicalScore = clinicalStudies.length > 0 ? 
      (clinicalStudies.filter(s => s.status === 'completed').length / clinicalStudies.length) * 100 : 0;
    const userScore = userStudies.length > 0 ?
      (userStudies.filter(s => s.status === 'completed').length / userStudies.length) * 100 : 0;
    const aiScore = aiValidations.length > 0 ?
      aiValidations.reduce((acc, val) => acc + val.metrics.total, 0) / aiValidations.length : 0;

    return Math.round((clinicalScore + userScore + aiScore) / 3);
  };

  const metrics = getOverviewMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medsight-dark via-slate-900 to-slate-800 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-medsight-accent">Loading validation data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medsight-dark via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Clinical Validation Dashboard</h1>
          <p className="text-medsight-primary/70">
            Comprehensive validation framework for medical AI systems
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'clinical', label: 'Clinical Studies', icon: BeakerIcon },
            { id: 'ai', label: 'AI Validation', icon: CogIcon },
            { id: 'user', label: 'User Studies', icon: UserGroupIcon },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-medsight-accent text-white'
                  : 'bg-slate-800 text-medsight-primary/70 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Total Studies</h3>
                  <DocumentCheckIcon className="h-8 w-8 text-medsight-accent" />
                </div>
                <div className="text-3xl font-bold text-medsight-accent mb-2">{metrics.totalStudies}</div>
                <div className="text-sm text-medsight-primary/70">
                  {metrics.activeStudies} active, {metrics.completedStudies} completed
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">AI Models Validated</h3>
                  <CheckBadgeIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">{metrics.aiModelsValidated}</div>
                <div className="text-sm text-medsight-primary/70">Across all validation phases</div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Compliance Score</h3>
                  <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{metrics.complianceScore}%</div>
                <div className="text-sm text-medsight-primary/70">Overall regulatory compliance</div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Validation Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-medsight-primary/70">Overall Progress</span>
                    <span className="text-white">{metrics.validationProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-medsight-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${metrics.validationProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clinical Studies Tab */}
        {activeTab === 'clinical' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Clinical Studies</h3>
              {clinicalStudies.length === 0 ? (
                <div className="text-center py-8">
                  <BeakerIcon className="h-16 w-16 text-medsight-primary/30 mx-auto mb-4" />
                  <p className="text-medsight-primary/70">No clinical studies found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clinicalStudies.map((study) => (
                    <div key={study.id} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-medsight-primary">{study.title}</div>
                          <div className="text-sm text-medsight-primary/70 mt-1">{study.description}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          study.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          study.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          study.status === 'recruiting' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {study.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Study Type</div>
                          <div className="text-sm text-white">{study.type}</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Phase</div>
                          <div className="text-sm text-white">{study.phase}</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Sample Size</div>
                          <div className="text-sm text-white">{study.population.sampleSize} participants</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Detailed Clinical Study View */}
        {activeTab === 'clinical' && clinicalStudies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
          >
            {clinicalStudies.slice(0, 4).map((study) => (
              <div key={study.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-medsight-primary">{study.title}</h4>
                    <p className="text-sm text-medsight-primary/70 mt-1">{study.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    study.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    study.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {study.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-medsight-primary/50 uppercase block">Sample Size</span>
                    <span className="text-sm text-white">
                      {study.population.sampleSize} participants
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-xs text-medsight-primary/50 uppercase block">Timeline</span>
                    <span className="text-sm text-white">
                      {study.timeline.endDate.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-xs text-medsight-primary/50 uppercase block">Study Design</span>
                    <p className="text-sm text-medsight-primary/70">{study.design.studyType}</p>
                    <span className="text-xs text-medsight-primary/50">
                      {study.design.blinding !== 'open_label' ? 'Blinded' : 'Open-label'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-xs text-medsight-primary/50 uppercase block">Primary Objective</span>
                    <p className="text-sm text-medsight-primary/70">{study.objectives[0]?.objective || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-medsight-primary/50 uppercase block">Principal Investigator</span>
                    <p className="text-sm text-medsight-primary/70">{study.investigators[0]?.name || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* AI Validation Tab */}
        {activeTab === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">AI Model Validation</h3>
              {aiValidations.length === 0 ? (
                <div className="text-center py-8">
                  <CogIcon className="h-16 w-16 text-medsight-primary/30 mx-auto mb-4" />
                  <p className="text-medsight-primary/70">No AI validations found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiValidations.map((validation) => (
                    <div key={validation.modelId} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-medsight-primary">Model {validation.modelId}</div>
                          <div className="text-sm text-medsight-primary/70">
                            Last updated: {validation.lastUpdate.toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          validation.status === 'validated' ? 'bg-green-500/20 text-green-400' :
                          validation.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {validation.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Accuracy</div>
                          <div className="text-sm text-white">{validation.metrics.accuracy}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Sensitivity</div>
                          <div className="text-sm text-white">{validation.metrics.sensitivity}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Specificity</div>
                          <div className="text-sm text-white">{validation.metrics.specificity}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Performance</div>
                          <div className="text-sm text-white">{validation.metrics.performance}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Safety</div>
                          <div className="text-sm text-white">{validation.metrics.safety}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Bias Score</div>
                          <div className="text-sm text-white">{validation.metrics.bias}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* User Studies Tab */}
        {activeTab === 'user' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">User Studies</h3>
              {userStudies.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-16 w-16 text-medsight-primary/30 mx-auto mb-4" />
                  <p className="text-medsight-primary/70">No user studies found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userStudies.map((study) => (
                    <div key={study.id} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-medsight-primary">{study.title}</div>
                          <p className="text-sm text-medsight-primary/70 mt-1">{study.objectives[0]?.objective || 'No objective available'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          study.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          study.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {study.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Study Type</div>
                          <div className="text-sm text-white">{study.type}</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Participants</div>
                          <div className="text-sm text-white">{study.participants.length}</div>
                        </div>
                        <div>
                          <div className="text-xs text-medsight-primary/50 uppercase">Phase</div>
                          <div className="text-sm text-white">{study.phase}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Regulatory Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheckIcon className="h-6 w-6 text-green-400" />
                    <div>
                      <h4 className="font-medium text-white">FDA Compliance</h4>
                      <p className="text-sm text-medsight-primary/70">Medical Device Regulation</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-400">98%</div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
                    <div>
                      <h4 className="font-medium text-white">HIPAA Compliance</h4>
                      <p className="text-sm text-medsight-primary/70">Privacy & Security</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">100%</div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheckIcon className="h-6 w-6 text-yellow-400" />
                    <div>
                      <h4 className="font-medium text-white">ISO 13485</h4>
                      <p className="text-sm text-medsight-primary/70">Quality Management</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">95%</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 