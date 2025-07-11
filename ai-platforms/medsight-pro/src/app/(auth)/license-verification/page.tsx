'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { medicalAuth } from '@/lib/auth/medical-auth-adapter';
import { 
  GlassCard, 
  GlassButton, 
  Input, 
  Alert,
  Select 
} from '@/components/ui';

// Medical license data
interface LicenseData {
  licenseNumber: string;
  state: string;
  specialization: string;
  npiNumber: string;
  deaNumber: string;
  issueDate: string;
  expirationDate: string;
  medicalSchool: string;
  graduationYear: string;
  residencyProgram: string;
  boardCertification: string;
  userId: string;
}

// Form validation errors
interface LicenseErrors {
  [key: string]: string;
}

// US States for license verification
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

// Medical specializations
const MEDICAL_SPECIALIZATIONS = [
  'Anesthesiology', 'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine',
  'Gastroenterology', 'General Surgery', 'Geriatrics', 'Hematology', 'Infectious Disease',
  'Internal Medicine', 'Neurology', 'Neurosurgery', 'Obstetrics & Gynecology', 'Oncology',
  'Ophthalmology', 'Orthopedic Surgery', 'Otolaryngology', 'Pathology', 'Pediatrics',
  'Plastic Surgery', 'Psychiatry', 'Pulmonology', 'Radiology', 'Rheumatology', 'Urology'
];

