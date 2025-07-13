'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { DashboardClient } from './dashboard-client';
import Link from 'next/link';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Server Component - can fetch data directly
async function getProjectsData() {
  try {
    // In development, return mock data. In production, this would fetch from database
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3021'}/api/projects`, {
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (!response.ok) {
      console.log('API response not ok, using mock data');
      return getMockData();
    }
    
    const data = await response.json();
    console.log('API data received:', data);
    return data;
  } catch (error) {
    console.log('API call failed, using mock data:', error);
    return getMockData();
  }
}

function getMockData() {
  return {
    stats: {
      totalProjects: 8,
      activeProjects: 3,
      totalImages: 156780,
      annotatedImages: 148421,
      totalVideos: 24,
      annotatedVideos: 18,
      totalAnnotations: 156780,
      qualityScore: 94.7,
      aiAssistanceUsage: 78.3,
      collaborators: 12
    },
    recentProjects: [
      {
        id: 'proj_001',
        name: 'Autonomous Vehicle Dataset',
        description: 'Traffic scene annotation for self-driving cars',
        type: 'object_detection',
        status: 'active',
        progress: 73,
        totalImages: 15420,
        annotatedImages: 11256,
        collaborators: ['Alice Johnson', 'Bob Chen', 'Carol Smith'],
        lastActivity: Date.now() - 1000 * 60 * 30,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 7
      },
      {
        id: 'proj_002',
        name: 'Medical Imaging Analysis',
        description: 'X-ray and CT scan annotation for diagnostic AI',
        type: 'medical_imaging',
        status: 'active',
        progress: 45,
        totalImages: 8750,
        annotatedImages: 3938,
        collaborators: ['Dr. Williams', 'Sarah Davis'],
        lastActivity: Date.now() - 1000 * 60 * 45,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
        dueDate: Date.now() + 1000 * 60 * 60 * 24 * 14
      },
      {
        id: 'proj_003',
        name: 'Retail Product Recognition',
        description: 'E-commerce product catalog annotation',
        type: 'classification',
        status: 'completed',
        progress: 100,
        totalImages: 5200,
        annotatedImages: 5200,
        collaborators: ['Mike Johnson'],
        lastActivity: Date.now() - 1000 * 60 * 60 * 2,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        dueDate: Date.now() - 1000 * 60 * 60 * 24 * 3
      }
    ]
  };
}

function AuthenticatedDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectsData = await getProjectsData();
        setData(projectsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="flex items-center space-x-3">
            <div className="loading-spinner" />
            <span className="text-white text-sm">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we always have the expected data structure
  const stats = data?.stats || {
    totalProjects: 0,
    activeProjects: 0,
    totalImages: 0,
    annotatedImages: 0,
    totalVideos: 0,
    annotatedVideos: 0,
    totalAnnotations: 0,
    qualityScore: 0,
    aiAssistanceUsage: 0,
    collaborators: 0
  };
  
  const recentProjects = data?.recentProjects || [];
  
  return (
    <DashboardClient 
      initialStats={stats}
      initialProjects={recentProjects}
    />
  );
}

function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: any = {};

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
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      // No redirect needed - auth state will change and component will re-render
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Invalid email or password. Please try again.' });
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
    if (errors[name]) {
      setErrors((prev: any) => ({
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

  // Quick demo login - bypass form
  const handleQuickDemo = () => {
    localStorage.setItem('access_token', 'demo-token-123');
    window.location.reload();
  };

  // Force logout - clear all tokens
  const handleForceLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-bold text-2xl">AI</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to AnnotateAI
          </h1>
          <p className="text-white/80 text-lg">
            Computer Vision Data Labeling Platform
          </p>
          <p className="text-white/60 text-sm mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
          {/* General Error Message */}
          {errors.general && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : ''
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
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
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
                  className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
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
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-white/70">Remember me</span>
              </label>
              
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-indigo-500/25"
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
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white/80 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Try Demo Account
            </button>

            {/* Quick Demo Login Button */}
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white/80 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Quick Demo Login
            </button>
          </form>

          {/* Social Login Section */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center px-4 py-3 rounded-lg hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-white/70">Google</span>
            </button>
            
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center px-4 py-3 rounded-lg hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5 mr-2 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-white/70">Facebook</span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-white/60">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-6 text-sm text-white/50">
            <Link href="/help" className="hover:text-white/70 transition-colors">
              Help
            </Link>
            <Link href="/legal/privacy" className="hover:text-white/70 transition-colors">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-white/70 transition-colors">
              Terms
            </Link>
          </div>
          <p className="text-xs text-white/40">
            © 2024 G3DAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading briefly
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="flex items-center space-x-3">
            <div className="loading-spinner" />
            <span className="text-white text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Smart routing: Show appropriate component based on auth state
  return isAuthenticated ? <AuthenticatedDashboard /> : <LoginForm />;
} 