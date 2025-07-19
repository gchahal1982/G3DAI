/**
 * Aura Onboarding Flow
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
    title: 'Welcome to Aura',
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
    description: 'Discover what Aura can do',
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        margin: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>{currentStepData.title}</h2>
          <button 
            onClick={onSkip}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          marginBottom: '24px',
          lineHeight: '1.6',
          color: '#666'
        }}>
          {currentStepData.description}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: index === currentStep ? '#007bff' : '#ddd'
                }}
              />
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Previous
              </button>
            )}
            <button 
              onClick={handleNext}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: '#007bff',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow; 