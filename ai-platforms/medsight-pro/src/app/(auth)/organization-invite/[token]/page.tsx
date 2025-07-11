'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { medicalAuth } from '@/lib/auth/medical-auth-adapter';
import { 
  Card, 
  Button, 
  Alert 
} from '@/components/ui';

// Organization invitation data
interface InvitationData {
  token: string;
  organizationName: string;
  organizationType: string;
  inviterName: string;
  inviterRole: string;
  assignedRole: string;
  departmentName: string;
  permissions: string[];
  hospitalSystem: string;
  location: string;
  licenseRequirements: string[];
  expirationDate: string;
  isValid: boolean;
}

// Invitation errors
interface InvitationErrors {
  [key: string]: string;
}

// Medical organization types
const ORGANIZATION_TYPES: { [key: string]: string } = {
  'hospital': 'Hospital',
  'clinic': 'Medical Clinic',
  'practice': 'Private Practice',
  'academic': 'Academic Medical Center',
  'emergency': 'Emergency Medical Services',
  'specialty': 'Specialty Medical Center',
  'rehabilitation': 'Rehabilitation Center',
  'urgent_care': 'Urgent Care Center',
  'telehealth': 'Telehealth Provider'
};

// Medical roles
const MEDICAL_ROLES: { [key: string]: string } = {
  'attending': 'Attending Physician',
  'resident': 'Medical Resident',
  'fellow': 'Medical Fellow',
  'radiologist': 'Radiologist',
  'technician': 'Medical Technician',
  'administrator': 'Medical Administrator',
  'nurse': 'Registered Nurse',
  'consultant': 'Medical Consultant'
};

