'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert } from '@/components/ui/Alert';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  RefreshCw,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Stethoscope,
  UserCheck,
  Star,
  TrendingUp,
  Activity
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

const Tabs = ({ value, onValueChange, children, className, ...props }: any) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const TabsList = ({ className, children, ...props }: any) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`} {...props}>
    {children}
  </div>
);

const TabsTrigger = ({ value, className, children, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}
    {...props}
  >
    {children}
  </button>
);

const TabsContent = ({ value, className, children, ...props }: any) => (
  <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`} {...props}>
    {children}
  </div>
);

const AlertDescription = ({ children, ...props }: any) => (
  <div className="text-sm [&_p]:leading-relaxed" {...props}>
    {children}
  </div>
);

interface MedicalCredential {
  id: string;
  userId: string;
  type: 'license' | 'certification' | 'education' | 'training' | 'cme';
  title: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialNumber: string;
  verificationStatus: 'pending' | 'verified' | 'expired' | 'revoked';
  verificationDate?: Date;
  verifierName?: string;
  documents: {
    id: string;
    filename: string;
    url: string;
    uploadDate: Date;
  }[];
  notes: string;
  isActive: boolean;
  renewalRequired: boolean;
  reminderSent: boolean;
  lastVerified: Date;
  nextReview: Date;
}

interface CredentialTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  requiredFields: string[];
  issuingOrganizations: string[];
  validityPeriod: number; // in months
  renewalRequired: boolean;
  verificationRequired: boolean;
}

interface VerificationRequest {
  id: string;
  credentialId: string;
  requestedBy: string;
  requestDate: Date;
  verificationMethod: 'manual' | 'automated' | 'third-party';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  notes: string;
  completedDate?: Date;
}

