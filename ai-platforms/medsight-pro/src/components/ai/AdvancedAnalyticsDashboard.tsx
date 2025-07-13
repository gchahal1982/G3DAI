'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/../../shared/components/ui/ScrollArea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Heart, 
  Brain, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Database,
  LineChart,
  PieChart,
  BarChart,
  Settings,
  Search,
  Eye,
  FileText,
  Microscope,
  Stethoscope,
  Pill,
  Activity as Pulse
} from 'lucide-react';
import { AIAnalysisIntegration } from '@/lib/ai/ai-analysis-integration';
// import { toast } from 'sonner'; // TODO: Install sonner package or replace with alternative

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: 'clinical' | 'operational' | 'financial' | 'quality' | 'ai';
  timestamp: Date;
}

interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  date?: Date;
}

interface MedicalInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: Date;
  actionable: boolean;
  relatedMetrics: string[];
}

interface Dashboard {
  id: string;
  name: string;
  widgets: Widget[];
  filters: FilterConfig;
  refreshInterval: number;
  lastUpdated: Date;
}

interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'heatmap' | 'gauge' | 'timeline';
  title: string;
  data: any;
  config: any;
  position: { x: number; y: number; w: number; h: number };
}

interface FilterConfig {
  dateRange: { start: Date; end: Date };
  departments: string[];
  categories: string[];
  severity: string[];
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [insights, setInsights] = useState<MedicalInsight[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisIntegration | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [alertsCount, setAlertsCount] = useState(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        const ai = new AIAnalysisIntegration();
        // await ai.initialize(); // TODO: Add initialize method to AIAnalysisIntegration
        setAIAnalysis(ai);
        await loadDashboards();
        await refreshAnalytics();
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
        console.error('Failed to initialize analytics dashboard');
      }
    };

    initializeAnalytics();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(refreshAnalytics, 30000);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const loadDashboards = async () => {
    // Load predefined dashboards
    const defaultDashboards: Dashboard[] = [
      {
        id: 'clinical-overview',
        name: 'Clinical Overview',
        widgets: [],
        filters: {
          dateRange: { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date() },
          departments: ['all'],
          categories: ['all'],
          severity: ['all']
        },
        refreshInterval: 30000,
        lastUpdated: new Date()
      },
      {
        id: 'ai-performance',
        name: 'AI Performance',
        widgets: [],
        filters: {
          dateRange: { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date() },
          departments: ['all'],
          categories: ['ai'],
          severity: ['all']
        },
        refreshInterval: 30000,
        lastUpdated: new Date()
      },
      {
        id: 'quality-metrics',
        name: 'Quality Metrics',
        widgets: [],
        filters: {
          dateRange: { start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date() },
          departments: ['all'],
          categories: ['quality'],
          severity: ['all']
        },
        refreshInterval: 30000,
        lastUpdated: new Date()
      }
    ];

    setDashboards(defaultDashboards);
    setActiveDashboard(defaultDashboards[0]);
  };

