'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Replace with actual authentication API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store authentication token
        if (formData.rememberMe) {
          localStorage.setItem('authToken', data.token);
        } else {
          sessionStorage.setItem('authToken', data.token);
        }

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Demo login function
  const handleDemoLogin = async () => {
    setFormData({
      email: 'demo@annotateai.com',
      password: 'demo123',
      rememberMe: false
    });
    
    // Auto-submit after a brief delay
    setTimeout(() => {
      document.getElementById('login-form')?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );
    }, 500);
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
            Welcome to AnnotateAI
          </h1>
          <p className="text-gray-300 text-lg">
            Computer Vision Data Labeling Platform
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="annotate-glass rounded-2xl p-8 space-y-6">
          {/* General Error Message */}
          {errors.general && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`glass-input w-full px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <ExclamationCircleIcon className="w-4 h-4" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`glass-input w-full px-4 py-3 pr-12 text-white placeholder-gray-400 transition-all duration-200 ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                  }`}
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-600 bg-transparent text-annotate-primary-500 focus:ring-annotate-primary-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              
              <Link
                href="/forgot-password"
                className="text-sm text-annotate-primary-400 hover:text-annotate-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple text-white font-medium transition-all duration-200 hover:from-annotate-primary-600 hover:to-annotate-accent-purple/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-annotate-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            {/* Demo Login Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg glass-btn hover:bg-white/10 text-gray-300 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Try Demo Account
            </button>
          </form>

          {/* Social Login Section */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="glass-btn flex items-center justify-center px-4 py-3 hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-gray-300">Google</span>
            </button>
            
            <button className="glass-btn flex items-center justify-center px-4 py-3 hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 mr-2 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-gray-300">Facebook</span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-annotate-primary-400 hover:text-annotate-primary-300 font-medium transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>

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

export default LoginPage; 