'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Award, 
  Calendar, 
  Clock, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  History,
  Settings,
  FileText,
  Camera,
  Key,
  Lock,
  Unlock
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  roles: string[];
  department: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiryDate: Date;
  specialization: string;
  subSpecialization?: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isActive: boolean;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string;
  bio?: string;
  preferredLanguage: string;
  timezone: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalCredentials: {
    medicalSchool: string;
    graduationYear: number;
    residencyProgram?: string;
    boardCertifications: string[];
    continuingEducationCredits: number;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface LoginHistory {
  id: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location: string;
  success: boolean;
}

interface UserActivity {
  id: string;
  action: string;
  timestamp: Date;
  details: string;
}

const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Mock data - replace with actual API call
        const mockProfile: UserProfile = {
          id: userId,
          email: 'sarah.johnson@hospital.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          middleName: 'Marie',
          roles: ['1', '2'],
          department: 'Radiology',
          licenseNumber: 'MD123456',
          licenseState: 'CA',
          licenseExpiryDate: new Date('2025-12-31'),
          specialization: 'Diagnostic Radiology',
          subSpecialization: 'Neuroradiology',
          phone: '(555) 123-4567',
          alternatePhone: '(555) 987-6543',
          address: '123 Medical Center Dr',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'United States',
          isActive: true,
          isVerified: true,
          twoFactorEnabled: true,
          lastLogin: new Date('2024-01-25T10:30:00Z'),
          loginCount: 342,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-25T10:30:00Z'),
          bio: 'Experienced diagnostic radiologist specializing in neuroimaging with over 10 years of clinical practice.',
          preferredLanguage: 'English',
          timezone: 'America/Los_Angeles',
          notificationPreferences: {
            email: true,
            sms: true,
            push: false
          },
          emergencyContact: {
            name: 'John Johnson',
            phone: '(555) 999-8888',
            relationship: 'Spouse'
          },
          medicalCredentials: {
            medicalSchool: 'Stanford University School of Medicine',
            graduationYear: 2012,
            residencyProgram: 'UCSF Radiology Residency',
            boardCertifications: ['American Board of Radiology', 'Neuroradiology Subspecialty'],
            continuingEducationCredits: 47
          }
        };

        const mockRoles: Role[] = [
          { id: '1', name: 'Senior Radiologist', description: 'Full diagnostic and supervisory access', color: 'bg-blue-500' },
          { id: '2', name: 'Radiologist', description: 'Standard diagnostic access', color: 'bg-green-500' }
        ];

        const mockLoginHistory: LoginHistory[] = [
          {
            id: '1',
            timestamp: new Date('2024-01-25T10:30:00Z'),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'San Francisco, CA',
            success: true
          },
          {
            id: '2',
            timestamp: new Date('2024-01-24T15:45:00Z'),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'San Francisco, CA',
            success: true
          },
          {
            id: '3',
            timestamp: new Date('2024-01-24T08:15:00Z'),
            ipAddress: '10.0.0.50',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
            location: 'San Francisco, CA',
            success: true
          },
          {
            id: '4',
            timestamp: new Date('2024-01-23T09:20:00Z'),
            ipAddress: '203.0.113.5',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'Unknown Location',
            success: false
          }
        ];

        const mockUserActivity: UserActivity[] = [
          {
            id: '1',
            action: 'Report Created',
            timestamp: new Date('2024-01-25T10:45:00Z'),
            details: 'Created diagnostic report for CT scan #CT-2024-001'
          },
          {
            id: '2',
            action: 'Study Reviewed',
            timestamp: new Date('2024-01-25T10:15:00Z'),
            details: 'Reviewed MRI study for patient ID 12345'
          },
          {
            id: '3',
            action: 'Profile Updated',
            timestamp: new Date('2024-01-24T16:30:00Z'),
            details: 'Updated contact information and emergency contact'
          },
          {
            id: '4',
            action: 'AI Analysis Used',
            timestamp: new Date('2024-01-24T14:20:00Z'),
            details: 'Used AI analysis for chest X-ray interpretation'
          }
        ];

        setProfile(mockProfile);
        setRoles(mockRoles);
        setLoginHistory(mockLoginHistory);
        setUserActivity(mockUserActivity);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    
    setSaving(true);
    try {
      // API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      setProfile(editedProfile);
      setIsEditing(false);
      setEditedProfile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(null);
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedProfile) return;
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };

  const handleNestedInputChange = (parentField: string, field: string, value: any) => {
    if (!editedProfile) return;
    setEditedProfile({
      ...editedProfile,
      [parentField]: {
        ...((editedProfile as any)[parentField as keyof UserProfile] || {}),
        [field]: value
      }
    });
  };

  const getUserRoles = () => {
    if (!profile) return [];
    return profile.roles.map(roleId => roles.find(r => r.id === roleId)).filter(Boolean) as Role[];
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">User profile not found</p>
        </div>
      </div>
    );
  }

  const displayProfile = isEditing ? editedProfile : profile;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {profile.profilePicture ? (
              <img 
                src={profile.profilePicture} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-bold text-2xl">
                {profile.firstName[0]}{profile.lastName[0]}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.firstName} {profile.middleName && `${profile.middleName} `}{profile.lastName}
            </h1>
            <p className="text-gray-600">{profile.specialization}</p>
            <p className="text-gray-500">{profile.department}</p>
            <div className="flex items-center space-x-2 mt-2">
              {getUserRoles().map(role => (
                <Badge key={role.id} variant="secondary" className="text-xs">
                  {role.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(profile.isActive)}
                  <Badge className={getStatusColor(profile.isActive)} variant="secondary">
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verification</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(profile.isVerified)}
                  <Badge className={getStatusColor(profile.isVerified)} variant="secondary">
                    {profile.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">2FA Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(profile.twoFactorEnabled)}
                  <Badge className={getStatusColor(profile.twoFactorEnabled)} variant="secondary">
                    {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <Lock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Login Count</p>
                <p className="text-2xl font-bold text-gray-900">{profile.loginCount}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={displayProfile?.firstName || ''}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={displayProfile?.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={displayProfile?.middleName || ''}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={displayProfile?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={displayProfile?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    value={displayProfile?.alternatePhone || ''}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    value={displayProfile?.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={displayProfile?.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={displayProfile?.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={displayProfile?.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={displayProfile?.zipCode || ''}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={displayProfile?.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={displayProfile?.emergencyContact.name || ''}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={displayProfile?.emergencyContact.phone || ''}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={displayProfile?.emergencyContact.relationship || ''}
                    onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={displayProfile?.licenseNumber || ''}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="licenseState">License State</Label>
                  <Input
                    id="licenseState"
                    value={displayProfile?.licenseState || ''}
                    onChange={(e) => handleInputChange('licenseState', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={displayProfile?.licenseExpiryDate.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleInputChange('licenseExpiryDate', new Date(e.target.value))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={displayProfile?.specialization || ''}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="subSpecialization">Sub-specialization</Label>
                  <Input
                    id="subSpecialization"
                    value={displayProfile?.subSpecialization || ''}
                    onChange={(e) => handleInputChange('subSpecialization', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education & Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="medicalSchool">Medical School</Label>
                  <Input
                    id="medicalSchool"
                    value={displayProfile?.medicalCredentials.medicalSchool || ''}
                    onChange={(e) => handleNestedInputChange('medicalCredentials', 'medicalSchool', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    value={displayProfile?.medicalCredentials.graduationYear || ''}
                    onChange={(e) => handleNestedInputChange('medicalCredentials', 'graduationYear', parseInt(e.target.value))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="residencyProgram">Residency Program</Label>
                  <Input
                    id="residencyProgram"
                    value={displayProfile?.medicalCredentials.residencyProgram || ''}
                    onChange={(e) => handleNestedInputChange('medicalCredentials', 'residencyProgram', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="ceCredits">Continuing Education Credits</Label>
                  <Input
                    id="ceCredits"
                    type="number"
                    value={displayProfile?.medicalCredentials.continuingEducationCredits || ''}
                    onChange={(e) => handleNestedInputChange('medicalCredentials', 'continuingEducationCredits', parseInt(e.target.value))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Board Certifications</Label>
                  <div className="space-y-2">
                    {displayProfile?.medicalCredentials.boardCertifications.map((cert, index) => (
                      <Badge key={index} variant="outline">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Badge className={getStatusColor(profile.twoFactorEnabled)} variant="secondary">
                  {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Recent Login History</h4>
                <div className="space-y-3">
                  {loginHistory.slice(0, 5).map(login => (
                    <div key={login.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          {login.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-medium">
                            {login.success ? 'Successful Login' : 'Failed Login'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {login.timestamp.toLocaleString()} - {login.location}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {login.ipAddress}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-gray-600">{activity.details}</div>
                      <div className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language">Preferred Language</Label>
                <Select value={displayProfile?.preferredLanguage} onValueChange={(value) => handleInputChange('preferredLanguage', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={displayProfile?.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-base font-medium">Notification Preferences</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={displayProfile?.notificationPreferences.email}
                      onChange={(e) => handleNestedInputChange('notificationPreferences', 'email', e.target.checked)}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="emailNotifications">Email notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={displayProfile?.notificationPreferences.sms}
                      onChange={(e) => handleNestedInputChange('notificationPreferences', 'sms', e.target.checked)}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="smsNotifications">SMS notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      checked={displayProfile?.notificationPreferences.push}
                      onChange={(e) => handleNestedInputChange('notificationPreferences', 'push', e.target.checked)}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="pushNotifications">Push notifications</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile; 