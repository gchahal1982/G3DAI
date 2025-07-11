'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
  token?: string;
}

interface TokenValidation {
  isValid: boolean;
  isExpired: boolean;
  email?: string;
  error?: string;
}

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValidation, setTokenValidation] = useState<TokenValidation>({
    isValid: false,
    isExpired: false
  });
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  // Get token and email from URL parameters
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValidation({
          isValid: false,
          isExpired: false,
          error: 'Invalid reset link. Please request a new password reset.'
        });
        setIsValidatingToken(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();

        if (response.ok) {
          setTokenValidation({
            isValid: true,
            isExpired: false,
            email: email
          });
        } else {
          setTokenValidation({
            isValid: false,
            isExpired: data.expired || false,
            error: data.message || 'Invalid or expired reset token'
          });
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenValidation({
          isValid: false,
          isExpired: false,
          error: 'Unable to validate reset token. Please try again.'
        });
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token, email]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password: formData.password
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.expired) {
          setTokenValidation(prev => ({
            ...prev,
            isValid: false,
            isExpired: true,
            error: 'Reset token has expired. Please request a new password reset.'
          }));
        } else {
          setErrors({ general: errorData.message || 'Failed to reset password. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Request new reset link
  const handleRequestNewLink = async () => {
    if (!email) return;

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      router.push('/forgot-password');
    } catch (error) {
      console.error('Request new link error:', error);
    }
  };

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-annotate-primary-900/20 to-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="annotate-glass rounded-2xl p-8">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Validating Reset Link
              </h2>
              <p className="text-gray-400">
                Please wait while we verify your password reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-annotate-primary-900/20 to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-annotate-primary-500 to-annotate-accent-purple rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">AI</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-annotate-accent-cyan rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSuccess ? 'Password Reset Complete' : 
             !tokenValidation.isValid ? 'Invalid Reset Link' : 
             'Set New Password'}
          </h1>
          <p className="text-gray-300 text-lg">
            {isSuccess ? 'Your password has been successfully updated' :
             !tokenValidation.isValid ? 'This reset link is no longer valid' :
             'Create a strong password for your account'}
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="annotate-glass rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-annotate-accent-green to-annotate-accent-cyan rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  Password Successfully Reset
                </h2>
                
                <div className="space-y-3 text-gray-300">
                  <p>
                    Your password has been updated successfully.
                  </p>
                  <p className="text-sm">
                    You can now sign in with your new password.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Link
                href="/login"
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple text-white font-medium transition-all duration-200 hover:from-annotate-primary-600 hover:to-annotate-accent-purple/90"
              >
                <ArrowRightIcon className="w-5 h-5 mr-2" />
                Sign In Now
              </Link>
            </div>
          </div>
        ) : !tokenValidation.isValid ? (
          /* Invalid Token State */
          <div className="annotate-glass rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  {tokenValidation.isExpired ? 'Reset Link Expired' : 'Invalid Reset Link'}
                </h2>
                
                <div className="space-y-3 text-gray-300">
                  <p className="text-red-300">
                    {tokenValidation.error}
                  </p>
                  {tokenValidation.isExpired && (
                    <p className="text-sm">
                      Reset links expire after 24 hours for security reasons.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <button
                onClick={handleRequestNewLink}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple text-white font-medium transition-all duration-200 hover:from-annotate-primary-600 hover:to-annotate-accent-purple/90"
              >
                Request New Reset Link
              </button>
              
              <Link
                href="/login"
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg glass-btn hover:bg-white/10 text-gray-300 font-medium transition-all duration-200"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Reset Password Form */
          <div className="annotate-glass rounded-2xl p-8 space-y-6">
            {/* User Info */}
            <div className="text-center">
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <ShieldCheckIcon className="w-5 h-5 text-annotate-accent-green" />
                  <span className="text-sm text-gray-300">
                    Resetting password for: <span className="font-medium text-white">{tokenValidation.email}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`glass-input w-full pl-10 pr-12 py-3 text-white placeholder-gray-400 transition-all duration-200 ${
                      errors.password ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`glass-input w-full pl-10 pr-12 py-3 text-white placeholder-gray-400 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple text-white font-medium transition-all duration-200 hover:from-annotate-primary-600 hover:to-annotate-accent-purple/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-annotate-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Updating password...
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Update Password
                  </>
                )}
              </button>
            </form>

            {/* Security Tips */}
            <div className="pt-6 border-t border-white/10">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-2">
                  Password Security Tips
                </h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Use a unique password you don't use elsewhere</li>
                  <li>• Include uppercase, lowercase, numbers, and symbols</li>
                  <li>• Make it at least 12 characters long</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <Link href="/help" className="hover:text-gray-300 transition-colors">
              Help
            </Link>
            <Link href="/legal/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-gray-300 transition-colors">
              Terms
            </Link>
          </div>
          <p className="text-xs text-gray-600">
            © 2024 G3DAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 