export default function LicenseVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const redirectTo = searchParams.get('redirect') || '/profile-setup';
  
  const [licenseData, setLicenseData] = useState<LicenseData>({
    licenseNumber: '',
    state: '',
    specialization: '',
    npiNumber: '',
    deaNumber: '',
    issueDate: '',
    expirationDate: '',
    medicalSchool: '',
    graduationYear: '',
    residencyProgram: '',
    boardCertification: '',
    userId: decodeURIComponent(userId)
  });
  
  const [errors, setErrors] = useState<LicenseErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');
  
  const licenseNumberRef = useRef<HTMLInputElement>(null);
  
  // Use medical authentication adapter

  // Focus license number input on mount
  useEffect(() => {
    licenseNumberRef.current?.focus();
  }, []);

  // Handle input changes
  const handleInputChange = (field: keyof LicenseData, value: string) => {
    setLicenseData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate license number format
  const isValidLicenseNumber = (license: string, state: string): boolean => {
    const cleanLicense = license.replace(/\s/g, '').toUpperCase();
    
    // Basic format validation - varies by state
    if (cleanLicense.length < 4 || cleanLicense.length > 15) {
      return false;
    }
    
    // State-specific validation patterns
    const statePatterns: { [key: string]: RegExp } = {
      'California': /^[A-Z]{1,2}\d{5,8}$/,
      'New York': /^\d{6,8}$/,
      'Texas': /^[A-Z]{1,2}\d{5,8}$/,
      'Florida': /^ME\d{6,8}$/,
      // Add more state-specific patterns as needed
    };
    
    const pattern = statePatterns[state];
    if (pattern) {
      return pattern.test(cleanLicense);
    }
    
    // Generic pattern for other states
    return /^[A-Z0-9]{4,15}$/.test(cleanLicense);
  };

  // Validate NPI number
  const isValidNPI = (npi: string): boolean => {
    const cleanNPI = npi.replace(/\D/g, '');
    
    // NPI must be 10 digits
    if (cleanNPI.length !== 10) {
      return false;
    }
    
    // Luhn algorithm check for NPI
    let sum = 0;
    let alt = false;
    
    for (let i = cleanNPI.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNPI[i]);
      
      if (alt) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }
      
      sum += digit;
      alt = !alt;
    }
    
    return sum % 10 === 0;
  };

  // Handle license verification
  const handleLicenseVerification = async () => {
    const validationErrors: LicenseErrors = {};
    
    // Required field validation
    if (!licenseData.licenseNumber.trim()) {
      validationErrors.licenseNumber = 'Medical license number is required';
    } else if (!isValidLicenseNumber(licenseData.licenseNumber, licenseData.state)) {
      validationErrors.licenseNumber = 'Invalid license number format for selected state';
    }
    
    if (!licenseData.state) {
      validationErrors.state = 'State of licensure is required';
    }
    
    if (!licenseData.specialization) {
      validationErrors.specialization = 'Medical specialization is required';
    }
    
    if (!licenseData.npiNumber.trim()) {
      validationErrors.npiNumber = 'NPI number is required';
    } else if (!isValidNPI(licenseData.npiNumber)) {
      validationErrors.npiNumber = 'Invalid NPI number format';
    }
    
    if (!licenseData.medicalSchool.trim()) {
      validationErrors.medicalSchool = 'Medical school is required';
    }
    
    if (!licenseData.graduationYear.trim()) {
      validationErrors.graduationYear = 'Graduation year is required';
    } else {
      const year = parseInt(licenseData.graduationYear);
      const currentYear = new Date().getFullYear();
      if (year < 1950 || year > currentYear) {
        validationErrors.graduationYear = 'Invalid graduation year';
      }
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setIsVerifying(true);
    setErrors({});

    try {
      // Simulate license verification process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await medicalAuth.verifyMedicalLicense({
        userId: licenseData.userId,
        licenseNumber: licenseData.licenseNumber,
        state: licenseData.state,
        specialization: licenseData.specialization,
        npiNumber: licenseData.npiNumber,
        deaNumber: licenseData.deaNumber,
        medicalSchool: licenseData.medicalSchool,
        graduationYear: licenseData.graduationYear,
        residencyProgram: licenseData.residencyProgram,
        boardCertification: licenseData.boardCertification,
        platform: 'medsight-pro'
      });

      if (response.success) {
        setVerificationStatus('verified');
        setVerificationComplete(true);
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          const destination = decodeURIComponent(redirectTo);
          router.push(destination);
        }, 3000);
      } else {
        setVerificationStatus('failed');
        setErrors({ general: 'License verification failed. Please check your information and try again.' });
      }
      
    } catch (error: any) {
      console.error('License verification failed:', error);
      setVerificationStatus('failed');
      
      if (error.code === 'LICENSE_NOT_FOUND') {
        setErrors({ licenseNumber: 'License not found in state database. Please verify your license number.' });
      } else if (error.code === 'LICENSE_EXPIRED') {
        setErrors({ general: 'License has expired. Please renew your license before proceeding.' });
      } else if (error.code === 'LICENSE_SUSPENDED') {
        setErrors({ general: 'License is suspended or revoked. Please contact your state licensing board.' });
      } else if (error.code === 'NPI_MISMATCH') {
        setErrors({ npiNumber: 'NPI number does not match license information.' });
      } else {
        setErrors({ general: 'Verification failed. Please try again or contact support.' });
      }
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  // Render verification success
  if (verificationComplete && verificationStatus === 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--medsight-primary-900) 0%, var(--medsight-primary-700) 100%)',
          }}
        />
        
        <div className="relative z-10 w-full max-w-md p-6">
          <GlassCard 
            className="medsight-glass p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.04) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(16, 185, 129, 0.12)',
              borderRadius: '16px'
            }}
          >
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <svg className="w-8 h-8" style={{ color: 'var(--medsight-normal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--medsight-normal)' }}>
              License Verified Successfully
            </h2>
            
            <p className="text-white text-sm mb-6">
              Your medical license has been verified with the state licensing board. You can now proceed to complete your profile setup.
            </p>
            
            <div 
              className="p-4 rounded-lg mb-6"
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}
            >
              <p className="text-white text-xs">
                ✅ License status: Active<br/>
                🏥 Specialization: {licenseData.specialization}<br/>
                📍 State: {licenseData.state}
              </p>
            </div>
            
            <GlassButton
              onClick={() => router.push(decodeURIComponent(redirectTo))}
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, var(--medsight-primary-500) 0%, var(--medsight-primary-600) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Continue to Profile Setup
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, var(--medsight-primary-900) 0%, var(--medsight-primary-700) 100%)',
        }}
      />
      
      <div className="relative z-10 w-full max-w-2xl p-6">
        <GlassCard 
          className="medsight-glass p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(16, 185, 129, 0.04) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(14, 165, 233, 0.12)',
            borderRadius: '16px'
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--medsight-primary-50)' }}>
              Medical License Verification
            </h1>
            <p className="text-lg mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Verify your medical credentials
            </p>
            <div 
              className="text-sm px-3 py-1 rounded-lg inline-block"
              style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Secure State Board Verification
            </div>
          </div>

          {errors.general && (
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
              {errors.general}
            </Alert>
          )}

          {/* Verification form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Medical License Number <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  ref={licenseNumberRef}
                  type="text"
                  value={licenseData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  placeholder="Enter your medical license number"
                  disabled={isLoading}
                  className="glass-input"
                />
                {errors.licenseNumber && (
                  <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                    {errors.licenseNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  State of Licensure <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <select
                  value={licenseData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={isLoading}
                  className="glass-input w-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.state ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state} style={{ background: '#1f2937', color: 'white' }}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                    {errors.state}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Medical Specialization <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <select
                  value={licenseData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  disabled={isLoading}
                  className="glass-input w-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(16px)',
                    border: errors.specialization ? '1px solid var(--medsight-abnormal)' : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    color: 'white'
                  }}
                >
                  <option value="">Select Specialization</option>
                  {MEDICAL_SPECIALIZATIONS.map(spec => (
                    <option key={spec} value={spec} style={{ background: '#1f2937', color: 'white' }}>
                      {spec}
                    </option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                    {errors.specialization}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  NPI Number <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  type="text"
                  value={licenseData.npiNumber}
                  onChange={(e) => handleInputChange('npiNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit NPI number"
                  maxLength={10}
                  disabled={isLoading}
                  className="glass-input"
                />
                {errors.npiNumber && (
                  <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                    {errors.npiNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Medical School <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  type="text"
                  value={licenseData.medicalSchool}
                  onChange={(e) => handleInputChange('medicalSchool', e.target.value)}
                  placeholder="Name of medical school"
                  disabled={isLoading}
                  className="glass-input"
                />
                {errors.medicalSchool && (
                  <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                    {errors.medicalSchool}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Graduation Year <span style={{ color: 'var(--medsight-abnormal)' }}>*</span>
                </label>
                <Input
                  type="text"
                  value={licenseData.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value.replace(/\D/g, ''))}
                  placeholder="YYYY"
                  maxLength={4}
                  disabled={isLoading}
                  className="glass-input"
                />
                {errors.graduationYear && (
                  <p className="text-sm mt-1" style={{ color: 'var(--medsight-abnormal)' }}>
                    {errors.graduationYear}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  DEA Number <span className="text-gray-400">(if applicable)</span>
                </label>
                <Input
                  type="text"
                  value={licenseData.deaNumber}
                  onChange={(e) => handleInputChange('deaNumber', e.target.value)}
                  placeholder="DEA registration number"
                  disabled={isLoading}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Board Certification <span className="text-gray-400">(if applicable)</span>
                </label>
                <Input
                  type="text"
                  value={licenseData.boardCertification}
                  onChange={(e) => handleInputChange('boardCertification', e.target.value)}
                  placeholder="Board certification"
                  disabled={isLoading}
                  className="glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-white">
                Residency Program <span className="text-gray-400">(if applicable)</span>
              </label>
              <Input
                type="text"
                value={licenseData.residencyProgram}
                onChange={(e) => handleInputChange('residencyProgram', e.target.value)}
                placeholder="Residency program and location"
                disabled={isLoading}
                className="glass-input"
              />
            </div>
          </div>

          {/* Verification progress */}
          {isVerifying && (
            <div 
              className="mt-6 p-4 rounded-lg"
              style={{
                background: 'rgba(14, 165, 233, 0.05)',
                border: '1px solid rgba(14, 165, 233, 0.1)'
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="text-white text-sm">Verifying with state licensing board...</span>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="mt-8">
            <GlassButton
              onClick={handleLicenseVerification}
              disabled={isLoading}
              className="w-full"
              style={{
                background: 'linear-gradient(135deg, var(--medsight-normal) 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 24px',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              {isLoading ? 'Verifying License...' : 'Verify Medical License'}
            </GlassButton>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs mb-2">
              We verify your license with official state licensing boards for security and compliance.
            </p>
            <Link 
              href="/login"
              className="text-sm hover:underline transition-colors"
              style={{ color: 'var(--medsight-primary-300)' }}
            >
              ← Back to Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 