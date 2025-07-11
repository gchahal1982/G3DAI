'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        if (response.status === 404) {
          setErrors({ email: 'No account found with this email address' });
        } else {
          setErrors({ general: errorData.message || 'Failed to send reset email. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form to try again
  const handleTryAgain = () => {
    setIsSuccess(false);
    setFormData({ email: '' });
    setErrors({});
  };

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
            {isSuccess ? 'Check Your Email' : 'Forgot Password?'}
          </h1>
          <p className="text-gray-300 text-lg">
            {isSuccess 
              ? 'Password reset instructions sent'
              : 'Enter your email to reset your password'
            }
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
                  Reset Email Sent
                </h2>
                
                <div className="space-y-3 text-gray-300">
                  <p>
                    We've sent password reset instructions to:
                  </p>
                  <p className="font-medium text-annotate-primary-400 text-lg">
                    {formData.email}
                  </p>
                  <p className="text-sm">
                    Check your inbox and follow the link to reset your password. 
                    The link will expire in 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-2">
                  Didn't receive the email?
                </h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure the email address is correct</li>
                  <li>• Wait a few minutes for delivery</li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleTryAgain}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg glass-btn hover:bg-white/10 text-gray-300 font-medium transition-all duration-200"
                >
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  Send Another Email
                </button>
                
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple text-white font-medium transition-all duration-200 hover:from-annotate-primary-600 hover:to-annotate-accent-purple/90"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Reset Request Form */
          <div className="annotate-glass rounded-2xl p-8 space-y-6">
            {/* General Error Message */}
            {errors.general && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Instructions */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`glass-input w-full pl-10 pr-4 py-3 text-white placeholder-gray-400 transition-all duration-200 ${
                      errors.email ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    <span>{errors.email}</span>
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
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                    Send Reset Email
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="pt-6 border-t border-white/10">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-annotate-accent-cyan rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">
                      Security Note
                    </h3>
                    <p className="text-xs text-gray-400">
                      For security reasons, we'll only send password reset emails to addresses associated with existing accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        {!isSuccess && (
          <div className="text-center space-y-4">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 text-annotate-primary-400 hover:text-annotate-primary-300 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
            
            <div className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-annotate-primary-400 hover:text-annotate-primary-300 font-medium transition-colors"
              >
                Sign up for free
              </Link>
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

export default ForgotPasswordPage; 