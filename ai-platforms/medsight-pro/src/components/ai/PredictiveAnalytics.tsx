'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Brain, 
  AlertTriangle, 
  Target, 
  Calendar, 
  Heart, 
  Activity, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  LineChart,
  PieChart,
  Download,
  RefreshCw,
  Settings,
  Search,
  Filter,
  Info,
  Lightbulb,
  Database,
  Microscope,
  Stethoscope,
  Pill,
  Users,
  Eye,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { AIAnalysisIntegration } from '@/lib/ai/ai-analysis-integration';

interface PredictionModel {
  id: string;
  name: string;
  type: 'outcome' | 'risk' | 'treatment' | 'diagnosis' | 'prognosis';
  description: string;
  accuracy: number;
  confidence: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'inactive';
  features: string[];
  targetVariable: string;
}

interface Prediction {
  id: string;
  modelId: string;
  patientId: string;
  prediction: any;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  factors: PredictionFactor[];
  recommendations: string[];
  timestamp: Date;
  validated?: boolean;
  actualOutcome?: any;
}

interface PredictionFactor {
  name: string;
  impact: number;
  value: any;
  importance: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface RiskScore {
  category: string;
  score: number;
  threshold: number;
  status: 'normal' | 'elevated' | 'high' | 'critical';
  trend: 'improving' | 'worsening' | 'stable';
  factors: string[];
}

interface OutcomePrediction {
  id: string;
  type: 'readmission' | 'complications' | 'recovery' | 'treatment_success';
  probability: number;
  timeframe: string;
  confidence: number;
  factors: PredictionFactor[];
  interventions: string[];
  similarCases: number;
}

const PredictiveAnalytics: React.FC = () => {
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [activeModel, setActiveModel] = useState<PredictionModel | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [predictionType, setPredictionType] = useState('outcome');
  const [timeframe, setTimeframe] = useState('30d');
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [outcomePredictions, setOutcomePredictions] = useState<OutcomePrediction[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysisIntegration | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customParameters, setCustomParameters] = useState<any>({});

  useEffect(() => {
    const initializePredictive = async () => {
      try {
        const ai = new AIAnalysisIntegration();
        setAIAnalysis(ai);
        await loadModels();
        await loadPredictions();
      } catch (error) {
        console.error('Failed to initialize predictive analytics:', error);
      }
    };

    initializePredictive();
  }, []);

  const loadModels = async () => {
    // Load available prediction models
    const sampleModels: PredictionModel[] = [
      {
        id: 'mortality-risk',
        name: 'Mortality Risk Assessment',
        type: 'risk',
        description: 'Predicts mortality risk based on patient vitals, lab results, and medical history',
        accuracy: 0.92,
        confidence: 0.88,
        lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'active',
        features: ['age', 'vitals', 'lab_results', 'comorbidities', 'medications'],
        targetVariable: 'mortality_risk'
      },
      {
        id: 'readmission-predictor',
        name: 'Readmission Predictor',
        type: 'outcome',
        description: 'Predicts likelihood of patient readmission within 30 days',
        accuracy: 0.85,
        confidence: 0.82,
        lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        features: ['diagnosis', 'length_of_stay', 'discharge_disposition', 'medications'],
        targetVariable: 'readmission_30d'
      },
      {
        id: 'treatment-response',
        name: 'Treatment Response Predictor',
        type: 'treatment',
        description: 'Predicts patient response to specific treatment protocols',
        accuracy: 0.79,
        confidence: 0.76,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        features: ['genetics', 'biomarkers', 'treatment_history', 'comorbidities'],
        targetVariable: 'treatment_success'
      }
    ];

    setModels(sampleModels);
    setActiveModel(sampleModels[0]);
  };

  const loadPredictions = async () => {
    // Load recent predictions
    const samplePredictions: Prediction[] = [
      {
        id: 'pred-1',
        modelId: 'mortality-risk',
        patientId: 'patient-001',
        prediction: { risk_score: 0.15, category: 'low' },
        confidence: 0.89,
        riskLevel: 'low',
        timeframe: '30 days',
        factors: [
          { name: 'Age', impact: 0.3, value: 45, importance: 'medium', trend: 'stable' },
          { name: 'Blood Pressure', impact: 0.2, value: 'normal', importance: 'low', trend: 'stable' },
          { name: 'Comorbidities', impact: 0.1, value: 'none', importance: 'low', trend: 'stable' }
        ],
        recommendations: ['Continue current treatment plan', 'Regular monitoring recommended'],
        timestamp: new Date()
      }
    ];

    setPredictions(samplePredictions);

    // Load risk scores
    const sampleRiskScores: RiskScore[] = [
      {
        category: 'Cardiovascular',
        score: 0.23,
        threshold: 0.3,
        status: 'normal',
        trend: 'stable',
        factors: ['blood_pressure', 'cholesterol', 'family_history']
      },
      {
        category: 'Diabetes',
        score: 0.67,
        threshold: 0.5,
        status: 'elevated',
        trend: 'worsening',
        factors: ['glucose_levels', 'bmi', 'age']
      }
    ];

    setRiskScores(sampleRiskScores);

    // Load outcome predictions
    const sampleOutcomes: OutcomePrediction[] = [
      {
        id: 'outcome-1',
        type: 'readmission',
        probability: 0.25,
        timeframe: '30 days',
        confidence: 0.84,
        factors: [
          { name: 'Length of Stay', impact: 0.4, value: 7, importance: 'high', trend: 'stable' },
          { name: 'Discharge Disposition', impact: 0.3, value: 'home', importance: 'medium', trend: 'stable' }
        ],
        interventions: ['Follow-up appointment within 7 days', 'Medication adherence monitoring'],
        similarCases: 1247
      }
    ];

    setOutcomePredictions(sampleOutcomes);
  };

  const runPrediction = async () => {
    if (!activeModel || !selectedPatient || !aiAnalysis) {
      console.error('Please select a model and patient');
      return;
    }

    setIsRunning(true);
    setIsLoading(true);

    try {
      // Submit analysis request
      const requestId = await aiAnalysis.submitAnalysisRequest({
        modelId: activeModel.id,
        inputData: {
          type: 'structured_data',
          data: { patientId: selectedPatient },
          format: 'json',
          metadata: { timeframe }
        },
        parameters: {
          confidence_threshold: 0.8,
          ...customParameters
        },
        priority: 'medium',
        requestedBy: 'predictive-analytics',
        patientId: selectedPatient,
        clinicalContext: {
          patientAge: 45,
          patientSex: 'unknown',
          indication: 'Risk assessment'
        }
      });

      if (requestId) {
        // Create prediction result
        const newPrediction: Prediction = {
          id: `pred-${Date.now()}`,
          modelId: activeModel.id,
          patientId: selectedPatient,
          prediction: { value: 0.75, category: 'medium' },
          confidence: 0.85,
          riskLevel: 'medium',
          timeframe,
          factors: [
            { name: 'Age', impact: 0.3, value: 45, importance: 'medium', trend: 'stable' },
            { name: 'History', impact: 0.2, value: 'none', importance: 'low', trend: 'stable' }
          ],
          recommendations: ['Continue monitoring', 'Follow up in 30 days'],
          timestamp: new Date()
        };

        setPredictions(prev => [newPrediction, ...prev]);
        console.log('Prediction completed successfully');
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsRunning(false);
      setIsLoading(false);
    }
  };

  const exportPredictions = async () => {
    try {
      const exportData = {
        predictions,
        models,
        riskScores,
        outcomePredictions,
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `predictions-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('Predictions exported successfully');
    } catch (error) {
      console.error('Failed to export predictions:', error);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'training': return 'text-blue-600';
      case 'inactive': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const ModelCard = ({ model }: { model: PredictionModel }) => (
    <Card 
      className={`cursor-pointer transition-all ${
        activeModel?.id === model.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setActiveModel(model)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{model.name}</CardTitle>
          <Badge variant="outline" className={getStatusColor(model.status)}>
            {model.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{model.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <span className="text-xs text-gray-500">Accuracy</span>
            <div className="font-semibold">{(model.accuracy * 100).toFixed(1)}%</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Confidence</span>
            <div className="font-semibold">{(model.confidence * 100).toFixed(1)}%</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Last trained: {model.lastTrained.toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  const PredictionCard = ({ prediction }: { prediction: Prediction }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {models.find(m => m.id === prediction.modelId)?.name || 'Unknown Model'}
          </CardTitle>
          <Badge className={getRiskColor(prediction.riskLevel)}>
            {prediction.riskLevel.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500">Confidence</span>
            <div className="font-semibold">{(prediction.confidence * 100).toFixed(1)}%</div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Timeframe</span>
            <div className="font-semibold">{prediction.timeframe}</div>
          </div>
        </div>

        {prediction.factors.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Key Factors</h4>
            <div className="space-y-2">
              {prediction.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{factor.value}</span>
                    <Badge variant="outline" className="text-xs">
                      {factor.importance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {prediction.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {prediction.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                  <Lightbulb className="w-3 h-3" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const RiskScoreCard = ({ risk }: { risk: RiskScore }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{risk.category}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Risk Score</span>
            <Badge className={getRiskColor(risk.status)}>
              {risk.status.toUpperCase()}
            </Badge>
          </div>
          <Progress value={risk.score * 100} className="h-3" />
          <div className="text-xs text-gray-500 mt-1">
            {(risk.score * 100).toFixed(1)}% (Threshold: {(risk.threshold * 100).toFixed(1)}%)
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>Trend:</span>
          <Badge variant="outline" className="text-xs">
            {risk.trend}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Active Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {models.filter(m => m.status === 'active').length}
            </div>
            <p className="text-sm text-gray-600">Running predictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Predictions Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-sm text-gray-600">Completed analyses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              High Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskScores.filter(r => r.status === 'high' || r.status === 'critical').length}
            </div>
            <p className="text-sm text-gray-600">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {riskScores.map((risk, index) => (
                <RiskScoreCard key={index} risk={risk} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.slice(0, 3).map((prediction) => (
                <div key={prediction.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {models.find(m => m.id === prediction.modelId)?.name}
                    </span>
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Confidence: {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ModelsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Prediction Models</h2>
        <Button onClick={loadModels}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>

      {activeModel && (
        <Card>
          <CardHeader>
            <CardTitle>Run Prediction - {activeModel.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient-id">Patient ID</Label>
                <Input
                  id="patient-id"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                    <SelectItem value="1y">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={runPrediction} 
                disabled={isRunning || !selectedPatient}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Prediction
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={exportPredictions}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const ResultsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Prediction Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {predictions.map((prediction) => (
          <PredictionCard key={prediction.id} prediction={prediction} />
        ))}
      </div>

      {predictions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No predictions yet</h3>
            <p className="text-gray-600">Run your first prediction to see results here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full backdrop-blur-sm bg-white/90 border border-white/20 rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Predictive Analytics</h1>
                <p className="text-gray-600">Medical Outcome Prediction & Risk Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {models.filter(m => m.status === 'active').length} Active Models
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {predictions.length} Predictions
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-[calc(100%-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Models
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="h-full p-4">
              <div className="h-full overflow-auto">
                <DashboardTab />
              </div>
            </TabsContent>

            <TabsContent value="models" className="h-full p-4">
              <div className="h-full overflow-auto">
                <ModelsTab />
              </div>
            </TabsContent>

            <TabsContent value="results" className="h-full p-4">
              <div className="h-full overflow-auto">
                <ResultsTab />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics; 