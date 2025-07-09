/**
 * G3D QuantumAI - Quantum Computing Simulation Dashboard
 * Advanced quantum circuit design and simulation platform
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

// Quantum Theme (Violet/Indigo quantum theme)
const quantumTheme = {
    ...baseGlassmorphismTheme,
    primary: '#7c3aed',
    secondary: '#4f46e5',
    accent: '#8b5cf6',
    glass: {
        background: 'rgba(124, 58, 237, 0.1)',
        border: 'rgba(124, 58, 237, 0.2)',
        blur: '12px'
    }
};

// Quantum Animations
const quantumOscillation = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
  25% { transform: scale(1.05) rotate(90deg); opacity: 1; }
  50% { transform: scale(0.95) rotate(180deg); opacity: 0.8; }
  75% { transform: scale(1.02) rotate(270deg); opacity: 0.9; }
`;

const entanglementGlow = keyframes`
  0%, 100% { box-shadow: 0 0 10px rgba(124, 58, 237, 0.3); }
  50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.8), 0 0 50px rgba(79, 70, 229, 0.6); }
`;

const qubitPulse = keyframes`
  0%, 100% { background: radial-gradient(circle, #7c3aed, #4f46e5); }
  50% { background: radial-gradient(circle, #8b5cf6, #7c3aed); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a23 0%, #1e1b4b 50%, #312e81 100%);
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
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${quantumOscillation} 4s infinite;
  }
`;

const QuantumStatus = styled.div`
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
    
    &.coherent {
      background: rgba(124, 58, 237, 0.2);
      color: #7c3aed;
      animation: ${entanglementGlow} 3s infinite;
    }
    
    &.decoherent {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    
    &.superposition {
      background: rgba(139, 92, 246, 0.2);
      color: #8b5cf6;
      animation: ${qubitPulse} 2s infinite;
    }
    
    .quantum-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
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

const CircuitDesigner = styled.div`
  position: relative;
  min-height: 600px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .circuit-canvas {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .quantum-circuit {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(79, 70, 229, 0.05));
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border: 2px dashed rgba(124, 58, 237, 0.3);
      
      .qubit-line {
        display: flex;
        align-items: center;
        gap: 1rem;
        height: 60px;
        background: rgba(124, 58, 237, 0.1);
        border-radius: 8px;
        padding: 0 1rem;
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          left: 60px;
          right: 20px;
          height: 2px;
          background: linear-gradient(90deg, #7c3aed, #4f46e5);
          top: 50%;
          transform: translateY(-50%);
        }
        
        .qubit-label {
          font-weight: 600;
          color: #7c3aed;
          min-width: 40px;
        }
        
        .quantum-gates {
          display: flex;
          gap: 1rem;
          position: relative;
          z-index: 2;
          
          .gate {
            width: 50px;
            height: 40px;
            background: linear-gradient(135deg, #7c3aed, #4f46e5);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            
            &:hover {
              transform: scale(1.1);
              animation: ${entanglementGlow} 1s infinite;
            }
            
            &.hadamard { background: linear-gradient(135deg, #7c3aed, #8b5cf6); }
            &.pauli-x { background: linear-gradient(135deg, #ef4444, #f87171); }
            &.pauli-y { background: linear-gradient(135deg, #22c55e, #4ade80); }
            &.pauli-z { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
            &.cnot { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
            &.phase { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
          }
        }
      }
    }
  }
`;

const GateLibrary = styled.div`
  .gate-category {
    margin-bottom: 1rem;
    
    .category-title {
      font-weight: 600;
      color: #7c3aed;
      margin-bottom: 0.5rem;
      padding: 0.5rem;
      background: rgba(124, 58, 237, 0.1);
      border-radius: 6px;
    }
    
    .gates-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      
      .gate-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(124, 58, 237, 0.2);
          transform: translateY(-2px);
        }
        
        .gate-symbol {
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.8rem;
        }
        
        .gate-name {
          font-size: 0.7rem;
          color: #a1a1aa;
          text-align: center;
        }
      }
    }
  }
`;

const SimulationResults = styled.div`
  .results-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    
    .result-section {
      background: rgba(124, 58, 237, 0.1);
      border-radius: 8px;
      padding: 1rem;
      
      .section-title {
        font-weight: 600;
        color: #7c3aed;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        .icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }
      }
      
      .quantum-state {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        .state-vector {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          
          .state-label {
            font-family: 'Monaco', monospace;
            color: #8b5cf6;
          }
          
          .amplitude {
            font-family: 'Monaco', monospace;
            color: #a1a1aa;
          }
          
          .probability {
            font-weight: 600;
            color: #7c3aed;
          }
        }
      }
      
      .measurement-outcomes {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        
        .outcome {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          
          .outcome-state {
            font-family: 'Monaco', monospace;
            color: #8b5cf6;
          }
          
          .probability-bar {
            flex: 1;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            margin: 0 0.5rem;
            overflow: hidden;
            
            .fill {
              height: 100%;
              background: linear-gradient(90deg, #7c3aed, #4f46e5);
              border-radius: 2px;
              transition: width 0.3s ease;
            }
          }
          
          .probability-value {
            font-weight: 600;
            color: #7c3aed;
            font-size: 0.8rem;
          }
        }
      }
    }
  }
`;

const AlgorithmLibrary = styled.div`
  .algorithm-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    .algorithm-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(124, 58, 237, 0.2);
        transform: translateY(-2px);
      }
      
      &.selected {
        background: rgba(124, 58, 237, 0.3);
        border: 1px solid #7c3aed;
      }
      
      .algorithm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        
        .algorithm-name {
          font-weight: 600;
          color: #7c3aed;
        }
        
        .complexity {
          font-size: 0.8rem;
          color: #a1a1aa;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }
      }
      
      .algorithm-description {
        font-size: 0.8rem;
        color: #d1d5db;
        line-height: 1.4;
      }
      
      .algorithm-qubits {
        margin-top: 0.5rem;
        font-size: 0.7rem;
        color: #8b5cf6;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        .qubit-count {
          background: rgba(124, 58, 237, 0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
        }
      }
    }
  }
`;

// Main Component
export const QuantumAIDashboard: React.FC = () => {
    // State Management
    const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
    const [quantumState, setQuantumState] = useState<'coherent' | 'decoherent' | 'superposition'>('coherent');
    const [circuitGates, setCircuitGates] = useState<any[]>([]);
    const [simulationResults, setSimulationResults] = useState<any>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    // Quantum algorithms library
    const algorithms = [
        {
            id: 'vqe',
            name: 'VQE (Variational Quantum Eigensolver)',
            description: 'Finds ground state energies of molecular systems using hybrid quantum-classical optimization.',
            complexity: 'O(n⁴)',
            qubits: '4-100',
            category: 'Chemistry'
        },
        {
            id: 'qaoa',
            name: 'QAOA (Quantum Approximate Optimization)',
            description: 'Solves combinatorial optimization problems with quantum advantage.',
            complexity: 'O(2ⁿ)',
            qubits: '10-50',
            category: 'Optimization'
        },
        {
            id: 'qft',
            name: 'Quantum Fourier Transform',
            description: 'Quantum analog of discrete Fourier transform for period finding.',
            complexity: 'O(n²)',
            qubits: '3-20',
            category: 'Transform'
        },
        {
            id: 'grover',
            name: "Grover's Search Algorithm",
            description: 'Provides quadratic speedup for unstructured search problems.',
            complexity: 'O(√N)',
            qubits: '5-30',
            category: 'Search'
        },
        {
            id: 'shor',
            name: "Shor's Factoring Algorithm",
            description: 'Factors large integers exponentially faster than classical algorithms.',
            complexity: 'O(n³)',
            qubits: '15-4000',
            category: 'Cryptography'
        }
    ];

    // Quantum gates library
    const gateCategories = [
        {
            name: 'Single Qubit',
            gates: [
                { symbol: 'H', name: 'Hadamard', description: 'Creates superposition' },
                { symbol: 'X', name: 'Pauli-X', description: 'Bit flip gate' },
                { symbol: 'Y', name: 'Pauli-Y', description: 'Bit and phase flip' },
                { symbol: 'Z', name: 'Pauli-Z', description: 'Phase flip gate' },
                { symbol: 'S', name: 'Phase', description: 'π/2 phase gate' },
                { symbol: 'T', name: 'T-gate', description: 'π/4 phase gate' }
            ]
        },
        {
            name: 'Two Qubit',
            gates: [
                { symbol: '⊕', name: 'CNOT', description: 'Controlled NOT' },
                { symbol: 'CZ', name: 'CZ', description: 'Controlled Z' },
                { symbol: 'SW', name: 'SWAP', description: 'Swap qubits' },
                { symbol: 'CU', name: 'Controlled-U', description: 'Controlled unitary' }
            ]
        },
        {
            name: 'Multi Qubit',
            gates: [
                { symbol: 'QFT', name: 'QFT', description: 'Quantum Fourier Transform' },
                { symbol: 'CCX', name: 'Toffoli', description: 'Controlled-Controlled-X' },
                { symbol: 'FRE', name: 'Fredkin', description: 'Controlled SWAP' }
            ]
        }
    ];

    // Event Handlers
    const handleRunSimulation = useCallback(async () => {
        setIsSimulating(true);
        setQuantumState('superposition');

        // Simulate quantum computation
        setTimeout(() => {
            const mockResults = {
                stateVector: [
                    { state: '|00⟩', amplitude: '0.707 + 0i', probability: 0.5 },
                    { state: '|01⟩', amplitude: '0 + 0i', probability: 0 },
                    { state: '|10⟩', amplitude: '0 + 0i', probability: 0 },
                    { state: '|11⟩', amplitude: '0.707 + 0i', probability: 0.5 }
                ],
                measurements: [
                    { state: '00', probability: 0.5 },
                    { state: '01', probability: 0.0 },
                    { state: '10', probability: 0.0 },
                    { state: '11', probability: 0.5 }
                ],
                fidelity: 0.98,
                executionTime: 1.23,
                shots: 1024
            };
            setSimulationResults(mockResults);
            setQuantumState('coherent');
            setIsSimulating(false);
        }, 3000);
    }, []);

    const handleAlgorithmSelect = useCallback((algorithmId: string) => {
        setSelectedAlgorithm(algorithmId);
        // Load pre-built circuit for selected algorithm
        console.log(`Loading ${algorithmId} circuit template`);
    }, []);

    const handleGateAdd = useCallback((gate: any) => {
        setCircuitGates(prev => [...prev, { ...gate, id: Date.now() }]);
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">⚛️</div>
                    <h1>G3D QuantumAI</h1>
                </Logo>
                <QuantumStatus>
                    <div className={`status-indicator ${quantumState}`}>
                        <div className="quantum-dot"></div>
                        <span>{quantumState === 'coherent' ? 'Coherent' : quantumState === 'superposition' ? 'Superposition' : 'Decoherent'}</span>
                    </div>
                    <GlassButton
                        variant="primary"
                        onClick={handleRunSimulation}
                        disabled={isSimulating}
                    >
                        {isSimulating ? 'Simulating...' : 'Run Simulation'}
                    </GlassButton>
                </QuantumStatus>
            </Header>

            <MainGrid>
                <LeftPanel>
                    <GlassCard size="full">
                        <h3>Quantum Gates</h3>
                        <GateLibrary>
                            {gateCategories.map(category => (
                                <div key={category.name} className="gate-category">
                                    <div className="category-title">{category.name}</div>
                                    <div className="gates-grid">
                                        {category.gates.map(gate => (
                                            <div
                                                key={gate.symbol}
                                                className="gate-item"
                                                onClick={() => handleGateAdd(gate)}
                                            >
                                                <div className="gate-symbol">{gate.symbol}</div>
                                                <div className="gate-name">{gate.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </GateLibrary>
                    </GlassCard>

                    <GlassCard size="full">
                        <h3>Algorithm Library</h3>
                        <AlgorithmLibrary>
                            <div className="algorithm-list">
                                {algorithms.map(algorithm => (
                                    <div
                                        key={algorithm.id}
                                        className={`algorithm-item ${selectedAlgorithm === algorithm.id ? 'selected' : ''}`}
                                        onClick={() => handleAlgorithmSelect(algorithm.id)}
                                    >
                                        <div className="algorithm-header">
                                            <div className="algorithm-name">{algorithm.name}</div>
                                            <div className="complexity">{algorithm.complexity}</div>
                                        </div>
                                        <div className="algorithm-description">{algorithm.description}</div>
                                        <div className="algorithm-qubits">
                                            <span>Qubits:</span>
                                            <div className="qubit-count">{algorithm.qubits}</div>
                                            <span>Category: {algorithm.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </AlgorithmLibrary>
                    </GlassCard>
                </LeftPanel>

                <CenterPanel>
                    <GlassCard size="full">
                        <h3>Quantum Circuit Designer</h3>
                        <CircuitDesigner>
                            <div className="circuit-canvas">
                                <div className="quantum-circuit">
                                    {[0, 1, 2, 3].map(qubitIndex => (
                                        <div key={qubitIndex} className="qubit-line">
                                            <div className="qubit-label">q{qubitIndex}</div>
                                            <div className="quantum-gates">
                                                <div className="gate hadamard">H</div>
                                                <div className="gate cnot">⊕</div>
                                                <div className="gate phase">S</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CircuitDesigner>
                    </GlassCard>
                </CenterPanel>

                <RightPanel>
                    <GlassCard size="full">
                        <h3>Simulation Results</h3>
                        <SimulationResults>
                            {simulationResults ? (
                                <div className="results-grid">
                                    <div className="result-section">
                                        <div className="section-title">
                                            <div className="icon">|ψ⟩</div>
                                            Quantum State Vector
                                        </div>
                                        <div className="quantum-state">
                                            {simulationResults.stateVector.map((state: any, index: number) => (
                                                <div key={index} className="state-vector">
                                                    <div className="state-label">{state.state}</div>
                                                    <div className="amplitude">{state.amplitude}</div>
                                                    <div className="probability">{(state.probability * 100).toFixed(1)}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="result-section">
                                        <div className="section-title">
                                            <div className="icon">📊</div>
                                            Measurement Outcomes
                                        </div>
                                        <div className="measurement-outcomes">
                                            {simulationResults.measurements.map((outcome: any, index: number) => (
                                                <div key={index} className="outcome">
                                                    <div className="outcome-state">{outcome.state}</div>
                                                    <div className="probability-bar">
                                                        <div
                                                            className="fill"
                                                            style={{ width: `${outcome.probability * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="probability-value">{(outcome.probability * 100).toFixed(1)}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>
                                    Run a simulation to see results
                                </div>
                            )}
                        </SimulationResults>
                    </GlassCard>

                    <GlassCard size="compact">
                        <h4>Quantum Metrics</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#7c3aed' }}>
                                    {simulationResults ? simulationResults.fidelity : '0.00'}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Fidelity</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#7c3aed' }}>
                                    {simulationResults ? `${simulationResults.executionTime}s` : '0.00s'}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Execution Time</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#7c3aed' }}>
                                    {simulationResults ? simulationResults.shots : '0'}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Shots</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#7c3aed' }}>4</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Qubits</div>
                            </div>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};