/**
 * G3D FinanceAI - Financial Analysis Dashboard
 * Complete financial intelligence platform with real-time market analysis and compliance
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    MarketData,
    PortfolioAnalysis,
    RiskAssessment,
    FinancialRecommendation,
    ComplianceStatus,
    TradingSignal,
    FinancialMetrics
} from '../types/finance.types';
import { FinancialAnalysisEngine } from '../services/FinancialAnalysisEngine';

// FinanceAI Theme (Financial gold/green theme)
const financeaiTheme = {
    primary: '#d97706',
    secondary: '#059669',
    accent: '#0891b2',
    glass: {
        background: 'rgba(217, 119, 6, 0.1)',
        border: 'rgba(217, 119, 6, 0.2)',
        blur: '12px'
    }
};

// Animations
const marketPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const priceFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

const profitGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.3); }
  50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%);
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
    background: linear-gradient(135deg, #d97706, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #d97706, #059669);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    animation: ${marketPulse} 3s infinite;
  }
`;

const MarketStatus = styled.div`
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
    
    &.bull {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
      animation: ${profitGlow} 2s infinite;
    }
    
    &.bear {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    
    &.neutral {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
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
  border: 1px solid rgba(217, 119, 6, 0.2);
  border-radius: 12px;
  padding: ${props =>
        props.size === 'sm' ? '1rem' :
            props.size === 'lg' ? '2rem' : '1.5rem'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const MarketOverview = styled.div`
  position: relative;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  
  .market-content {
    width: 100%;
    height: 100%;
    padding: 1rem;
    position: relative;
    
    .market-display {
      width: 100%;
      height: 350px;
      background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(5, 150, 105, 0.1));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border: 2px solid rgba(217, 119, 6, 0.3);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #d97706, transparent);
        animation: ${priceFlow} 4s infinite;
      }
      
      .market-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
        width: 100%;
        max-width: 500px;
        
        .market-card {
          background: rgba(217, 119, 6, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid rgba(217, 119, 6, 0.3);
          
          .market-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          
          .market-value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #d97706;
            margin-bottom: 0.25rem;
          }
          
          .market-label {
            font-size: 0.9rem;
            opacity: 0.8;
          }
          
          .market-change {
            margin-top: 0.5rem;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            
            &.positive { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
            &.negative { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
            &.neutral { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
          }
        }
      }
    }
  }
`;

const PortfolioOverview = styled.div`
  .portfolio-section {
    margin-bottom: 1.5rem;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0;
        font-size: 1rem;
        color: #d97706;
      }
      
      .update-button {
        font-size: 0.8rem;
        color: #059669;
        cursor: pointer;
        
        &:hover {
          color: #d97706;
        }
      }
    }
    
    .portfolio-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      
      .portfolio-item {
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
          
          &.positive { color: #22c55e; }
          &.negative { color: #ef4444; }
        }
      }
    }
  }
`;

const TradingSignals = styled.div`
  .signal-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    border-left: 4px solid #d97706;
    
    .signal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      
      .signal-type {
        background: rgba(217, 119, 6, 0.2);
        color: #d97706;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
      }
      
      .confidence {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .signal-content {
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 0.75rem;
    }
    
    .signal-actions {
      display: flex;
      gap: 0.5rem;
      
      .action-button {
        padding: 0.25rem 0.75rem;
        background: rgba(217, 119, 6, 0.2);
        border: 1px solid rgba(217, 119, 6, 0.3);
        border-radius: 6px;
        color: #d97706;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(217, 119, 6, 0.3);
        }
      }
    }
  }
`;

const RiskMetrics = styled.div`
  .risk-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.75rem;
    
    .risk-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      
      &.low { background: rgba(34, 197, 94, 0.2); }
      &.medium { background: rgba(245, 158, 11, 0.2); }
      &.high { background: rgba(239, 68, 68, 0.2); }
    }
    
    .risk-info {
      flex: 1;
      
      .risk-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      
      .risk-description {
        font-size: 0.8rem;
        opacity: 0.7;
      }
    }
    
    .risk-level {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      
      &.low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
      &.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
      &.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    }
  }
`;

const FinancialMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .metric-card {
    padding: 1.5rem;
    background: rgba(217, 119, 6, 0.1);
    border-radius: 8px;
    text-align: center;
    
    .metric-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #d97706;
      margin-bottom: 0.5rem;
    }
    
    .metric-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .metric-trend {
      font-size: 0.8rem;
      margin-top: 0.25rem;
      
      &.up { color: #22c55e; }
      &.down { color: #ef4444; }
      &.stable { color: #f59e0b; }
    }
  }
`;

const GlassButton = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost'; fullWidth?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(217, 119, 6, 0.3);
  background: ${props =>
        props.variant === 'primary' ? 'rgba(217, 119, 6, 0.2)' :
            props.variant === 'secondary' ? 'rgba(5, 150, 105, 0.2)' :
                'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  &:hover {
    background: ${props =>
        props.variant === 'primary' ? 'rgba(217, 119, 6, 0.3)' :
            props.variant === 'secondary' ? 'rgba(5, 150, 105, 0.3)' :
                'rgba(255, 255, 255, 0.2)'};
    transform: translateY(-2px);
  }
`;

// Main Component
export const FinancialAnalysisDashboard: React.FC = () => {
    // State Management
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioAnalysis | null>(null);
    const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
    const [riskMetrics, setRiskMetrics] = useState<RiskAssessment | null>(null);
    const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Refs
    const financeEngine = useRef(new FinancialAnalysisEngine());

    // Sample market data
    const currentMarket = {
        sp500: { value: '4,185.47', change: '+1.2%', status: 'positive' as const },
        nasdaq: { value: '12,965.34', change: '+0.8%', status: 'positive' as const },
        dow: { value: '33,274.15', change: '+0.6%', status: 'positive' as const },
        vix: { value: '18.45', change: '-2.1%', status: 'negative' as const }
    };

    // Sample portfolio data
    const portfolioData = {
        totalValue: '$1,247,350',
        todayChange: '+$15,240',
        todayPercent: '+1.24%',
        positions: 15,
        cashBalance: '$52,340',
        allocation: {
            stocks: '65%',
            bonds: '20%',
            cash: '10%',
            alternatives: '5%'
        }
    };

    // Sample risk assessments
    const riskAssessments = [
        {
            id: 'risk-001',
            name: 'Market Volatility',
            level: 'medium' as const,
            description: 'Current VIX levels indicate moderate market uncertainty',
            score: 6.2
        },
        {
            id: 'risk-002',
            name: 'Concentration Risk',
            level: 'low' as const,
            description: 'Portfolio well-diversified across sectors',
            score: 3.1
        },
        {
            id: 'risk-003',
            name: 'Interest Rate Risk',
            level: 'high' as const,
            description: 'Bond exposure vulnerable to rate changes',
            score: 8.4
        }
    ];

    // Event Handlers
    const handleTradeExecution = useCallback(async (signal: TradingSignal) => {
        try {
            const execution = await financeEngine.current.executeTrade({
                symbol: signal.symbol,
                action: signal.action,
                quantity: signal.recommendedSize,
                riskParameters: signal.riskParameters
            });

            console.log('Trade executed:', execution);
        } catch (error) {
            console.error('Trade execution failed:', error);
        }
    }, []);

    const handleRiskAnalysis = useCallback(async () => {
        try {
            const analysis = await financeEngine.current.analyzePortfolioRisk({
                portfolio: portfolio,
                marketConditions: marketData,
                timeHorizon: '1Y'
            });

            setRiskMetrics(analysis);
        } catch (error) {
            console.error('Risk analysis failed:', error);
        }
    }, [portfolio, marketData]);

    // Load financial data
    useEffect(() => {
        const loadFinancialData = async () => {
            try {
                const market = await financeEngine.current.getMarketData();
                setMarketData(market);

                const portfolioAnalysis = await financeEngine.current.getPortfolioAnalysis();
                setPortfolio(portfolioAnalysis);

                const signals = await financeEngine.current.getTradingSignals();
                setTradingSignals(signals);

                const currentMetrics = await financeEngine.current.getFinancialMetrics();
                setMetrics(currentMetrics);
            } catch (error) {
                console.error('Failed to load financial data:', error);
            }
        };

        loadFinancialData();
    }, []);

    return (
        <DashboardContainer>
            <Header>
                <Logo>
                    <div className="icon">💰</div>
                    <h1>G3D FinanceAI Intelligence</h1>
                </Logo>
                <MarketStatus>
                    <div className="status-indicator bull">
                        <div className="dot" />
                        <span>Market: Bullish</span>
                    </div>
                    <GlassButton
                        variant="secondary"
                        onClick={() => setShowAnalysisModal(true)}
                    >
                        📊 Run Analysis
                    </GlassButton>
                </MarketStatus>
            </Header>

            <MainGrid>
                {/* Left Panel - Portfolio & Risk */}
                <LeftPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Portfolio Overview</h3>
                        <PortfolioOverview>
                            <div className="portfolio-section">
                                <div className="section-header">
                                    <h4>Account Summary</h4>
                                    <span className="update-button">Refresh</span>
                                </div>
                                <div className="portfolio-grid">
                                    <div className="portfolio-item">
                                        <span className="label">Total Value:</span>
                                        <span className="value">{portfolioData.totalValue}</span>
                                    </div>
                                    <div className="portfolio-item">
                                        <span className="label">Today's Change:</span>
                                        <span className="value positive">{portfolioData.todayChange}</span>
                                    </div>
                                    <div className="portfolio-item">
                                        <span className="label">Percent Change:</span>
                                        <span className="value positive">{portfolioData.todayPercent}</span>
                                    </div>
                                    <div className="portfolio-item">
                                        <span className="label">Positions:</span>
                                        <span className="value">{portfolioData.positions}</span>
                                    </div>
                                    <div className="portfolio-item">
                                        <span className="label">Cash Balance:</span>
                                        <span className="value">{portfolioData.cashBalance}</span>
                                    </div>
                                    <div className="portfolio-item">
                                        <span className="label">Buying Power:</span>
                                        <span className="value">$125,680</span>
                                    </div>
                                </div>
                            </div>

                            <div className="portfolio-section">
                                <div className="section-header">
                                    <h4>Asset Allocation</h4>
                                    <span className="update-button">Rebalance</span>
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Stocks:</span>
                                        <span style={{ color: '#d97706' }}>{portfolioData.allocation.stocks}</span>
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Bonds:</span>
                                        <span style={{ color: '#059669' }}>{portfolioData.allocation.bonds}</span>
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Cash:</span>
                                        <span style={{ color: '#0891b2' }}>{portfolioData.allocation.cash}</span>
                                    </div>
                                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Alternatives:</span>
                                        <span style={{ color: '#7c3aed' }}>{portfolioData.allocation.alternatives}</span>
                                    </div>
                                </div>
                            </div>
                        </PortfolioOverview>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Risk Assessment</h3>
                        <RiskMetrics>
                            {riskAssessments.map(risk => (
                                <div key={risk.id} className="risk-item">
                                    <div className={`risk-icon ${risk.level}`}>
                                        {risk.level === 'low' && '🟢'}
                                        {risk.level === 'medium' && '🟡'}
                                        {risk.level === 'high' && '🔴'}
                                    </div>
                                    <div className="risk-info">
                                        <div className="risk-name">{risk.name}</div>
                                        <div className="risk-description">{risk.description}</div>
                                    </div>
                                    <div className={`risk-level ${risk.level}`}>
                                        {risk.score}/10
                                    </div>
                                </div>
                            ))}
                        </RiskMetrics>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Performance Metrics</h3>
                        <FinancialMetricsGrid>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.sharpeRatio || '1.34'}</div>
                                <div className="metric-label">Sharpe Ratio</div>
                                <div className="metric-trend up">Excellent</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.beta || '0.92'}</div>
                                <div className="metric-label">Beta</div>
                                <div className="metric-trend stable">Defensive</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.alpha || '2.1%'}</div>
                                <div className="metric-label">Alpha</div>
                                <div className="metric-trend up">Outperforming</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-value">{metrics?.maxDrawdown || '-8.2%'}</div>
                                <div className="metric-label">Max Drawdown</div>
                                <div className="metric-trend stable">Controlled</div>
                            </div>
                        </FinancialMetricsGrid>
                    </GlassCard>
                </LeftPanel>

                {/* Center Panel - Market Overview */}
                <CenterPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Market Overview</h3>
                        <MarketOverview>
                            <div className="market-content">
                                <div className="market-display">
                                    <div className="market-grid">
                                        <div className="market-card">
                                            <div className="market-icon">📈</div>
                                            <div className="market-value">{currentMarket.sp500.value}</div>
                                            <div className="market-label">S&P 500</div>
                                            <div className={`market-change ${currentMarket.sp500.status}`}>
                                                {currentMarket.sp500.change}
                                            </div>
                                        </div>

                                        <div className="market-card">
                                            <div className="market-icon">💻</div>
                                            <div className="market-value">{currentMarket.nasdaq.value}</div>
                                            <div className="market-label">NASDAQ</div>
                                            <div className={`market-change ${currentMarket.nasdaq.status}`}>
                                                {currentMarket.nasdaq.change}
                                            </div>
                                        </div>

                                        <div className="market-card">
                                            <div className="market-icon">🏭</div>
                                            <div className="market-value">{currentMarket.dow.value}</div>
                                            <div className="market-label">Dow Jones</div>
                                            <div className={`market-change ${currentMarket.dow.status}`}>
                                                {currentMarket.dow.change}
                                            </div>
                                        </div>

                                        <div className="market-card">
                                            <div className="market-icon">⚡</div>
                                            <div className="market-value">{currentMarket.vix.value}</div>
                                            <div className="market-label">VIX</div>
                                            <div className={`market-change ${currentMarket.vix.status}`}>
                                                {currentMarket.vix.change}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MarketOverview>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Financial Analysis Tools</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <GlassButton variant="ghost" fullWidth>
                                📊 Technical Analysis
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📈 Fundamental Analysis
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🎯 Options Strategy
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                🔍 Stock Screener
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📰 Market News
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                💡 AI Insights
                            </GlassButton>
                        </div>
                    </GlassCard>
                </CenterPanel>

                {/* Right Panel - Trading Signals & Actions */}
                <RightPanel>
                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>AI Trading Signals</h3>
                        <TradingSignals>
                            <div className="signal-item">
                                <div className="signal-header">
                                    <span className="signal-type">BUY</span>
                                    <span className="confidence">89% confidence</span>
                                </div>
                                <div className="signal-content">
                                    <strong>AAPL</strong> - Technical breakout above resistance with strong volume. Target: $185, Stop: $172
                                </div>
                                <div className="signal-actions">
                                    <button className="action-button">Execute Trade</button>
                                    <button className="action-button">Set Alert</button>
                                </div>
                            </div>

                            <div className="signal-item">
                                <div className="signal-header">
                                    <span className="signal-type">SELL</span>
                                    <span className="confidence">76% confidence</span>
                                </div>
                                <div className="signal-content">
                                    <strong>TSLA</strong> - Overbought conditions with bearish divergence. Consider profit taking.
                                </div>
                                <div className="signal-actions">
                                    <button className="action-button">Execute Trade</button>
                                    <button className="action-button">Analyze</button>
                                </div>
                            </div>

                            <div className="signal-item">
                                <div className="signal-header">
                                    <span className="signal-type">HOLD</span>
                                    <span className="confidence">92% confidence</span>
                                </div>
                                <div className="signal-content">
                                    <strong>MSFT</strong> - Strong fundamentals with upcoming earnings. Maintain position.
                                </div>
                                <div className="signal-actions">
                                    <button className="action-button">View Analysis</button>
                                    <button className="action-button">Set Target</button>
                                </div>
                            </div>
                        </TradingSignals>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Watchlist</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justify: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>NVDA</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>NVIDIA Corp</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: '#22c55e' }}>$428.50</div>
                                    <div style={{ fontSize: '0.8rem', color: '#22c55e' }}>+2.4%</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justify: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>GOOGL</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Alphabet Inc</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: '#ef4444' }}>$134.20</div>
                                    <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>-0.8%</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justify: 'space-between', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>AMZN</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Amazon.com Inc</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 600, color: '#22c55e' }}>$142.75</div>
                                    <div style={{ fontSize: '0.8rem', color: '#22c55e' }}>+1.2%</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard size="lg">
                        <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <GlassButton variant="primary" fullWidth>
                                🚀 Execute Trade
                            </GlassButton>
                            <GlassButton variant="secondary" fullWidth>
                                📊 Portfolio Analysis
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                ⚖️ Rebalance Portfolio
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📈 Set Price Alerts
                            </GlassButton>
                            <GlassButton variant="ghost" fullWidth>
                                📋 Generate Report
                            </GlassButton>
                        </div>
                    </GlassCard>
                </RightPanel>
            </MainGrid>
        </DashboardContainer>
    );
};

export default FinancialAnalysisDashboard;