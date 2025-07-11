'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { medicalAuth } from '@/lib/auth/medical-auth-adapter';
import { 
  Card, 
  Button, 
  Input, 
  Alert 
} from '@/components/ui';

// Verification methods
enum VerificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  BOTH = 'both'
}

// Verification form data
interface VerificationData {
  email: string;
  phone: string;
  emailCode: string;
  smsCode: string;
  medicalLicense: string;
  verificationMethod: VerificationMethod;
}

// Form validation errors
interface VerificationErrors {
  [key: string]: string;
}

export default function VerifyAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const method = searchParams.get('method') as VerificationMethod || VerificationMethod.EMAIL;
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  
  const [verificationData, setVerificationData] = useState<VerificationData>({
    email: decodeURIComponent(email),
    phone: decodeURIComponent(phone),
    emailCode: '',
    smsCode: '',
    medicalLicense: '',
    verificationMethod: method
  });
  
  const [errors, setErrors] = useState<VerificationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  
  const emailCodeRef = useRef<HTMLInputElement>(null);
  const smsCodeRef = useRef<HTMLInputElement>(null);
  
  // Initialize medical authentication service
  // Use medical authentication adapter

  // Handle direct token verification
  useEffect(() => {
    if (token) {
      handleTokenVerification();
    } else if (method === VerificationMethod.EMAIL) {
      emailCodeRef.current?.focus();
    } else if (method === VerificationMethod.SMS) {
      smsCodeRef.current?.focus();
    }
  }, [token, method]);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setVerificationAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  // Handle input changes
  const handleInputChange = (field: keyof VerificationData, value: string) => {
    setVerificationData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle direct token verification
  const handleTokenVerification = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await medicalAuth.verifyAccountToken({
        token,
        platform: 'medsight-pro'
      });

      if (response.success) {
        setIsVerified(true);
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('Token verification failed:', error);
      
      if (error.code === 'TOKEN_EXPIRED') {
        setErrors({ general: 'Verification link has expired. Please request a new one.' });
      } else if (error.code === 'TOKEN_INVALID') {
        setErrors({ general: 'Invalid verification link. Please check your email/SMS for the correct link.' });
      } else if (error.code === 'ALREADY_VERIFIED') {
        setErrors({ general: 'Account is already verified. You can now sign in.' });
      } else {
        setErrors({ general: 'Verification failed. Please try again or contact support.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code verification
  const handleCodeVerification = async () => {
    if (isLocked) {
      setErrors({ general: `Too many attempts. Please wait ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')} before trying again.` });
      return;
    }

    const validationErrors: VerificationErrors = {};
    
    if (verificationData.verificationMethod === VerificationMethod.EMAIL || verificationData.verificationMethod === VerificationMethod.BOTH) {
      if (!verificationData.emailCode.trim()) {
        validationErrors.emailCode = 'Email verification code is required';
      } else if (verificationData.emailCode.length !== 6) {
        validationErrors.emailCode = 'Email verification code must be 6 digits';
      }
    }
    
    if (verificationData.verificationMethod === VerificationMethod.SMS || verificationData.verificationMethod === VerificationMethod.BOTH) {
      if (!verificationData.smsCode.trim()) {
        validationErrors.smsCode = 'SMS verification code is required';
      } else if (verificationData.smsCode.length !== 6) {
        validationErrors.smsCode = 'SMS verification code must be 6 digits';
      }
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await medicalAuth.verifyAccountCode({
        email: verificationData.email,
        phone: verificationData.phone,
        emailCode: verificationData.emailCode,
        smsCode: verificationData.smsCode,
        method: verificationData.verificationMethod,
        platform: 'medsight-pro'
      });

      if (response.success) {
        setIsVerified(true);
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('Code verification failed:', error);
      
      const newAttempts = verificationAttempts + 1;
      setVerificationAttempts(newAttempts);
      
      // Lock after 5 failed attempts
      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockoutTime(1800); // 30 minute lockout
        setErrors({ general: 'Too many failed attempts. Account verification locked for 30 minutes for security.' });
      } else {
        if (error.code === 'INVALID_CODE') {
          if (verificationData.verificationMethod === VerificationMethod.EMAIL) {
            setErrors({ emailCode: 'Invalid email verification code. Please check and try again.' });
          } else if (verificationData.verificationMethod === VerificationMethod.SMS) {
            setErrors({ smsCode: 'Invalid SMS verification code. Please check and try again.' });
          } else {
            setErrors({ general: 'Invalid verification code(s). Please check and try again.' });
          }
        } else if (error.code === 'CODE_EXPIRED') {
          setErrors({ general: 'Verification code has expired. Please request a new one.' });
        } else if (error.code === 'ALREADY_VERIFIED') {
          setErrors({ general: 'Account is already verified. You can now sign in.' });
        } else {
          setErrors({ general: `Verification failed. ${5 - newAttempts} attempts remaining.` });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async () => {
    if (!verificationData.email && !verificationData.phone) {
      setErrors({ general: 'Email or phone number is required to resend verification code.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await medicalAuth.resendVerificationCode({
        email: verificationData.email,
        phone: verificationData.phone,
        method: verificationData.verificationMethod,
        platform: 'medsight-pro'
      });

      if (response.success) {
        setVerificationSent(true);
        setVerificationAttempts(0); // Reset attempts on successful resend
        
        // Clear existing codes
        setVerificationData(prev => ({
          ...prev,
          emailCode: '',
          smsCode: ''
        }));
        
        // Focus appropriate input
        if (verificationData.verificationMethod === VerificationMethod.EMAIL) {
          emailCodeRef.current?.focus();
        } else if (verificationData.verificationMethod === VerificationMethod.SMS) {
          smsCodeRef.current?.focus();
        }
      }
      
    } catch (error: any) {
      console.error('Resend verification failed:', error);
      
      if (error.code === 'RATE_LIMITED') {
        setErrors({ general: 'Too many resend requests. Please wait before requesting another code.' });
      } else if (error.code === 'ALREADY_VERIFIED') {
        setErrors({ general: 'Account is already verified. You can now sign in.' });
      } else {
        setErrors({ general: 'Failed to resend verification code. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Change verification method
  const changeVerificationMethod = (method: VerificationMethod) => {
    setVerificationData(prev => ({ 
      ...prev, 
      verificationMethod: method,
      emailCode: '',
      smsCode: ''
    }));
    setErrors({});
  };

  // Get verification method label
  const getVerificationMethodLabel = (): string => {
    switch (verificationData.verificationMethod) {
      case VerificationMethod.EMAIL:
        return 'Email Verification';
      case VerificationMethod.SMS:
        return 'SMS Verification';
      case VerificationMethod.BOTH:
        return 'Email & SMS Verification';
      default:
        return 'Account Verification';
    }
  };

  // Render verification success
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Medical background gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--medsight-primary-900) 0%, var(--medsight-primary-700) 100%)',
          }}
        />
        
        {/* Success particle overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Success card */}
        <div className="relative z-10 w-full max-w-md p-6">
          <Card 
            className="medsight-glass p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.04) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(16, 185, 129, 0.12)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Success icon */}
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
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
              Account Verified Successfully
            </h2>
            
            <p className="text-white text-sm mb-6">
              Your MedSight Pro account has been successfully verified. You can now sign in and access all medical features.
            </p>
            
            <div 
              className="p-4 rounded-lg mb-6"
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}
            >
              <p className="text-white text-xs">
                ✅ Medical professional account verified<br/>
                🔒 Security features activated<br/>
                🏥 Ready for clinical use
              </p>
            </div>
            
            <Button
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
            </Button>
            
            <p className="text-gray-400 text-xs mt-4">
              Redirecting automatically in 3 seconds...
            </p>
          </Card>
        </div>
      </div>
    );
  }

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
      
      {/* Main verification form */}
      <div className="relative z-10 w-full max-w-md p-6">
        <Card 
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
              Verify Account
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
              {getVerificationMethodLabel()}
            </p>
            <div 
              className="text-sm px-3 py-1 rounded-lg inline-block"
              style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Medical Professional Security
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

          {/* Success message for resend */}
          {verificationSent && (
            <Alert 
              variant="success"
              className="mb-6"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            >
              New verification code sent successfully!
            </Alert>
          )}

          {/* Contact info display */}
          <div className="space-y-4 mb-6">
            {verificationData.email && (
              <div 
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(14, 165, 233, 0.05)',
                  border: '1px solid rgba(14, 165, 233, 0.1)'
                }}
              >
                <p className="text-white text-sm font-medium">Email:</p>
                <p className="text-white text-sm">{verificationData.email}</p>
              </div>
            )}
            
            {verificationData.phone && (
              <div 
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.1)'
                }}
              >
                <p className="text-white text-sm font-medium">Phone:</p>
                <p className="text-white text-sm">{verificationData.phone}</p>
              </div>
            )}
          </div>

          {/* Verification method selector */}
          {verificationData.email && verificationData.phone && (
            <div className="flex space-x-2 mb-6">
              <Button
                onClick={() => changeVerificationMethod(VerificationMethod.EMAIL)}
                className="flex-1 text-xs"
                style={{
                  background: verificationData.verificationMethod === VerificationMethod.EMAIL ?
                    'rgba(14, 165, 233, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: verificationData.verificationMethod === VerificationMethod.EMAIL ?
                    'var(--medsight-primary-300)' : 'rgba(255, 255, 255, 0.7)',
                  border: verificationData.verificationMethod === VerificationMethod.EMAIL ?
                    '1px solid rgba(14, 165, 233, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(16px)'
                }}
              >
                Email Only
              </Button>
              <Button
                onClick={() => changeVerificationMethod(VerificationMethod.SMS)}
                className="flex-1 text-xs"
                style={{
                  background: verificationData.verificationMethod === VerificationMethod.SMS ?
                    'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: verificationData.verificationMethod === VerificationMethod.SMS ?
                    'var(--medsight-secondary-300)' : 'rgba(255, 255, 255, 0.7)',
                  border: verificationData.verificationMethod === VerificationMethod.SMS ?
                    '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(16px)'
                }}
              >
                SMS Only
              </Button>
              <Button
                onClick={() => changeVerificationMethod(VerificationMethod.BOTH)}
                className="flex-1 text-xs"
                style={{
                  background: verificationData.verificationMethod === VerificationMethod.BOTH ?
                    'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: verificationData.verificationMethod === VerificationMethod.BOTH ?
                    'var(--medsight-accent-300)' : 'rgba(255, 255, 255, 0.7)',
                  border: verificationData.verificationMethod === VerificationMethod.BOTH ?
                    '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(16px)'
                }}
              >
                Both
              </Button>
            </div>
          )}

          {/* Verification code inputs */}
          <div className="space-y-4 mb-6">
            {(verificationData.verificationMethod === VerificationMethod.EMAIL || 
              verificationData.verificationMethod === VerificationMethod.BOTH) && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Email Verification Code <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <div className="flex space-x-2">
                  <Input
                    ref={emailCodeRef}
                    type="text"
                    value={verificationData.emailCode}
                    onChange={(e) => handleInputChange('emailCode', e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit email code"
                    maxLength={6}
                    disabled={isLoading || isLocked}
                    className="glass-input flex-1"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      backdropFilter: 'blur(16px)',
                      border: errors.emailCode ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: 'white',
                      fontFamily: 'monospace',
                      fontSize: '16px',
                      textAlign: 'center',
                      letterSpacing: '0.2em'
                    }}
                  />
                </div>
                {errors.emailCode && (
                  <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                    {errors.emailCode}
                  </p>
                )}
              </div>
            )}

            {(verificationData.verificationMethod === VerificationMethod.SMS || 
              verificationData.verificationMethod === VerificationMethod.BOTH) && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  SMS Verification Code <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <div className="flex space-x-2">
                  <Input
                    ref={smsCodeRef}
                    type="text"
                    value={verificationData.smsCode}
                    onChange={(e) => handleInputChange('smsCode', e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit SMS code"
                    maxLength={6}
                    disabled={isLoading || isLocked}
                    className="glass-input flex-1"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      backdropFilter: 'blur(16px)',
                      border: errors.smsCode ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: 'white',
                      fontFamily: 'monospace',
                      fontSize: '16px',
                      textAlign: 'center',
                      letterSpacing: '0.2em'
                    }}
                  />
                </div>
                {errors.smsCode && (
                  <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                    {errors.smsCode}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleCodeVerification}
              disabled={isLoading || isLocked}
              className="w-full"
              style={{
                background: isLocked ? 
                  'rgba(107, 114, 128, 0.5)' :
                  'linear-gradient(135deg, var(--medsight-normal) 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)',
                opacity: isLocked ? 0.5 : 1
              }}
            >
              {isLoading ? 'Verifying...' : isLocked ? 
                `Locked for ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')}` : 
                'Verify Account'
              }
            </Button>

            <Button
              onClick={resendVerificationCode}
              disabled={isLoading || isLocked}
              className="w-full"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--medsight-primary-300)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                padding: '12px 24px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              {isLoading ? 'Sending...' : 'Resend Verification Code'}
            </Button>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs mb-2">
              Didn't receive the code? Check your spam folder or try resending.
            </p>
            <p className="text-gray-400 text-xs">
              Having trouble? <Link href="/help" className="text-white hover:underline">Contact Support</Link>
            </p>
          </div>

          {/* Back to login link */}
          <div className="text-center mt-6">
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
        </Card>
      </div>
    </div>
  );
} 