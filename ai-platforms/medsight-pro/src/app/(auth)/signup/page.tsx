'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { medicalAuth } from '@/lib/auth/medical-auth-adapter';
import { 
  GlassCard, 
  GlassButton, 
  Input, 
  Select,
  Checkbox,
  Alert 
} from '@/components/ui';

// Registration step enumeration
enum RegistrationStep {
  PERSONAL_INFO = 1,
  MEDICAL_CREDENTIALS = 2,
  ORGANIZATION = 3,
  SECURITY = 4,
  COMPLIANCE = 5,
  VERIFICATION = 6
}

// Medical registration interface
interface MedicalRegistrationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Medical Credentials
  medicalLicense: string;
  licenseState: string;
  licenseExpiry: string;
  deaNumber?: string;
  npiNumber: string;
  medicalSpecialization: string;
  boardCertifications: string[];
  medicalSchool: string;
  graduationYear: string;
  residencyProgram: string;
  fellowshipProgram?: string;
  
  // Organization
  primaryHospital: string;
  department: string;
  position: string;
  organizationInviteCode?: string;
  additionalAffiliations: string[];
  
  // Security
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  enableMFA: boolean;
  mfaMethod: 'sms' | 'email' | 'authenticator';
  
  // Compliance
  agreeToTerms: boolean;
  agreeToHIPAA: boolean;
  agreeToPrivacy: boolean;
  professionalLiability: boolean;
  backgroundCheck: boolean;
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
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.PERSONAL_INFO);
  const [registrationData, setRegistrationData] = useState<MedicalRegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    medicalLicense: '',
    licenseState: '',
    licenseExpiry: '',
    deaNumber: '',
    npiNumber: '',
    medicalSpecialization: '',
    boardCertifications: [],
    medicalSchool: '',
    graduationYear: '',
    residencyProgram: '',
    fellowshipProgram: '',
    primaryHospital: '',
    department: '',
    position: '',
    organizationInviteCode: '',
    additionalAffiliations: [],
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
    enableMFA: true,
    mfaMethod: 'sms',
    agreeToTerms: false,
    agreeToHIPAA: false,
    agreeToPrivacy: false,
    professionalLiability: false,
    backgroundCheck: false
  });
  
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  
  const stepRefs = useRef<HTMLDivElement[]>([]);
  
  // Initialize medical authentication service
  // Use medical authentication adapter

  // Handle input changes
  const handleInputChange = (field: keyof MedicalRegistrationData, value: any) => {
    setRegistrationData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const stepErrors: RegistrationErrors = {};
    
    switch (currentStep) {
      case RegistrationStep.PERSONAL_INFO:
        if (!registrationData.firstName.trim()) {
          stepErrors.firstName = 'First name is required';
        }
        if (!registrationData.lastName.trim()) {
          stepErrors.lastName = 'Last name is required';
        }
        if (!registrationData.email.trim()) {
          stepErrors.email = 'Email is required';
        } else if (!isValidEmail(registrationData.email)) {
          stepErrors.email = 'Please enter a valid email address';
        }
        if (!registrationData.phone.trim()) {
          stepErrors.phone = 'Phone number is required';
        }
        if (!registrationData.dateOfBirth) {
          stepErrors.dateOfBirth = 'Date of birth is required';
        }
        break;
        
      case RegistrationStep.MEDICAL_CREDENTIALS:
        if (!registrationData.medicalLicense.trim()) {
          stepErrors.medicalLicense = 'Medical license number is required';
        }
        if (!registrationData.licenseState) {
          stepErrors.licenseState = 'License state is required';
        }
        if (!registrationData.licenseExpiry) {
          stepErrors.licenseExpiry = 'License expiry date is required';
        }
        if (!registrationData.npiNumber.trim()) {
          stepErrors.npiNumber = 'NPI number is required';
        } else if (!isValidNPI(registrationData.npiNumber)) {
          stepErrors.npiNumber = 'Please enter a valid 10-digit NPI number';
        }
        if (!registrationData.medicalSpecialization) {
          stepErrors.medicalSpecialization = 'Medical specialization is required';
        }
        if (!registrationData.medicalSchool.trim()) {
          stepErrors.medicalSchool = 'Medical school is required';
        }
        if (!registrationData.graduationYear) {
          stepErrors.graduationYear = 'Graduation year is required';
        }
        break;
        
      case RegistrationStep.ORGANIZATION:
        if (!registrationData.primaryHospital.trim()) {
          stepErrors.primaryHospital = 'Primary hospital/organization is required';
        }
        if (!registrationData.department.trim()) {
          stepErrors.department = 'Department is required';
        }
        if (!registrationData.position.trim()) {
          stepErrors.position = 'Position/title is required';
        }
        break;
        
      case RegistrationStep.SECURITY:
        if (!registrationData.password) {
          stepErrors.password = 'Password is required';
        } else if (!isValidPassword(registrationData.password)) {
          stepErrors.password = 'Password must be at least 12 characters with uppercase, lowercase, number, and special character';
        }
        if (registrationData.password !== registrationData.confirmPassword) {
          stepErrors.confirmPassword = 'Passwords do not match';
        }
        if (!registrationData.securityQuestion.trim()) {
          stepErrors.securityQuestion = 'Security question is required';
        }
        if (!registrationData.securityAnswer.trim()) {
          stepErrors.securityAnswer = 'Security answer is required';
        }
        break;
        
      case RegistrationStep.COMPLIANCE:
        if (!registrationData.agreeToTerms) {
          stepErrors.agreeToTerms = 'You must agree to the terms of service';
        }
        if (!registrationData.agreeToHIPAA) {
          stepErrors.agreeToHIPAA = 'HIPAA compliance agreement is required';
        }
        if (!registrationData.agreeToPrivacy) {
          stepErrors.agreeToPrivacy = 'Privacy policy agreement is required';
        }
        if (!registrationData.professionalLiability) {
          stepErrors.professionalLiability = 'Professional liability confirmation is required';
        }
        if (!registrationData.backgroundCheck) {
          stepErrors.backgroundCheck = 'Background check consent is required';
        }
        break;
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
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
      password.length >= 12 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    );
  };

  // Go to next step
  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < RegistrationStep.VERIFICATION) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > RegistrationStep.PERSONAL_INFO) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Send verification code
  const sendVerificationCode = async () => {
    try {
      setIsLoading(true);
      await medicalAuth.sendVerificationCode({
        email: registrationData.email,
        phone: registrationData.phone,
        type: 'registration'
      });
      setVerificationSent(true);
    } catch (error) {
      setErrors({ verification: 'Failed to send verification code' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle final registration
  const handleRegistration = async () => {
    if (!verificationCode.trim()) {
      setErrors({ verification: 'Verification code is required' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Register medical professional
      const result = await medicalAuth.register({
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email,
        password: registrationData.password,
        medicalLicense: registrationData.medicalLicense,
        specialization: registrationData.medicalSpecialization,
        organization: registrationData.primaryHospital,
        verificationCode,
        userType: 'medical-professional',
        platform: 'medsight-pro'
      });
      
      if (result.success) {
        // Redirect to success page or auto-login
        router.push('/profile-setup?new=true');
      } else {
        setErrors({ 
          verification: result.error || 'Registration failed. Please try again.' 
        });
      }
      
    } catch (error: any) {
      console.error('Medical registration failed:', error);
      setErrors({ 
        verification: error.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get step title
  const getStepTitle = (): string => {
    switch (currentStep) {
      case RegistrationStep.PERSONAL_INFO:
        return 'Personal Information';
      case RegistrationStep.MEDICAL_CREDENTIALS:
        return 'Medical Credentials';
      case RegistrationStep.ORGANIZATION:
        return 'Organization & Affiliation';
      case RegistrationStep.SECURITY:
        return 'Security Setup';
      case RegistrationStep.COMPLIANCE:
        return 'Compliance & Agreements';
      case RegistrationStep.VERIFICATION:
        return 'Account Verification';
      default:
        return 'Registration';
    }
  };

  // Render progress indicator
  const renderProgressIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i + 1 <= currentStep
                ? 'bg-medsight-primary-500 shadow-lg'
                : 'bg-gray-300 opacity-50'
            }`}
            style={{
              backgroundColor: i + 1 <= currentStep ? 'var(--medsight-primary-500)' : 'rgba(255, 255, 255, 0.3)',
              boxShadow: i + 1 <= currentStep ? '0 0 10px rgba(14, 165, 233, 0.5)' : 'none'
            }}
          />
        ))}
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case RegistrationStep.PERSONAL_INFO:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  First Name <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  value={registrationData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.firstName ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.firstName && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Last Name <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  value={registrationData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.lastName ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.lastName && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.lastName}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">
                Email Address <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <Input
                type="email"
                value={registrationData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your professional email"
                className="glass-input"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: errors.email ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              />
              {errors.email && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.email}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Phone Number <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  type="tel"
                  value={registrationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.phone ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.phone && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Date of Birth <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  type="date"
                  value={registrationData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.dateOfBirth ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.dateOfBirth && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.dateOfBirth}</p>}
              </div>
            </div>
          </div>
        );
        
      case RegistrationStep.MEDICAL_CREDENTIALS:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Medical License Number <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  value={registrationData.medicalLicense}
                  onChange={(e) => handleInputChange('medicalLicense', e.target.value.toUpperCase())}
                  placeholder="Enter license number"
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.medicalLicense ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.medicalLicense && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.medicalLicense}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  License State <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Select
                  value={registrationData.licenseState}
                  onChange={(e) => handleInputChange('licenseState', e.target.value)}
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.licenseState ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                >
                  <option value="">Select state</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </Select>
                {errors.licenseState && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.licenseState}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  License Expiry Date <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  type="date"
                  value={registrationData.licenseExpiry}
                  onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.licenseExpiry ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.licenseExpiry && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.licenseExpiry}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  NPI Number <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  value={registrationData.npiNumber}
                  onChange={(e) => handleInputChange('npiNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit NPI number"
                  maxLength={10}
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.npiNumber ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.npiNumber && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.npiNumber}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">
                Medical Specialization <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
              </label>
              <Select
                value={registrationData.medicalSpecialization}
                onChange={(e) => handleInputChange('medicalSpecialization', e.target.value)}
                className="glass-input"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(16px)',
                  border: errors.medicalSpecialization ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: 'white'
                }}
              >
                <option value="">Select specialization</option>
                {MEDICAL_SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </Select>
              {errors.medicalSpecialization && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.medicalSpecialization}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Medical School <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  value={registrationData.medicalSchool}
                  onChange={(e) => handleInputChange('medicalSchool', e.target.value)}
                  placeholder="Name of medical school"
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.medicalSchool ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.medicalSchool && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.medicalSchool}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Graduation Year <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={registrationData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  placeholder="YYYY"
                  className="glass-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.graduationYear ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                />
                {errors.graduationYear && <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>{errors.graduationYear}</p>}
              </div>
            </div>
          </div>
        );
        
      // Continue with additional cases for other steps...
      default:
        return <div>Step content not implemented</div>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
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
      
      {/* Main registration form */}
      <div className="relative z-10 w-full max-w-2xl p-6">
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
          {/* Header */}
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
              Join MedSight Pro
            </h1>
            <p 
              className="text-lg mb-4"
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-primary)',
                lineHeight: 'var(--medsight-line-height)',
                letterSpacing: 'var(--medsight-letter-spacing)'
              }}
            >
              Medical Professional Registration
            </p>
            <p 
              className="text-sm"
              style={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'var(--font-primary)',
                lineHeight: 'var(--medsight-line-height)'
              }}
            >
              Step {currentStep} of 6: {getStepTitle()}
            </p>
          </div>

          {/* Progress indicator */}
          {renderProgressIndicator()}

          {/* Error alerts */}
          {Object.keys(errors).length > 0 && (
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
              Please correct the errors below to continue.
            </Alert>
          )}

          {/* Step content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between space-x-4">
            <GlassButton
              onClick={prevStep}
              disabled={currentStep === RegistrationStep.PERSONAL_INFO}
              className="px-6 py-3"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--medsight-primary-300)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                opacity: currentStep === RegistrationStep.PERSONAL_INFO ? 0.5 : 1,
                cursor: currentStep === RegistrationStep.PERSONAL_INFO ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </GlassButton>
            
            {currentStep < RegistrationStep.VERIFICATION ? (
              <GlassButton
                onClick={nextStep}
                disabled={isLoading}
                className="px-6 py-3"
                style={{
                  background: 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
                }}
              >
                {isLoading ? 'Processing...' : 'Next Step'}
              </GlassButton>
            ) : (
              <GlassButton
                onClick={handleRegistration}
                disabled={isLoading}
                className="px-6 py-3"
                style={{
                  background: 'linear-gradient(135deg, var(--medsight-normal) 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </GlassButton>
            )}
          </div>

          {/* Login link */}
          <div className="text-center mt-6">
            <span 
              className="text-sm"
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 'var(--medsight-line-height)'
              }}
            >
              Already have an account?{' '}
              <Link 
                href="/login"
                className="font-semibold hover:underline transition-colors"
                style={{ color: 'var(--medsight-primary-300)' }}
              >
                Sign In
              </Link>
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 