'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface SignupFormData {
  // Step 1: Account Details
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  
  // Step 2: Plan Selection
  selectedPlan: 'free' | 'pro' | 'enterprise';
  
  // Step 3: Organization (for enterprise)
  organizationName: string;
  organizationSize: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  organizationName?: string;
  general?: string;
}

interface Plan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '5 projects',
      '1,000 annotations/month',
      'Basic AI assistance',
      'COCO & YOLO export',
      'Community support'
    ],
    icon: UserIcon,
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    description: 'For professional teams',
    features: [
      'Unlimited projects',
      '50,000 annotations/month',
      'Advanced AI assistance',
      'All export formats',
      'Priority support',
      'Team collaboration',
      'API access'
    ],
    recommended: true,
    icon: SparklesIcon,
    color: 'from-annotate-primary-500 to-annotate-accent-purple'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Unlimited annotations',
      'Custom AI models',
      'SSO integration',
      'Dedicated support',
      'On-premise deployment',
      'Custom integrations'
    ],
    icon: BuildingOfficeIcon,
    color: 'from-annotate-accent-cyan to-annotate-accent-green'
  }
];

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    selectedPlan: 'pro',
    organizationName: '',
    organizationSize: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation for Step 1
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

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

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Step 3 (Enterprise)
  const validateStep3 = (): boolean => {
    if (formData.selectedPlan !== 'enterprise') return true;

    const newErrors: FormErrors = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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

  // Handle plan selection
  const handlePlanSelect = (planId: 'free' | 'pro' | 'enterprise') => {
    setFormData(prev => ({ ...prev, selectedPlan: planId }));
  };

  // Handle step navigation
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formData.selectedPlan === 'enterprise') {
        setCurrentStep(3);
      } else {
        handleSubmit();
      }
    } else if (currentStep === 3 && validateStep3()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store authentication token
        sessionStorage.setItem('authToken', data.token);
        
        // Redirect to onboarding or dashboard
        router.push('/onboarding');
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Progress indicator
  const getStepProgress = () => {
    const totalSteps = formData.selectedPlan === 'enterprise' ? 3 : 2;
    return (currentStep / totalSteps) * 100;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-annotate-primary-900/20 to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
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
            Join AnnotateAI
          </h1>
          <p className="text-gray-300 text-lg">
            Start labeling computer vision data with AI assistance
          </p>
        </div>

        {/* Progress Bar */}
        <div className="annotate-glass rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-300">
              Step {currentStep} of {formData.selectedPlan === 'enterprise' ? 3 : 2}
            </span>
            <span className="text-sm text-gray-400">
              {currentStep === 1 && 'Account Details'}
              {currentStep === 2 && 'Plan Selection'}
              {currentStep === 3 && 'Organization Details'}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Main Form */}
        <div className="annotate-glass rounded-2xl p-8">
          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center space-x-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Step 1: Account Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Create Your Account</h2>
                <p className="text-gray-400">Enter your details to get started</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`glass-input w-full px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 ${
                      errors.firstName ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      <span>{errors.firstName}</span>
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`glass-input w-full px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 ${
                      errors.lastName ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                      <ExclamationCircleIcon className="w-4 h-4" />
                      <span>{errors.lastName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`glass-input w-full px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                  }`}
                  placeholder="john@company.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`glass-input w-full px-4 py-3 pr-12 text-white placeholder-gray-400 transition-all duration-200 ${
                      errors.password ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                    }`}
                    placeholder="At least 8 characters"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`glass-input w-full px-4 py-3 pr-12 text-white placeholder-gray-400 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                    }`}
                    placeholder="Confirm your password"
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

              {/* Terms Agreement */}
              <div>
                <label className="flex items-start">
                  <input
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 mt-1 rounded border-gray-600 bg-transparent text-annotate-primary-500 focus:ring-annotate-primary-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-300">
                    I agree to the{' '}
                    <Link href="/legal/terms" className="text-annotate-primary-400 hover:text-annotate-primary-300">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/legal/privacy" className="text-annotate-primary-400 hover:text-annotate-primary-300">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    <span>{errors.agreeToTerms}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Plan Selection */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Choose Your Plan</h2>
                <p className="text-gray-400">Select the plan that best fits your needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-200 ${
                      formData.selectedPlan === plan.id
                        ? 'annotate-glass border-annotate-primary-500 ring-2 ring-annotate-primary-500'
                        : 'glass-card hover:scale-105'
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple text-white text-xs font-medium px-3 py-1 rounded-full">
                          Recommended
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                        <plan.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-white mb-1">
                        {plan.price}
                        {plan.price !== 'Custom' && <span className="text-lg text-gray-400">/month</span>}
                      </div>
                      <p className="text-gray-400">{plan.description}</p>
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-300">
                          <CheckCircleIcon className="w-4 h-4 text-annotate-accent-green mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {formData.selectedPlan === plan.id && (
                      <div className="absolute top-4 right-4">
                        <CheckCircleIcon className="w-6 h-6 text-annotate-primary-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Organization Details (Enterprise only) */}
          {currentStep === 3 && formData.selectedPlan === 'enterprise' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Organization Details</h2>
                <p className="text-gray-400">Tell us about your organization</p>
              </div>

              {/* Organization Name */}
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300 mb-2">
                  Organization Name
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className={`glass-input w-full px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 ${
                    errors.organizationName ? 'border-red-500/50 focus:border-red-500' : 'focus:border-annotate-primary-500'
                  }`}
                  placeholder="Your company name"
                />
                {errors.organizationName && (
                  <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    <span>{errors.organizationName}</span>
                  </p>
                )}
              </div>

              {/* Organization Size */}
              <div>
                <label htmlFor="organizationSize" className="block text-sm font-medium text-gray-300 mb-2">
                  Organization Size
                </label>
                <select
                  id="organizationSize"
                  name="organizationSize"
                  value={formData.organizationSize}
                  onChange={handleInputChange}
                  className="glass-input w-full px-4 py-3 text-white bg-transparent focus:border-annotate-primary-500"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-white/10">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center px-6 py-3 rounded-lg glass-btn hover:bg-white/10 text-gray-300 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center px-6 py-3 rounded-lg glass-btn hover:bg-white/10 text-gray-300 transition-all duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Sign In
              </Link>
            )}

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-annotate-primary-500 to-annotate-accent-purple text-white font-medium transition-all duration-200 hover:from-annotate-primary-600 hover:to-annotate-accent-purple/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  {currentStep === 2 && formData.selectedPlan !== 'enterprise' ? 'Create Account' : 'Continue'}
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-annotate-primary-400 hover:text-annotate-primary-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 