  const refreshAnalytics = async () => {
    if (!aiAnalysis) return;

    setIsLoading(true);
    try {
      // Generate sample analytics data
      const sampleMetrics: AnalyticsMetric[] = [
        {
          id: 'patient-satisfaction',
          name: 'Patient Satisfaction',
          value: 4.8,
          unit: '/5',
          trend: 'up',
          change: 0.2,
          category: 'quality',
          timestamp: new Date()
        },
        {
          id: 'ai-accuracy',
          name: 'AI Diagnostic Accuracy',
          value: 94.2,
          unit: '%',
          trend: 'up',
          change: 2.1,
          category: 'ai',
          timestamp: new Date()
        },
        {
          id: 'response-time',
          name: 'Average Response Time',
          value: 1.2,
          unit: 'min',
          trend: 'down',
          change: -0.3,
          category: 'operational',
          timestamp: new Date()
        },
        {
          id: 'cost-per-case',
          name: 'Cost per Case',
          value: 285,
          unit: '$',
          trend: 'down',
          change: -15,
          category: 'financial',
          timestamp: new Date()
        }
      ];

      const sampleInsights: MedicalInsight[] = [
        {
          id: 'pattern-1',
          type: 'pattern',
          title: 'Increased Cardiac Cases',
          description: 'AI has detected a 15% increase in cardiac-related cases this week',
          confidence: 0.87,
          severity: 'medium',
          category: 'clinical',
          timestamp: new Date(),
          actionable: true,
          relatedMetrics: ['patient-satisfaction']
        },
        {
          id: 'anomaly-1',
          type: 'anomaly',
          title: 'Unusual Imaging Pattern',
          description: 'Anomalous pattern detected in chest X-ray interpretations',
          confidence: 0.92,
          severity: 'high',
          category: 'ai',
          timestamp: new Date(),
          actionable: true,
          relatedMetrics: ['ai-accuracy']
        }
      ];

      setMetrics(sampleMetrics);
      setInsights(sampleInsights);
      setAlertsCount(sampleInsights.filter(i => i.severity === 'high' || i.severity === 'critical').length);

      // Generate real-time data
      const realtimeData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        patients: Math.floor(Math.random() * 50) + 20,
        aiAnalyses: Math.floor(Math.random() * 30) + 10,
        alerts: Math.floor(Math.random() * 5)
      }));

      setRealTimeData(realtimeData);
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      console.error('Failed to refresh analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const exportData = {
        metrics,
        insights,
        dashboards,
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('Analytics data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      console.error('Failed to export analytics data');
    }
  };

  const MetricCard = ({ metric }: { metric: AnalyticsMetric }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{metric.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{metric.value.toLocaleString()}</span>
            <span className="text-sm text-gray-500">{metric.unit}</span>
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            metric.trend === 'up' ? 'text-green-600' : 
            metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
            <span>{Math.abs(metric.change)}</span>
          </div>
        </div>
        <Badge variant="outline" className="mt-2 text-xs">
          {metric.category}
        </Badge>
      </CardContent>
    </Card>
  );

  const InsightCard = ({ insight }: { insight: MedicalInsight }) => (
    <Card className={`border-l-4 ${
      insight.severity === 'critical' ? 'border-red-500' :
      insight.severity === 'high' ? 'border-orange-500' :
      insight.severity === 'medium' ? 'border-yellow-500' : 'border-green-500'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {insight.confidence * 100}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {insight.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {insight.category}
            </Badge>
          </div>
          {insight.actionable && (
            <Button size="sm" variant="outline">
              Take Action
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const SimpleChart = ({ data, title }: { data: ChartDataPoint[]; title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2">
          {data.map((point, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${(point.value / Math.max(...data.map(d => d.value))) * 200}px` }}
              />
              <span className="text-xs mt-2 text-gray-600">{point.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart 
          data={realTimeData.map(d => ({ label: `${d.hour}:00`, value: d.patients }))}
          title="Patient Volume (24h)"
        />
        <SimpleChart 
          data={realTimeData.map(d => ({ label: `${d.hour}:00`, value: d.aiAnalyses }))}
          title="AI Analyses (24h)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Health</span>
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Models</span>
                <Badge variant="outline" className="text-blue-600">
                  4 Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Alerts</span>
                <Badge variant="outline" className="text-red-600">
                  {alertsCount}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Freshness</span>
                <Badge variant="outline" className="text-green-600">
                  Real-time
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const DetailedAnalysisTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clinical Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.filter(m => m.category === 'clinical').map((metric) => (
                <div key={metric.id} className="flex items-center justify-between">
                  <span className="text-sm">{metric.name}</span>
                  <span className="font-medium">{metric.value}{metric.unit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.filter(m => m.category === 'ai').map((metric) => (
                <div key={metric.id} className="flex items-center justify-between">
                  <span className="text-sm">{metric.name}</span>
                  <span className="font-medium">{metric.value}{metric.unit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quality Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.filter(m => m.category === 'quality').map((metric) => (
                <div key={metric.id} className="flex items-center justify-between">
                  <span className="text-sm">{metric.name}</span>
                  <span className="font-medium">{metric.value}{metric.unit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Auto Refresh</span>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Time Range</span>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="6h">6 Hours</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Department</span>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="radiology">Radiology</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={refreshAnalytics} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button onClick={exportData} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full backdrop-blur-sm bg-white/90 border border-white/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Advanced Analytics</h1>
                <p className="text-gray-600">Medical Data Visualization & AI Insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {isLoading ? 'Loading...' : 'Live'}
              </Badge>
              {alertsCount > 0 && (
                <Badge variant="destructive">
                  {alertsCount} Alerts
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="h-full p-4">
              <ScrollArea className="h-full">
                <OverviewTab />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analysis" className="h-full p-4">
              <ScrollArea className="h-full">
                <DetailedAnalysisTab />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="h-full p-4">
              <ScrollArea className="h-full">
                <SettingsTab />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard; 