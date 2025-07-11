'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert } from '@/components/ui/Alert';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Award, 
  Shield, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Key, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Save,
  X
} from 'lucide-react';

// Mock UI components for missing imports
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { className?: string }>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);
Input.displayName = 'Input';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    />
  )
);
Label.displayName = 'Label';

const Select = ({ value, onValueChange, children, ...props }: any) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  </div>
);

const SelectTrigger = ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>;
const SelectValue = ({ placeholder }: any) => <option value="">{placeholder}</option>;
const SelectContent = ({ children }: any) => <>{children}</>;
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>;

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { 
  className?: string; 
  onCheckedChange?: (checked: boolean) => void;
}>(
  ({ className, onCheckedChange, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
);
Checkbox.displayName = 'Checkbox';

const AlertDescription = ({ children, ...props }: any) => (
  <div className="text-sm [&_p]:leading-relaxed" {...props}>
    {children}
  </div>
);

interface UserCreationData {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: string;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Professional Information
  department: string;
  specialization: string;
  subSpecialization: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiryDate: string;
  
  // Medical Credentials
  medicalSchool: string;
  graduationYear: number;
  residencyProgram: string;
  boardCertifications: string[];
  continuingEducationCredits: number;
  
  // Employment Details
  employeeId: string;
  hireDate: string;
  employmentType: string;
  supervisor: string;
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
    address: string;
  };
  
  // System Access
  roles: string[];
  startDate: string;
  temporaryPassword: string;
  requirePasswordChange: boolean;
  
  // Preferences
  preferredLanguage: string;
  timezone: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const UserCreation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserCreationData>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    department: '',
    specialization: '',
    subSpecialization: '',
    licenseNumber: '',
    licenseState: '',
    licenseExpiryDate: '',
    medicalSchool: '',
    graduationYear: new Date().getFullYear(),
    residencyProgram: '',
    boardCertifications: [],
    continuingEducationCredits: 0,
    employeeId: '',
    hireDate: '',
    employmentType: '',
    supervisor: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
      address: ''
    },
    roles: [],
    startDate: '',
    temporaryPassword: '',
    requirePasswordChange: true,
    preferredLanguage: 'English',
    timezone: 'America/Los_Angeles',
    notificationPreferences: {
      email: true,
      sms: false,
      push: false
    }
  });
  
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Senior Radiologist',
      description: 'Full access to all medical imaging and diagnostic tools',
      permissions: ['read_all_studies', 'create_reports', 'approve_reports', 'manage_protocols', 'ai_analysis'],
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Radiologist',
      description: 'Standard radiologist access with reporting capabilities',
      permissions: ['read_assigned_studies', 'create_reports', 'use_ai_tools', 'view_analytics'],
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Radiology Technician',
      description: 'Technical staff with limited diagnostic access',
      permissions: ['upload_studies', 'view_protocols', 'basic_measurements', 'schedule_studies'],
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Medical Student',
      description: 'Educational access with supervision requirements',
      permissions: ['read_educational_studies', 'practice_tools', 'view_tutorials'],
      color: 'bg-yellow-500'
    },
    {
      id: '6',
      name: 'Quality Assurance',
      description: 'Quality control and compliance monitoring',
      permissions: ['view_analytics', 'audit_logs', 'manage_protocols', 'create_reports'],
      color: 'bg-indigo-500'
    }
  ]);

  const departments = [
    'Radiology',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Emergency Medicine',
    'Internal Medicine',
    'Surgery',
    'Pediatrics',
    'Oncology',
    'Pathology',
    'Anesthesiology',
    'Dermatology',
    'Psychiatry',
    'Ophthalmology',
    'ENT',
    'Urology',
    'Gastroenterology',
    'Pulmonology',
    'Endocrinology',
    'Rheumatology',
    'Quality Assurance',
    'Administration',
    'IT',
    'Education'
  ];

  const specializations = [
    'Diagnostic Radiology',
    'Interventional Radiology',
    'Neuroradiology',
    'Musculoskeletal Radiology',
    'Cardiac Imaging',
    'Chest Radiology',
    'Abdominal Radiology',
    'Pediatric Radiology',
    'Nuclear Medicine',
    'Radiation Oncology',
    'Radiologic Technology',
    'Medical Physics',
    'System Administration',
    'Quality Assurance',
    'Medical Student',
    'Resident',
    'Fellow'
  ];

  const employmentTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Locum Tenens',
    'Resident',
    'Fellow',
    'Student',
    'Volunteer'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Basic personal details' },
    { id: 2, title: 'Address & Contact', description: 'Address and contact information' },
    { id: 3, title: 'Professional Details', description: 'Medical credentials and license' },
    { id: 4, title: 'Medical Credentials', description: 'Education and certifications' },
    { id: 5, title: 'Employment', description: 'Employment and supervisor details' },
    { id: 6, title: 'Emergency Contact', description: 'Emergency contact information' },
    { id: 7, title: 'System Access', description: 'Roles and permissions' },
    { id: 8, title: 'Preferences', description: 'System preferences and settings' },
    { id: 9, title: 'Review & Submit', description: 'Review and confirm details' }
  ];

  const handleInputChange = (field: keyof UserCreationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors for this field
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const handleNestedInputChange = (parentField: keyof UserCreationData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [field]: value
      }
    }));
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationError[] = [];
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.push({ field: 'firstName', message: 'First name is required' });
        if (!formData.lastName.trim()) newErrors.push({ field: 'lastName', message: 'Last name is required' });
        if (!formData.email.trim()) newErrors.push({ field: 'email', message: 'Email is required' });
        if (!formData.phone.trim()) newErrors.push({ field: 'phone', message: 'Phone number is required' });
        if (!formData.dateOfBirth) newErrors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
        break;
      
      case 2:
        if (!formData.address.trim()) newErrors.push({ field: 'address', message: 'Address is required' });
        if (!formData.city.trim()) newErrors.push({ field: 'city', message: 'City is required' });
        if (!formData.state.trim()) newErrors.push({ field: 'state', message: 'State is required' });
        if (!formData.zipCode.trim()) newErrors.push({ field: 'zipCode', message: 'ZIP code is required' });
        break;
      
      case 3:
        if (!formData.department) newErrors.push({ field: 'department', message: 'Department is required' });
        if (!formData.specialization) newErrors.push({ field: 'specialization', message: 'Specialization is required' });
        if (!formData.licenseNumber.trim()) newErrors.push({ field: 'licenseNumber', message: 'License number is required' });
        if (!formData.licenseState) newErrors.push({ field: 'licenseState', message: 'License state is required' });
        if (!formData.licenseExpiryDate) newErrors.push({ field: 'licenseExpiryDate', message: 'License expiry date is required' });
        break;
      
      case 4:
        if (!formData.medicalSchool.trim()) newErrors.push({ field: 'medicalSchool', message: 'Medical school is required' });
        if (!formData.graduationYear || formData.graduationYear < 1900) newErrors.push({ field: 'graduationYear', message: 'Valid graduation year is required' });
        break;
      
      case 5:
        if (!formData.employeeId.trim()) newErrors.push({ field: 'employeeId', message: 'Employee ID is required' });
        if (!formData.hireDate) newErrors.push({ field: 'hireDate', message: 'Hire date is required' });
        if (!formData.employmentType) newErrors.push({ field: 'employmentType', message: 'Employment type is required' });
        break;
      
      case 6:
        if (!formData.emergencyContact.name.trim()) newErrors.push({ field: 'emergencyContact.name', message: 'Emergency contact name is required' });
        if (!formData.emergencyContact.phone.trim()) newErrors.push({ field: 'emergencyContact.phone', message: 'Emergency contact phone is required' });
        if (!formData.emergencyContact.relationship.trim()) newErrors.push({ field: 'emergencyContact.relationship', message: 'Relationship is required' });
        break;
      
      case 7:
        if (formData.roles.length === 0) newErrors.push({ field: 'roles', message: 'At least one role must be selected' });
        if (!formData.startDate) newErrors.push({ field: 'startDate', message: 'Start date is required' });
        if (!formData.temporaryPassword.trim()) newErrors.push({ field: 'temporaryPassword', message: 'Temporary password is required' });
        break;
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      // API call to create user
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      
      // Success handling
      alert('User created successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        department: '',
        specialization: '',
        subSpecialization: '',
        licenseNumber: '',
        licenseState: '',
        licenseExpiryDate: '',
        medicalSchool: '',
        graduationYear: new Date().getFullYear(),
        residencyProgram: '',
        boardCertifications: [],
        continuingEducationCredits: 0,
        employeeId: '',
        hireDate: '',
        employmentType: '',
        supervisor: '',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: '',
          address: ''
        },
        roles: [],
        startDate: '',
        temporaryPassword: '',
        requirePasswordChange: true,
        preferredLanguage: 'English',
        timezone: 'America/Los_Angeles',
        notificationPreferences: {
          email: true,
          sms: false,
          push: false
        }
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={getFieldError('firstName') ? 'border-red-500' : ''}
                />
                {getFieldError('firstName') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('firstName')}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={getFieldError('lastName') ? 'border-red-500' : ''}
                />
                {getFieldError('lastName') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('lastName')}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={getFieldError('email') ? 'border-red-500' : ''}
              />
              {getFieldError('email') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={getFieldError('phone') ? 'border-red-500' : ''}
                />
                {getFieldError('phone') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('phone')}</p>
                )}
              </div>
              <div>
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  id="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={getFieldError('dateOfBirth') ? 'border-red-500' : ''}
              />
              {getFieldError('dateOfBirth') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('dateOfBirth')}</p>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={getFieldError('address') ? 'border-red-500' : ''}
              />
              {getFieldError('address') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('address')}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={getFieldError('city') ? 'border-red-500' : ''}
                />
                {getFieldError('city') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('city')}</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger className={getFieldError('state') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError('state') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('state')}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={getFieldError('zipCode') ? 'border-red-500' : ''}
                />
                {getFieldError('zipCode') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('zipCode')}</p>
                )}
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger className={getFieldError('department') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('department') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('department')}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialization">Specialization *</Label>
                <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                  <SelectTrigger className={getFieldError('specialization') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError('specialization') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('specialization')}</p>
                )}
              </div>
              <div>
                <Label htmlFor="subSpecialization">Sub-specialization</Label>
                <Input
                  id="subSpecialization"
                  value={formData.subSpecialization}
                  onChange={(e) => handleInputChange('subSpecialization', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="licenseNumber">License Number *</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className={getFieldError('licenseNumber') ? 'border-red-500' : ''}
                />
                {getFieldError('licenseNumber') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('licenseNumber')}</p>
                )}
              </div>
              <div>
                <Label htmlFor="licenseState">License State *</Label>
                <Select value={formData.licenseState} onValueChange={(value) => handleInputChange('licenseState', value)}>
                  <SelectTrigger className={getFieldError('licenseState') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError('licenseState') && (
                  <p className="text-sm text-red-500 mt-1">{getFieldError('licenseState')}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="licenseExpiryDate">License Expiry Date *</Label>
              <Input
                id="licenseExpiryDate"
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                className={getFieldError('licenseExpiryDate') ? 'border-red-500' : ''}
              />
              {getFieldError('licenseExpiryDate') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('licenseExpiryDate')}</p>
              )}
            </div>
          </div>
        );
      
      case 7:
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Roles *</Label>
              <div className="space-y-3 mt-2">
                {availableRoles.map(role => (
                  <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={role.id}
                      checked={formData.roles.includes(role.id)}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                        <Label htmlFor={role.id} className="font-medium">{role.name}</Label>
                      </div>
                      <p className="text-sm text-gray-600">{role.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.permissions.slice(0, 3).map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {getFieldError('roles') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('roles')}</p>
              )}
            </div>
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={getFieldError('startDate') ? 'border-red-500' : ''}
              />
              {getFieldError('startDate') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('startDate')}</p>
              )}
            </div>
            <div>
              <Label htmlFor="temporaryPassword">Temporary Password *</Label>
              <Input
                id="temporaryPassword"
                type="password"
                value={formData.temporaryPassword}
                onChange={(e) => handleInputChange('temporaryPassword', e.target.value)}
                className={getFieldError('temporaryPassword') ? 'border-red-500' : ''}
              />
              {getFieldError('temporaryPassword') && (
                <p className="text-sm text-red-500 mt-1">{getFieldError('temporaryPassword')}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requirePasswordChange"
                checked={formData.requirePasswordChange}
                onCheckedChange={(checked) => handleInputChange('requirePasswordChange', checked)}
              />
              <Label htmlFor="requirePasswordChange">Require password change on first login</Label>
            </div>
          </div>
        );
      
      case 9:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Review User Details</h3>
              <p className="text-sm text-blue-700">
                Please review all information before creating the user account.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Name:</strong> {formData.firstName} {formData.middleName} {formData.lastName}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Phone:</strong> {formData.phone}</div>
                  <div><strong>Date of Birth:</strong> {formData.dateOfBirth}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Department:</strong> {formData.department}</div>
                  <div><strong>Specialization:</strong> {formData.specialization}</div>
                  <div><strong>License:</strong> {formData.licenseNumber} ({formData.licenseState})</div>
                  <div><strong>Employee ID:</strong> {formData.employeeId}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formData.roles.map(roleId => {
                      const role = availableRoles.find(r => r.id === roleId);
                      return role ? (
                        <div key={roleId} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                          <span>{role.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Start Date:</strong> {formData.startDate}</div>
                  <div><strong>Temporary Password:</strong> ••••••••</div>
                  <div><strong>Password Change Required:</strong> {formData.requirePasswordChange ? 'Yes' : 'No'}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return <div>Step content not implemented</div>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
          <p className="text-gray-600 mt-1">Add a new medical professional to the system</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            Step {currentStep} of {steps.length}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div key={step.id} className={`flex flex-col items-center ${index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1 < currentStep ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className="text-xs mt-1 text-center max-w-20">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please correct the following errors:
            <ul className="list-disc list-inside mt-2">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UserCreation; 