const MedicalCredentials: React.FC = () => {
  const [credentials, setCredentials] = useState<MedicalCredential[]>([]);
  const [templates, setTemplates] = useState<CredentialTemplate[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCredential, setSelectedCredential] = useState<MedicalCredential | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        // Mock data - replace with actual API calls
        const mockCredentials: MedicalCredential[] = [
          {
            id: '1',
            userId: '1',
            type: 'license',
            title: 'Medical License - California',
            issuingOrganization: 'California Medical Board',
            issueDate: new Date('2012-06-15'),
            expiryDate: new Date('2025-06-15'),
            credentialNumber: 'CA-MD-123456',
            verificationStatus: 'verified',
            verificationDate: new Date('2024-01-15'),
            verifierName: 'Dr. Sarah Johnson',
            documents: [
              {
                id: '1',
                filename: 'medical-license-ca.pdf',
                url: '/documents/medical-license-ca.pdf',
                uploadDate: new Date('2024-01-10')
              }
            ],
            notes: 'Primary medical license for California practice',
            isActive: true,
            renewalRequired: true,
            reminderSent: false,
            lastVerified: new Date('2024-01-15'),
            nextReview: new Date('2024-12-15')
          },
          {
            id: '2',
            userId: '1',
            type: 'certification',
            title: 'American Board of Radiology - Diagnostic Radiology',
            issuingOrganization: 'American Board of Radiology',
            issueDate: new Date('2016-07-20'),
            expiryDate: new Date('2026-07-20'),
            credentialNumber: 'ABR-DR-789012',
            verificationStatus: 'verified',
            verificationDate: new Date('2024-01-20'),
            verifierName: 'Dr. Mark Chen',
            documents: [
              {
                id: '2',
                filename: 'abr-certificate.pdf',
                url: '/documents/abr-certificate.pdf',
                uploadDate: new Date('2024-01-15')
              }
            ],
            notes: 'Board certification in diagnostic radiology',
            isActive: true,
            renewalRequired: true,
            reminderSent: false,
            lastVerified: new Date('2024-01-20'),
            nextReview: new Date('2025-07-20')
          },
          {
            id: '3',
            userId: '1',
            type: 'education',
            title: 'Doctor of Medicine (MD)',
            issuingOrganization: 'Stanford University School of Medicine',
            issueDate: new Date('2012-05-15'),
            credentialNumber: 'SU-MD-2012-456',
            verificationStatus: 'verified',
            verificationDate: new Date('2024-01-10'),
            verifierName: 'Dr. Lisa Rodriguez',
            documents: [
              {
                id: '3',
                filename: 'md-diploma.pdf',
                url: '/documents/md-diploma.pdf',
                uploadDate: new Date('2024-01-08')
              }
            ],
            notes: 'Medical degree from Stanford University',
            isActive: true,
            renewalRequired: false,
            reminderSent: false,
            lastVerified: new Date('2024-01-10'),
            nextReview: new Date('2027-01-10')
          },
          {
            id: '4',
            userId: '1',
            type: 'training',
            title: 'Radiology Residency',
            issuingOrganization: 'UCSF Medical Center',
            issueDate: new Date('2016-06-30'),
            credentialNumber: 'UCSF-RAD-2016-123',
            verificationStatus: 'verified',
            verificationDate: new Date('2024-01-12'),
            verifierName: 'Dr. John Smith',
            documents: [
              {
                id: '4',
                filename: 'residency-completion.pdf',
                url: '/documents/residency-completion.pdf',
                uploadDate: new Date('2024-01-10')
              }
            ],
            notes: 'Completed 4-year radiology residency program',
            isActive: true,
            renewalRequired: false,
            reminderSent: false,
            lastVerified: new Date('2024-01-12'),
            nextReview: new Date('2027-01-12')
          },
          {
            id: '5',
            userId: '1',
            type: 'cme',
            title: 'Continuing Medical Education Credits 2024',
            issuingOrganization: 'American Medical Association',
            issueDate: new Date('2024-01-01'),
            expiryDate: new Date('2024-12-31'),
            credentialNumber: 'AMA-CME-2024-789',
            verificationStatus: 'pending',
            documents: [
              {
                id: '5',
                filename: 'cme-credits-2024.pdf',
                url: '/documents/cme-credits-2024.pdf',
                uploadDate: new Date('2024-01-25')
              }
            ],
            notes: 'Annual CME credits for 2024',
            isActive: true,
            renewalRequired: true,
            reminderSent: false,
            lastVerified: new Date('2024-01-01'),
            nextReview: new Date('2024-12-01')
          },
          {
            id: '6',
            userId: '1',
            type: 'certification',
            title: 'Neuroradiology Subspecialty Certification',
            issuingOrganization: 'American Board of Radiology',
            issueDate: new Date('2018-08-15'),
            expiryDate: new Date('2023-08-15'),
            credentialNumber: 'ABR-NR-345678',
            verificationStatus: 'expired',
            verificationDate: new Date('2023-08-15'),
            verifierName: 'Dr. Jane Doe',
            documents: [
              {
                id: '6',
                filename: 'neuroradiology-cert.pdf',
                url: '/documents/neuroradiology-cert.pdf',
                uploadDate: new Date('2023-08-10')
              }
            ],
            notes: 'Subspecialty certification in neuroradiology - renewal required',
            isActive: false,
            renewalRequired: true,
            reminderSent: true,
            lastVerified: new Date('2023-08-15'),
            nextReview: new Date('2024-02-15')
          }
        ];

        const mockTemplates: CredentialTemplate[] = [
          {
            id: '1',
            type: 'license',
            name: 'Medical License',
            description: 'State medical license for practicing medicine',
            requiredFields: ['state', 'licenseNumber', 'issueDate', 'expiryDate'],
            issuingOrganizations: ['California Medical Board', 'New York State Board', 'Texas Medical Board'],
            validityPeriod: 24,
            renewalRequired: true,
            verificationRequired: true
          },
          {
            id: '2',
            type: 'certification',
            name: 'Board Certification',
            description: 'Specialty board certification',
            requiredFields: ['specialty', 'certificationNumber', 'issueDate', 'expiryDate'],
            issuingOrganizations: ['American Board of Radiology', 'American Board of Internal Medicine'],
            validityPeriod: 120,
            renewalRequired: true,
            verificationRequired: true
          },
          {
            id: '3',
            type: 'education',
            name: 'Medical Degree',
            description: 'Doctor of Medicine degree',
            requiredFields: ['institution', 'graduationDate', 'degree'],
            issuingOrganizations: ['Stanford University', 'Harvard Medical School', 'UCSF'],
            validityPeriod: 0,
            renewalRequired: false,
            verificationRequired: true
          }
        ];

        const mockVerificationRequests: VerificationRequest[] = [
          {
            id: '1',
            credentialId: '5',
            requestedBy: 'admin@hospital.com',
            requestDate: new Date('2024-01-25'),
            verificationMethod: 'manual',
            status: 'pending',
            notes: 'Verify CME credits for 2024'
          },
          {
            id: '2',
            credentialId: '6',
            requestedBy: 'admin@hospital.com',
            requestDate: new Date('2024-01-20'),
            verificationMethod: 'third-party',
            status: 'completed',
            notes: 'Renewal required for neuroradiology certification',
            completedDate: new Date('2024-01-22')
          }
        ];

        setCredentials(mockCredentials);
        setTemplates(mockTemplates);
        setVerificationRequests(mockVerificationRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching credentials:', error);
        setLoading(false);
      }
    };

    fetchCredentials();
  }, []);

  const filteredCredentials = credentials.filter(credential => {
    const matchesSearch = 
      credential.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.issuingOrganization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.credentialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || credential.type === filterType;
    const matchesStatus = filterStatus === 'all' || credential.verificationStatus === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'revoked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'revoked': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'license': return <Award className="w-4 h-4 text-blue-500" />;
      case 'certification': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'education': return <GraduationCap className="w-4 h-4 text-green-500" />;
      case 'training': return <BookOpen className="w-4 h-4 text-orange-500" />;
      case 'cme': return <Activity className="w-4 h-4 text-indigo-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getExpiryStatus = (expiryDate?: Date) => {
    if (!expiryDate) return 'no-expiry';
    
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring-soon';
    if (daysUntilExpiry <= 90) return 'expiring-warning';
    return 'valid';
  };

  const getExpiryColor = (expiryDate?: Date) => {
    const status = getExpiryStatus(expiryDate);
    switch (status) {
      case 'expired': return 'text-red-600';
      case 'expiring-soon': return 'text-red-500';
      case 'expiring-warning': return 'text-yellow-600';
      case 'valid': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const credentialStats = {
    total: credentials.length,
    verified: credentials.filter(c => c.verificationStatus === 'verified').length,
    pending: credentials.filter(c => c.verificationStatus === 'pending').length,
    expired: credentials.filter(c => c.verificationStatus === 'expired').length,
    expiringSoon: credentials.filter(c => getExpiryStatus(c.expiryDate) === 'expiring-soon').length,
    renewalRequired: credentials.filter(c => c.renewalRequired && c.isActive).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Credentials</h1>
          <p className="text-gray-600 mt-1">Manage and verify medical professional credentials</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Credential
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{credentialStats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{credentialStats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{credentialStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{credentialStats.expired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">{credentialStats.expiringSoon}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Renewal Needed</p>
                <p className="text-2xl font-bold text-purple-600">{credentialStats.renewalRequired}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="license">License</SelectItem>
            <SelectItem value="certification">Certification</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="cme">CME Credits</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Credentials List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCredentials.map((credential) => (
          <Card key={credential.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(credential.type)}
                  <div>
                    <CardTitle className="text-lg">{credential.title}</CardTitle>
                    <CardDescription className="mt-1">{credential.issuingOrganization}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(credential.verificationStatus)}
                  <Badge className={getStatusColor(credential.verificationStatus)} variant="secondary">
                    {credential.verificationStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Credential #:</span>
                  <span className="font-medium">{credential.credentialNumber}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">{credential.issueDate.toLocaleDateString()}</span>
                </div>
                
                {credential.expiryDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Expires:</span>
                    <span className={`font-medium ${getExpiryColor(credential.expiryDate)}`}>
                      {credential.expiryDate.toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Verified:</span>
                  <span className="font-medium">{credential.lastVerified.toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-medium">{credential.documents.length}</span>
                </div>
                
                {credential.renewalRequired && (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Renewal Required</span>
                  </div>
                )}
                
                {credential.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {credential.notes}
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCredential(credential)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  {credential.verificationStatus === 'pending' && (
                    <Button variant="ghost" size="sm">
                      <UserCheck className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        {credentialStats.expiringSoon > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{credentialStats.expiringSoon} credentials expiring soon.</strong> 
              Review and renew expiring credentials to maintain compliance.
            </AlertDescription>
          </Alert>
        )}
        
        {credentialStats.pending > 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>{credentialStats.pending} credentials pending verification.</strong> 
              Complete verification process to activate credentials.
            </AlertDescription>
          </Alert>
        )}
        
        {credentialStats.expired > 0 && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{credentialStats.expired} credentials have expired.</strong> 
              Renew expired credentials to restore access privileges.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default MedicalCredentials; 