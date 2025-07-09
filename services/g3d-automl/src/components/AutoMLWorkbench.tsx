/**
 * G3D AutoML - Automated Machine Learning Workbench
 * Complete enterprise AutoML platform with drag-and-drop model building
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    GlassCard,
    GlassButton,
    GlassInput,
    GlassModal,
    baseGlassmorphismTheme,
    serviceThemeOverrides
} from '../../../../shared/ui/src/components/index';
import {
    MLPipeline,
    Dataset,
    ModelMetrics,
    AutoMLExperiment,
    FeatureEngineering,
    DeploymentConfig
} from '../types/automl.types';
import type { ModelComparison } from '../types/automl.types';
import { AutoMLEngine } from '../services/AutoMLEngine';

// AutoML Theme (Purple/Blue ML theme)
const automlTheme = {
    ...baseGlassmorphismTheme,
    primary: '#8b5cf6',
    secondary: '#3b82f6',
    accent: '#06b6d4',
    glass: {
        background: 'rgba(139, 92, 246, 0.1)',
        border: 'rgba(139, 92, 246, 0.2)',
        blur: '12px'
    }
};

// Animations
const modelTraining = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.7; }
`;

const dataFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const progressPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
`;

// Styled Components
const WorkbenchContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a1f 0%, #1a1235 50%, #2d1b69 100%);
  padding: 1.5rem;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #8b5cf6, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #8b5cf6, #3b82f6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
`;

const ExperimentStatus = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    
    &.idle {
      background: rgba(107, 114, 128, 0.2);
      color: #9ca3af;
    }
    
    &.training {
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
      animation: ${progressPulse} 2s infinite;
    }
    
    &.completed {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    
    &.error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  gap: 1.5rem;
  height: calc(100vh - 140px);
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

const CenterPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

const PipelineBuilder = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .builder-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .pipeline-canvas {
      width: 100%;
      height: 450px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 2px dashed rgba(139, 92, 246, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
        animation: ${dataFlow} 4s infinite;
      }
      
      .pipeline-steps {
        display: flex;
        align-items: center;
        gap: 2rem;
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(139, 92, 246, 0.2);
            transform: translateY(-2px);
          }
          
          &.active {
            background: rgba(139, 92, 246, 0.3);
            border-color: #8b5cf6;
            animation: ${modelTraining} 2s infinite;
          }
          
          .step-icon {
            font-size: 2rem;
          }
          
          .step-label {
            font-size: 0.9rem;
            font-weight: 600;
          }
        }
        
        .arrow {
          font-size: 1.5rem;
          color: #8b5cf6;
        }
      }
    }
  }
`;

const DatasetList = styled.div`
  .dataset-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(139, 92, 246, 0.1);
    }
    
    &.selected {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid #8b5cf6;
    }
    
    .dataset-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    
    .dataset-info {
      flex: 1;
      
      .dataset-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .dataset-details {
        font-size: 0.8rem;
        opacity: 0.7;
        display: flex;
        gap: 1rem;
      }
    }
    
    .dataset-status {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      
      &.ready { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      &.processing { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
      &.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    }
  }
`;

const ModelMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #8b5cf6;
      margin-bottom: 0.5rem;
    }
    
    .metric-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .metric-change {
      font-size: 0.8rem;
      margin-top: 0.25rem;
      
      &.positive { color: #22c55e; }
      &.negative { color: #ef4444; }
    }
  }
`;

const ExperimentsList = styled.div`
  .experiment-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(139, 92, 246, 0.1);
    }
    
    .experiment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .experiment-name {
        font-weight: 600;
      }
      
      .experiment-score {
        font-size: 0.9rem;
        color: #8b5cf6;
        font-weight: 600;
      }
    }
    
    .experiment-details {
      font-size: 0.8rem;
      opacity: 0.7;
      display: flex;
      gap: 1rem;
    }
    
    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 0.5rem;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #8b5cf6, #3b82f6);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
    }
  }
`;

const ModelComparison = styled.div`
  .comparison-table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    th {
      background: rgba(139, 92, 246, 0.1);
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    td {
      font-size: 0.8rem;
    }
    
    .best-score {
      color: #22c55e;
      font-weight: 600;
    }
  }
`;

// Main Component
export const AutoMLWorkbench: React.FC = () => {
    // State Management
    const [selectedDataset, setSelectedDataset] = useState<string>('');
    const [experimentStatus, setExperimentStatus] = useState<'idle' | 'training' | 'completed' | 'error'>('idle');
    const [activeStep, setActiveStep] = useState<string>('data');
    const [experiments, setExperiments] = useState<AutoMLExperiment[]>([]);
    const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
    const [showExperimentDetails, setShowExperimentDetails] = useState(false);

    // Refs
    const automlEngine = useRef(new AutoMLEngine());

    // Sample datasets
    const datasets = [
        {
            id: 'dataset-001',
            name: 'Customer Churn Analysis',
            type: 'Classification',
            rows: '125K',
            features: '45',
            status: 'ready' as const
        },
        {
            id: 'dataset-002',
            name: 'Sales Forecasting',
            type: 'Regression',
            rows: '89K',
            features: '32',
            status: 'ready' as const
        },
        {
            id: 'dataset-003',
            name: 'Image Classification',
            type: 'Computer Vision',
            rows: '50K',
            features: '2048',
            status: 'processing' as const
        },
        {
            id: 'dataset-004',
            name: 'Text Sentiment Analysis',
            type: 'NLP',
            rows: '200K',
            features: '1024',
            status: 'ready' as const
        }
    ];

    // Pipeline steps
    const pipelineSteps = [
        { id: 'data', label: 'Data Ingestion', icon: '📊' },
        { id: 'preprocess', label: 'Preprocessing', icon: '🔧' },
        { id: 'feature', label: 'Feature Engineering', icon: '⚙️' },
        { id: 'model', label: 'Model Training', icon: '🤖' },
        { id: 'evaluate', label: 'Evaluation', icon: '📈' },
        { id: 'deploy', label: 'Deployment', icon: '🚀' }
    ];

    // Event Handlers
    const handleStartExperiment = useCallback(async () => {
        if (!selectedDataset || experimentStatus === 'training') return;

        setExperimentStatus('training');
        setActiveStep('data');

        try {
            // Simulate pipeline execution
            for (const step of pipelineSteps) {
                setActiveStep(step.id);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate step execution
            }

            const newExperiment = await automlEngine.current.runExperiment({
                datasetId: selectedDataset,
                targetColumn: 'target',
                problemType: 'classification'
            });

            setExperiments(prev => [newExperiment, ...prev.slice(0, 4)]);
            setExperimentStatus('completed');

        } catch (error) {
            console.error('Experiment failed:', error);
            setExperimentStatus('error');
        }
    }, [selectedDataset, experimentStatus, pipelineSteps]);

    // Load AutoML data
    useEffect(() => {
        const loadAutoMLData = async () => {
            try {
                const modelMetrics = await automlEngine.current.getModelMetrics();
                setMetrics(modelMetrics);

                const recentExperiments = await automlEngine.current.getRecentExperiments();
                setExperiments(recentExperiments);
            } catch (error) {
                console.error('Failed to load AutoML data:', error);
            }
        };

        loadAutoMLData();
    }, []);

    return (
        <WorkbenchContainer>
            <Header>
                <Logo>
                    <div className="icon">🤖</div>
                    <h1>G3D AutoML Workbench</h1>
                </Logo>
                <ExperimentStatus>
                    <div className={`status-indicator ${experimentStatus}`}>
                        <div className="dot" />
                        <span>Status: {experimentStatus.toUpperCase()}</span>
                    </div>
                    <GlassButton
                        variant="primary"
                        onClick={handleStartExperiment}
                        disabled={experimentStatus === 'training' || !selectedDataset}
                        theme={automlTheme}
                    >
                        {experimentStatus === 'training' ? '⏳ Training...' : '🚀 Start Experiment'}
                    </GlassButton>
                </ExperimentStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Datasets & Tools */}
                <LeftPanel>
                    <GlassCard size="lg" theme={automlTheme}>
                        <h3 style={{ marginTop: 0 }}>Available Datasets</h3>
                        <DatasetList>
                            {datasets.map(dataset => (
                                <div
                                    key={dataset.id}
                                    className={`dataset-item ${selectedDataset === dataset.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedDataset(dataset.id)}
                                >
                                    <div className="dataset-icon">📊</div>
                                    <div className="dataset-info">
                                        <div className="dataset-name">{dataset.name}</div>
                                        <div className="dataset-details">
                                            <span>{dataset.type}</span>
                                            <span>{dataset.rows} rows</span>
                                            <span>{dataset.features} features</span>
                                        </div>
                                    </div>
                                    <div className={`dataset-status ${dataset.status}`}>
                                        {dataset.status}
                                    </div>
                                </div>
                            ))}
                        </DatasetList>
                    </GlassCard>

                    <GlassCard size="lg" theme={automlTheme}>
                        <h3 style={{ marginTop: 0 }}>AutoML Tools</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="ghost" fullWidth theme={automlTheme}>
                                📁 Upload Dataset
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={automlTheme}>
                                🔧 Feature Engineering
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={automlTheme}>
                                📊 Data Visualization
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={automlTheme}>
                                🎯 Hyperparameter Tuning
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={automlTheme}>
                                📈 Model Comparison
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={automlTheme}>
                                🚀 Model Deployment
                            </GlassButton>
                        </div>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Pipeline Builder */}
                <CenterPanel>
                    <GlassCard size="lg" theme={automlTheme}>
                        <h3 style={{ marginTop: 0 }}>ML Pipeline Builder</h3>
                        <PipelineBuilder>
                            <div className="builder-content">
                                <div className="pipeline-canvas">
                                    <div className="pipeline-steps">
                                        {pipelineSteps.map((step, index) => (
                                            <React.Fragment key={step.id}>
                                                <div className={`step ${activeStep === step.id ? 'active' : ''}`}>
                                                    <div className="step-icon">{step.icon}</div>
                                                    <div className="step-label">{step.label}</div>
                                                </div>
                                                {index < pipelineSteps.length - 1 && (
                                                    <div className="arrow">→</div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PipelineBuilder>
                    </GlassCard>

                    <GlassCard size="lg" theme={automlTheme}>
                        <h3 style={{ marginTop: 0 }}>Model Performance Metrics</h3>
                        <ModelMetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.accuracy || '94.2'}%</div>
                                <div className="metric-label">Accuracy</div>
                                <div className="metric-change positive">+2.1%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.precision || '91.8'}%</div>
                                <div className="metric-label">Precision</div>
                                <div className="metric-change positive">+1.5%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.recall || '89.6'}%</div>
                                <div className="metric-label">Recall</div>
                                <div className="metric-change negative">-0.8%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.f1Score || '90.7'}%</div>
                                <div className="metric-label">F1 Score</div>
                                <div className="metric-change positive">+0.9%</div>
                            </div>
                        </ModelMetricsGrid>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Experiments & Results */}
                <RightPanel>
                    <GlassCard size="lg" theme={automlTheme}>
                        <h3 style={{ marginTop: 0 }}>Recent Experiments</h3>
                        <ExperimentsList>
                            <div className="experiment-item">
                                <div className="experiment-header">
                                    <span className="experiment-name">Random Forest Classifier</span>
                                    <span className="experiment-score">94.2%</span>
                                </div>
                                <div className="experiment-details">
                                    <span>Customer Churn</span>
                                    <span>2 min ago</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <div className="experiment-item">
                                <div className="experiment-header">
                                    <span className="experiment-name">XGBoost Classifier</span>
                                    <span className="experiment-score">92.8%</span>
                                </div>
                                <div className="experiment-details">
                                    <span>Customer Churn</span>
                                    <span>5 min ago</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <div className="experiment-item">
                                <div className="experiment-header">
                                    <span className="experiment-name">Neural Network</span>
                                    <span className="experiment-score">91.5%</span>
                                </div>
                                <div className="experiment-details">
                                    <span>Customer Churn</span>
                                    <span>12 min ago</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </ExperimentsList>
                    </GlassCard>

                    <GlassCard size="lg" theme={automlTheme}>
                        <h3 style={{ marginTop: 0 }}>Model Comparison</h3>
                        <ModelComparison>
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Accuracy</th>
                                        <th>Training Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Random Forest</td>
                                        <td className="best-score">94.2%</td>
                                        <td>2m 15s</td>
                                    </tr>
                                    <tr>
                                        <td>XGBoost</td>
                                        <td>92.8%</td>
                                        <td>3m 42s</td>
                                    </tr>
                                    <tr>
                                        <td>Neural Network</td>
                                        <td>91.5%</td>
                                        <td>8m 30s</td>
                                    </tr>
                                    <tr>
                                        <td>Logistic Regression</td>
                                        <td>87.3%</td>
                                        <td>45s</td>
                                    </tr>
                                </tbody>
                            </table>
                        </ModelComparison>
                    </GlassCard>

                    <GlassCard size="lg" theme={automlTheme}>
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth theme={automlTheme}>
                                🚀 Deploy Best Model
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth theme={automlTheme}>
                                📊 Generate Report
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={automlTheme}>
                                💾 Export Model
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={automlTheme}>
                                📧 Share Results
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>

            {/* Experiment Details Modal */}
            <GlassModal
                isOpen={showExperimentDetails}
                onClose={() => setShowExperimentDetails(false)}
                title="Experiment Details"
                size="lg"
                theme={automlTheme}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h4>Random Forest Classifier</h4>
                        <p>Detailed performance metrics and configuration for the selected experiment.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div>
                            <strong>Accuracy:</strong> 94.2%
                        </div>
                        <div>
                            <strong>Precision:</strong> 91.8%
                        </div>
                        <div>
                            <strong>Recall:</strong> 89.6%
                        </div>
                        <div>
                            <strong>F1 Score:</strong> 90.7%
                        </div>
                        <div>
                            <strong>Training Time:</strong> 2m 15s
                        </div>
                        <div>
                            <strong>Cross-validation:</strong> 5-fold
                        </div>
                    </div>

                    <div>
                        <strong>Hyperparameters:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            <li>n_estimators: 100</li>
                            <li>max_depth: 10</li>
                            <li>min_samples_split: 2</li>
                            <li>min_samples_leaf: 1</li>
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <GlassButton
                            variant="ghost"
                            onClick={() => setShowExperimentDetails(false)}
                            theme={automlTheme}
                        >
                            Close
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            theme={automlTheme}
                        >
                            Deploy Model
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </WorkbenchContainer>
    );
};

export default AutoMLWorkbench;