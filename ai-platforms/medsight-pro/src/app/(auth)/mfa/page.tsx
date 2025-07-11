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

// MFA methods
enum MFAMethod {
  SMS = 'sms',
  EMAIL = 'email',
  AUTHENTICATOR = 'authenticator',
  BACKUP_CODE = 'backup_code'
}

// MFA form data
interface MFAData {
  code: string;
  method: MFAMethod;
  trustDevice: boolean;
  backupCode: string;
  userId: string;
  sessionId: string;
}

// Form validation errors
interface MFAErrors {
  [key: string]: string;
}

// MFA method configuration
interface MFAMethodConfig {
  label: string;
  description: string;
  icon: string;
  placeholder: string;
  maxLength: number;
  format: 'numeric' | 'alphanumeric';
}

const MFA_METHODS: Record<MFAMethod, MFAMethodConfig> = {
  [MFAMethod.SMS]: {
    label: 'SMS Authentication',
    description: 'Enter the 6-digit code sent to your phone',
    icon: '📱',
    placeholder: 'Enter SMS code',
    maxLength: 6,
    format: 'numeric'
  },
  [MFAMethod.EMAIL]: {
    label: 'Email Authentication',
    description: 'Enter the 6-digit code sent to your email',
    icon: '📧',
    placeholder: 'Enter email code',
    maxLength: 6,
    format: 'numeric'
  },
  [MFAMethod.AUTHENTICATOR]: {
    label: 'Authenticator App',
    description: 'Enter the 6-digit code from your authenticator app',
    icon: '🔐',
    placeholder: 'Enter authenticator code',
    maxLength: 6,
    format: 'numeric'
  },
  [MFAMethod.BACKUP_CODE]: {
    label: 'Backup Code',
    description: 'Enter one of your backup recovery codes',
    icon: '🔑',
    placeholder: 'Enter backup code',
    maxLength: 12,
    format: 'alphanumeric'
  }
};

