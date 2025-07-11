'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { medicalAuth } from '@/lib/auth/medical-auth-adapter';
import { 
  GlassCard, 
  GlassButton, 
  Input, 
  Alert 
} from '@/components/ui';

// Password reset steps
enum ResetStep {
  IDENTITY_VERIFICATION = 1,
  SECURITY_VERIFICATION = 2,
  PASSWORD_RESET = 3,
  CONFIRMATION = 4
}

// Password reset form data
interface PasswordResetData {
  emailOrLicense: string;
  medicalLicense?: string;
  securityQuestion?: string;
  securityAnswer: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
}

// Form validation errors
interface ResetErrors {
  [key: string]: string;
}

// Security questions for medical professionals
const SECURITY_QUESTIONS = [
  "What was the name of your medical school?",
  "What was your first hospital rotation specialty?",
  "What is your medical mentor's last name?",
  "In what city did you complete your residency?",
  "What was your first patient's condition? (general)",
  "What medical specialty did you first consider?",
  "What was your medical school graduation year?",
  "What was your undergraduate major?"
];

export default function PasswordResetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.IDENTITY_VERIFICATION);
  const [resetData, setResetData] = useState<PasswordResetData>({
    emailOrLicense: '',
    medicalLicense: '',
    securityQuestion: '',
    securityAnswer: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<ResetErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetAttempts, setResetAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [userSecurityQuestion, setUserSecurityQuestion] = useState('');
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize medical authentication service
  // Use medical authentication adapter

  // Focus email input on mount
  useEffect(() => {
    if (token) {
      // Direct token-based reset
      setCurrentStep(ResetStep.PASSWORD_RESET);
      setResetData(prev => ({ ...prev, verificationCode: token }));
    } else {
      emailInputRef.current?.focus();
    }
  }, [token]);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setResetAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  // Handle input changes
  const handleInputChange = (field: keyof PasswordResetData, value: string) => {
    setResetData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Medical license validation helper
  const isValidMedicalLicense = (license: string): boolean => {
    const licenseRegex = /^[A-Z]{1,3}\d{4,8}$/;
    return licenseRegex.test(license.replace(/\s/g, '').toUpperCase());
  };

  // Password validation helper
  const isValidPassword = (password: string): boolean => {
    return (
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
  };

  // Step 1: Identity Verification
  const handleIdentityVerification = async () => {
    if (isLocked) {
      setErrors({ general: `Too many attempts. Please wait ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')} before trying again.` });
      return;
    }

    if (!resetData.emailOrLicense.trim()) {
      setErrors({ emailOrLicense: 'Email address or medical license is required' });
      return;
    }

    if (!isValidEmail(resetData.emailOrLicense) && !isValidMedicalLicense(resetData.emailOrLicense)) {
      setErrors({ emailOrLicense: 'Please enter a valid email address or medical license number' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Verify medical professional identity
      const response = await medicalAuth.requestPasswordReset({
        identifier: resetData.emailOrLicense,
        platform: 'medsight-pro',
        additionalVerification: true // Require medical verification
      });

      if (response.success) {
        setUserSecurityQuestion(response.securityQuestion);
        setResetData(prev => ({ 
          ...prev, 
          securityQuestion: response.securityQuestion,
          medicalLicense: response.medicalLicense 
        }));
        setCurrentStep(ResetStep.SECURITY_VERIFICATION);
      }
      
    } catch (error: any) {
      console.error('Identity verification failed:', error);
      
      const newAttempts = resetAttempts + 1;
      setResetAttempts(newAttempts);
      
      // Lock after 3 failed attempts
      if (newAttempts >= 3) {
        setIsLocked(true);
        setLockoutTime(900); // 15 minute lockout
        setErrors({ general: 'Too many failed attempts. Account locked for 15 minutes for security.' });
      } else {
        if (error.code === 'USER_NOT_FOUND') {
          setErrors({ emailOrLicense: 'No account found with this email or medical license.' });
        } else if (error.code === 'ACCOUNT_SUSPENDED') {
          setErrors({ general: 'Account suspended. Please contact medical administration.' });
        } else {
          setErrors({ general: `Identity verification failed. ${3 - newAttempts} attempts remaining.` });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Security Verification
  const handleSecurityVerification = async () => {
    if (!resetData.securityAnswer.trim()) {
      setErrors({ securityAnswer: 'Security answer is required' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await medicalAuth.verifySecurityAnswer({
        identifier: resetData.emailOrLicense,
        securityAnswer: resetData.securityAnswer,
        medicalLicense: resetData.medicalLicense
      });

      if (response.success) {
        // Send verification code
        await medicalAuth.sendVerificationCode({
          identifier: resetData.emailOrLicense,
          method: 'both' // Email and SMS for medical security
        });
        
        setVerificationSent(true);
        setCurrentStep(ResetStep.PASSWORD_RESET);
      }
      
    } catch (error: any) {
      console.error('Security verification failed:', error);
      
      if (error.code === 'INVALID_SECURITY_ANSWER') {
        setErrors({ securityAnswer: 'Incorrect security answer. Please try again.' });
      } else {
        setErrors({ general: 'Security verification failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Password Reset
  const handlePasswordReset = async () => {
    const validationErrors: ResetErrors = {};
    
    if (!resetData.verificationCode.trim()) {
      validationErrors.verificationCode = 'Verification code is required';
    }
    
    if (!resetData.newPassword) {
      validationErrors.newPassword = 'New password is required';
    } else if (!isValidPassword(resetData.newPassword)) {
      validationErrors.newPassword = 'Password must be at least 12 characters with uppercase, lowercase, number, and special character';
    }
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await medicalAuth.resetPassword({
        identifier: resetData.emailOrLicense,
        verificationCode: resetData.verificationCode,
        newPassword: resetData.newPassword,
        medicalLicense: resetData.medicalLicense
      });

      if (response.success) {
        setCurrentStep(ResetStep.CONFIRMATION);
        
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 5000);
      }
      
    } catch (error: any) {
      console.error('Password reset failed:', error);
      
      if (error.code === 'INVALID_VERIFICATION_CODE') {
        setErrors({ verificationCode: 'Invalid verification code. Please check and try again.' });
      } else if (error.code === 'CODE_EXPIRED') {
        setErrors({ verificationCode: 'Verification code has expired. Please request a new one.' });
      } else if (error.code === 'PASSWORD_USED_RECENTLY') {
        setErrors({ newPassword: 'Password was used recently. Please choose a different password.' });
      } else {
        setErrors({ general: 'Password reset failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async () => {
    try {
      setIsLoading(true);
      await medicalAuth.sendVerificationCode({
        identifier: resetData.emailOrLicense,
        method: 'both'
      });
      setVerificationSent(true);
    } catch (error) {
      setErrors({ verificationCode: 'Failed to resend verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  // Get step title
  const getStepTitle = (): string => {
    switch (currentStep) {
      case ResetStep.IDENTITY_VERIFICATION:
        return 'Identity Verification';
      case ResetStep.SECURITY_VERIFICATION:
        return 'Security Verification';
      case ResetStep.PASSWORD_RESET:
        return 'Reset Password';
      case ResetStep.CONFIRMATION:
        return 'Password Reset Complete';
      default:
        return 'Password Reset';
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case ResetStep.IDENTITY_VERIFICATION:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-white text-sm mb-4">
                Enter your email address or medical license number to begin the password reset process.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">
                Email Address or Medical License <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <Input
                ref={emailInputRef}
                type="text"
                value={resetData.emailOrLicense}
                onChange={(e) => handleInputChange('emailOrLicense', e.target.value)}
                placeholder="Enter email or medical license number"
                disabled={isLoading || isLocked}
                className="glass-input"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: errors.emailOrLicense ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              />
              {errors.emailOrLicense && (
                <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                  {errors.emailOrLicense}
                </p>
              )}
            </div>
            
            <GlassButton
              onClick={handleIdentityVerification}
              disabled={isLoading || isLocked}
              className="w-full"
              style={{
                background: isLocked ? 
                  'rgba(107, 114, 128, 0.5)' :
                  'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(14, 165, 233, 0.2)',
                opacity: isLocked ? 0.5 : 1
              }}
            >
              {isLoading ? 'Verifying...' : isLocked ? 
                `Locked for ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')}` : 
                'Verify Identity'
              }
            </GlassButton>
          </div>
        );
        
      case ResetStep.SECURITY_VERIFICATION:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-white text-sm mb-4">
                For additional security, please answer your security question.
              </p>
            </div>
            
            <div 
              className="p-4 rounded-lg mb-4"
              style={{
                background: 'rgba(14, 165, 233, 0.05)',
                border: '1px solid rgba(14, 165, 233, 0.1)'
              }}
            >
              <p className="text-white text-sm font-medium">Security Question:</p>
              <p className="text-white text-sm mt-1">{userSecurityQuestion}</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">
                Security Answer <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <Input
                type="text"
                value={resetData.securityAnswer}
                onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                placeholder="Enter your security answer"
                disabled={isLoading}
                className="glass-input"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: errors.securityAnswer ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              />
              {errors.securityAnswer && (
                <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                  {errors.securityAnswer}
                </p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <GlassButton
                onClick={() => setCurrentStep(ResetStep.IDENTITY_VERIFICATION)}
                className="flex-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--medsight-primary-300)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)'
                }}
              >
                Back
              </GlassButton>
              <GlassButton
                onClick={handleSecurityVerification}
                disabled={isLoading}
                className="flex-1"
                style={{
                  background: 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify Answer'}
              </GlassButton>
            </div>
          </div>
        );
        
      case ResetStep.PASSWORD_RESET:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-white text-sm mb-4">
                {verificationSent ? 
                  'A verification code has been sent to your email and phone. Enter the code and your new password below.' :
                  'Enter the verification code from your email/SMS and create a new secure password.'
                }
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">
                Verification Code <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={resetData.verificationCode}
                  onChange={(e) => handleInputChange('verificationCode', e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={isLoading}
                  className="glass-input flex-1"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.verificationCode ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                <GlassButton
                  onClick={resendVerificationCode}
                  disabled={isLoading}
                  className="px-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--medsight-primary-300)',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(16px)',
                    fontSize: '14px'
                  }}
                >
                  Resend
                </GlassButton>
              </div>
              {errors.verificationCode && (
                <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                  {errors.verificationCode}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">
                New Password <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <Input
                type="password"
                value={resetData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Enter new secure password"
                disabled={isLoading}
                className="glass-input"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: errors.newPassword ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              />
              {errors.newPassword && (
                <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                  {errors.newPassword}
                </p>
              )}
              <p className="text-xs mt-1 text-gray-300">
                Password must be at least 12 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">
                Confirm New Password <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <Input
                type="password"
                value={resetData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                disabled={isLoading}
                className="glass-input"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: errors.confirmPassword ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              />
              {errors.confirmPassword && (
                <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            
            <GlassButton
              onClick={handlePasswordReset}
              disabled={isLoading}
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, var(--medsight-normal) 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </GlassButton>
          </div>
        );
        
      case ResetStep.CONFIRMATION:
        return (
          <div className="text-center space-y-6">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <svg 
                className="w-8 h-8" 
                style={{ color: 'var(--medsight-normal)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--medsight-normal)' }}
            >
              Password Reset Successful
            </h2>
            
            <p className="text-white text-sm mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            
            <div 
              className="p-4 rounded-lg mb-6"
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}
            >
              <p className="text-white text-xs">
                🔒 Your account security has been updated<br/>
                ⚡ All active sessions have been terminated<br/>
                📧 A confirmation email has been sent
              </p>
            </div>
            
            <GlassButton
              onClick={() => router.push('/login')}
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
              }}
            >
              Continue to Sign In
            </GlassButton>
            
            <p className="text-gray-400 text-xs">
              Redirecting automatically in 5 seconds...
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Medical background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, var(--medsight-primary-900) 0%, var(--medsight-primary-700) 100%)',
        }}
      />
      
      {/* Medical particle overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Main reset form */}
      <div className="relative z-10 w-full max-w-md p-6">
        <GlassCard 
          className="medsight-glass p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(16, 185, 129, 0.04) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(14, 165, 233, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ 
                color: 'var(--medsight-primary-50)',
                fontFamily: 'var(--font-primary)',
                lineHeight: 'var(--medsight-line-height)',
                letterSpacing: 'var(--medsight-letter-spacing)'
              }}
            >
              Reset Password
            </h1>
            <p 
              className="text-lg mb-2"
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-primary)',
                lineHeight: 'var(--medsight-line-height)',
                letterSpacing: 'var(--medsight-letter-spacing)'
              }}
            >
              {getStepTitle()}
            </p>
            <div 
              className="text-sm px-3 py-1 rounded-lg inline-block"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Secure Medical Recovery Process
            </div>
          </div>

          {/* Error alerts */}
          {errors.general && (
            <Alert 
              variant="error"
              className="mb-6"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            >
              {errors.general}
            </Alert>
          )}

          {/* Step content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Back to login link */}
          {currentStep !== ResetStep.CONFIRMATION && (
            <div className="text-center">
              <Link 
                href="/login"
                className="text-sm hover:underline transition-colors"
                style={{ 
                  color: 'var(--medsight-primary-300)',
                  lineHeight: 'var(--medsight-line-height)'
                }}
              >
                ← Back to Sign In
              </Link>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
} 