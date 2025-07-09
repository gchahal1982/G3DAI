/**
 * G3D BioAI - Bioinformatics and Drug Discovery Dashboard
 * Advanced molecular analysis and drug design platform
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    GlassCard,
    GlassButton,
    GlassInput,
    GlassModal,
    baseGlassmorphismTheme
} from '../../../../shared/ui/src/components/index';

// Bio Theme (Emerald/Teal bio theme)
const bioTheme = {
    ...baseGlassmorphismTheme,
    primary: '#059669',
    secondary: '#0891b2',
    accent: '#06b6d4',
    glass: {
        background: 'rgba(5, 150, 105, 0.1)',
        border: 'rgba(5, 150, 105, 0.2)',
        blur: '12px'
    }
};

// Bio Animations
const dnaHelix = keyframes`
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
`;

const molecularVibration = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.02) rotate(1deg); }
  50% { transform: scale(0.98) rotate(-1deg); }
  75% { transform: scale(1.01) rotate(0.5deg); }
`;

const proteinFolding = keyframes`
  0%, 100% { 
    border-radius: 50%; 
    background: linear-gradient(45deg, #059669, #0891b2);
  }
  33% { 
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; 
    background: linear-gradient(90deg, #0891b2, #06b6d4);
  }
  66% { 
    border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; 
    background: linear-gradient(135deg, #06b6d4, #059669);
  }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a1f1a 0%, #134e4a 50%, #155e63 100%);
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
    background: linear-gradient(135deg, #059669, #0891b2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #059669, #0891b2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${dnaHelix} 6s infinite linear;
  }
`;

const AnalysisStatus = styled.div`
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
      background: rgba(5, 150, 105, 0.2);
      color: #059669;
      animation: ${molecularVibration} 2s infinite;
    }
    
    &.folding {
      background: rgba(8, 145, 178, 0.2);
      color: #0891b2;
    }
    
    &.docking {
      background: rgba(6, 182, 212, 0.2);
      color: #06b6d4;
    }
    
    .molecule-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: ${proteinFolding} 3s infinite;
    }
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr 350px;
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

const MolecularViewer = styled.div`
  position: relative;
  min-height: 600px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .viewer-canvas {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .molecular-display {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(8, 145, 178, 0.05));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border: 2px dashed rgba(5, 150, 105, 0.3);
      
      .protein-structure {
        width: 300px;
        height: 300px;
        position: relative;
        
        .amino-acid {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          animation: ${molecularVibration} 3s infinite;
          
          &.hydrophobic {
            background: linear-gradient(135deg, #059669, #10b981);
          }
          
          &.hydrophilic {
            background: linear-gradient(135deg, #0891b2, #06b6d4);
          }
          
          &.charged {
            background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          }
          
          &.polar {
            background: linear-gradient(135deg, #f59e0b, #fbbf24);
          }
        }
        
        .bond {
          position: absolute;
          height: 2px;
          background: linear-gradient(90deg, #059669, #0891b2);
          transform-origin: left center;
        }
      }
      
      .molecule-info {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: rgba(0, 0, 0, 0.7);
        padding: 1rem;
        border-radius: 8px;
        
        .molecule-name {
          font-weight: 600;
          color: #059669;
          margin-bottom: 0.5rem;
        }
        
        .molecule-formula {
          font-family: 'Monaco', monospace;
          color: #0891b2;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .molecule-properties {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          
          .property {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            
            .label {
              color: #a1a1aa;
            }
            
            .value {
              color: #06b6d4;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
`;

const DrugDesignStudio = styled.div`
  .design-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    .tab {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
      
      &.active {
        background: rgba(5, 150, 105, 0.2);
        color: #059669;
      }
      
      &:not(.active) {
        background: rgba(255, 255, 255, 0.05);
        color: #a1a1aa;
        
        &:hover {
          background: rgba(5, 150, 105, 0.1);
          color: #10b981;
        }
      }
    }
  }
  
  .design-workspace {
    min-height: 400px;
    background: rgba(5, 150, 105, 0.05);
    border-radius: 8px;
    padding: 1rem;
    
    .compound-library {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      
      .compound-card {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(5, 150, 105, 0.2);
          transform: translateY(-2px);
        }
        
        .compound-structure {
          width: 100%;
          height: 80px;
          background: linear-gradient(135deg, #059669, #0891b2);
          border-radius: 6px;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }
        
        .compound-info {
          .compound-id {
            font-weight: 600;
            color: #059669;
            margin-bottom: 0.25rem;
          }
          
          .compound-activity {
            font-size: 0.8rem;
            color: #a1a1aa;
          }
        }
      }
    }
    
    .docking-interface {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      
      .target-selection {
        .target-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          
          .target-item {
            padding: 0.75rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              background: rgba(5, 150, 105, 0.2);
            }
            
            &.selected {
              background: rgba(5, 150, 105, 0.3);
              border: 1px solid #059669;
            }
            
            .target-name {
              font-weight: 600;
              color: #059669;
              margin-bottom: 0.25rem;
            }
            
            .target-type {
              font-size: 0.8rem;
              color: #a1a1aa;
            }
          }
        }
      }
      
      .ligand-selection {
        .ligand-upload {
          border: 2px dashed rgba(5, 150, 105, 0.3);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            border-color: #059669;
            background: rgba(5, 150, 105, 0.05);
          }
          
          .upload-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #059669;
          }
          
          .upload-text {
            color: #a1a1aa;
          }
        }
      }
    }
  }
`;

const SequenceAnalyzer = styled.div`
  .sequence-input {
    margin-bottom: 1rem;
    
    .sequence-textarea {
      width: 100%;
      min-height: 120px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(5, 150, 105, 0.3);
      border-radius: 8px;
      padding: 1rem;
      color: white;
      font-family: 'Monaco', monospace;
      font-size: 0.9rem;
      resize: vertical;
      
      &:focus {
        outline: none;
        border-color: #059669;
        box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.2);
      }
      
      &::placeholder {
        color: #6b7280;
      }
    }
  }
  
  .analysis-results {
    .result-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
      
      .metric-card {
        background: rgba(5, 150, 105, 0.1);
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        
        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #059669;
          margin-bottom: 0.25rem;
        }
        
        .metric-label {
          font-size: 0.8rem;
          color: #a1a1aa;
        }
      }
    }
    
    .sequence-visualization {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 1rem;
      
      .sequence-display {
        font-family: 'Monaco', monospace;
        font-size: 0.8rem;
        line-height: 1.6;
        color: #d1d5db;
        word-break: break-all;
        
        .nucleotide {
          padding: 2px 4px;
          margin: 1px;
          border-radius: 3px;
          
          &.a { background: rgba(239, 68, 68, 0.3); color: #fca5a5; }
          &.t { background: rgba(34, 197, 94, 0.3); color: #86efac; }
          &.g { background: rgba(59, 130, 246, 0.3); color: #93c5fd; }
          &.c { background: rgba(245, 158, 11, 0.3); color: #fcd34d; }
        }
        
        .amino-acid {
          padding: 2px 4px;
          margin: 1px;
          border-radius: 3px;
          
          &.hydrophobic { background: rgba(5, 150, 105, 0.3); color: #6ee7b7; }
          &.hydrophilic { background: rgba(8, 145, 178, 0.3); color: #7dd3fc; }
          &.charged { background: rgba(124, 58, 237, 0.3); color: #c4b5fd; }
          &.polar { background: rgba(245, 158, 11, 0.3); color: #fcd34d; }
        }
      }
    }
  }
`;

const DatabaseBrowser = styled.div`
  .database-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    
    .db-tab {
      padding: 0.5rem 1rem;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.8rem;
      font-weight: 600;
      
      &.active {
        background: rgba(5, 150, 105, 0.2);
        color: #059669;
      }
      
      &:not(.active) {
        background: rgba(255, 255, 255, 0.05);
        color: #a1a1aa;
        
        &:hover {
          background: rgba(5, 150, 105, 0.1);
        }
      }
    }
  }
  
  .database-content {
    .search-bar {
      margin-bottom: 1rem;
      
      .search-input {
        width: 100%;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(5, 150, 105, 0.3);
        border-radius: 8px;
        color: white;
        
        &:focus {
          outline: none;
          border-color: #059669;
        }
        
        &::placeholder {
          color: #6b7280;
        }
      }
    }
    
    .database-results {
      max-height: 400px;
      overflow-y: auto;
      
      .result-item {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-bottom: 0.75rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(5, 150, 105, 0.1);
        }
        
        .result-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 0.5rem;
          
          .result-id {
            font-weight: 600;
            color: #059669;
          }
          
          .result-score {
            font-size: 0.8rem;
            color: #06b6d4;
            background: rgba(6, 182, 212, 0.2);
            padding: 0.25rem 0.5rem;
            border-radius: 10px;
          }
        }
        
        .result-description {
          font-size: 0.8rem;
          color: #d1d5db;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }
        
        .result-metadata {
          display: flex;
          gap: 1rem;
          font-size: 0.7rem;
          color: #a1a1aa;
          
          .metadata-item {
            display: flex;
            gap: 0.25rem;
            
            .label {
              font-weight: 600;
            }
          }
        }
      }
    }
  }
`;

// Main Component
export const BioAIDashboard: React.FC = () => {
    // State Management
    const [activeDesignTab, setActiveDesignTab] = useState<string>('library');
    const [activeDatabaseTab, setActiveDatabaseTab] = useState<string>('pdb');
    const [analysisStatus, setAnalysisStatus] = useState<'analyzing' | 'folding' | 'docking'>('analyzing');
    const [selectedTarget, setSelectedTarget] = useState<string>('');
    const [sequenceInput, setSequenceInput] = useState<string>('');
    const [analysisResults, setAnalysisResults] = useState<any>(null);

    // Sample data
    const drugTargets = [
        { id: 'egfr', name: 'EGFR Kinase', type: 'Protein Kinase', pdbId: '1M17' },
        { id: 'ace2', name: 'ACE2 Receptor', type: 'Peptidase', pdbId: '6M0J' },
        { id: 'spike', name: 'SARS-CoV-2 Spike', type: 'Viral Protein', pdbId: '6VXX' },
        { id: 'bcl2', name: 'BCL-2 Protein', type: 'Anti-apoptotic', pdbId: '2XA0' }
    ];

    const compoundLibrary = [
        { id: 'ZINC001', name: 'Aspirin', activity: 'Anti-inflammatory', ic50: '1.2 μM' },
        { id: 'ZINC002', name: 'Imatinib', activity: 'Kinase Inhibitor', ic50: '0.6 μM' },
        { id: 'ZINC003', name: 'Remdesivir', activity: 'Antiviral', ic50: '0.77 μM' },
        { id: 'ZINC004', name: 'Dexamethasone', activity: 'Corticosteroid', ic50: '2.1 μM' },
        { id: 'ZINC005', name: 'Hydroxychloroquine', activity: 'Antimalarial', ic50: '4.5 μM' },
        { id: 'ZINC006', name: 'Tocilizumab', activity: 'IL-6 Inhibitor', ic50: '0.3 μM' }
    ];

    // Event Handlers
    const handleSequenceAnalysis = useCallback(async () => {
        if (!sequenceInput.trim()) return;

        setAnalysisStatus('analyzing');

        // Simulate sequence analysis
        setTimeout(() => {
            const mockResults = {
                length: sequenceInput.replace(/\s/g, '').length,
                gcContent: Math.random() * 100,
                openReadingFrames: Math.floor(Math.random() * 10) + 1,
                domains: Math.floor(Math.random() * 5) + 1,
                secondaryStructure: {
                    alphaHelix: Math.random() * 40,
                    betaSheet: Math.random() * 30,
                    randomCoil: Math.random() * 30
                }
            };
            setAnalysisResults(mockResults);
            setAnalysisStatus('folding');
        }, 2000);
    }, [sequenceInput]);

    const handleMolecularDocking = useCallback(async () => {
        if (!selectedTarget) return;

        setAnalysisStatus('docking');

        // Simulate molecular docking
        setTimeout(() => {
            console.log(`Docking completed for target: ${selectedTarget}`);
            setAnalysisStatus('analyzing');
        }, 3000);
    }, [selectedTarget]);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">🧬</div>
                    <h1>G3D BioAI</h1>
                </Logo>
                <AnalysisStatus>
                    <div className={`status-indicator ${analysisStatus}`}>
                        <div className="molecule-dot"></div>
                        <span>{analysisStatus === 'analyzing' ? 'Analyzing' : analysisStatus === 'folding' ? 'Protein Folding' : 'Molecular Docking'}</span>
                    </div>
                    <GlassButton
                        variant="primary"
                        onClick={handleMolecularDocking}
                        disabled={!selectedTarget}
                    >
                        Start Docking
                    </GlassButton>
                </AnalysisStatus>
            </Header>

            <MainGrid>
                <LeftPanel>
                    <GlassCard size="full">
                        <h3>Sequence Analyzer</h3>
                        <SequenceAnalyzer>
                            <div className="sequence-input">
                                <textarea
                                    className="sequence-textarea"
                                    placeholder="Enter DNA, RNA, or protein sequence..."
                                    value={sequenceInput}
                                    onChange={(e) => setSequenceInput(e.target.value)}
                                />
                                <GlassButton
                                    variant="primary"
                                    onClick={handleSequenceAnalysis}
                                    style={{ width: '100%', marginTop: '0.5rem' }}
                                >
                                    Analyze Sequence
                                </GlassButton>
                            </div>

                            {analysisResults && (
                                <div className="analysis-results">
                                    <div className="result-grid">
                                        <div className="metric-card">
                                            <div className="metric-value">{analysisResults.length}</div>
                                            <div className="metric-label">Length</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value">{analysisResults.gcContent.toFixed(1)}%</div>
                                            <div className="metric-label">GC Content</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value">{analysisResults.openReadingFrames}</div>
                                            <div className="metric-label">ORFs</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value">{analysisResults.domains}</div>
                                            <div className="metric-label">Domains</div>
                                        </div>
                                    </div>

                                    <div className="sequence-visualization">
                                        <div className="sequence-display">
                                            {sequenceInput.split('').map((char, index) => {
                                                if (/[ATGC]/i.test(char)) {
                                                    return <span key={index} className={`nucleotide ${char.toLowerCase()}`}>{char}</span>;
                                                } else if (/[ACDEFGHIKLMNPQRSTVWY]/i.test(char)) {
                                                    const type = ['hydrophobic', 'hydrophilic', 'charged', 'polar'][Math.floor(Math.random() * 4)];
                                                    return <span key={index} className={`amino-acid ${type}`}>{char}</span>;
                                                }
                                                return char;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SequenceAnalyzer>
                    </GlassCard>

                    <GlassCard size="full">
                        <h3>Database Browser</h3>
                        <DatabaseBrowser>
                            <div className="database-tabs">
                                {['pdb', 'uniprot', 'chembl', 'pubchem'].map(db => (
                                    <div
                                        key={db}
                                        className={`db-tab ${activeDatabaseTab === db ? 'active' : ''}`}
                                        onClick={() => setActiveDatabaseTab(db)}
                                    >
                                        {db.toUpperCase()}
                                    </div>
                                ))}
                            </div>

                            <div className="database-content">
                                <div className="search-bar">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder={`Search ${activeDatabaseTab.toUpperCase()}...`}
                                    />
                                </div>

                                <div className="database-results">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="result-item">
                                            <div className="result-header">
                                                <div className="result-id">{activeDatabaseTab.toUpperCase()}{String(i).padStart(4, '0')}</div>
                                                <div className="result-score">95.{i}%</div>
                                            </div>
                                            <div className="result-description">
                                                Sample protein structure with high resolution crystal structure data...
                                            </div>
                                            <div className="result-metadata">
                                                <div className="metadata-item">
                                                    <span className="label">Resolution:</span>
                                                    <span>1.{i}Å</span>
                                                </div>
                                                <div className="metadata-item">
                                                    <span className="label">Method:</span>
                                                    <span>X-ray</span>
                                                </div>
                                                <div className="metadata-item">
                                                    <span className="label">Year:</span>
                                                    <span>202{i}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DatabaseBrowser>
                    </GlassCard>
                </LeftPanel>

                <CenterPanel>
                    <GlassCard size="full">
                        <h3>3D Molecular Viewer</h3>
                        <MolecularViewer>
                            <div className="viewer-canvas">
                                <div className="molecular-display">
                                    <div className="protein-structure">
                                        {/* Simulated protein structure */}
                                        {Array.from({ length: 20 }, (_, i) => (
                                            <div
                                                key={i}
                                                className={`amino-acid ${['hydrophobic', 'hydrophilic', 'charged', 'polar'][i % 4]}`}
                                                style={{
                                                    left: `${50 + 30 * Math.cos(i * 0.5)}%`,
                                                    top: `${50 + 30 * Math.sin(i * 0.5)}%`,
                                                    animationDelay: `${i * 0.1}s`
                                                }}
                                            />
                                        ))}

                                        {/* Bonds */}
                                        {Array.from({ length: 15 }, (_, i) => (
                                            <div
                                                key={i}
                                                className="bond"
                                                style={{
                                                    left: `${50 + 25 * Math.cos(i * 0.4)}%`,
                                                    top: `${50 + 25 * Math.sin(i * 0.4)}%`,
                                                    width: `${20 + Math.random() * 20}px`,
                                                    transform: `rotate(${i * 24}deg)`
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="molecule-info">
                                        <div className="molecule-name">EGFR Kinase Domain</div>
                                        <div className="molecule-formula">C₁₂₈₂H₂₀₃₆N₃₆₂O₃₉₀S₈</div>
                                        <div className="molecule-properties">
                                            <div className="property">
                                                <span className="label">MW:</span>
                                                <span className="value">28.9 kDa</span>
                                            </div>
                                            <div className="property">
                                                <span className="label">pI:</span>
                                                <span className="value">6.24</span>
                                            </div>
                                            <div className="property">
                                                <span className="label">Residues:</span>
                                                <span className="value">267</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MolecularViewer>
                    </GlassCard>
                </CenterPanel>

                <RightPanel>
                    <GlassCard size="full">
                        <h3>Drug Design Studio</h3>
                        <DrugDesignStudio>
                            <div className="design-tabs">
                                {[
                                    { id: 'library', label: 'Compound Library' },
                                    { id: 'docking', label: 'Molecular Docking' },
                                    { id: 'admet', label: 'ADMET Prediction' }
                                ].map(tab => (
                                    <div
                                        key={tab.id}
                                        className={`tab ${activeDesignTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveDesignTab(tab.id)}
                                    >
                                        {tab.label}
                                    </div>
                                ))}
                            </div>

                            <div className="design-workspace">
                                {activeDesignTab === 'library' && (
                                    <div className="compound-library">
                                        {compoundLibrary.map(compound => (
                                            <div key={compound.id} className="compound-card">
                                                <div className="compound-structure">
                                                    {compound.name.substring(0, 3).toUpperCase()}
                                                </div>
                                                <div className="compound-info">
                                                    <div className="compound-id">{compound.id}</div>
                                                    <div className="compound-activity">{compound.activity}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeDesignTab === 'docking' && (
                                    <div className="docking-interface">
                                        <div className="target-selection">
                                            <h4>Select Target</h4>
                                            <div className="target-list">
                                                {drugTargets.map(target => (
                                                    <div
                                                        key={target.id}
                                                        className={`target-item ${selectedTarget === target.id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedTarget(target.id)}
                                                    >
                                                        <div className="target-name">{target.name}</div>
                                                        <div className="target-type">{target.type}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="ligand-selection">
                                            <h4>Upload Ligand</h4>
                                            <div className="ligand-upload">
                                                <div className="upload-icon">📁</div>
                                                <div className="upload-text">Drop SDF/MOL files here</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeDesignTab === 'admet' && (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>
                                        ADMET prediction interface coming soon...
                                    </div>
                                )}
                            </div>
                        </DrugDesignStudio>
                    </GlassCard>

                    <GlassCard size="compact">
                        <h4>Analysis Metrics</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                                    {analysisResults ? analysisResults.length : '0'}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Sequence Length</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                                    {analysisResults ? `${analysisResults.gcContent.toFixed(1)}%` : '0%'}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>GC Content</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                                    {drugTargets.length}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Drug Targets</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                                    {compoundLibrary.length}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Compounds</div>
                            </div>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};