'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { medicalAuth } from '@/lib/auth/medical-auth-adapter';

// Medical registration interface
interface MedicalRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  medicalLicense: string;
  licenseState: string;
  npiNumber: string;
  medicalSpecialization: string;
  primaryHospital: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  agreeToHIPAA: boolean;
}

// Form validation errors
interface RegistrationErrors {
  [key: string]: string;
}

// Medical specializations list
const MEDICAL_SPECIALIZATIONS = [
  'Radiology',
  'Cardiology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Emergency Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Surgery',
  'Anesthesiology',
  'Psychiatry',
  'Pathology',
  'Family Medicine',
  'Dermatology',
  'Ophthalmology',
  'Other'
];

// US States for medical license
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function MedicalSignupPage() {
  const router = useRouter();
  const [registrationData, setRegistrationData] = useState<MedicalRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    medicalLicense: '',
    licenseState: '',
    npiNumber: '',
    medicalSpecialization: '',
    primaryHospital: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToHIPAA: false
  });
  
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleInputChange = (field: keyof MedicalRegistrationData, value: any) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: RegistrationErrors = {};
    
    if (!registrationData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!registrationData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!registrationData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(registrationData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!registrationData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!registrationData.medicalLicense.trim()) {
      newErrors.medicalLicense = 'Medical license is required';
    }
    if (!registrationData.licenseState) {
      newErrors.licenseState = 'License state is required';
    }
    if (!registrationData.npiNumber.trim()) {
      newErrors.npiNumber = 'NPI number is required';
    } else if (!isValidNPI(registrationData.npiNumber)) {
      newErrors.npiNumber = 'Please enter a valid 10-digit NPI number';
    }
    if (!registrationData.medicalSpecialization) {
      newErrors.medicalSpecialization = 'Medical specialization is required';
    }
    if (!registrationData.primaryHospital.trim()) {
      newErrors.primaryHospital = 'Primary hospital/organization is required';
    }
    if (!registrationData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(registrationData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }
    if (registrationData.password !== registrationData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!registrationData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms of service';
    }
    if (!registrationData.agreeToHIPAA) {
      newErrors.agreeToHIPAA = 'HIPAA compliance agreement is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // NPI validation helper
  const isValidNPI = (npi: string): boolean => {
    return /^\d{10}$/.test(npi.replace(/\D/g, ''));
  };

  // Password validation helper
  const isValidPassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
  };

  // Handle registration
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await medicalAuth.register({
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email,
        password: registrationData.password,
        medicalLicense: registrationData.medicalLicense,
        specialization: registrationData.medicalSpecialization,
        organization: registrationData.primaryHospital,
        phone: registrationData.phone,
        npiNumber: registrationData.npiNumber,
        licenseState: registrationData.licenseState,
        userType: 'medical-professional',
        platform: 'medsight-pro'
      });
      
      if (result.success) {
        router.push('/login?message=Registration successful. Please sign in.');
      } else {
        setErrors({ 
          general: result.error || 'Registration failed. Please try again.' 
        });
      }
      
    } catch (error: any) {
      console.error('Medical registration failed:', error);
      setErrors({ 
        general: error.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Registration Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <HeartIcon className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Join MedSight Pro
            </h1>
            <p className="text-gray-600 text-sm">
              Create your medical professional account
            </p>
          </div>

          {/* HIPAA Compliance Badge */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-green-50/50 border border-green-200/50">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">HIPAA Compliant Registration</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegistration} className="space-y-6">
            {/* Error Alert */}
            {errors.general && (
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  value={registrationData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.firstName ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={registrationData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.lastName ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.email ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                  placeholder="your.email@hospital.com"
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={registrationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.phone ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
              </div>
            </div>

            {/* Medical Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Medical License *
                </label>
                <input
                  type="text"
                  value={registrationData.medicalLicense}
                  onChange={(e) => handleInputChange('medicalLicense', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.medicalLicense ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                  placeholder="License number"
                />
                {errors.medicalLicense && <p className="text-red-600 text-sm">{errors.medicalLicense}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  License State *
                </label>
                <select
                  value={registrationData.licenseState}
                  onChange={(e) => handleInputChange('licenseState', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.licenseState ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                >
                  <option value="">Select state</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.licenseState && <p className="text-red-600 text-sm">{errors.licenseState}</p>}
              </div>
            </div>

            {/* NPI and Specialization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  NPI Number *
                </label>
                <input
                  type="text"
                  value={registrationData.npiNumber}
                  onChange={(e) => handleInputChange('npiNumber', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.npiNumber ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                  placeholder="1234567890"
                />
                {errors.npiNumber && <p className="text-red-600 text-sm">{errors.npiNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Specialization *
                </label>
                <select
                  value={registrationData.medicalSpecialization}
                  onChange={(e) => handleInputChange('medicalSpecialization', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                    errors.medicalSpecialization ? 'border-red-300' : 'border-white/30'
                  } text-gray-900 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                >
                  <option value="">Select specialization</option>
                  {MEDICAL_SPECIALIZATIONS.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.medicalSpecialization && <p className="text-red-600 text-sm">{errors.medicalSpecialization}</p>}
              </div>
            </div>

            {/* Primary Hospital */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Primary Hospital/Organization *
              </label>
              <input
                type="text"
                value={registrationData.primaryHospital}
                onChange={(e) => handleInputChange('primaryHospital', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border ${
                  errors.primaryHospital ? 'border-red-300' : 'border-white/30'
                } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                placeholder="Hospital or healthcare organization"
              />
              {errors.primaryHospital && <p className="text-red-600 text-sm">{errors.primaryHospital}</p>}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registrationData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/50 backdrop-blur-sm border ${
                      errors.password ? 'border-red-300' : 'border-white/30'
                    } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registrationData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-white/50 backdrop-blur-sm border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-white/30'
                    } text-gray-900 placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={registrationData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link> *
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-600 text-sm ml-6">{errors.agreeToTerms}</p>}

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeToHIPAA"
                  checked={registrationData.agreeToHIPAA}
                  onChange={(e) => handleInputChange('agreeToHIPAA', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                />
                <label htmlFor="agreeToHIPAA" className="text-sm text-gray-700">
                  I acknowledge HIPAA compliance requirements and <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link> *
                </label>
              </div>
              {errors.agreeToHIPAA && <p className="text-red-600 text-sm ml-6">{errors.agreeToHIPAA}</p>}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/70 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <LockClosedIcon className="w-5 h-5" />
                  <span>Create Medical Account</span>
                </div>
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 