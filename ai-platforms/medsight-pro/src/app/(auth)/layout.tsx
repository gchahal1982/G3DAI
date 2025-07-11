import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MedSight Pro - Medical Professional Authentication',
  description: 'Secure authentication portal for medical professionals using MedSight Pro platform',
  keywords: ['medical', 'authentication', 'HIPAA', 'medical imaging', 'healthcare', 'radiology'],
  robots: 'noindex, nofollow', // Authentication pages should not be indexed
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      {/* Medical Authentication Background */}
      <div className="fixed inset-0 z-0">
        {/* Primary Gradient Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--medsight-primary-900) 0%, var(--medsight-primary-700) 100%)'
          }}
        />
        
        {/* Medical Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Medical Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Floating Medical Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Medical Cross Icons */}
          <div className="absolute top-20 left-20 w-8 h-8 opacity-5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
              <path d="M19 8h-2V6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H5a1 1 0 0 0 0 2h2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8h2a1 1 0 0 0 0-2zM9 6h6v12H9V6z"/>
              <path d="M11 8h2v2h2v2h-2v2h-2v-2H9v-2h2V8z"/>
            </svg>
          </div>
          
          <div className="absolute top-40 right-32 w-6 h-6 opacity-5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <div className="absolute bottom-40 left-40 w-10 h-10 opacity-5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          
          <div className="absolute bottom-20 right-20 w-7 h-7 opacity-5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            {/* MedSight Pro Logo */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(14, 165, 233, 0.3)'
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h1 
                  className="text-xl font-bold text-white"
                  style={{ 
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: 'var(--medsight-letter-spacing)'
                  }}
                >
                  MedSight Pro
                </h1>
                <p 
                  className="text-xs text-white/70"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  Medical Imaging AI Platform
                </p>
              </div>
            </div>

            {/* Medical Security Badge */}
            <div 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span 
                className="text-xs font-medium text-green-400"
                style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
              >
                HIPAA Compliant
              </span>
            </div>
          </div>
        </header>

        {/* Main Authentication Content */}
        <main className="relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 z-20 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              {/* Medical Compliance Badges */}
              <div className="flex items-center space-x-4">
                <div 
                  className="flex items-center space-x-2 px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(14, 165, 233, 0.1)',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span 
                    className="text-xs text-blue-400 font-medium"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    DICOM Compliant
                  </span>
                </div>

                <div 
                  className="flex items-center space-x-2 px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span 
                    className="text-xs text-yellow-400 font-medium"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    FDA Class II
                  </span>
                </div>

                <div 
                  className="flex items-center space-x-2 px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    backdropFilter: 'blur(16px)'
                  }}
                >
                  <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span 
                    className="text-xs text-purple-400 font-medium"
                    style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                  >
                    HL7 FHIR
                  </span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="text-right">
                <p 
                  className="text-xs text-white/60"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  Medical Emergency Support: 
                  <span className="text-white/80 font-medium ml-1">1-800-MEDSIGHT</span>
                </p>
                <p 
                  className="text-xs text-white/50 mt-1"
                  style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
                >
                  24/7 Clinical Technical Support Available
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Medical Security Notices */}
      <div className="fixed bottom-4 left-4 z-30">
        <div 
          className="flex items-center space-x-2 px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 8A6 6 0 006 8v1H3a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-3V8zM8 8a4 4 0 118 0v1H8V8z" clipRule="evenodd" />
          </svg>
          <span 
            className="text-xs text-white font-medium"
            style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
          >
            Secure Medical Connection
          </span>
        </div>
      </div>

      {/* Medical Session Security */}
      <div className="fixed bottom-4 right-4 z-30">
        <div 
          className="flex items-center space-x-2 px-3 py-2 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span 
            className="text-xs text-white/80"
            style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
          >
            Medical Session Active
          </span>
        </div>
      </div>

      {/* Global Medical Styles */}
      <style jsx global>{`
        /* Medical Authentication Form Styles */
        .medical-auth input:focus {
          border-color: var(--medsight-primary-500);
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }
        
        .medical-auth button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3);
        }
        
        /* Medical Authentication Animations */
        @keyframes medical-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .medical-pulse {
          animation: medical-pulse 2s infinite;
        }
        
        /* Medical Glass Effect Enhancements */
        .medsight-auth-glass {
          background: linear-gradient(135deg, 
            rgba(14, 165, 233, 0.06) 0%, 
            rgba(16, 185, 129, 0.04) 100%);
          backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(14, 165, 233, 0.12);
          box-shadow: 
            0 8px 32px rgba(14, 165, 233, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
        
        /* Medical Security Indicators */
        .medical-security-indicator {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          backdrop-filter: blur(16px);
          border-radius: 8px;
        }
        
        /* Medical Emergency Styles */
        .medical-emergency {
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          backdrop-filter: blur(16px);
          box-shadow: 
            0 4px 16px rgba(220, 38, 38, 0.2),
            0 0 20px rgba(220, 38, 38, 0.1);
        }
        
        /* Medical Typography Enhancements */
        .medical-text {
          font-family: var(--font-primary);
          line-height: var(--medsight-line-height);
          letter-spacing: var(--medsight-letter-spacing);
        }
        
        /* Accessibility Enhancements for Medical Interfaces */
        @media (prefers-reduced-motion: reduce) {
          .medical-pulse,
          .animate-pulse {
            animation: none;
          }
        }
        
        @media (prefers-contrast: high) {
          .medsight-auth-glass {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </>
  );
} 