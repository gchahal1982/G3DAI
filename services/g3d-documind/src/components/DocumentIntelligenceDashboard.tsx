/**
 * G3D DocuMind - Document Intelligence Dashboard
 * Complete intelligent document processing platform with AI-powered analysis
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// DocuMind Theme (Document amber/orange theme)
const documindTheme = {
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    glass: {
        background: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)',
        blur: '12px'
    }
};

// Animations
const documentScan = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

const processingPulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.3); }
  50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.8); }
`;

const ocrFlow = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #92400e 0%, #b45309 50%, #f59e0b 100%);
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
    background: linear-gradient(135deg, #f59e0b, #d97706);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${processingPulse} 3s infinite;
  }
`;

const ProcessingStatus = styled.div`
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
    
    &.processing {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      animation: ${processingPulse} 2s infinite;
    }
    
    &.ready {
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
  grid-template-columns: 350px 1fr 300px;
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

const GlassCard = styled.div<{ size?: 'sm' | 'md' | 'lg' }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 12px;
  padding: ${props =>
        props.size === 'sm' ? '1rem' :
            props.size === 'lg' ? '2rem' : '1.5rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const DocumentViewer = styled.div`
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .document-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .document-display {
      width: 100%;
      height: 450px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(245, 158, 11, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #f59e0b, transparent);
        animation: ${documentScan} 4s infinite;
      }
      
      .upload-area {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px dashed rgba(245, 158, 11, 0.5);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }
        
        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #f59e0b;
          animation: ${ocrFlow} 3s infinite;
        }
        
        .upload-text {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .upload-subtext {
          font-size: 0.9rem;
          opacity: 0.7;
        }
      }
      
      .document-preview {
        width: 100%;
        height: 100%;
        display: flex;
        position: relative;
        
        .document-image {
          flex: 1;
          background: white;
          border-radius: 8px;
          margin: 1rem;
          position: relative;
          overflow: hidden;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          .ocr-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            
            .text-region {
              position: absolute;
              border: 2px solid rgba(245, 158, 11, 0.8);
              background: rgba(245, 158, 11, 0.1);
              border-radius: 4px;
              
              &.highlighted {
                border-color: #f59e0b;
                background: rgba(245, 158, 11, 0.2);
              }
            }
          }
        }
        
        .analysis-panel {
          width: 300px;
          background: rgba(0, 0, 0, 0.5);
          padding: 1rem;
          overflow-y: auto;
          
          .analysis-section {
            margin-bottom: 1.5rem;
            
            .section-title {
              font-weight: 600;
              color: #f59e0b;
              margin-bottom: 0.75rem;
              font-size: 0.9rem;
            }
            
            .confidence-bar {
              width: 100%;
              height: 6px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 3px;
              margin-bottom: 0.5rem;
              overflow: hidden;
              
              .confidence-fill {
                height: 100%;
                background: linear-gradient(90deg, #f59e0b, #fbbf24);
                border-radius: 3px;
                transition: width 0.3s ease;
              }
            }
          }
        }
      }
    }
  }
`;

const DocumentAnalytics = styled.div`
  .analytics-section {
    margin-bottom: 1.5rem;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        font-size: 1rem;
        color: #f59e0b;
      }
      
      .export-button {
        font-size: 0.8rem;
        color: #fbbf24;
        cursor: pointer;
        
        &:hover {
          color: #f59e0b;
        }
      }
    }
    
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      
      .analytics-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        
        .label {
          font-size: 0.9rem;
          opacity: 0.8;
        }
        
        .value {
          font-size: 0.9rem;
          font-weight: 600;
          
          &.high { color: #22c55e; }
          &.medium { color: #f59e0b; }
          &.low { color: #ef4444; }
        }
      }
    }
  }
`;

const EntityExtraction = styled.div`
  .entity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    .entity-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      background: rgba(245, 158, 11, 0.2);
    }
    
    .entity-info {
      flex: 1;
      
      .entity-type {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: #f59e0b;
      }
      
      .entity-value {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
    
    .entity-confidence {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
  }
`;

const DocumentInsights = styled.div`
  .insight-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #f59e0b;
    
    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .insight-type {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
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
      margin-bottom: 0.75rem;
    }
    
    .insight-actions {
      display: flex;
      gap: 0.5rem;
      
      .action-button {
        padding: 0.25rem 0.75rem;
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 6px;
        color: #f59e0b;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(245, 158, 11, 0.3);
        }
      }
    }
  }
`;

const DocumentMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(245, 158, 11, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #f59e0b;
      margin-bottom: 0.5rem;
    }
    
    .metric-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .metric-trend {
      font-size: 0.8rem;
      margin-top: 0.25rem;
      
      &.improving { color: #22c55e; }
      &.declining { color: #ef4444; }
      &.stable { color: #fbbf24; }
    }
  }
`;

const GlassButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost'; fullWidth?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  background: ${props =>
        props.variant === 'primary' ? 'rgba(245, 158, 11, 0.2)' :
            props.variant === 'secondary' ? 'rgba(217, 119, 6, 0.2)' :
                'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:hover {
    background: ${props =>
        props.variant === 'primary' ? 'rgba(245, 158, 11, 0.3)' :
            props.variant === 'secondary' ? 'rgba(217, 119, 6, 0.3)' :
                'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

// Main Component
export const DocumentIntelligenceDashboard: React.FC = () => {
    // State Management
    const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
    const [documentAnalysis, setDocumentAnalysis] = useState<any>(null);
    const [extractedEntities, setExtractedEntities] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);

    // Sample document analytics
    const documentMetrics = {
        pages: 3,
        words: 1247,
        confidence: 96,
        entities: 15,
        tables: 2,
        signatures: 1,
        processingTime: '2.3s',
        accuracy: '98%'
    };

    // Sample extracted entities
    const entities = [
        {
            id: 'entity-001',
            type: 'Person',
            value: 'John Smith',
            confidence: 98,
            icon: '👤'
        },
        {
            id: 'entity-002',
            type: 'Date',
            value: 'March 15, 2024',
            confidence: 95,
            icon: '📅'
        },
        {
            id: 'entity-003',
            type: 'Amount',
            value: '$12,500.00',
            confidence: 99,
            icon: '💰'
        },
        {
            id: 'entity-004',
            type: 'Organization',
            value: 'Acme Corporation',
            confidence: 97,
            icon: '🏢'
        },
        {
            id: 'entity-005',
            type: 'Address',
            value: '123 Main St, New York, NY',
            confidence: 94,
            icon: '📍'
        }
    ];

    // Event Handlers
    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadedDocument(file);
        setIsProcessing(true);
        setProcessingProgress(0);

        try {
            // Simulate document processing
            const intervals = [20, 40, 60, 80, 100];
            for (let i = 0; i < intervals.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 800));
                setProcessingProgress(intervals[i]);
            }

            // Mock analysis results
            setDocumentAnalysis({
                documentType: 'Invoice',
                confidence: 96,
                layout: 'Standard Business Document',
                language: 'English',
                quality: 'High'
            });

            setExtractedEntities(entities);
        } catch (error) {
            console.error('Document processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            setUploadedDocument(file);
            // Process the dropped file
        }
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">📄</div>
                    <h1>G3D DocuMind Intelligence</h1>
                </Logo>
                <ProcessingStatus>
                    <div className={`status-indicator ${isProcessing ? 'processing' : 'ready'}`}>
                        <div className="dot" />
                        <span>{isProcessing ? `Processing... ${processingProgress}%` : 'Ready'}</span>
                    </div>
                    <GlassButton
                        variant="secondary"
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        📤 Upload Document
                    </GlassButton>
                    <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </ProcessingStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Document Analytics & Metrics */}
                <LeftPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Document Analytics</h3>
                        <DocumentAnalytics>
                            <div className="analytics-section">
                                <div className="section-header">
                                    <h4>Current Document</h4>
                                    <span className="export-button">Export</span>
                                </div>
                                <div className="analytics-grid">
                                    <div className="analytics-item">
                                        <span className="label">Pages:</span>
                                        <span className="value medium">{documentMetrics.pages}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Words:</span>
                                        <span className="value medium">{documentMetrics.words}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Confidence:</span>
                                        <span className="value high">{documentMetrics.confidence}%</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Entities:</span>
                                        <span className="value medium">{documentMetrics.entities}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Tables:</span>
                                        <span className="value medium">{documentMetrics.tables}</span>
                                    </div>
                                    <div className="analytics-item">
                                        <span className="label">Signatures:</span>
                                        <span className="value medium">{documentMetrics.signatures}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-section">
                                <div className="section-header">
                                    <h4>Processing Details</h4>
                                    <span className="export-button">View Log</span>
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Processing Time:</span>
                                        <span style={{ color: '#22c55e', fontWeight: 600 }}>{documentMetrics.processingTime}</span>
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                        ✅ OCR Completed
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                        ✅ Layout Analyzed
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', fontSize: '0.8rem' }}>
                                        ✅ Entities Extracted
                                    </div>
                                </div>
                            </div>
                        </DocumentAnalytics>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Extracted Entities</h3>
                        <EntityExtraction>
                            {entities.map(entity => (
                                <div key={entity.id} className="entity-item">
                                    <div className="entity-icon">
                                        {entity.icon}
                                    </div>
                                    <div className="entity-info">
                                        <div className="entity-type">{entity.type}</div>
                                        <div className="entity-value">{entity.value}</div>
                                    </div>
                                    <div className="entity-confidence">
                                        {entity.confidence}%
                                    </div>
                                </div>
                            ))}
                        </EntityExtraction>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Performance Metrics</h3>
                        <DocumentMetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">2.3s</div>
                                <div className="metric-label">Avg Processing</div>
                                <div className="metric-trend improving">-25% faster</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">98%</div>
                                <div className="metric-label">OCR Accuracy</div>
                                <div className="metric-trend improving">+2% this week</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">1,847</div>
                                <div className="metric-label">Documents</div>
                                <div className="metric-trend stable">This month</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">15</div>
                                <div className="metric-label">Entity Types</div>
                                <div className="metric-trend stable">Supported</div>
                            </div>
                        </DocumentMetricsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Document Viewer */}
                <CenterPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Document Viewer</h3>
                        <DocumentViewer>
                            <div className="document-content">
                                <div className="document-display">
                                    {!uploadedDocument && (
                                        <div
                                            className="upload-area"
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('file-input')?.click()}
                                        >
                                            <div className="upload-icon">📄</div>
                                            <div className="upload-text">Drop document here or click to upload</div>
                                            <div className="upload-subtext">
                                                Supports PDF, DOC, DOCX, JPG, PNG files
                                            </div>
                                        </div>
                                    )}

                                    {uploadedDocument && (
                                        <div className="document-preview">
                                            <div className="document-image">
                                                {/* Document preview would go here */}
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    background: '#f8f9fa',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#666',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    📄 {uploadedDocument.name}
                                                </div>

                                                {documentAnalysis && (
                                                    <div className="ocr-overlay">
                                                        {/* OCR text regions would be overlaid here */}
                                                        <div className="text-region highlighted" style={{ top: '10%', left: '10%', width: '80%', height: '15%' }} />
                                                        <div className="text-region" style={{ top: '30%', left: '10%', width: '40%', height: '8%' }} />
                                                        <div className="text-region" style={{ top: '30%', left: '55%', width: '35%', height: '8%' }} />
                                                        <div className="text-region" style={{ top: '45%', left: '10%', width: '80%', height: '25%' }} />
                                                        <div className="text-region" style={{ top: '75%', left: '10%', width: '50%', height: '10%' }} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="analysis-panel">
                                                <div className="analysis-section">
                                                    <div className="section-title">Document Type</div>
                                                    <div>{documentAnalysis?.documentType || 'Unknown'}</div>
                                                    <div className="confidence-bar">
                                                        <div
                                                            className="confidence-fill"
                                                            style={{ width: `${documentAnalysis?.confidence || 0}%` }}
                                                        />
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                        {documentAnalysis?.confidence || 0}% confidence
                                                    </div>
                                                </div>

                                                <div className="analysis-section">
                                                    <div className="section-title">Layout Analysis</div>
                                                    <div>{documentAnalysis?.layout || 'Analyzing...'}</div>
                                                </div>

                                                <div className="analysis-section">
                                                    <div className="section-title">Language</div>
                                                    <div>{documentAnalysis?.language || 'Detecting...'}</div>
                                                </div>

                                                <div className="analysis-section">
                                                    <div className="section-title">Quality</div>
                                                    <div>{documentAnalysis?.quality || 'Assessing...'}</div>
                                                </div>

                                                {isProcessing && (
                                                    <div className="analysis-section">
                                                        <div className="section-title">Processing</div>
                                                        <div className="confidence-bar">
                                                            <div
                                                                className="confidence-fill"
                                                                style={{ width: `${processingProgress}%` }}
                                                            />
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                            {processingProgress}% complete
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DocumentViewer>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Document Processing Tools</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth>
                                🔍 Advanced OCR
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📊 Table Extraction
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ✍️ Signature Detection
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🏷️ Document Classification
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📋 Form Processing
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔗 Batch Processing
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - AI Insights & Actions */}
                <RightPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>AI Document Insights</h3>
                        <DocumentInsights>
                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Classification</span>
                                    <span className="confidence">96% confidence</span>
                                </div>
                                <div className="insight-content">
                                    Document identified as a business invoice with standard formatting. All required fields detected.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Verify</button>
                                    <button className="action-button">Export Data</button>
                                </div>
                            </div>

                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Validation</span>
                                    <span className="confidence">94% confidence</span>
                                </div>
                                <div className="insight-content">
                                    All extracted amounts and dates appear consistent. No anomalies detected in document structure.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Review Details</button>
                                    <button className="action-button">Approve</button>
                                </div>
                            </div>

                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Compliance</span>
                                    <span className="confidence">99% confidence</span>
                                </div>
                                <div className="insight-content">
                                    Document meets all regulatory requirements. No sensitive data exposure detected.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Generate Report</button>
                                    <button className="action-button">Archive</button>
                                </div>
                            </div>
                        </DocumentInsights>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Document Queue</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Processing Queue</span>
                                    <span style={{ fontSize: '0.9rem', color: '#f59e0b' }}>3 pending</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Average processing time: 2.3s
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Completed Today</span>
                                    <span style={{ fontSize: '0.9rem', color: '#22c55e' }}>47 documents</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Target: 50 documents
                                </div>
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>Error Rate</span>
                                    <span style={{ fontSize: '0.9rem', color: '#22c55e' }}>0.2%</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                    Well below 1% target
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth>
                                📤 Export Results
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                📋 Copy Extracted Data
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔄 Reprocess Document
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📊 Generate Report
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ⚙️ Processing Settings
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};

export default DocumentIntelligenceDashboard;