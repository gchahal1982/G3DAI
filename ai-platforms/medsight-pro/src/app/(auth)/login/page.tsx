'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { medicalAuth, MedicalLoginCredentials } from '@/lib/auth/medical-auth-adapter';

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
    
    // Email validation - allow demo credentials
    if (!credentials.email.trim()) {
      newErrors.email = 'Email or Medical License is required';
    } else if (
      credentials.email !== 'testuser' && 
      !isValidEmail(credentials.email) && 
      !isValidMedicalLicense(credentials.email)
    ) {
      newErrors.email = 'Please enter a valid email address or medical license number';
    }
    
    // Password validation - allow demo credentials
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (
      credentials.password !== 'testpass' && 
      credentials.password.length < 8
    ) {
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
    
    console.log('🔐 Login attempt started:', { 
      email: credentials.email, 
      hasPassword: !!credentials.password 
    });
    
    if (isLocked) {
      setErrors({ general: `Account locked. Please wait ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')} before trying again.` });
      return;
    }
    
    if (!validateCredentials()) {
      console.log('❌ Validation failed');
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      console.log('🚀 Attempting medical authentication...');
      
      // Attempt medical professional authentication
      const loginResult = await medicalAuth.login({
        email: credentials.email,
        password: credentials.password,
        medicalLicense: credentials.medicalLicense,
        rememberMe: credentials.rememberMe,
        clientInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          ipAddress: 'client-detected',
          platform: 'medsight-pro'
        }
      });
      
      console.log('✅ Login successful:', loginResult);
      
      if (loginResult.requiresMFA) {
        console.log('🔒 MFA required, redirecting...');
        router.push('/mfa?token=' + encodeURIComponent(loginResult.mfaToken));
        return;
      }
      
      if (loginResult.requiresLicenseVerification) {
        console.log('📋 License verification required, redirecting...');
        router.push('/license-verification?token=' + encodeURIComponent(loginResult.verificationToken));
        return;
      }
      
      if (loginResult.requiresProfileSetup) {
        console.log('👤 Profile setup required, redirecting...');
        router.push('/profile-setup');
        return;
      }
      
      // Successful login - redirect to medical dashboard
      console.log('🏥 Redirecting to medical dashboard...');
      
      // Small delay to ensure token is set before redirect
      setTimeout(() => {
        router.push('/dashboard/medical');
      }, 100);
      
    } catch (error: any) {
      console.error('💥 Medical login failed:', error);
      
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
            general: `Login failed: ${error.message || 'Please check your credentials and try again.'}` 
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
    <div className="min-h-screen relative">
      {/* Glassmorphism Background - Same as Dashboard */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-blue-50/30 to-indigo-100/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.08) 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <HeartIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to MedSight Pro
              </h1>
              <p className="text-gray-600 text-sm">
                Advanced Medical AI Platform for Clinical Excellence
              </p>
            </div>

            {/* HIPAA Compliance Badge */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-green-50/50 border border-green-200/50">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-800 text-sm font-medium">HIPAA Compliant Platform</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Alert */}
              {errors.general && (
                <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 text-sm">{errors.general}</span>
                  </div>
                </div>
              )}

              {/* Email/License Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email or Medical License
                </label>
                <input
                  ref={emailInputRef}
                  type="text"
                  placeholder="Enter your email or medical license"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading || isLocked}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.email ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading || isLocked}
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/50 backdrop-blur-sm border ${
                      errors.password ? 'border-red-300' : 'border-white/30'
                    } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading || isLocked}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={credentials.rememberMe}
                    onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                    disabled={isLoading || isLocked}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link 
                  href="/reset-password"
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 hover:scale-[1.02] ${
                  isLocked 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/70 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : isLocked ? (
                  `Locked ${Math.floor(lockoutTime / 60)}:${(lockoutTime % 60).toString().padStart(2, '0')}`
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <LockClosedIcon className="w-5 h-5" />
                    <span>Sign In Securely</span>
                  </div>
                )}
              </button>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  New to MedSight Pro?{' '}
                  <Link 
                    href="/signup"
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    Create an account
                  </Link>
                </span>
              </div>
            </form>
          </div>

          {/* Security Features */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 text-center">
              <div className="text-green-600 text-2xl mb-2">🔒</div>
              <div className="text-sm font-medium text-gray-700">End-to-End Encryption</div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl rounded-xl p-4 border border-white/20 text-center">
              <div className="text-blue-600 text-2xl mb-2">🏥</div>
              <div className="text-sm font-medium text-gray-700">FDA Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 