export default function MFAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const sessionId = searchParams.get('sessionId') || '';
  const defaultMethod = (searchParams.get('method') as MFAMethod) || MFAMethod.SMS;
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  const [mfaData, setMFAData] = useState<MFAData>({
    code: '',
    method: defaultMethod,
    trustDevice: false,
    backupCode: '',
    userId: decodeURIComponent(userId),
    sessionId: decodeURIComponent(sessionId)
  });
  
  const [errors, setErrors] = useState<MFAErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [mfaAttempts, setMFAAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [availableMethods, setAvailableMethods] = useState<MFAMethod[]>([]);
  
  const codeInputRef = useRef<HTMLInputElement>(null);
  
  // Use medical authentication adapter

  // Load available MFA methods
  useEffect(() => {
    loadAvailableMethods();
  }, []);

  // Focus code input when method changes
  useEffect(() => {
    codeInputRef.current?.focus();
  }, [mfaData.method]);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setMFAAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  // Load available MFA methods for user
  const loadAvailableMethods = async () => {
    if (!mfaData.userId) return;
    
    try {
      const response = await medicalAuth.getMFAMethods({
        userId: mfaData.userId,
        platform: 'medsight-pro'
      });
      
      if (response.success) {
        setAvailableMethods(response.methods || [MFAMethod.SMS, MFAMethod.EMAIL]);
      }
    } catch (error) {
      console.error('Failed to load MFA methods:', error);
      setAvailableMethods([MFAMethod.SMS, MFAMethod.EMAIL]);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof MFAData, value: string | boolean) => {
    setMFAData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Format code input based on method
  const formatCode = (code: string, method: MFAMethod): string => {
    const config = MFA_METHODS[method];
    
    if (config.format === 'numeric') {
      return code.replace(/\D/g, '').slice(0, config.maxLength);
    } else {
      return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, config.maxLength);
    }
  };

  // Handle MFA verification
  const handleMFAVerification = async () => {
    if (isLocked) {
      setErrors({ general: `Too many attempts. Please wait ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')} before trying again.` });
      return;
    }

    const validationErrors: MFAErrors = {};
    
    if (!mfaData.userId || !mfaData.sessionId) {
      validationErrors.general = 'Invalid session. Please sign in again.';
    }
    
    const currentCode = mfaData.method === MFAMethod.BACKUP_CODE ? mfaData.backupCode : mfaData.code;
    
    if (!currentCode.trim()) {
      validationErrors.code = `${MFA_METHODS[mfaData.method].label} code is required`;
    } else if (currentCode.length < MFA_METHODS[mfaData.method].maxLength) {
      validationErrors.code = `${MFA_METHODS[mfaData.method].label} code must be ${MFA_METHODS[mfaData.method].maxLength} characters`;
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await medicalAuth.verifyMFA({
        userId: mfaData.userId,
        sessionId: mfaData.sessionId,
        code: currentCode,
        method: mfaData.method,
        trustDevice: mfaData.trustDevice,
        platform: 'medsight-pro'
      });

      if (response.success) {
        // Store authentication token
        if (response.token) {
          await medicalAuth.setAuthToken(response.token);
        }
        
        // Redirect to intended destination
        const destination = decodeURIComponent(redirectTo);
        router.push(destination);
      }
      
    } catch (error: any) {
      console.error('MFA verification failed:', error);
      
      const newAttempts = mfaAttempts + 1;
      setMFAAttempts(newAttempts);
      
      // Lock after 3 failed attempts
      if (newAttempts >= 3) {
        setIsLocked(true);
        setLockoutTime(1800); // 30 minute lockout
        setErrors({ general: 'Too many failed attempts. MFA verification locked for 30 minutes for security.' });
      } else {
        if (error.code === 'INVALID_CODE') {
          setErrors({ code: 'Invalid authentication code. Please check and try again.' });
        } else if (error.code === 'CODE_EXPIRED') {
          setErrors({ code: 'Authentication code has expired. Please request a new one.' });
        } else if (error.code === 'SESSION_EXPIRED') {
          setErrors({ general: 'Session has expired. Please sign in again.' });
        } else if (error.code === 'BACKUP_CODE_USED') {
          setErrors({ code: 'This backup code has already been used. Please use a different code.' });
        } else {
          setErrors({ general: `Authentication failed. ${3 - newAttempts} attempts remaining.` });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Request new verification code
  const requestNewCode = async () => {
    if (mfaData.method === MFAMethod.AUTHENTICATOR || mfaData.method === MFAMethod.BACKUP_CODE) {
      setErrors({ general: 'New codes cannot be requested for authenticator app or backup codes.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await medicalAuth.requestMFACode({
        userId: mfaData.userId,
        method: mfaData.method,
        platform: 'medsight-pro'
      });

      if (response.success) {
        setVerificationSent(true);
        setMFAAttempts(0); // Reset attempts on successful resend
        
        // Clear existing code
        setMFAData(prev => ({ ...prev, code: '' }));
        
        // Focus input
        codeInputRef.current?.focus();
      }
      
    } catch (error: any) {
      console.error('Request new code failed:', error);
      
      if (error.code === 'RATE_LIMITED') {
        setErrors({ general: 'Too many requests. Please wait before requesting another code.' });
      } else if (error.code === 'SESSION_EXPIRED') {
        setErrors({ general: 'Session has expired. Please sign in again.' });
      } else {
        setErrors({ general: 'Failed to send new code. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Change MFA method
  const changeMFAMethod = (method: MFAMethod) => {
    setMFAData(prev => ({ 
      ...prev, 
      method,
      code: '',
      backupCode: ''
    }));
    setErrors({});
    setVerificationSent(false);
  };

  // Get current code value
  const getCurrentCode = (): string => {
    return mfaData.method === MFAMethod.BACKUP_CODE ? mfaData.backupCode : mfaData.code;
  };

  // Handle code input change
  const handleCodeChange = (value: string) => {
    const formattedValue = formatCode(value, mfaData.method);
    
    if (mfaData.method === MFAMethod.BACKUP_CODE) {
      handleInputChange('backupCode', formattedValue);
    } else {
      handleInputChange('code', formattedValue);
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
      
      {/* Security particle overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Main MFA form */}
      <div className="relative z-10 w-full max-w-md p-6">
        <GlassCard 
          className="medsight-glass p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(14, 165, 233, 0.04) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(245, 158, 11, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '2px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              <span className="text-2xl">{MFA_METHODS[mfaData.method].icon}</span>
            </div>
            
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ 
                color: 'var(--medsight-primary-50)',
                fontFamily: 'var(--font-primary)',
                lineHeight: 'var(--medsight-line-height)',
                letterSpacing: 'var(--medsight-letter-spacing)'
              }}
            >
              Two-Factor Authentication
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
              {MFA_METHODS[mfaData.method].label}
            </p>
            <div 
              className="text-sm px-3 py-1 rounded-lg inline-block"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Enhanced Medical Security
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
              New authentication code sent successfully!
            </Alert>
          )}

          {/* Method description */}
          <div 
            className="p-4 rounded-lg mb-6"
            style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.1)'
            }}
          >
            <p className="text-white text-sm">
              {MFA_METHODS[mfaData.method].description}
            </p>
          </div>

          {/* MFA method selector */}
          {availableMethods.length > 1 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {availableMethods.map((method) => (
                <GlassButton
                  key={method}
                  onClick={() => changeMFAMethod(method)}
                  className="text-xs p-3"
                  style={{
                    background: mfaData.method === method ?
                      'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: mfaData.method === method ?
                      'var(--medsight-accent-300)' : 'rgba(255, 255, 255, 0.7)',
                    border: mfaData.method === method ?
                      '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span className="text-lg">{MFA_METHODS[method].icon}</span>
                  <span>{MFA_METHODS[method].label}</span>
                </GlassButton>
              ))}
            </div>
          )}

          {/* Code input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-white">
              Authentication Code <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
            </label>
            <Input
              ref={codeInputRef}
              type="text"
              value={getCurrentCode()}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={MFA_METHODS[mfaData.method].placeholder}
              maxLength={MFA_METHODS[mfaData.method].maxLength}
              disabled={isLoading || isLocked}
              className="glass-input"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(16px)',
                border: errors.code ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '0.3em',
                padding: '16px 24px'
              }}
            />
            {errors.code && (
              <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                {errors.code}
              </p>
            )}
          </div>

          {/* Trust this device */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mfaData.trustDevice}
                onChange={(e) => handleInputChange('trustDevice', e.target.checked)}
                className="w-4 h-4 text-medsight-primary-500 bg-transparent border-2 border-white/20 rounded focus:ring-medsight-primary-500 focus:ring-2"
              />
              <span className="text-sm text-white">
                Trust this device for 30 days
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-1 ml-7">
              Skip MFA on this device for trusted locations
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <GlassButton
              onClick={handleMFAVerification}
              disabled={isLoading || isLocked}
              className="w-full"
              style={{
                background: isLocked ? 
                  'rgba(107, 114, 128, 0.5)' :
                  'linear-gradient(135deg, var(--medsight-accent-500) 0%, var(--medsight-accent-600) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 24px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.2)',
                opacity: isLocked ? 0.5 : 1
              }}
            >
              {isLoading ? 'Verifying...' : isLocked ? 
                `Locked for ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')}` : 
                'Verify & Continue'
              }
            </GlassButton>

            {/* Request new code button */}
            {mfaData.method !== MFAMethod.AUTHENTICATOR && mfaData.method !== MFAMethod.BACKUP_CODE && (
              <GlassButton
                onClick={requestNewCode}
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
                {isLoading ? 'Sending...' : 'Request New Code'}
              </GlassButton>
            )}
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs mb-2">
              {mfaData.method === MFAMethod.AUTHENTICATOR ? 
                'Use your authenticator app (Google Authenticator, Authy, etc.)' :
                mfaData.method === MFAMethod.BACKUP_CODE ?
                'Use one of your saved backup codes' :
                'Check your messages for the verification code'
              }
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
        </GlassCard>
      </div>
    </div>
  );
} 