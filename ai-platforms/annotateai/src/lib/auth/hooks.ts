import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { SubscriptionPlan } from '@/types/auth';

// Types
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  selectedPlan: 'free' | 'pro' | 'enterprise' | 'custom';
  organizationName: string;
  organizationSize: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  allowedPlans?: Array<SubscriptionPlan>;
  requiredFeatures?: string[];
}

interface UseLoginFormReturn {
  formData: LoginFormData;
  errors: FormErrors;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
}

interface UseSignupFormReturn {
  formData: SignupFormData;
  errors: FormErrors;
  isLoading: boolean;
  currentStep: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleNext: () => boolean;
  handleBack: () => void;
  validateStep: (step: number) => boolean;
  clearErrors: () => void;
  setFieldError: (field: string, error: string) => void;
  selectPlan: (planId: 'free' | 'pro' | 'enterprise' | 'custom') => void;
  getStepProgress: () => number;
}

// Plan features mapping - add custom plan support
const PLAN_FEATURES = {
  free: [
    'basic_annotation',
    'coco_export',
    'yolo_export',
    'community_support'
  ],
  pro: [
    'basic_annotation',
    'advanced_annotation',
    'ai_assistance',
    'all_export_formats',
    'team_collaboration',
    'priority_support',
    'api_access',
    'analytics'
  ],
  enterprise: [
    'basic_annotation',
    'advanced_annotation',
    'ai_assistance',
    'all_export_formats',
    'team_collaboration',
    'priority_support',
    'api_access',
    'analytics',
    'custom_models',
    'sso_integration',
    'dedicated_support',
    'on_premise',
    'custom_integrations'
  ],
  custom: [
    'basic_annotation',
    'advanced_annotation',
    'ai_assistance',
    'all_export_formats',
    'team_collaboration',
    'priority_support',
    'api_access',
    'analytics',
    'custom_models',
    'sso_integration',
    'dedicated_support',
    'on_premise',
    'custom_integrations',
    'white_label',
    'custom_deployment'
  ]
};

// Plan limits mapping - add custom plan support
const PLAN_LIMITS = {
  free: {
    projects: 5,
    annotationsPerMonth: 1000,
    storage: 1, // GB
    teamMembers: 1
  },
  pro: {
    projects: -1, // unlimited
    annotationsPerMonth: 50000,
    storage: 100, // GB
    teamMembers: 10
  },
  enterprise: {
    projects: -1, // unlimited
    annotationsPerMonth: -1, // unlimited
    storage: -1, // unlimited
    teamMembers: -1 // unlimited
  },
  custom: {
    projects: -1, // unlimited
    annotationsPerMonth: -1, // unlimited
    storage: -1, // unlimited
    teamMembers: -1 // unlimited
  }
};

/**
 * Hook for authentication guard - protects components/pages
 */
export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { 
    isAuthenticated, 
    loading, 
    user 
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const {
    redirectTo = '/login',
    requireAuth = true,
    allowedPlans,
    requiredFeatures = []
  } = options;

  const canAccess = useMemo(() => {
    if (loading) return false;
    
    if (requireAuth && !isAuthenticated) return false;
    
    if (allowedPlans && user && !allowedPlans.includes(user.subscription.plan)) return false;
    
    if (requiredFeatures.length > 0 && user) {
      const userFeatures = PLAN_FEATURES[user.subscription.plan] || [];
      const hasAllFeatures = requiredFeatures.every(feature => 
        userFeatures.includes(feature)
      );
      if (!hasAllFeatures) return false;
    }
    
    return true;
  }, [loading, isAuthenticated, user, requireAuth, allowedPlans, requiredFeatures]);

  useEffect(() => {
    if (loading) return;

    if (!canAccess) {
      const currentPath = pathname;
      let redirectUrl = redirectTo;

      if (requireAuth && !isAuthenticated) {
        redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      } else if (allowedPlans && user && !allowedPlans.includes(user.subscription.plan)) {
        redirectUrl = '/upgrade';
      } else if (requiredFeatures.length > 0) {
        redirectUrl = '/upgrade';
      }

      router.push(redirectUrl);
    }
  }, [canAccess, loading, pathname, router, redirectTo, requireAuth, isAuthenticated, allowedPlans, user, requiredFeatures]);

  return {
    canAccess,
    isLoading: loading,
    user,
    isAuthenticated
  };
};

/**
 * Hook for login form management
 */
export const useLoginForm = (): UseLoginFormReturn => {
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    clearErrors();

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setFieldError('general', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, login, validateForm, clearErrors, setFieldError]);

  return {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSubmit,
    validateForm,
    clearErrors,
    setFieldError
  };
};

/**
 * Hook for signup form management
 */
