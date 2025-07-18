/**
 * CodeForge Onboarding Flow
 * Guided setup and feature introduction for new users
 * 
 * Features:
 * - Progressive disclosure of features
 * - Interactive tutorials and tooltips
 * - Setup wizard for preferences
 * - Feature availability based on user needs
 * - Skip options for experienced users
 * - Progress tracking and completion rewards
 */

import React, { useState, useEffect } from 'react';

interface OnboardingProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  optional: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to CodeForge',
    description: 'Your AI-powered coding companion',
    component: () => <div>Welcome Step</div>,
    optional: false
  },
  {
    id: 'setup',
    title: 'Setup Your Workspace',
    description: 'Configure your development environment',
    component: () => <div>Setup Step</div>,
    optional: false
  },
  {
    id: 'features',
    title: 'Explore Features',
    description: 'Discover what CodeForge can do',
    component: () => <div>Features Step</div>,
    optional: true
  }
];

export const OnboardingFlow: React.FC<OnboardingProps> = ({
  isVisible,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h2>{currentStepData.title}</h2>
          <p>{currentStepData.description}</p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="onboarding-content">
          <currentStepData.component />
        </div>

        <div className="onboarding-actions">
          <button onClick={handleSkip} className="skip-button">
            Skip Tutorial
          </button>
          <button onClick={handleNext} className="next-button">
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .onboarding-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .onboarding-container {
          background: white;
          border-radius: 12px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow: auto;
        }

        .onboarding-header h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 24px;
        }

        .onboarding-header p {
          margin: 0 0 24px 0;
          color: #666;
          font-size: 16px;
        }

        .progress-bar {
          height: 4px;
          background: #f0f0f0;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 32px;
        }

        .progress-fill {
          height: 100%;
          background: #4CAF50;
          transition: width 0.3s ease;
        }

        .onboarding-content {
          margin-bottom: 32px;
          min-height: 200px;
        }

        .onboarding-actions {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .skip-button {
          background: transparent;
          border: 1px solid #ddd;
          color: #666;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .skip-button:hover {
          background: #f5f5f5;
        }

        .next-button {
          background: #4CAF50;
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .next-button:hover {
          background: #45a049;
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlow; 