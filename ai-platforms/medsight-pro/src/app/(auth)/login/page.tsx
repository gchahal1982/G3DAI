'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { medicalAuth, MedicalLoginCredentials } from '@/lib/auth/medical-auth-adapter';
import { 
  GlassCard, 
  GlassButton, 
  Input, 
  Checkbox,
  Alert 
} from '@/components/ui';

// Medical professional login form validation
interface LoginFormErrors {
  email?: string;
  password?: string;
  medicalLicense?: string;
  general?: string;
}

export default function MedicalLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<MedicalLoginCredentials>({
    email: '',
    password: '',
    medicalLicense: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Use medical authentication adapter

  // Focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Handle lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  // Validate medical professional credentials
  const validateCredentials = (): boolean => {
    const newErrors: LoginFormErrors = {};
    
    // Email validation
    if (!credentials.email.trim()) {
      newErrors.email = 'Email or Medical License is required';
    } else if (!isValidEmail(credentials.email) && !isValidMedicalLicense(credentials.email)) {
      newErrors.email = 'Please enter a valid email address or medical license number';
    }
    
    // Password validation
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Medical license validation helper
  const isValidMedicalLicense = (license: string): boolean => {
    // Basic medical license format validation (can be enhanced)
    const licenseRegex = /^[A-Z]{1,3}\d{4,8}$/;
    return licenseRegex.test(license.replace(/\s/g, '').toUpperCase());
  };

  // Handle secure medical login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setErrors({ general: `Account locked. Please wait ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')} before trying again.` });
      return;
    }
    
    if (!validateCredentials()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Attempt medical professional authentication
      const loginResult = await medicalAuth.login({
        email: credentials.email,
        password: credentials.password,
        medicalLicense: credentials.medicalLicense,
        rememberMe: credentials.rememberMe,
        clientInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          ipAddress: 'client-detected', // Would be detected server-side
          platform: 'medsight-pro'
        }
      });
      
      if (loginResult.requiresMFA) {
        // Redirect to MFA verification
        router.push('/mfa?token=' + encodeURIComponent(loginResult.mfaToken));
        return;
      }
      
      if (loginResult.requiresLicenseVerification) {
        // Redirect to medical license verification
        router.push('/license-verification?token=' + encodeURIComponent(loginResult.verificationToken));
        return;
      }
      
      if (loginResult.requiresProfileSetup) {
        // Redirect to medical profile setup
        router.push('/profile-setup');
        return;
      }
      
      // Successful login - redirect to medical dashboard
      router.push('/dashboard/medical');
      
    } catch (error: any) {
      console.error('Medical login failed:', error);
      
      // Increment login attempts for security
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        setIsLocked(true);
        setLockoutTime(300); // 5 minute lockout
        setErrors({ general: 'Too many failed attempts. Account locked for 5 minutes for security.' });
      } else {
        // Display appropriate error message
        if (error.code === 'INVALID_CREDENTIALS') {
          setErrors({ 
            general: `Invalid credentials. ${5 - newAttempts} attempts remaining before account lockout.` 
          });
        } else if (error.code === 'ACCOUNT_SUSPENDED') {
          setErrors({ 
            general: 'Account suspended. Please contact medical administration for assistance.' 
          });
        } else if (error.code === 'LICENSE_SUSPENDED') {
          setErrors({ 
            general: 'Medical license suspended. Please verify your license status.' 
          });
        } else {
          setErrors({ 
            general: 'Login failed. Please check your credentials and try again.' 
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof MedicalLoginCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error on change
    if (errors[field as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
      
      {/* Main login form */}
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
          {/* Medical platform header */}
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
              MedSight Pro
            </h1>
            <p 
              className="text-lg"
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-primary)',
                lineHeight: 'var(--medsight-line-height)',
                letterSpacing: 'var(--medsight-letter-spacing)'
              }}
            >
              Medical Professional Portal
            </p>
            <div 
              className="text-sm mt-2 px-3 py-1 rounded-lg"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              HIPAA Compliant • Secure Medical Data Processing
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            {/* General error alert */}
            {errors.general && (
              <Alert 
                variant="error"
                className="medsight-status-abnormal"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white'
                }}
              >
                {errors.general}
              </Alert>
            )}

            {/* Email/License input */}
            <div className="space-y-2">
              <label 
                htmlFor="email"
                className="block text-sm font-semibold"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 'var(--medsight-line-height)'
                }}
              >
                Email or Medical License <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <Input
                ref={emailInputRef}
                id="email"
                type="text"
                placeholder="Email address or medical license number"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isLoading || isLocked}
                className="glass-input"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: errors.email ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  lineHeight: 'var(--medsight-line-height)',
                  letterSpacing: 'var(--medsight-letter-spacing)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: 'white'
                }}
              />
              {errors.email && (
                <p className="text-sm" style={{ color: 'var(--medsight-abnormal)' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label 
                htmlFor="password"
                className="block text-sm font-semibold"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 'var(--medsight-line-height)'
                }}
              >
                Password <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your secure password"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading || isLocked}
                  className="glass-input pr-12"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.password ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    lineHeight: 'var(--medsight-line-height)',
                    letterSpacing: 'var(--medsight-letter-spacing)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: 'white'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm"
                  style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                  disabled={isLoading || isLocked}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm" style={{ color: 'var(--medsight-abnormal)' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember"
                checked={credentials.rememberMe}
                onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                disabled={isLoading || isLocked}
                style={{
                  accentColor: 'var(--medsight-primary-500)'
                }}
              />
              <label 
                htmlFor="remember" 
                className="text-sm"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 'var(--medsight-line-height)'
                }}
              >
                Keep me signed in (secure session)
              </label>
            </div>

            {/* Login button */}
            <GlassButton
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full medical-action-button"
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
                lineHeight: 'var(--medsight-line-height)',
                letterSpacing: 'var(--medsight-letter-spacing)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(14, 165, 233, 0.2)',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.5 : 1
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div 
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    style={{ animation: 'spin 1s linear infinite' }}
                  />
                  <span>Authenticating...</span>
                </div>
              ) : isLocked ? (
                `Locked for ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')}`
              ) : (
                'Sign In Securely'
              )}
            </GlassButton>

            {/* Additional login options */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <Link 
                  href="/reset-password"
                  className="hover:underline transition-colors"
                  style={{ 
                    color: 'var(--medsight-primary-300)',
                    lineHeight: 'var(--medsight-line-height)'
                  }}
                >
                  Forgot Password?
                </Link>
                <Link 
                  href="/forgot-username"
                  className="hover:underline transition-colors"
                  style={{ 
                    color: 'var(--medsight-primary-300)',
                    lineHeight: 'var(--medsight-line-height)'
                  }}
                >
                  Forgot Username?
                </Link>
              </div>
              
              <div className="text-center">
                <span 
                  className="text-sm"
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: 'var(--medsight-line-height)'
                  }}
                >
                  New to MedSight Pro?{' '}
                  <Link 
                    href="/signup"
                    className="font-semibold hover:underline transition-colors"
                    style={{ color: 'var(--medsight-primary-300)' }}
                  >
                    Create Account
                  </Link>
                </span>
              </div>
            </div>

            {/* Security and compliance notice */}
            <div 
              className="text-xs text-center p-3 rounded-lg"
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 'var(--medsight-line-height)'
              }}
            >
              <p className="mb-1">🔒 End-to-end encrypted medical data</p>
              <p className="mb-1">⚡ HIPAA compliant authentication</p>
              <p>🏥 FDA Class II medical device software</p>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}

// Add keyframe animations
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
} 