export const useSignupForm = (): UseSignupFormReturn => {
  const { signup } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedPlan: 'pro',
    organizationName: '',
    organizationSize: '',
    acceptTerms: false,
    acceptPrivacy: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [errors]);

  const selectPlan = useCallback((planId: 'free' | 'pro' | 'enterprise' | 'custom') => {
    setFormData(prev => ({ ...prev, selectedPlan: planId }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      // Account details validation
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
      
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must agree to the terms and conditions';
      }
    }

    if (step === 3 && formData.selectedPlan === 'enterprise') {
      // Organization details validation
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback((): boolean => {
    if (currentStep === 1 && validateStep(1)) {
      setCurrentStep(2);
      return true;
    } else if (currentStep === 2) {
      if (formData.selectedPlan === 'enterprise') {
        setCurrentStep(3);
        return true;
      } else {
        // Submit form for non-enterprise plans
        handleSubmit();
        return false;
      }
    } else if (currentStep === 3 && validateStep(3)) {
      handleSubmit();
      return false;
    }
    return false;
  }, [currentStep, validateStep, formData.selectedPlan]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const getStepProgress = useCallback((): number => {
    const totalSteps = formData.selectedPlan === 'enterprise' ? 3 : 2;
    return (currentStep / totalSteps) * 100;
  }, [currentStep, formData.selectedPlan]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    clearErrors();

    try {
      await signup({
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        plan: formData.selectedPlan,
        organizationName: formData.organizationName,
        organizationSize: formData.organizationSize,
        acceptTerms: formData.acceptTerms,
        acceptPrivacy: formData.acceptPrivacy
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setFieldError('general', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, signup, clearErrors, setFieldError]);

  return {
    formData,
    errors,
    isLoading,
    currentStep,
    handleInputChange,
    handleSubmit,
    handleNext,
    handleBack,
    validateStep,
    clearErrors,
    setFieldError,
    selectPlan,
    getStepProgress
  };
};

/**
 * Hook for user profile management
 */
export const useProfile = () => {
  const { user, updateUser, loading } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateProfile = useCallback(async (updates: Partial<typeof user>) => {
    if (!user) return;

    setIsUpdating(true);
    setErrors({});

    try {
      await updateUser(updates);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setErrors({ general: errorMessage });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [user, updateUser]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    user,
    isLoading: loading || isUpdating,
    errors,
    updateProfile,
    clearErrors
  };
};

/**
 * Hook for permissions and plan management
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const hasFeature = useCallback((feature: string): boolean => {
    if (!user) return false;
    const userFeatures = PLAN_FEATURES[user.subscription.plan] || [];
    return userFeatures.includes(feature);
  }, [user]);

  const hasAnyFeature = useCallback((features: string[]): boolean => {
    return features.some(feature => hasFeature(feature));
  }, [hasFeature]);

  const hasAllFeatures = useCallback((features: string[]): boolean => {
    return features.every(feature => hasFeature(feature));
  }, [hasFeature]);

  const canAccessPlan = useCallback((plan: 'free' | 'pro' | 'enterprise' | 'custom'): boolean => {
    if (!user) return false;
    
    const planHierarchy = { free: 0, pro: 1, enterprise: 2, custom: 3 };
    return planHierarchy[user.subscription.plan] >= planHierarchy[plan];
  }, [user]);

  const getUsageLimit = useCallback((limitType: keyof typeof PLAN_LIMITS['free']): number => {
    if (!user) return 0;
    return PLAN_LIMITS[user.subscription.plan][limitType];
  }, [user]);

  const isWithinLimit = useCallback((limitType: keyof typeof PLAN_LIMITS['free'], currentUsage: number): boolean => {
    const limit = getUsageLimit(limitType);
    return limit === -1 || currentUsage <= limit; // -1 means unlimited
  }, [getUsageLimit]);

  const getUserFeatures = useCallback((): string[] => {
    if (!user) return [];
    return PLAN_FEATURES[user.subscription.plan] || [];
  }, [user]);

  const getPlanLimits = useCallback(() => {
    if (!user) return PLAN_LIMITS.free;
    return PLAN_LIMITS[user.subscription.plan];
  }, [user]);

  return {
    user,
    hasFeature,
    hasAnyFeature,
    hasAllFeatures,
    canAccessPlan,
    getUsageLimit,
    isWithinLimit,
    getUserFeatures,
    getPlanLimits
  };
};

/**
 * Hook for authentication redirects
 */
export const useAuthRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const redirectToLogin = useCallback((options: { returnUrl?: string; message?: string } = {}) => {
    const { returnUrl = pathname, message } = options;
    
    let loginUrl = '/login';
    const params = new URLSearchParams();
    
    if (returnUrl && returnUrl !== '/login') {
      params.set('redirect', returnUrl);
    }
    
    if (message) {
      params.set('message', message);
    }
    
    if (params.toString()) {
      loginUrl += `?${params.toString()}`;
    }
    
    router.push(loginUrl);
  }, [pathname, router]);

  const redirectToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const redirectToSignup = useCallback((plan?: 'free' | 'pro' | 'enterprise') => {
    let signupUrl = '/signup';
    if (plan) {
      signupUrl += `?plan=${plan}`;
    }
    router.push(signupUrl);
  }, [router]);

  const redirectToUpgrade = useCallback((feature?: string) => {
    let upgradeUrl = '/upgrade';
    if (feature) {
      upgradeUrl += `?feature=${feature}`;
    }
    router.push(upgradeUrl);
  }, [router]);

  const handleAuthRedirect = useCallback(() => {
    if (loading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    if (isAuthenticated && redirectUrl) {
      router.push(redirectUrl);
    } else if (isAuthenticated) {
      redirectToDashboard();
    }
  }, [isAuthenticated, loading, router, redirectToDashboard]);

  return {
    redirectToLogin,
    redirectToDashboard,
    redirectToSignup,
    redirectToUpgrade,
    handleAuthRedirect
  };
};

/**
 * Hook for checking authentication status
 */
export const useAuthStatus = () => {
  const { 
    isAuthenticated, 
    loading, 
    user, 
    error
  } = useAuth();

  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    // Since checkAuthStatus doesn't exist, we'll use a simple refresh approach
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!loading && !lastChecked) {
      setLastChecked(new Date());
    }
  }, [loading, lastChecked]);

  return {
    isAuthenticated,
    isLoading: loading,
    isInitialized: !loading,
    user,
    error,
    lastChecked,
    refresh
  };
}; 