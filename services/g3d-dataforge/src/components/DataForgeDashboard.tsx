/**
 * G3D DataForge - Enterprise Data Intelligence Platform
 * Complete frontend implementation with real-time analytics and AI insights
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
    DataSource,
    AnalysisJob,
    DataInsight,
    ProcessingPipeline,
    DataMetrics,
    QueryResult,
    DataVisualization
} from '../types/dataforge.types';
import { DataProcessingEngine } from '../services/DataProcessingEngine';

// DataForge Theme
const dataforgeTheme = {
    ...baseGlassmorphismTheme,
    ...serviceThemeOverrides['dataforge']
};

// Animations
const dataFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
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
    background: linear-gradient(135deg, #10b981, #0891b2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #10b981, #0891b2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  .processing-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 20px;
    animation: ${pulseGlow} 2s infinite;
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
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

const DataVisualizationArea = styled.div`
  position: relative;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .viz-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    
    .chart-container {
      width: 100%;
      height: 350px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(8, 145, 178, 0.1));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #10b981, transparent);
        animation: ${dataFlow} 3s infinite;
      }
    }
  }
`;

const QueryInterface = styled.div`
  .query-editor {
    .editor-header {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 1rem;
      
      .query-type-tabs {
        display: flex;
        gap: 0.5rem;
        
        .tab {
          padding: 0.5rem 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          
          &.active {
            background: rgba(16, 185, 129, 0.3);
            border: 1px solid #10b981;
          }
        }
      }
    }
    
    .query-input {
      width: 100%;
      min-height: 120px;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      color: white;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      resize: vertical;
      outline: none;
      
      &:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    }
    
    .query-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
  }
`;

const DataSourceList = styled.div`
  .source-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(16, 185, 129, 0.1);
    }
    
    &.active {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
    }
    
    .source-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #10b981, #0891b2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    
    .source-info {
      flex: 1;
      
      .source-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .source-details {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .source-status {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      
      &.connected { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      &.connecting { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
      &.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #10b981;
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

const InsightsList = styled.div`
  .insight-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #10b981;
    
    .insight-header {
      display: flex;
      justify-content: between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .insight-type {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
      }
      
      .confidence {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .insight-content {
      font-size: 0.9rem;
      line-height: 1.4;
    }
  }
`;

// Main Component
export const DataForgeDashboard: React.FC = () => {
    // State Management
    const [activeDataSource, setActiveDataSource] = useState<string>('');
    const [query, setQuery] = useState<string>('');
    const [queryType, setQueryType] = useState<string>('sql');
    const [isProcessing, setIsProcessing] = useState(false);
    const [insights, setInsights] = useState<DataInsight[]>([]);
    const [metrics, setMetrics] = useState<DataMetrics | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    // Refs
    const dataEngine = useRef(new DataProcessingEngine());

    // Sample data sources
    const dataSources = [
        {
            id: 'postgres-main',
            name: 'PostgreSQL Main',
            type: 'PostgreSQL',
            icon: '🐘',
            status: 'connected' as const,
            details: '2.3M records, 45 tables'
        },
        {
            id: 'mongodb-logs',
            name: 'MongoDB Logs',
            type: 'MongoDB',
            icon: '🍃',
            status: 'connected' as const,
            details: '850K documents, 12 collections'
        },
        {
            id: 'elasticsearch-search',
            name: 'Elasticsearch',
            type: 'Elasticsearch',
            icon: '🔍',
            status: 'connected' as const,
            details: '5.2M indexed documents'
        },
        {
            id: 'kafka-stream',
            name: 'Kafka Stream',
            type: 'Apache Kafka',
            icon: '⚡',
            status: 'connecting' as const,
            details: 'Real-time event stream'
        }
    ];

    // Query types
    const queryTypes = [
        { id: 'sql', name: 'SQL', icon: '📊' },
        { id: 'nosql', name: 'NoSQL', icon: '📄' },
        { id: 'graph', name: 'Graph', icon: '🕸️' },
        { id: 'ai', name: 'AI Query', icon: '🤖' }
    ];

    // Event Handlers
    const handleExecuteQuery = useCallback(async () => {
        if (!query.trim() || isProcessing) return;

        setIsProcessing(true);

        try {
            const result = await dataEngine.current.executeQuery({
                query,
                type: queryType,
                dataSource: activeDataSource
            });

            // Process results and generate insights
            const newInsights = await dataEngine.current.generateInsights(result);
            setInsights(prev => [...newInsights, ...prev.slice(0, 4)]);

        } catch (error) {
            console.error('Query execution failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [query, queryType, activeDataSource, isProcessing]);

    // Load metrics
    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const dataMetrics = await dataEngine.current.getMetrics();
                setMetrics(dataMetrics);
            } catch (error) {
                console.error('Failed to load metrics:', error);
            }
        };

        loadMetrics();
        const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">📊</div>
                    <h1>G3D DataForge</h1>
                </Logo>
                <StatusIndicator>
                    <div className="processing-status">
                        <div className="dot" />
                        <span>{isProcessing ? 'Processing' : 'Ready'}</span>
                    </div>
                    <GlassButton
                        variant="ghost"
                        onClick={() => setShowSettings(true)}
                        theme={dataforgeTheme}
                    >
                        ⚙️ Settings
                    </GlassButton>
                </StatusIndicator>
            </Header>

            <MainGrid>
                {/* Left Panel - Data Sources */}
                <LeftPanel>
                    <GlassCard size="lg" theme={dataforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Data Sources</h3>
                        <DataSourceList>
                            {dataSources.map(source => (
                                <div
                                    key={source.id}
                                    className={`source-item ${activeDataSource === source.id ? 'active' : ''}`}
                                    onClick={() => setActiveDataSource(source.id)}
                                >
                                    <div className="source-icon">{source.icon}</div>
                                    <div className="source-info">
                                        <div className="source-name">{source.name}</div>
                                        <div className="source-details">{source.details}</div>
                                    </div>
                                    <div className={`source-status ${source.status}`}>
                                        {source.status}
                                    </div>
                                </div>
                            ))}
                        </DataSourceList>
                    </GlassCard>

                    <GlassCard size="lg" theme={dataforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Quick Metrics</h3>
                        <MetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.totalRecords || '0'}</div>
                                <div className="metric-label">Total Records</div>
                                <div className="metric-change positive">+12.5%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.processedToday || '0'}</div>
                                <div className="metric-label">Processed Today</div>
                                <div className="metric-change positive">+8.3%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.avgQueryTime || '0'}ms</div>
                                <div className="metric-label">Avg Query Time</div>
                                <div className="metric-change negative">-5.2%</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.activeConnections || '0'}</div>
                                <div className="metric-label">Active Connections</div>
                                <div className="metric-change positive">+2</div>
                            </div>
                        </MetricsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Query Interface & Visualization */}
                <CenterPanel>
                    <GlassCard size="lg" theme={dataforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Data Visualization</h3>
                        <DataVisualizationArea>
                            <div className="viz-content">
                                <div className="chart-container">
                                    <div style={{ textAlign: 'center', opacity: 0.6 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
                                        <div style={{ fontSize: '1.2rem' }}>Interactive Data Visualization</div>
                                        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                            Execute a query to see your data visualized
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DataVisualizationArea>
                    </GlassCard>

                    <GlassCard size="lg" theme={dataforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Query Interface</h3>
                        <QueryInterface>
                            <div className="query-editor">
                                <div className="editor-header">
                                    <div className="query-type-tabs">
                                        {queryTypes.map(type => (
                                            <div
                                                key={type.id}
                                                className={`tab ${queryType === type.id ? 'active' : ''}`}
                                                onClick={() => setQueryType(type.id)}
                                            >
                                                {type.icon} {type.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <textarea
                                    className="query-input"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={`Enter your ${queryType.toUpperCase()} query here...`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.ctrlKey) {
                                            handleExecuteQuery();
                                        }
                                    }}
                                />

                                <div className="query-actions">
                                    <GlassButton
                                        variant="primary"
                                        onClick={handleExecuteQuery}
                                        disabled={isProcessing || !query.trim() || !activeDataSource}
                                        theme={dataforgeTheme}
                                    >
                                        {isProcessing ? '⏳ Executing...' : '▶️ Execute Query'}
                                    </GlassButton>
                                    <GlassButton variant="secondary" theme={dataforgeTheme}>
                                        💾 Save Query
                                    </GlassButton>
                                    <GlassButton variant="ghost" theme={dataforgeTheme}>
                                        📋 Query History
                                    </GlassButton>
                                </div>
                            </div>
                        </QueryInterface>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Insights & Tools */}
                <RightPanel>
                    <GlassCard size="lg" theme={dataforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>AI Insights</h3>
                        <InsightsList>
                            {insights.length > 0 ? insights.map((insight, index) => (
                                <div key={index} className="insight-item">
                                    <div className="insight-header">
                                        <span className="insight-type">{insight.type}</span>
                                        <span className="confidence">{Math.round(insight.confidence * 100)}% confidence</span>
                                    </div>
                                    <div className="insight-content">{insight.description}</div>
                                </div>
                            )) : (
                                <>
                                    <div className="insight-item">
                                        <div className="insight-header">
                                            <span className="insight-type">Pattern</span>
                                            <span className="confidence">94% confidence</span>
                                        </div>
                                        <div className="insight-content">
                                            User engagement peaks between 2-4 PM on weekdays, suggesting optimal content scheduling.
                                        </div>
                                    </div>
                                    <div className="insight-item">
                                        <div className="insight-header">
                                            <span className="insight-type">Anomaly</span>
                                            <span className="confidence">87% confidence</span>
                                        </div>
                                        <div className="insight-content">
                                            Unusual spike in error rates detected in the payment processing pipeline.
                                        </div>
                                    </div>
                                    <div className="insight-item">
                                        <div className="insight-header">
                                            <span className="insight-type">Trend</span>
                                            <span className="confidence">92% confidence</span>
                                        </div>
                                        <div className="insight-content">
                                            Mobile traffic has increased 23% over the past month, mobile optimization recommended.
                                        </div>
                                    </div>
                                </>
                            )}
                        </InsightsList>
                    </GlassCard>

                    <GlassCard size="lg" theme={dataforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Data Tools</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="ghost" fullWidth theme={dataforgeTheme}>
                                🔧 Data Transformation
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={dataforgeTheme}>
                                🧹 Data Cleaning
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={dataforgeTheme}>
                                📊 Auto Visualization
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={dataforgeTheme}>
                                🤖 ML Model Training
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={dataforgeTheme}>
                                📈 Predictive Analytics
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth theme={dataforgeTheme}>
                                📤 Export Results
                            </GlassButton>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg" theme={dataforgeTheme}>
                        <h3 style={{ marginTop: 0 }}>Recent Queries</h3>
                        <div style={{ fontSize: '0.9rem' }}>
                            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>User Engagement Analysis</div>
                                <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>2 minutes ago</div>
                            </div>
                            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Revenue Trend Report</div>
                                <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>15 minutes ago</div>
                            </div>
                            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Performance Metrics</div>
                                <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>1 hour ago</div>
                            </div>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>

            {/* Settings Modal */}
            <GlassModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                title="DataForge Settings"
                size="lg"
                theme={dataforgeTheme}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Default Query Timeout (seconds)
                        </label>
                        <input
                            type="number"
                            defaultValue="30"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            Enable real-time insights
                        </label>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" defaultChecked />
                            Auto-save query results
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <GlassButton
                            variant="ghost"
                            onClick={() => setShowSettings(false)}
                            theme={dataforgeTheme}
                        >
                            Cancel
                        </GlassButton>
                        <GlassButton
                            variant="primary"
                            onClick={() => setShowSettings(false)}
                            theme={dataforgeTheme}
                        >
                            Save Settings
                        </GlassButton>
                    </div>
                </div>
            </GlassModal>
        </DashboardContainer>
    );
};

export default DataForgeDashboard;