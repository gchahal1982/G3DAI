'use client';

import { useState, useEffect } from 'react';

// Simple icon components
const TrendingUp = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📈</div>;
const TrendingDown = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📉</div>;
const BarChart = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📊</div>;
const Target = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🎯</div>;
const Clock = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⏰</div>;
const Brain = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🧠</div>;
const Heart = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>❤️</div>;
const Users = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>👥</div>;
const Award = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🏆</div>;
const Activity = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📊</div>;

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

const Progress = ({ value = 0, className = '' }: { value?: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    ></div>
  </div>
);

interface MedicalMetricsProps {
  className?: string;
}

// Mock medical metrics data
const mockMedicalMetrics = {
  diagnosticAccuracy: {
    current: 96.8,
    target: 95.0,
    trend: 'up',
    change: '+2.3%',
    timeframe: 'vs last month'
  },
  averageReadTime: {
    current: 8.5,
    target: 12.0,
    trend: 'down',
    change: '-1.2 min',
    timeframe: 'vs last month',
    unit: 'minutes'
  },
  aiAgreementRate: {
    current: 94.2,
    target: 90.0,
    trend: 'up',
    change: '+3.1%',
    timeframe: 'vs last month'
  },
  peerReviewScore: {
    current: 4.8,
    target: 4.5,
    trend: 'up',
    change: '+0.2',
    timeframe: 'vs last month',
    max: 5.0
  },
  patientSatisfaction: {
    current: 4.9,
    target: 4.6,
    trend: 'up',
    change: '+0.1',
    timeframe: 'vs last month',
    max: 5.0
  },
  complianceScore: {
    current: 100,
    target: 98.0,
    trend: 'stable',
    change: '0%',
    timeframe: 'vs last month'
  },
  weeklyStats: {
    casesCompleted: 142,
    emergencyCases: 18,
    aiAssisted: 134,
    collaborativeReviews: 23,
    qualityFlags: 2,
    averageConfidence: 92.4
  },
  performanceTrends: {
    diagnosticAccuracy: [94.2, 95.1, 95.8, 96.2, 96.8],
    readTime: [10.2, 9.8, 9.1, 8.7, 8.5],
    aiAgreement: [89.1, 90.5, 92.1, 93.4, 94.2],
    satisfaction: [4.6, 4.7, 4.7, 4.8, 4.9]
  },
  benchmarks: {
    industryAverage: {
      diagnosticAccuracy: 93.5,
      readTime: 11.2,
      aiAgreement: 87.3,
      satisfaction: 4.4
    },
    topPerformers: {
      diagnosticAccuracy: 97.8,
      readTime: 7.2,
      aiAgreement: 96.1,
      satisfaction: 4.9
    }
  }
};

export function MedicalMetrics({ className }: MedicalMetricsProps) {
  const [timeframe, setTimeframe] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('diagnosticAccuracy');
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  useEffect(() => {
    // Animate values on component mount
    const timer = setTimeout(() => {
      setAnimatedValues({
        diagnosticAccuracy: mockMedicalMetrics.diagnosticAccuracy.current,
        readTime: mockMedicalMetrics.averageReadTime.current,
        aiAgreement: mockMedicalMetrics.aiAgreementRate.current,
        peerReview: mockMedicalMetrics.peerReviewScore.current,
        satisfaction: mockMedicalMetrics.patientSatisfaction.current,
        compliance: mockMedicalMetrics.complianceScore.current
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getPerformanceColor = (current: number, target: number) => {
    if (current >= target * 1.05) return 'text-green-600';
    if (current >= target) return 'text-blue-600';
    if (current >= target * 0.9) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (current: number, target: number) => {
    if (current >= target * 1.05) return 'bg-green-500';
    if (current >= target) return 'bg-blue-500';
    if (current >= target * 0.9) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="medsight-glass border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-blue-500" />
              <span>Medical Performance Metrics</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Diagnostic Accuracy */}
            <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Diagnostic Accuracy
                  </span>
                </div>
                {getTrendIcon(mockMedicalMetrics.diagnosticAccuracy.trend)}
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                  {animatedValues.diagnosticAccuracy?.toFixed(1) || 0}%
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    Target: {mockMedicalMetrics.diagnosticAccuracy.target}%
                  </Badge>
                  <span className={`text-sm font-medium ${getTrendColor(mockMedicalMetrics.diagnosticAccuracy.trend)}`}>
                    {mockMedicalMetrics.diagnosticAccuracy.change}
                  </span>
                </div>
                <Progress 
                  value={(animatedValues.diagnosticAccuracy || 0) / 100 * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Average Read Time */}
            <div className="p-6 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Average Read Time
                  </span>
                </div>
                {getTrendIcon(mockMedicalMetrics.averageReadTime.trend)}
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-800 dark:text-green-200">
                  {animatedValues.readTime?.toFixed(1) || 0}m
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    Target: {mockMedicalMetrics.averageReadTime.target}m
                  </Badge>
                  <span className={`text-sm font-medium ${getTrendColor(mockMedicalMetrics.averageReadTime.trend)}`}>
                    {mockMedicalMetrics.averageReadTime.change}
                  </span>
                </div>
                <Progress 
                  value={100 - ((animatedValues.readTime || 0) / mockMedicalMetrics.averageReadTime.target * 100)} 
                  className="h-2"
                />
              </div>
            </div>

            {/* AI Agreement Rate */}
            <div className="p-6 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    AI Agreement Rate
                  </span>
                </div>
                {getTrendIcon(mockMedicalMetrics.aiAgreementRate.trend)}
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                  {animatedValues.aiAgreement?.toFixed(1) || 0}%
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                    Target: {mockMedicalMetrics.aiAgreementRate.target}%
                  </Badge>
                  <span className={`text-sm font-medium ${getTrendColor(mockMedicalMetrics.aiAgreementRate.trend)}`}>
                    {mockMedicalMetrics.aiAgreementRate.change}
                  </span>
                </div>
                <Progress 
                  value={(animatedValues.aiAgreement || 0) / 100 * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Peer Review Score */}
            <div className="p-6 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Peer Review Score
                  </span>
                </div>
                {getTrendIcon(mockMedicalMetrics.peerReviewScore.trend)}
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-amber-800 dark:text-amber-200">
                  {animatedValues.peerReview?.toFixed(1) || 0}/5.0
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                    Target: {mockMedicalMetrics.peerReviewScore.target}/5.0
                  </Badge>
                  <span className={`text-sm font-medium ${getTrendColor(mockMedicalMetrics.peerReviewScore.trend)}`}>
                    {mockMedicalMetrics.peerReviewScore.change}
                  </span>
                </div>
                <Progress 
                  value={(animatedValues.peerReview || 0) / 5 * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Patient Satisfaction */}
            <div className="p-6 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    Patient Satisfaction
                  </span>
                </div>
                {getTrendIcon(mockMedicalMetrics.patientSatisfaction.trend)}
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-red-800 dark:text-red-200">
                  {animatedValues.satisfaction?.toFixed(1) || 0}/5.0
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                    Target: {mockMedicalMetrics.patientSatisfaction.target}/5.0
                  </Badge>
                  <span className={`text-sm font-medium ${getTrendColor(mockMedicalMetrics.patientSatisfaction.trend)}`}>
                    {mockMedicalMetrics.patientSatisfaction.change}
                  </span>
                </div>
                <Progress 
                  value={(animatedValues.satisfaction || 0) / 5 * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Compliance Score */}
            <div className="p-6 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    Compliance Score
                  </span>
                </div>
                {getTrendIcon(mockMedicalMetrics.complianceScore.trend)}
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-indigo-800 dark:text-indigo-200">
                  {animatedValues.compliance?.toFixed(0) || 0}%
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                    Target: {mockMedicalMetrics.complianceScore.target}%
                  </Badge>
                  <span className={`text-sm font-medium ${getTrendColor(mockMedicalMetrics.complianceScore.trend)}`}>
                    {mockMedicalMetrics.complianceScore.change}
                  </span>
                </div>
                <Progress 
                  value={animatedValues.compliance || 0} 
                  className="h-2"
                />
              </div>
            </div>
          </div>

          {/* Weekly Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="medsight-glass border-0">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Cases Completed</span>
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {mockMedicalMetrics.weeklyStats.casesCompleted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Emergency Cases</span>
                    <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {mockMedicalMetrics.weeklyStats.emergencyCases}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">AI Assisted</span>
                    <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {mockMedicalMetrics.weeklyStats.aiAssisted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Collaborative Reviews</span>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {mockMedicalMetrics.weeklyStats.collaborativeReviews}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Quality Flags</span>
                    <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                      {mockMedicalMetrics.weeklyStats.qualityFlags}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Average AI Confidence</span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {mockMedicalMetrics.weeklyStats.averageConfidence}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medsight-glass border-0">
              <CardHeader>
                <CardTitle className="text-lg">Performance Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">vs Industry Average</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Diagnostic Accuracy</span>
                        <span className="text-green-600">+3.3% above</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Read Time</span>
                        <span className="text-green-600">2.7m faster</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>AI Agreement</span>
                        <span className="text-green-600">+6.9% above</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">vs Top Performers</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Diagnostic Accuracy</span>
                        <span className="text-amber-600">-1.0% below</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Read Time</span>
                        <span className="text-amber-600">1.3m slower</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>AI Agreement</span>
                        <span className="text-amber-600">-1.9% below</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 