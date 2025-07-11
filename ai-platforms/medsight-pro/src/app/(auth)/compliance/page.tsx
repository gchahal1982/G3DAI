'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MedicalAuthAdapter } from '@/lib/auth/medical-auth-adapter';

interface ComplianceAgreements {
  hipaaCompliance: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  dataProcessing: boolean;
  medicalLiability: boolean;
  professionalConduct: boolean;
  securityGuidelines: boolean;
  auditConsent: boolean;
}

export default function CompliancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agreements, setAgreements] = useState<ComplianceAgreements>({
    hipaaCompliance: false,
    privacyPolicy: false,
    termsOfService: false,
    dataProcessing: false,
    medicalLiability: false,
    professionalConduct: false,
    securityGuidelines: false,
    auditConsent: false
  });
  const [signature, setSignature] = useState('');
  const [currentDate] = useState(new Date().toLocaleDateString());

  const authAdapter = MedicalAuthAdapter.getInstance();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const user = await authAdapter.getCurrentUser();
        if (!user) {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleAgreementChange = (key: keyof ComplianceAgreements, value: boolean) => {
    setAgreements(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const allAgreementsAccepted = Object.values(agreements).every(agreement => agreement);

  const handleSubmit = async () => {
    if (!allAgreementsAccepted || !signature.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Save compliance agreements via medical auth adapter
      await authAdapter.updateComplianceAgreements({
        agreements,
        signature,
        signedDate: new Date().toISOString(),
        ipAddress: 'CLIENT_IP', // Would be populated on backend
        userAgent: navigator.userAgent
      });
      
      // Redirect to profile setup after compliance acceptance
      router.push('/profile-setup');
    } catch (error) {
      console.error('Failed to save compliance agreements:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  const complianceItems = [
    {
      key: 'hipaaCompliance' as keyof ComplianceAgreements,
      title: 'HIPAA Compliance Agreement',
      description: 'I acknowledge that I will handle all Protected Health Information (PHI) in accordance with HIPAA regulations and will maintain the confidentiality, integrity, and availability of all medical data.',
      required: true,
      critical: true
    },
    {
      key: 'privacyPolicy' as keyof ComplianceAgreements,
      title: 'Privacy Policy',
      description: 'I have read and agree to the MedSight Pro Privacy Policy, including data collection, usage, and sharing practices for medical information.',
      required: true,
      critical: false
    },
    {
      key: 'termsOfService' as keyof ComplianceAgreements,
      title: 'Terms of Service',
      description: 'I agree to the MedSight Pro Terms of Service, including acceptable use policies and professional responsibilities.',
      required: true,
      critical: false
    },
    {
      key: 'dataProcessing' as keyof ComplianceAgreements,
      title: 'Medical Data Processing',
      description: 'I consent to the processing of medical imaging data and patient information for diagnostic purposes, AI analysis, and clinical workflow optimization.',
      required: true,
      critical: true
    },
    {
      key: 'medicalLiability' as keyof ComplianceAgreements,
      title: 'Medical Professional Liability',
      description: 'I understand that I maintain full professional liability for all medical decisions and that MedSight Pro serves as a diagnostic aid tool only.',
      required: true,
      critical: true
    },
    {
      key: 'professionalConduct' as keyof ComplianceAgreements,
      title: 'Professional Conduct Standards',
      description: 'I agree to maintain the highest standards of medical professional conduct and to use this platform solely for legitimate medical purposes.',
      required: true,
      critical: false
    },
    {
      key: 'securityGuidelines' as keyof ComplianceAgreements,
      title: 'Security Guidelines',
      description: 'I will follow all security protocols, including secure authentication, proper logout procedures, and reporting of any security incidents.',
      required: true,
      critical: true
    },
    {
      key: 'auditConsent' as keyof ComplianceAgreements,
      title: 'Audit and Monitoring Consent',
      description: 'I consent to audit logging of all my activities for security, compliance, and quality assurance purposes.',
      required: true,
      critical: false
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, var(--medsight-primary-900) 0%, var(--medsight-primary-700) 100%)'
    }}>
      <div className="w-full max-w-4xl">
        <div className="medsight-glass p-8" style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(16, 185, 129, 0.04) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(14, 165, 233, 0.12)',
          boxShadow: '0 8px 32px rgba(14, 165, 233, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          borderRadius: '16px'
        }}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ 
              fontFamily: 'var(--font-primary)', 
              lineHeight: 'var(--medsight-line-height)',
              letterSpacing: 'var(--medsight-letter-spacing)'
            }}>
              Medical Compliance Agreement
            </h1>
            <p className="text-white/70" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
              Please review and accept all compliance requirements for medical data handling
            </p>
            
            {/* Critical Notice */}
            <div className="mt-6 p-4 rounded-lg" style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              backdropFilter: 'blur(16px)'
            }}>
              <div className="flex items-center justify-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400 font-bold text-sm" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
                  CRITICAL MEDICAL COMPLIANCE
                </span>
              </div>
              <p className="text-red-300 text-sm" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
                This platform handles Protected Health Information (PHI). All agreements are legally binding and required for medical data access.
              </p>
            </div>
          </div>

          {/* Compliance Agreements */}
          <div className="space-y-6 mb-8">
            {complianceItems.map((item) => (
              <div 
                key={item.key}
                className={`p-6 rounded-lg border transition-all ${
                  item.critical 
                    ? 'border-yellow-500/30 bg-yellow-500/5' 
                    : 'border-white/20 bg-white/5'
                }`}
                style={{
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-start space-x-4">
                  <label className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={agreements[item.key]}
                      onChange={(e) => handleAgreementChange(item.key, e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      required={item.required}
                    />
                  </label>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-bold text-white" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
                        {item.title}
                      </h3>
                      {item.required && (
                        <span className="px-2 py-1 text-xs font-bold rounded" style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          REQUIRED
                        </span>
                      )}
                      {item.critical && (
                        <span className="px-2 py-1 text-xs font-bold rounded" style={{
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}>
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed" style={{ 
                      lineHeight: 'var(--medsight-line-height)',
                      letterSpacing: 'var(--medsight-letter-spacing)'
                    }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Electronic Signature */}
          <div className="space-y-6 border-t border-white/20 pt-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2" style={{ 
                fontFamily: 'var(--font-primary)', 
                lineHeight: 'var(--medsight-line-height)',
                letterSpacing: 'var(--medsight-letter-spacing)'
              }}>
                Electronic Signature
              </h3>
              <p className="text-white/70 text-sm" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
                Your electronic signature confirms your agreement to all terms above
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
                  Full Legal Name (Electronic Signature)
                </label>
                <input
                  type="text"
                  placeholder="Type your full legal name as electronic signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full p-4 rounded-lg border-0 outline-none text-white placeholder-white/50"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: '2px solid rgba(14, 165, 233, 0.3)',
                    lineHeight: 'var(--medsight-line-height)',
                    letterSpacing: 'var(--medsight-letter-spacing)'
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-white/70">
                <div>
                  <span className="font-medium">Date: </span>
                  <span style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>{currentDate}</span>
                </div>
                <div>
                  <span className="font-medium">IP Address: </span>
                  <span style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>Will be recorded</span>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="p-4 rounded-lg" style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(16px)'
            }}>
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-blue-300 font-medium text-sm mb-1" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
                    Legal Electronic Signature
                  </p>
                  <p className="text-blue-200 text-xs leading-relaxed" style={{ 
                    lineHeight: 'var(--medsight-line-height)',
                    letterSpacing: 'var(--medsight-letter-spacing)'
                  }}>
                    By typing your name above, you are providing a legally binding electronic signature equivalent to a handwritten signature. This action confirms your identity and agreement to all terms and conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center items-center mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              {!allAgreementsAccepted && (
                <p className="text-yellow-400 text-sm mb-4" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
                  Please accept all required compliance agreements to continue
                </p>
              )}
              {!signature.trim() && allAgreementsAccepted && (
                <p className="text-yellow-400 text-sm mb-4" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
                  Please provide your electronic signature to continue
                </p>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={!allAgreementsAccepted || !signature.trim() || isLoading}
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                  !allAgreementsAccepted || !signature.trim() || isLoading
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'hover:transform hover:translateY(-1px)'
                }`}
                style={{
                  background: !allAgreementsAccepted || !signature.trim() || isLoading
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, var(--medsight-normal) 0%, #059669 100%)',
                  color: !allAgreementsAccepted || !signature.trim() || isLoading ? 'rgba(255, 255, 255, 0.5)' : 'white',
                  letterSpacing: 'var(--medsight-letter-spacing)',
                  boxShadow: !allAgreementsAccepted || !signature.trim() || isLoading
                    ? 'none'
                    : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing Compliance...</span>
                  </div>
                ) : (
                  'Accept All Terms & Continue'
                )}
              </button>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/50" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
              This compliance agreement is recorded with timestamp, IP address, and digital signature for legal verification
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
            style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}
          >
            ← Back to Login
          </button>
          
          <div className="text-white/50 text-xs" style={{ letterSpacing: 'var(--medsight-letter-spacing)' }}>
            Step 1 of 2: Compliance → Profile Setup
          </div>
        </div>
      </div>
    </div>
  );
} 