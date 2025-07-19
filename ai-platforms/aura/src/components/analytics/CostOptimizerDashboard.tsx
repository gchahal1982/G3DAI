/**
 * CostOptimizerDashboard.tsx
 * 
 * Smart-Router+ Analytics - Advanced cost optimization dashboard for Aura.
 * Premium paid add-on with comprehensive cost analysis and optimization recommendations.
 * 
 * Features:
 * - Cost optimization dashboard UI with real-time insights
 * - Model cost comparison charts across vendors
 * - Cache hit rate analytics with performance correlation
 * - Vendor SLA monitoring with uptime tracking
 * - Cost projection tools with ML-based forecasting
 * - Budget alert configuration with smart thresholds
 * - Optimization recommendations with automated suggestions
 * - ROI tracking metrics with business impact analysis
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  LinearProgress,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Speed,
  CloudQueue,
  Storage,
  Timeline,
  Lightbulb,
  Settings,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  ExpandMore,
  Savings,
  CompareArrows,
  Analytics,
  MonetizationOn,
  Schedule,
  Assessment,
  Autorenew,
  NotificationsActive
} from '@mui/icons-material';

// Types and Interfaces
interface CostOptimizationData {
  totalCost: number;
  monthlyCost: number;
  projectedCost: number;
  savings: {
    potential: number;
    realized: number;
    percentage: number;
  };
  efficiency: {
    score: number;
    trend: number;
    recommendations: number;
  };
}

interface ModelCostComparison {
  modelId: string;
  name: string;
  vendor: 'local' | 'openai' | 'anthropic' | 'google' | 'deepseek' | 'kimi';
  inputCost: number; // per 1M tokens
  outputCost: number; // per 1M tokens
  averageLatency: number;
  usage: {
    requests: number;
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
  efficiency: number; // cost per successful completion
  recommendations: string[];
}

interface CacheAnalytics {
  hitRate: number;
  missRate: number;
  costSavings: number;
  performanceGain: number;
  cacheSize: number;
  evictionRate: number;
  breakdown: {
    context: { hitRate: number; savings: number };
    models: { hitRate: number; savings: number };
    responses: { hitRate: number; savings: number };
  };
}

interface VendorSLA {
  vendor: string;
  displayName: string;
  uptime: number;
  targetUptime: number;
  averageLatency: number;
  targetLatency: number;
  errorRate: number;
  targetErrorRate: number;
  availability: 'healthy' | 'degraded' | 'outage';
  incidents: VendorIncident[];
  costsImpact: number;
}

interface VendorIncident {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  startTime: number;
  endTime?: number;
  description: string;
  impact: string;
  costImpact: number;
}

interface CostProjection {
  timeframe: '7d' | '30d' | '90d' | '365d';
  baseline: number;
  projected: number;
  confidence: number;
  factors: {
    usage_growth: number;
    seasonal_adjustment: number;
    efficiency_gains: number;
    vendor_pricing_changes: number;
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

interface BudgetAlert {
  id: string;
  name: string;
  type: 'absolute' | 'percentage' | 'trend';
  threshold: number;
  currentValue: number;
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  recipients: string[];
  lastTriggered?: number;
}

interface OptimizationRecommendation {
  id: string;
  type: 'model_switch' | 'cache_optimization' | 'routing_improvement' | 'scheduling' | 'vendor_negotiation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedSavings: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timeToValue: number; // days
  impact: {
    cost: number;
    performance: number;
    reliability: number;
  };
  actionItems: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

interface ROIMetrics {
  totalInvestment: number;
  totalSavings: number;
  roi: number;
  paybackPeriod: number; // months
  netPresentValue: number;
  breakdown: {
    infrastructure: { investment: number; savings: number; roi: number };
    optimization: { investment: number; savings: number; roi: number };
    automation: { investment: number; savings: number; roi: number };
  };
  timeline: Array<{
    month: number;
    cumulativeInvestment: number;
    cumulativeSavings: number;
    netBenefit: number;
  }>;
}

// Chart Components
const CostTrendChart: React.FC<{ data: Array<{ timestamp: number; cost: number; projected?: boolean }> }> = ({ data }) => {
  const maxCost = Math.max(...data.map(d => d.cost));
  const minCost = Math.min(...data.map(d => d.cost));
  const range = maxCost - minCost;

  return (
    <Box sx={{ height: 200, position: 'relative' }}>
      <svg width="100%" height="150" style={{ border: '1px solid #e0e0e0' }}>
        {data.map((point, index) => {
          if (index === 0) return null;
          
          const x = (index / (data.length - 1)) * 100;
          const y = ((maxCost - point.cost) / range) * 130 + 10;
          const prevPoint = data[index - 1];
          const prevX = ((index - 1) / (data.length - 1)) * 100;
          const prevY = ((maxCost - prevPoint.cost) / range) * 130 + 10;
          
          return (
            <line
              key={index}
              x1={`${prevX}%`}
              y1={prevY}
              x2={`${x}%`}
              y2={y}
              stroke={point.projected ? '#ff9800' : '#1976d2'}
              strokeWidth="2"
              strokeDasharray={point.projected ? '5,5' : ''}
            />
          );
        })}
        
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = ((maxCost - point.cost) / range) * 130 + 10;
          
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={y}
              r="3"
              fill={point.projected ? '#ff9800' : '#1976d2'}
            />
          );
        })}
      </svg>
    </Box>
  );
};

const ModelCostComparisonChart: React.FC<{ models: ModelCostComparison[] }> = ({ models }) => {
  const maxCost = Math.max(...models.map(m => m.usage.totalCost));

  return (
    <Box sx={{ height: 300 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {models.map((model, index) => (
          <Box key={model.modelId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ minWidth: 150 }}>
              <Typography variant="subtitle2">{model.name}</Typography>
              <Typography variant="caption" color="textSecondary">{model.vendor}</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={(model.usage.totalCost / maxCost) * 100}
                sx={{ height: 20, borderRadius: 10 }}
                color={model.vendor === 'local' ? 'success' : 'primary'}
              />
            </Box>
            <Box sx={{ minWidth: 80, textAlign: 'right' }}>
              <Typography variant="subtitle2">${model.usage.totalCost.toFixed(2)}</Typography>
              <Typography variant="caption" color="textSecondary">
                {model.usage.requests.toLocaleString()} req
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const CacheHitRateChart: React.FC<{ analytics: CacheAnalytics }> = ({ analytics }) => {
  const data = [
    { label: 'Context Cache', hitRate: analytics.breakdown.context.hitRate, savings: analytics.breakdown.context.savings },
    { label: 'Model Cache', hitRate: analytics.breakdown.models.hitRate, savings: analytics.breakdown.models.savings },
    { label: 'Response Cache', hitRate: analytics.breakdown.responses.hitRate, savings: analytics.breakdown.responses.savings }
  ];

  return (
    <Box sx={{ height: 200 }}>
      {data.map((item, index) => (
        <Box key={item.label} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">{item.label}</Typography>
            <Typography variant="body2" fontWeight="medium">
              {item.hitRate.toFixed(1)}% (${item.savings.toFixed(2)} saved)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={item.hitRate}
            sx={{ height: 8, borderRadius: 4 }}
            color={item.hitRate > 80 ? 'success' : item.hitRate > 60 ? 'warning' : 'error'}
          />
        </Box>
      ))}
    </Box>
  );
};

// Main Component
export const CostOptimizerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedVendors, setSelectedVendors] = useState<string[]>(['all']);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);

  // Mock data
  const [optimizationData, setOptimizationData] = useState<CostOptimizationData>({
    totalCost: 2856.75,
    monthlyCost: 2856.75,
    projectedCost: 3200.50,
    savings: {
      potential: 890.25,
      realized: 456.80,
      percentage: 16.0
    },
    efficiency: {
      score: 78,
      trend: 12,
      recommendations: 5
    }
  });

  const [modelComparisons, setModelComparisons] = useState<ModelCostComparison[]>([
    {
      modelId: 'qwen3-14b',
      name: 'Qwen3-Coder 14B',
      vendor: 'local',
      inputCost: 0,
      outputCost: 0,
      averageLatency: 45,
      usage: {
        requests: 15420,
        inputTokens: 2340000,
        outputTokens: 890000,
        totalCost: 0
      },
      efficiency: 0.0,
      recommendations: ['Primary local model - no cost optimization needed']
    },
    {
      modelId: 'gpt-4',
      name: 'GPT-4',
      vendor: 'openai',
      inputCost: 30.0,
      outputCost: 60.0,
      averageLatency: 1200,
      usage: {
        requests: 2300,
        inputTokens: 890000,
        outputTokens: 450000,
        totalCost: 1567.50
      },
      efficiency: 0.68,
      recommendations: ['Consider switching to GPT-4 Turbo for 50% cost reduction', 'Reduce context length by 20%']
    },
    {
      modelId: 'claude-3',
      name: 'Claude 3 Opus',
      vendor: 'anthropic',
      inputCost: 15.0,
      outputCost: 75.0,
      averageLatency: 980,
      usage: {
        requests: 1800,
        inputTokens: 720000,
        outputTokens: 380000,
        totalCost: 1389.25
      },
      efficiency: 0.77,
      recommendations: ['Switch to Claude 3 Sonnet for 60% cost reduction', 'Implement response caching']
    },
    {
      modelId: 'deepseek-r1',
      name: 'DeepSeek R1',
      vendor: 'deepseek',
      inputCost: 2.0,
      outputCost: 8.0,
      averageLatency: 2200,
      usage: {
        requests: 890,
        inputTokens: 450000,
        outputTokens: 220000,
        totalCost: 89.60
      },
      efficiency: 0.10,
      recommendations: ['Excellent cost efficiency', 'Increase usage for complex reasoning tasks']
    }
  ]);

  const [cacheAnalytics, setCacheAnalytics] = useState<CacheAnalytics>({
    hitRate: 73.5,
    missRate: 26.5,
    costSavings: 456.80,
    performanceGain: 65.2,
    cacheSize: 2.4,
    evictionRate: 5.8,
    breakdown: {
      context: { hitRate: 82.3, savings: 245.50 },
      models: { hitRate: 68.9, savings: 156.30 },
      responses: { hitRate: 69.4, savings: 55.00 }
    }
  });

  const [vendorSLAs, setVendorSLAs] = useState<VendorSLA[]>([
    {
      vendor: 'openai',
      displayName: 'OpenAI',
      uptime: 99.85,
      targetUptime: 99.9,
      averageLatency: 1200,
      targetLatency: 1000,
      errorRate: 0.12,
      targetErrorRate: 0.1,
      availability: 'healthy',
      incidents: [],
      costsImpact: 0
    },
    {
      vendor: 'anthropic',
      displayName: 'Anthropic',
      uptime: 99.92,
      targetUptime: 99.9,
      averageLatency: 980,
      targetLatency: 1000,
      errorRate: 0.08,
      targetErrorRate: 0.1,
      availability: 'healthy',
      incidents: [],
      costsImpact: 0
    },
    {
      vendor: 'deepseek',
      displayName: 'DeepSeek',
      uptime: 99.78,
      targetUptime: 99.5,
      averageLatency: 2200,
      targetLatency: 2000,
      errorRate: 0.15,
      targetErrorRate: 0.2,
      availability: 'degraded',
      incidents: [
        {
          id: 'inc_1',
          severity: 'medium',
          startTime: Date.now() - 3600000,
          endTime: Date.now() - 1800000,
          description: 'Increased latency due to high load',
          impact: 'Response times increased by 40%',
          costImpact: 45.30
        }
      ],
      costsImpact: 45.30
    }
  ]);

  const [costProjections, setCostProjections] = useState<CostProjection[]>([
    {
      timeframe: '30d',
      baseline: 2856.75,
      projected: 3200.50,
      confidence: 85.2,
      factors: {
        usage_growth: 15.5,
        seasonal_adjustment: -2.3,
        efficiency_gains: -8.1,
        vendor_pricing_changes: 3.2
      },
      scenarios: {
        optimistic: 2890.25,
        realistic: 3200.50,
        pessimistic: 3650.80
      }
    }
  ]);

  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([
    {
      id: 'alert_1',
      name: 'Monthly Budget Threshold',
      type: 'absolute',
      threshold: 3000,
      currentValue: 2856.75,
      severity: 'warning',
      enabled: true,
      recipients: ['admin@aura.ai'],
      lastTriggered: Date.now() - 86400000
    },
    {
      id: 'alert_2',
      name: 'Weekly Growth Rate',
      type: 'percentage',
      threshold: 20,
      currentValue: 15.5,
      severity: 'info',
      enabled: true,
      recipients: ['finance@aura.ai'],
    }
  ]);

  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([
    {
      id: 'rec_1',
      type: 'model_switch',
      priority: 'high',
      title: 'Switch to More Cost-Effective Models',
      description: 'Replace GPT-4 with GPT-4 Turbo for 50% cost reduction with similar performance',
      estimatedSavings: 783.75,
      implementationEffort: 'low',
      timeToValue: 1,
      impact: {
        cost: 90,
        performance: -5,
        reliability: 0
      },
      actionItems: [
        'Update model routing configuration',
        'Test performance with GPT-4 Turbo',
        'Gradually migrate traffic over 3 days'
      ],
      status: 'pending'
    },
    {
      id: 'rec_2',
      type: 'cache_optimization',
      priority: 'medium',
      title: 'Optimize Response Caching',
      description: 'Improve response cache hit rate from 69% to 85% by implementing semantic similarity matching',
      estimatedSavings: 234.50,
      implementationEffort: 'medium',
      timeToValue: 7,
      impact: {
        cost: 65,
        performance: 25,
        reliability: 10
      },
      actionItems: [
        'Implement semantic cache key generation',
        'Increase cache size allocation',
        'Add cache warming for popular queries'
      ],
      status: 'pending'
    },
    {
      id: 'rec_3',
      type: 'routing_improvement',
      priority: 'high',
      title: 'Implement Smart Request Routing',
      description: 'Route simple requests to local models and complex requests to cloud models based on complexity analysis',
      estimatedSavings: 445.80,
      implementationEffort: 'high',
      timeToValue: 14,
      impact: {
        cost: 85,
        performance: 15,
        reliability: 5
      },
      actionItems: [
        'Develop request complexity analyzer',
        'Create routing decision engine',
        'Implement gradual rollout system'
      ],
      status: 'in_progress'
    }
  ]);

  const [roiMetrics, setROIMetrics] = useState<ROIMetrics>({
    totalInvestment: 125000,
    totalSavings: 189500,
    roi: 51.6,
    paybackPeriod: 8.5,
    netPresentValue: 64500,
    breakdown: {
      infrastructure: { investment: 75000, savings: 120000, roi: 60.0 },
      optimization: { investment: 35000, savings: 52500, roi: 50.0 },
      automation: { investment: 15000, savings: 17000, roi: 13.3 }
    },
    timeline: [
      { month: 1, cumulativeInvestment: 25000, cumulativeSavings: 5000, netBenefit: -20000 },
      { month: 3, cumulativeInvestment: 75000, cumulativeSavings: 25000, netBenefit: -50000 },
      { month: 6, cumulativeInvestment: 100000, cumulativeSavings: 75000, netBenefit: -25000 },
      { month: 9, cumulativeInvestment: 120000, cumulativeSavings: 135000, netBenefit: 15000 },
      { month: 12, cumulativeInvestment: 125000, cumulativeSavings: 189500, netBenefit: 64500 }
    ]
  });

  // Tab content renderers
  const renderOverviewTab = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {/* Key Metrics */}
      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }, minWidth: 0 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Cost
                </Typography>
                <Typography variant="h4">
                  ${optimizationData.monthlyCost.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp sx={{ color: 'error.main', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: 'error.main', ml: 0.5 }}>
                    +12.5% vs last month
                  </Typography>
                </Box>
              </Box>
              <AttachMoney sx={{ color: '#1976d2', fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Potential Savings
                </Typography>
                <Typography variant="h4">
                  ${optimizationData.savings.potential.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'success.main' }}>
                  {optimizationData.savings.percentage}% optimization opportunity
                </Typography>
              </Box>
              <Savings sx={{ color: '#2e7d32', fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Cache Hit Rate
                </Typography>
                <Typography variant="h4">
                  {cacheAnalytics.hitRate.toFixed(1)}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'success.main' }}>
                  ${cacheAnalytics.costSavings.toFixed(0)} saved
                </Typography>
              </Box>
              <Speed sx={{ color: '#ed6c02', fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Efficiency Score
                </Typography>
                <Typography variant="h4">
                  {optimizationData.efficiency.score}/100
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
                  <Typography variant="caption" sx={{ color: 'success.main', ml: 0.5 }}>
                    +{optimizationData.efficiency.trend} this month
                  </Typography>
                </Box>
              </Box>
              <Assessment sx={{ color: '#9c27b0', fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Cost Trend */}
      <Box sx={{ width: { xs: '100%', md: '66.67%' } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cost Trend & Projections
            </Typography>
            <CostTrendChart
              data={[
                { timestamp: Date.now() - 2592000000, cost: 2200 },
                { timestamp: Date.now() - 1814400000, cost: 2450 },
                { timestamp: Date.now() - 1209600000, cost: 2680 },
                { timestamp: Date.now() - 604800000, cost: 2756 },
                { timestamp: Date.now(), cost: optimizationData.monthlyCost },
                { timestamp: Date.now() + 604800000, cost: 2950, projected: true },
                { timestamp: Date.now() + 1209600000, cost: 3100, projected: true },
                { timestamp: Date.now() + 1814400000, cost: 3200, projected: true }
              ]}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Optimization Actions
            </Typography>
            <List>
              {recommendations.slice(0, 3).map((rec) => (
                <ListItem key={rec.id} dense>
                  <ListItemIcon>
                    <Lightbulb 
                      sx={{ 
                        color: rec.priority === 'high' ? 'error.main' : 
                               rec.priority === 'medium' ? 'warning.main' : 'info.main' 
                      }} 
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={rec.title}
                    secondary={`Save $${rec.estimatedSavings.toFixed(0)}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip 
                      label={rec.priority} 
                      size="small"
                      color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => setShowRecommendationDialog(true)}
              sx={{ mt: 1 }}
            >
              View All Recommendations
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderModelComparisonTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Model Cost Comparison Analysis
            </Typography>
            <ModelCostComparisonChart models={modelComparisons} />
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detailed Model Analytics
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell align="right">Vendor</TableCell>
                    <TableCell align="right">Usage</TableCell>
                    <TableCell align="right">Total Cost</TableCell>
                    <TableCell align="right">Cost per Request</TableCell>
                    <TableCell align="right">Recommendations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modelComparisons.map((model) => (
                    <TableRow key={model.modelId}>
                      <TableCell>
                        <Typography variant="subtitle2">{model.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {model.averageLatency}ms avg latency
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={model.vendor}
                          size="small"
                          color={model.vendor === 'local' ? 'success' : 'primary'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {model.usage.requests.toLocaleString()} requests
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {(model.usage.inputTokens / 1000000).toFixed(1)}M in / {(model.usage.outputTokens / 1000000).toFixed(1)}M out
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          ${model.usage.totalCost.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${model.efficiency.toFixed(3)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ maxWidth: 300 }}>
                          {model.recommendations.map((rec, index) => (
                            <Chip
                              key={index}
                              label={rec}
                              size="small"
                              variant="outlined"
                              sx={{ m: 0.25 }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderCacheAnalyticsTab = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: 0 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
            Cache Performance Analytics
            </Typography>
            <CacheHitRateChart analytics={cacheAnalytics} />
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: 0 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cache Impact Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h3" color="success.main">
                ${cacheAnalytics.costSavings.toFixed(0)}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total Cost Savings This Month
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4">
                {cacheAnalytics.performanceGain.toFixed(1)}%
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Performance Improvement
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Cache Size: {cacheAnalytics.cacheSize.toFixed(1)}GB
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Eviction Rate: {cacheAnalytics.evictionRate.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cache Optimization Recommendations
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><Autorenew /></ListItemIcon>
                <ListItemText
                  primary="Increase Context Cache TTL"
                  secondary="Extend cache time-to-live from 1 hour to 4 hours for 15% improvement"
                />
                <ListItemSecondaryAction>
                  <Typography color="success.main">+$45/month</Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon><Storage /></ListItemIcon>
                <ListItemText
                  primary="Implement Semantic Caching"
                  secondary="Use semantic similarity for cache keys to improve hit rate by 20%"
                />
                <ListItemSecondaryAction>
                  <Typography color="success.main">+$120/month</Typography>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon><CloudQueue /></ListItemIcon>
                <ListItemText
                  primary="Pre-warm Popular Queries"
                  secondary="Cache common queries during off-peak hours"
                />
                <ListItemSecondaryAction>
                  <Typography color="success.main">+$80/month</Typography>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderVendorSLATab = () => (
    <Grid container spacing={3}>
      <Box sx={{ width: { xs: '100%' } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vendor SLA Monitoring
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Vendor</TableCell>
                    <TableCell align="right">Uptime</TableCell>
                    <TableCell align="right">Latency</TableCell>
                    <TableCell align="right">Error Rate</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Cost Impact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendorSLAs.map((vendor) => (
                    <TableRow key={vendor.vendor}>
                      <TableCell>
                        <Typography variant="subtitle2">{vendor.displayName}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <LinearProgress
                            variant="determinate"
                            value={vendor.uptime}
                            sx={{ width: 60, mr: 1 }}
                            color={vendor.uptime >= vendor.targetUptime ? 'success' : 'error'}
                          />
                          {vendor.uptime.toFixed(2)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={vendor.averageLatency <= vendor.targetLatency ? 'success.main' : 'error.main'}
                        >
                          {vendor.averageLatency}ms
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (target: {vendor.targetLatency}ms)
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={vendor.errorRate <= vendor.targetErrorRate ? 'success.main' : 'error.main'}
                        >
                          {vendor.errorRate.toFixed(2)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={vendor.availability}
                          color={
                            vendor.availability === 'healthy' ? 'success' :
                            vendor.availability === 'degraded' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color={vendor.costsImpact > 0 ? 'error.main' : 'text.primary'}
                        >
                          ${vendor.costsImpact.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Recent Incidents */}
      <Box sx={{ width: { xs: '100%' } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Incidents & Impact
            </Typography>
            {vendorSLAs.filter(v => v.incidents.length > 0).map((vendor) => (
              <Box key={vendor.vendor} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {vendor.displayName}
                </Typography>
                {vendor.incidents.map((incident) => (
                  <Alert
                    key={incident.id}
                    severity={incident.severity as any}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle2">{incident.description}</Typography>
                    <Typography variant="body2">{incident.impact}</Typography>
                    <Typography variant="caption">
                      Cost Impact: ${incident.costImpact.toFixed(2)} | 
                      Duration: {Math.round((incident.endTime! - incident.startTime) / 60000)} minutes
                    </Typography>
                  </Alert>
                ))}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Grid>
  );

  const renderROITab = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' }, minWidth: 0 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ROI Summary
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" color="success.main">
                {roiMetrics.roi.toFixed(1)}%
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Return on Investment
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5">
                {roiMetrics.paybackPeriod.toFixed(1)} months
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Payback Period
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" color="success.main">
                ${roiMetrics.netPresentValue.toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Net Present Value
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66.67%' }, minWidth: 0 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Investment vs Savings Timeline
            </Typography>
            <Box sx={{ height: 200 }}>
              {/* ROI chart would go here */}
              <Typography variant="body2" color="textSecondary">
                Interactive ROI timeline chart showing cumulative investment, savings, and net benefit over time.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ROI Breakdown by Category
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {Object.entries(roiMetrics.breakdown).map(([category, data]) => (
                <Box key={category} sx={{ flex: { xs: '1 1 100%', md: '1 1 33.33%' }, minWidth: 0 }}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', mb: 1 }}>
                      {category}
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {data.roi.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Investment: ${data.investment.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Savings: ${data.savings.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Smart-Router+ Cost Optimizer
          <Chip label="Premium" color="primary" size="small" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Advanced cost optimization analytics with AI-powered recommendations
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                label="Time Range"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<NotificationsActive />}
              onClick={() => setShowBudgetDialog(true)}
            >
              Budget Alerts
            </Button>
            <Button
              variant="contained"
              startIcon={<Lightbulb />}
              onClick={() => setShowRecommendationDialog(true)}
            >
              View Recommendations
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Model Comparison" />
          <Tab label="Cache Analytics" />
          <Tab label="Vendor SLAs" />
          <Tab label="ROI Analysis" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && renderOverviewTab()}
      {activeTab === 1 && renderModelComparisonTab()}
      {activeTab === 2 && renderCacheAnalyticsTab()}
      {activeTab === 3 && renderVendorSLATab()}
      {activeTab === 4 && renderROITab()}

      {/* Budget Alerts Dialog */}
      <Dialog open={showBudgetDialog} onClose={() => setShowBudgetDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Budget Alert Configuration</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Active Budget Alerts
          </Typography>
          {budgetAlerts.map((alert) => (
            <Box key={alert.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">{alert.name}</Typography>
                <Switch checked={alert.enabled} />
              </Box>
              <Typography variant="body2" color="textSecondary">
                Threshold: ${alert.threshold} | Current: ${alert.currentValue.toFixed(2)}
              </Typography>
              <Chip
                label={alert.severity}
                color={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBudgetDialog(false)}>Close</Button>
          <Button variant="contained">Add New Alert</Button>
        </DialogActions>
      </Dialog>

      {/* Recommendations Dialog */}
      <Dialog open={showRecommendationDialog} onClose={() => setShowRecommendationDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Optimization Recommendations
          <Badge badgeContent={recommendations.filter(r => r.status === 'pending').length} color="error" sx={{ ml: 2 }} />
        </DialogTitle>
        <DialogContent>
          {recommendations.map((rec) => (
            <Accordion key={rec.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Chip
                    label={rec.priority}
                    color={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}
                    size="small"
                  />
                  <Typography variant="subtitle1" sx={{ flex: 1 }}>
                    {rec.title}
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${rec.estimatedSavings.toFixed(0)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography paragraph>{rec.description}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: 0 }}>
                    <Typography variant="subtitle2" gutterBottom>Action Items:</Typography>
                    <List dense>
                      {rec.actionItems.map((item, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: 0 }}>
                    <Typography variant="subtitle2" gutterBottom>Impact Analysis:</Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2">Cost Impact: {rec.impact.cost}%</Typography>
                      <LinearProgress variant="determinate" value={rec.impact.cost} color="success" />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2">Performance: {rec.impact.performance}%</Typography>
                      <LinearProgress variant="determinate" value={Math.abs(rec.impact.performance)} 
                        color={rec.impact.performance >= 0 ? 'success' : 'warning'} />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Time to Value: {rec.timeToValue} days | Effort: {rec.implementationEffort}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button variant="contained" size="small">
                    Implement
                  </Button>
                  <Button variant="outlined" size="small">
                    Schedule
                  </Button>
                  <Button variant="text" size="small">
                    Dismiss
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRecommendationDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CostOptimizerDashboard; 