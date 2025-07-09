/**
 * G3D LegalAI - Legal Assistant Dashboard
 * Complete legal AI platform with contract analysis, research, and compliance monitoring
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// LegalAI Theme (Legal navy/gold theme)
const legalaiTheme = {
    primary: '#1e40af',
    secondary: '#1e3a8a',
    accent: '#fbbf24',
    glass: {
        background: 'rgba(30, 64, 175, 0.1)',
        border: 'rgba(30, 64, 175, 0.2)',
        blur: '12px'
    }
};

// Animations
const legalScan = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const compliancePulse = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(30, 64, 175, 0.3); }
  50% { box-shadow: 0 0 20px rgba(30, 64, 175, 0.8); }
`;

const documentFlow = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

const gavel = keyframes`
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
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
    background: linear-gradient(135deg, #1e40af, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #1e40af, #fbbf24);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${gavel} 3s infinite;
  }
`;

const LegalStatus = styled.div`
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
    
    &.analyzing {
      background: rgba(30, 64, 175, 0.2);
      color: #1e40af;
      animation: ${compliancePulse} 2s infinite;
    }
    
    &.compliant {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    
    &.review-needed {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
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
  border: 1px solid rgba(30, 64, 175, 0.2);
  border-radius: 12px;
  padding: ${props =>
        props.size === 'sm' ? '1rem' :
            props.size === 'lg' ? '2rem' : '1.5rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const DocumentAnalyzer = styled.div`
  position: relative;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(30, 64, 175, 0.3);
  
  .analyzer-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .document-display {
      width: 100%;
      height: 350px;
      background: linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(30, 58, 138, 0.1));
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(30, 64, 175, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #1e40af, transparent);
        animation: ${legalScan} 4s infinite;
      }
      
      .upload-area {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px dashed rgba(30, 64, 175, 0.5);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #1e40af;
          background: rgba(30, 64, 175, 0.05);
        }
        
        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #1e40af;
          animation: ${documentFlow} 3s infinite;
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
        
        .document-content {
          flex: 1;
          background: white;
          border-radius: 8px;
          margin: 1rem;
          position: relative;
          overflow: hidden;
          color: #333;
          padding: 1rem;
          
          .legal-highlights {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            
            .highlight-region {
              position: absolute;
              border: 2px solid rgba(30, 64, 175, 0.8);
              background: rgba(30, 64, 175, 0.1);
              border-radius: 4px;
              
              &.clause { border-color: #1e40af; }
              &.risk { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
              &.opportunity { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
            }
          }
        }
        
        .analysis-sidebar {
          width: 250px;
          background: rgba(0, 0, 0, 0.5);
          padding: 1rem;
          overflow-y: auto;
          
          .analysis-section {
            margin-bottom: 1.5rem;
            
            .section-title {
              font-weight: 600;
              color: #1e40af;
              margin-bottom: 0.75rem;
              font-size: 0.9rem;
            }
            
            .risk-meter {
              width: 100%;
              height: 8px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 4px;
              margin-bottom: 0.5rem;
              overflow: hidden;
              
              .risk-fill {
                height: 100%;
                border-radius: 4px;
                transition: width 0.3s ease;
                
                &.low { background: linear-gradient(90deg, #22c55e, #16a34a); }
                &.medium { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
                &.high { background: linear-gradient(90deg, #ef4444, #dc2626); }
              }
            }
          }
        }
      }
    }
  }
`;

const LegalResearch = styled.div`
  .research-query {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    
    .query-input {
      flex: 1;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(30, 64, 175, 0.3);
      border-radius: 8px;
      color: white;
      font-size: 0.9rem;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
      
      &:focus {
        outline: none;
        border-color: #1e40af;
        background: rgba(255, 255, 255, 0.15);
      }
    }
    
    .search-button {
      padding: 0.75rem 1.5rem;
      background: rgba(30, 64, 175, 0.2);
      border: 1px solid rgba(30, 64, 175, 0.3);
      border-radius: 8px;
      color: #1e40af;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(30, 64, 175, 0.3);
      }
    }
  }
  
  .research-results {
    .result-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin-bottom: 0.75rem;
      border-left: 4px solid #1e40af;
      
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        
        .case-title {
          font-weight: 600;
          color: #1e40af;
        }
        
        .relevance-score {
          background: rgba(30, 64, 175, 0.2);
          color: #1e40af;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
        }
      }
      
      .result-content {
        font-size: 0.9rem;
        line-height: 1.4;
        margin-bottom: 0.75rem;
      }
      
      .result-metadata {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        opacity: 0.7;
        
        .metadata-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
  }
`;

const ContractAnalysis = styled.div`
  .contract-item {
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
      background: rgba(30, 64, 175, 0.1);
      transform: translateX(4px);
    }
    
    .contract-icon {
      width: 45px;
      height: 45px;
      background: linear-gradient(135deg, rgba(30, 64, 175, 0.3), rgba(30, 58, 138, 0.3));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      color: #1e40af;
      animation: ${documentFlow} 4s infinite;
    }
    
    .contract-info {
      flex: 1;
      
      .contract-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: #1e40af;
      }
      
      .contract-details {
        font-size: 0.8rem;
        opacity: 0.7;
        display: flex;
        gap: 1rem;
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
    
    .contract-status {
      display: flex;
      flex-direction: column;
      align-items: end;
      gap: 0.25rem;
      
      .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        
        &.compliant {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }
        
        &.review {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
        }
        
        &.risk {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
      }
      
      .risk-score {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
  }
`;

const ComplianceMonitoring = styled.div`
  .compliance-section {
    margin-bottom: 1.5rem;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        font-size: 1rem;
        color: #1e40af;
      }
      
      .compliance-score {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
      }
    }
    
    .compliance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      margin-bottom: 0.5rem;
      
      .compliance-label {
        font-size: 0.9rem;
        opacity: 0.8;
      }
      
      .compliance-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          
          &.compliant { background: #22c55e; }
          &.warning { background: #fbbf24; }
          &.violation { background: #ef4444; }
        }
        
        .status-text {
          font-size: 0.8rem;
          font-weight: 600;
          
          &.compliant { color: #22c55e; }
          &.warning { color: #fbbf24; }
          &.violation { color: #ef4444; }
        }
      }
    }
  }
`;

const LegalInsights = styled.div`
  .insight-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #1e40af;
    
    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .insight-type {
        background: rgba(30, 64, 175, 0.2);
        color: #1e40af;
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
        background: rgba(30, 64, 175, 0.2);
        border: 1px solid rgba(30, 64, 175, 0.3);
        border-radius: 6px;
        color: #1e40af;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(30, 64, 175, 0.3);
        }
      }
    }
  }
`;

const GlassButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost'; fullWidth?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(30, 64, 175, 0.3);
  background: ${props =>
        props.variant === 'primary' ? 'rgba(30, 64, 175, 0.2)' :
            props.variant === 'secondary' ? 'rgba(30, 58, 138, 0.2)' :
                'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:hover {
    background: ${props =>
        props.variant === 'primary' ? 'rgba(30, 64, 175, 0.3)' :
            props.variant === 'secondary' ? 'rgba(30, 58, 138, 0.3)' :
                'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

// Main Component
export const LegalAIAssistantDashboard: React.FC = () => {
    // State Management
    const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [legalStatus, setLegalStatus] = useState('compliant');

    // Sample contract data
    const contracts = [
        {
            id: 'contract-001',
            name: 'Software License Agreement',
            type: 'License',
            status: 'compliant',
            riskScore: 'Low',
            lastReview: '2 days ago',
            icon: '📄'
        },
        {
            id: 'contract-002',
            name: 'Employment Contract - Senior Dev',
            type: 'Employment',
            status: 'review',
            riskScore: 'Medium',
            lastReview: '5 days ago',
            icon: '👔'
        },
        {
            id: 'contract-003',
            name: 'Vendor Service Agreement',
            type: 'Service',
            status: 'risk',
            riskScore: 'High',
            lastReview: '10 days ago',
            icon: '🤝'
        },
        {
            id: 'contract-004',
            name: 'Data Processing Agreement',
            type: 'Privacy',
            status: 'compliant',
            riskScore: 'Low',
            lastReview: '1 day ago',
            icon: '🔒'
        }
    ];

    // Sample research results
    const researchResults = [
        {
            id: 'case-001',
            title: 'Smith v. Jones Software Solutions',
            relevance: 95,
            content: 'Landmark case establishing precedent for software licensing disputes and intellectual property rights in SaaS agreements.',
            court: 'Federal Circuit',
            year: '2023',
            citations: 47
        },
        {
            id: 'case-002',
            title: 'Tech Corp v. Data Privacy Board',
            relevance: 88,
            content: 'Important ruling on GDPR compliance requirements for international data processing agreements.',
            court: 'Supreme Court',
            year: '2022',
            citations: 156
        },
        {
            id: 'case-003',
            title: 'Employment Rights Coalition v. BigTech',
            relevance: 82,
            content: 'Significant decision regarding non-compete clauses and employee mobility in technology sector.',
            court: 'Appeals Court',
            year: '2023',
            citations: 89
        }
    ];

    // Event Handlers
    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadedDocument(file);
        setIsAnalyzing(true);
        setAnalysisProgress(0);

        try {
            // Simulate legal analysis
            const stages = [25, 50, 75, 100];
            for (const progress of stages) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setAnalysisProgress(progress);
            }
        } catch (error) {
            console.error('Legal analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const handleSearch = useCallback(() => {
        console.log('Searching legal database for:', searchQuery);
    }, [searchQuery]);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            setUploadedDocument(file);
        }
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">⚖️</div>
                    <h1>G3D LegalAI Assistant</h1>
                </Logo>
                <LegalStatus>
                    <div className={`status-indicator ${legalStatus}`}>
                        <div className="dot" />
                        <span>{legalStatus === 'analyzing' ? 'Analyzing' : legalStatus === 'compliant' ? 'Compliant' : 'Review Needed'}</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        4 contracts monitored
                    </span>
                    <GlassButton
                        variant="primary"
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        📤 Upload Document
                    </GlassButton>
                    <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </LegalStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Contract Analysis */}
                <LeftPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Contract Analysis</h3>
                        <ContractAnalysis>
                            {contracts.map(contract => (
                                <div key={contract.id} className="contract-item">
                                    <div className="contract-icon">
                                        {contract.icon}
                                    </div>
                                    <div className="contract-info">
                                        <div className="contract-name">{contract.name}</div>
                                        <div className="contract-details">
                                            <div className="detail-item">
                                                <span>📋</span>
                                                <span>{contract.type}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span>⏰</span>
                                                <span>{contract.lastReview}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="contract-status">
                                        <div className={`status-badge ${contract.status}`}>
                                            {contract.status === 'compliant' ? 'Compliant' :
                                                contract.status === 'review' ? 'Review' : 'Risk'}
                                        </div>
                                        <div className="risk-score">{contract.riskScore} Risk</div>
                                    </div>
                                </div>
                            ))}
                        </ContractAnalysis>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Legal Research</h3>
                        <LegalResearch>
                            <div className="research-query">
                                <input
                                    type="text"
                                    className="query-input"
                                    placeholder="Search legal precedents, cases, regulations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button className="search-button" onClick={handleSearch}>
                                    🔍 Search
                                </button>
                            </div>

                            <div className="research-results">
                                {researchResults.map(result => (
                                    <div key={result.id} className="result-item">
                                        <div className="result-header">
                                            <span className="case-title">{result.title}</span>
                                            <span className="relevance-score">{result.relevance}% match</span>
                                        </div>
                                        <div className="result-content">
                                            {result.content}
                                        </div>
                                        <div className="result-metadata">
                                            <div className="metadata-item">
                                                <span>🏛️</span>
                                                <span>{result.court}</span>
                                            </div>
                                            <div className="metadata-item">
                                                <span>📅</span>
                                                <span>{result.year}</span>
                                            </div>
                                            <div className="metadata-item">
                                                <span>📊</span>
                                                <span>{result.citations} citations</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </LegalResearch>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Document Analyzer */}
                <CenterPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Document Analyzer</h3>
                        <DocumentAnalyzer>
                            <div className="analyzer-content">
                                <div className="document-display">
                                    {!uploadedDocument && (
                                        <div
                                            className="upload-area"
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('file-input')?.click()}
                                        >
                                            <div className="upload-icon">📄</div>
                                            <div className="upload-text">Drop legal document here or click to upload</div>
                                            <div className="upload-subtext">
                                                Supports PDF, DOC, DOCX, TXT files
                                            </div>
                                        </div>
                                    )}

                                    {uploadedDocument && (
                                        <div className="document-preview">
                                            <div className="document-content">
                                                <div style={{
                                                    padding: '1rem',
                                                    fontSize: '0.9rem',
                                                    lineHeight: '1.6'
                                                }}>
                                                    <h4 style={{ color: '#1e40af', marginTop: 0 }}>
                                                        📄 {uploadedDocument.name}
                                                    </h4>
                                                    <p>
                                                        <strong>TERMS AND CONDITIONS</strong><br />
                                                        This Software License Agreement ("Agreement") is entered into between...
                                                    </p>
                                                    <p>
                                                        1. <strong>Grant of License:</strong> Subject to the terms and conditions of this Agreement,
                                                        Licensor hereby grants to Licensee a non-exclusive, non-transferable license...
                                                    </p>
                                                    <p>
                                                        2. <strong>Restrictions:</strong> Licensee shall not modify, reverse engineer,
                                                        decompile, or disassemble the Software...
                                                    </p>
                                                </div>

                                                <div className="legal-highlights">
                                                    <div className="highlight-region clause" style={{ top: '15%', left: '10%', width: '80%', height: '8%' }} />
                                                    <div className="highlight-region risk" style={{ top: '35%', left: '10%', width: '70%', height: '6%' }} />
                                                    <div className="highlight-region opportunity" style={{ top: '55%', left: '10%', width: '75%', height: '10%' }} />
                                                </div>
                                            </div>

                                            <div className="analysis-sidebar">
                                                <div className="analysis-section">
                                                    <div className="section-title">Risk Assessment</div>
                                                    <div className="risk-meter">
                                                        <div className="risk-fill medium" style={{ width: '65%' }} />
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                        Medium Risk (65%)
                                                    </div>
                                                </div>

                                                <div className="analysis-section">
                                                    <div className="section-title">Key Clauses</div>
                                                    <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                                        • Liability Limitation
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                                        • Termination Rights
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                                        • Intellectual Property
                                                    </div>
                                                </div>

                                                <div className="analysis-section">
                                                    <div className="section-title">Compliance</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#22c55e' }}>
                                                        ✅ GDPR Compliant
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                                                        ⚠️ Review IP Clause
                                                    </div>
                                                </div>

                                                {isAnalyzing && (
                                                    <div className="analysis-section">
                                                        <div className="section-title">Analyzing</div>
                                                        <div className="risk-meter">
                                                            <div
                                                                className="risk-fill low"
                                                                style={{ width: `${analysisProgress}%` }}
                                                            />
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                            {analysisProgress}% complete
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DocumentAnalyzer>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Legal Tools</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth>
                                📋 Contract Review
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔍 Due Diligence
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ⚖️ Risk Analysis
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📊 Compliance Check
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📝 Document Draft
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔗 Clause Library
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📈 Legal Analytics
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🎯 AI Insights
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Compliance & Insights */}
                <RightPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Compliance Monitoring</h3>
                        <ComplianceMonitoring>
                            <div className="compliance-section">
                                <div className="section-header">
                                    <h4>GDPR Compliance</h4>
                                    <span className="compliance-score">98%</span>
                                </div>
                                <div className="compliance-item">
                                    <span className="compliance-label">Data Processing</span>
                                    <div className="compliance-status">
                                        <div className="status-indicator compliant" />
                                        <span className="status-text compliant">Compliant</span>
                                    </div>
                                </div>
                                <div className="compliance-item">
                                    <span className="compliance-label">Consent Management</span>
                                    <div className="compliance-status">
                                        <div className="status-indicator compliant" />
                                        <span className="status-text compliant">Compliant</span>
                                    </div>
                                </div>
                                <div className="compliance-item">
                                    <span className="compliance-label">Data Retention</span>
                                    <div className="compliance-status">
                                        <div className="status-indicator warning" />
                                        <span className="status-text warning">Review</span>
                                    </div>
                                </div>
                            </div>

                            <div className="compliance-section">
                                <div className="section-header">
                                    <h4>Contract Compliance</h4>
                                    <span className="compliance-score">92%</span>
                                </div>
                                <div className="compliance-item">
                                    <span className="compliance-label">SLA Requirements</span>
                                    <div className="compliance-status">
                                        <div className="status-indicator compliant" />
                                        <span className="status-text compliant">Met</span>
                                    </div>
                                </div>
                                <div className="compliance-item">
                                    <span className="compliance-label">Payment Terms</span>
                                    <div className="compliance-status">
                                        <div className="status-indicator compliant" />
                                        <span className="status-text compliant">Current</span>
                                    </div>
                                </div>
                                <div className="compliance-item">
                                    <span className="compliance-label">Renewal Dates</span>
                                    <div className="compliance-status">
                                        <div className="status-indicator warning" />
                                        <span className="status-text warning">Due Soon</span>
                                    </div>
                                </div>
                            </div>
                        </ComplianceMonitoring>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Legal Insights</h3>
                        <LegalInsights>
                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Risk Alert</span>
                                    <span className="confidence">High confidence</span>
                                </div>
                                <div className="insight-content">
                                    Vendor Service Agreement contains broad liability waiver that may expose company to significant risk.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Review</button>
                                    <button className="action-button">Negotiate</button>
                                </div>
                            </div>

                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Opportunity</span>
                                    <span className="confidence">Medium confidence</span>
                                </div>
                                <div className="insight-content">
                                    Employment contract renewal approaching. Consider updating IP assignment clauses based on recent case law.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Schedule</button>
                                    <button className="action-button">Research</button>
                                </div>
                            </div>

                            <div className="insight-item">
                                <div className="insight-header">
                                    <span className="insight-type">Compliance</span>
                                    <span className="confidence">High confidence</span>
                                </div>
                                <div className="insight-content">
                                    New privacy regulation effective next month may require updates to data processing agreements.
                                </div>
                                <div className="insight-actions">
                                    <button className="action-button">Update</button>
                                    <button className="action-button">Notify</button>
                                </div>
                            </div>
                        </LegalInsights>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth>
                                📊 Generate Report
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                📅 Schedule Review
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔔 Set Alerts
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📤 Export Analysis
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ⚙️ Legal Settings
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};

export default LegalAIAssistantDashboard;