export default function OrganizationInvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [errors, setErrors] = useState<InvitationErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  
  // Initialize medical authentication service
  // Use medical authentication adapter

  // Load invitation details
  useEffect(() => {
    if (token) {
      loadInvitationDetails();
    }
  }, [token]);

  // Load invitation details from token
  const loadInvitationDetails = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await medicalAuth.getOrganizationInvitation({
        token,
        platform: 'medsight-pro'
      });

      if (response.success && response.invitation) {
        setInvitationData(response.invitation);
      } else {
        setErrors({ general: 'Invalid or expired invitation link.' });
      }
      
    } catch (error: any) {
      console.error('Failed to load invitation:', error);
      
      if (error.code === 'TOKEN_EXPIRED') {
        setErrors({ general: 'This invitation has expired. Please contact the organization for a new invitation.' });
      } else if (error.code === 'TOKEN_INVALID') {
        setErrors({ general: 'Invalid invitation link. Please check the link and try again.' });
      } else if (error.code === 'ALREADY_MEMBER') {
        setErrors({ general: 'You are already a member of this organization.' });
      } else if (error.code === 'INVITATION_REVOKED') {
        setErrors({ general: 'This invitation has been revoked by the organization.' });
      } else {
        setErrors({ general: 'Failed to load invitation details. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Accept organization invitation
  const acceptInvitation = async () => {
    if (!invitationData) return;

    setIsAccepting(true);
    setErrors({});

    try {
      const response = await medicalAuth.acceptOrganizationInvitation({
        token,
        platform: 'medsight-pro'
      });

      if (response.success) {
        setIsAccepted(true);
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push('/dashboard/medical');
        }, 3000);
      } else {
        setErrors({ general: 'Failed to accept invitation. Please try again.' });
      }
      
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      
      if (error.code === 'LICENSE_MISMATCH') {
        setErrors({ general: 'Your medical license does not meet the requirements for this organization.' });
      } else if (error.code === 'ACCOUNT_REQUIRED') {
        setErrors({ general: 'Please create a MedSight Pro account first before accepting this invitation.' });
      } else if (error.code === 'VERIFICATION_REQUIRED') {
        setErrors({ general: 'Please complete account verification before accepting this invitation.' });
      } else {
        setErrors({ general: 'Failed to accept invitation. Please try again or contact support.' });
      }
    } finally {
      setIsAccepting(false);
    }
  };

  // Decline invitation
  const declineInvitation = async () => {
    if (!invitationData) return;

    try {
      await medicalAuth.declineOrganizationInvitation({
        token,
        platform: 'medsight-pro'
      });
      
      router.push('/login?invitation=declined');
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      // Still redirect on error
      router.push('/login');
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--medsight-primary-900) 0%, var(--medsight-primary-700) 100%)',
          }}
        />
        
        <div className="relative z-10 w-full max-w-md p-6">
          <Card 
            className="medsight-glass p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(16, 185, 129, 0.04) 100%)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(14, 165, 233, 0.12)',
              borderRadius: '16px'
            }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-sm">Loading invitation details...</p>
          </Card>
        </div>
      </div>
    );
  }

  // Render acceptance success
  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--medsight-primary-900) 0%, var(--medsight-primary-700) 100%)',
          }}
        />
        
        <div className="relative z-10 w-full max-w-md p-6">
          <Card 
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--medsight-normal)' }}>
              Welcome to {invitationData?.organizationName}!
            </h2>
            
            <p className="text-white text-sm mb-6">
              You have successfully joined the organization. You can now access medical workflows and collaborate with your team.
            </p>
            
            <div 
              className="p-4 rounded-lg mb-6"
              style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}
            >
              <p className="text-white text-xs">
                🏥 Organization: {invitationData?.organizationName}<br/>
                👨‍⚕️ Role: {MEDICAL_ROLES[invitationData?.assignedRole || ''] || invitationData?.assignedRole}<br/>
                🏢 Department: {invitationData?.departmentName}
              </p>
            </div>
            
            <Button
              onClick={() => router.push('/dashboard/medical')}
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
              Continue to Dashboard
            </Button>
            
            <p className="text-gray-400 text-xs mt-4">
              Redirecting automatically in 3 seconds...
            </p>
          </Card>
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
        <Card 
          className="medsight-glass p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(16, 185, 129, 0.04) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(14, 165, 233, 0.12)',
            borderRadius: '16px'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '2px solid rgba(14, 165, 233, 0.3)'
              }}
            >
              <span className="text-2xl">🏥</span>
            </div>
            
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--medsight-primary-50)' }}>
              Organization Invitation
            </h1>
            <p className="text-lg mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Join Medical Organization
            </p>
            <div 
              className="text-sm px-3 py-1 rounded-lg inline-block"
              style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              Medical Professional Invitation
            </div>
          </div>

          {/* Error alerts */}
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

          {/* Invitation details */}
          {invitationData && (
            <div className="space-y-6">
              {/* Organization information */}
              <div 
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(14, 165, 233, 0.05)',
                  border: '1px solid rgba(14, 165, 233, 0.1)'
                }}
              >
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {invitationData.organizationName}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Organization Type:</span>
                    <p className="text-white font-medium">
                      {ORGANIZATION_TYPES[invitationData.organizationType] || invitationData.organizationType}
                    </p>
                  </div>
                  
                  {invitationData.hospitalSystem && (
                    <div>
                      <span className="text-gray-300">Hospital System:</span>
                      <p className="text-white font-medium">{invitationData.hospitalSystem}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-300">Location:</span>
                    <p className="text-white font-medium">{invitationData.location}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-300">Department:</span>
                    <p className="text-white font-medium">{invitationData.departmentName}</p>
                  </div>
                </div>
              </div>

              {/* Invitation details */}
              <div 
                className="p-6 rounded-lg"
                style={{
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.1)'
                }}
              >
                <h4 className="text-lg font-semibold mb-4 text-white">Invitation Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Invited by:</span>
                    <p className="text-white font-medium">
                      {invitationData.inviterName} ({invitationData.inviterRole})
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-300">Assigned Role:</span>
                    <p className="text-white font-medium">
                      {MEDICAL_ROLES[invitationData.assignedRole] || invitationData.assignedRole}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-gray-300">Expires:</span>
                    <p className="text-white font-medium">{formatDate(invitationData.expirationDate)}</p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              {invitationData.permissions && invitationData.permissions.length > 0 && (
                <div 
                  className="p-6 rounded-lg"
                  style={{
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.1)'
                  }}
                >
                  <h4 className="text-lg font-semibold mb-4 text-white">Role Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {invitationData.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-white text-sm">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* License requirements */}
              {invitationData.licenseRequirements && invitationData.licenseRequirements.length > 0 && (
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.1)'
                  }}
                >
                  <h4 className="text-sm font-semibold mb-2 text-white">License Requirements</h4>
                  <div className="space-y-1">
                    {invitationData.licenseRequirements.map((requirement, index) => (
                      <p key={index} className="text-white text-xs">• {requirement}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={acceptInvitation}
                  disabled={isAccepting}
                  className="flex-1"
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
                  {isAccepting ? 'Accepting...' : 'Accept Invitation'}
                </Button>
                
                <Button
                  onClick={declineInvitation}
                  disabled={isAccepting}
                  className="flex-1"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--medsight-primary-300)',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(16px)',
                    padding: '16px 24px',
                    fontWeight: '500',
                    fontSize: '16px'
                  }}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-xs mb-2">
              By accepting this invitation, you agree to the organization's policies and terms of use.
            </p>
            <p className="text-gray-400 text-xs">
              Questions? <Link href="/help" className="text-white hover:underline">Contact Support</Link>
            </p>
          </div>

          {/* Back to login link */}
          <div className="text-center mt-6">
            <Link 
              href="/login"
              className="text-sm hover:underline transition-colors"
              style={{ color: 'var(--medsight-primary-300)' }}
            >
              ← Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 