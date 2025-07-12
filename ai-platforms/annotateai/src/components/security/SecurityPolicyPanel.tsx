'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Alert, AlertDescription } from '../../../../../shared/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../shared/components/ui/Tabs';
import { Progress } from '../../../../../shared/components/ui/Progress';
import { Input } from '../../../../../shared/components/ui/Input';
import { Label } from '../../../../../shared/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/Select';
import { Textarea } from '../../../../../shared/components/ui/Textarea';
import { Switch } from '../../../../../shared/components/ui/Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../shared/components/ui/Table';
import { ScrollArea } from '../../../../../shared/components/ui/ScrollArea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../../../shared/components/ui/Dialog';
import { 
  Shield, 
  AlertTriangle, 
  Settings, 
  Eye, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Users,
  Key,
  Lock,
  Database,
  Network,
  Server,
  Globe,
  UserCheck,
  Ban,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Play,
  Pause,
  Square,
  Copy,
  Code,
  List,
  BookOpen,
  Award,
  AlertOctagon,
  Info,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Share2,
  Save,
  RotateCcw,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import React from 'react';

interface SecurityPolicy {
  id: string;
  name: string;
  type: 'authentication' | 'authorization' | 'dataProtection' | 'network' | 'compliance' | 'audit';
  description: string;
  status: 'active' | 'inactive' | 'warning' | 'draft';
  compliance: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  createdBy: string;
  violations: number;
  affectedUsers: number;
  rules: PolicyRule[];
  tags: string[];
  version: string;
  isTemplate: boolean;
  enforced: boolean;
  autoRemediation: boolean;
}

interface PolicyRule {
  id: string;
  name: string;
  condition: string;
  action: 'allow' | 'deny' | 'warn' | 'log';
  enabled: boolean;
  priority: number;
  lastTriggered?: string;
  triggerCount: number;
}

interface PolicyViolation {
  id: string;
  policyId: string;
  policyName: string;
  userId: string;
  userName: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ruleId: string;
  ruleName: string;
  source: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  remediation?: string;
}

// Mock data for security policies
const mockPolicies: SecurityPolicy[] = [
  {
    id: 'POL-001',
    name: 'Password Security Policy',
    type: 'authentication',
    description: 'Enforces strong password requirements and rotation policies',
    status: 'active',
    compliance: 95,
    severity: 'high',
    lastUpdated: '2024-01-15T10:30:00Z',
    createdBy: 'admin@annotateai.com',
    violations: 5,
    affectedUsers: 150,
    version: '2.1',
    isTemplate: false,
    enforced: true,
    autoRemediation: true,
    tags: ['password', 'authentication', 'security'],
    rules: [
      {
        id: 'RULE-001',
        name: 'Minimum Password Length',
        condition: 'password.length >= 12',
        action: 'deny',
        enabled: true,
        priority: 1,
        triggerCount: 45
      },
      {
        id: 'RULE-002',
        name: 'Password Complexity',
        condition: 'password.hasUppercase && password.hasLowercase && password.hasNumbers && password.hasSymbols',
        action: 'deny',
        enabled: true,
        priority: 2,
        triggerCount: 23
      }
    ]
  },
  {
    id: 'POL-002',
    name: 'Data Encryption Policy',
    type: 'dataProtection',
    description: 'Requires encryption for all sensitive data at rest and in transit',
    status: 'active',
    compliance: 100,
    severity: 'critical',
    lastUpdated: '2024-01-14T14:20:00Z',
    createdBy: 'security@annotateai.com',
    violations: 0,
    affectedUsers: 300,
    version: '3.0',
    isTemplate: false,
    enforced: true,
    autoRemediation: false,
    tags: ['encryption', 'data-protection', 'compliance'],
    rules: [
      {
        id: 'RULE-003',
        name: 'Data at Rest Encryption',
        condition: 'data.storage.encrypted === true',
        action: 'deny',
        enabled: true,
        priority: 1,
        triggerCount: 0
      },
      {
        id: 'RULE-004',
        name: 'Transit Encryption',
        condition: 'connection.tls >= 1.2',
        action: 'deny',
        enabled: true,
        priority: 2,
        triggerCount: 0
      }
    ]
  },
  {
    id: 'POL-003',
    name: 'Access Control Policy',
    type: 'authorization',
    description: 'Defines role-based access control and permissions',
    status: 'warning',
    compliance: 87,
    severity: 'high',
    lastUpdated: '2024-01-13T09:45:00Z',
    createdBy: 'admin@annotateai.com',
    violations: 12,
    affectedUsers: 200,
    version: '1.8',
    isTemplate: false,
    enforced: true,
    autoRemediation: false,
    tags: ['access-control', 'rbac', 'permissions'],
    rules: [
      {
        id: 'RULE-005',
        name: 'Role-Based Access',
        condition: 'user.hasRole(resource.requiredRole)',
        action: 'deny',
        enabled: true,
        priority: 1,
        triggerCount: 78
      },
      {
        id: 'RULE-006',
        name: 'Time-Based Access',
        condition: 'currentTime.between(user.accessWindow)',
        action: 'warn',
        enabled: true,
        priority: 3,
        triggerCount: 23
      }
    ]
  },
  {
    id: 'POL-004',
    name: 'Network Security Policy',
    type: 'network',
    description: 'Controls network access and traffic filtering',
    status: 'active',
    compliance: 92,
    severity: 'medium',
    lastUpdated: '2024-01-12T16:15:00Z',
    createdBy: 'netadmin@annotateai.com',
    violations: 3,
    affectedUsers: 250,
    version: '2.3',
    isTemplate: false,
    enforced: true,
    autoRemediation: true,
    tags: ['network', 'firewall', 'traffic-control'],
    rules: [
      {
        id: 'RULE-007',
        name: 'IP Whitelist',
        condition: 'source.ip.inWhitelist()',
        action: 'deny',
        enabled: true,
        priority: 1,
        triggerCount: 156
      },
      {
        id: 'RULE-008',
        name: 'Port Restrictions',
        condition: 'port.in(allowedPorts)',
        action: 'deny',
        enabled: true,
        priority: 2,
        triggerCount: 89
      }
    ]
  }
];

const mockViolations: PolicyViolation[] = [
  {
    id: 'VIO-001',
    policyId: 'POL-001',
    policyName: 'Password Security Policy',
    userId: 'user001',
    userName: 'john.doe@annotateai.com',
    timestamp: '2024-01-15T11:30:00Z',
    severity: 'medium',
    description: 'Password does not meet complexity requirements',
    ruleId: 'RULE-002',
    ruleName: 'Password Complexity',
    source: '192.168.1.45',
    status: 'open',
    remediation: 'User must update password to meet complexity requirements'
  },
  {
    id: 'VIO-002',
    policyId: 'POL-003',
    policyName: 'Access Control Policy',
    userId: 'user002',
    userName: 'jane.smith@annotateai.com',
    timestamp: '2024-01-15T10:45:00Z',
    severity: 'high',
    description: 'Attempted access to restricted resource',
    ruleId: 'RULE-005',
    ruleName: 'Role-Based Access',
    source: '10.0.0.23',
    status: 'investigating'
  },
  {
    id: 'VIO-003',
    policyId: 'POL-004',
    policyName: 'Network Security Policy',
    userId: 'user003',
    userName: 'bob.wilson@annotateai.com',
    timestamp: '2024-01-15T09:20:00Z',
    severity: 'low',
    description: 'Connection from non-whitelisted IP',
    ruleId: 'RULE-007',
    ruleName: 'IP Whitelist',
    source: '203.0.113.1',
    status: 'resolved',
    remediation: 'IP added to whitelist after verification'
  }
];

const mockPolicyTemplates = [
  {
    id: 'TEMPLATE-001',
    name: 'GDPR Compliance Policy',
    type: 'compliance',
    description: 'Template for GDPR compliance requirements',
    category: 'Data Protection'
  },
  {
    id: 'TEMPLATE-002',
    name: 'SOC 2 Access Control',
    type: 'authorization',
    description: 'Template for SOC 2 access control requirements',
    category: 'Compliance'
  },
  {
    id: 'TEMPLATE-003',
    name: 'Multi-Factor Authentication',
    type: 'authentication',
    description: 'Template for enforcing MFA requirements',
    category: 'Authentication'
  }
];

export default function SecurityPolicyPanel() {
  const [selectedTab, setSelectedTab] = useState('policies');
  const [policies, setPolicies] = useState<SecurityPolicy[]>(mockPolicies);
  const [violations, setViolations] = useState<PolicyViolation[]>(mockViolations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SecurityPolicy | null>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    condition: '',
    action: 'deny' as const,
    enabled: true,
    priority: 1
  });

  // Filter policies based on search and filters
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || policy.type === filterType;
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Filter violations based on search
  const filteredViolations = violations.filter(violation => 
    violation.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    violation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'authentication': return <Key className="w-4 h-4" />;
      case 'authorization': return <UserCheck className="w-4 h-4" />;
      case 'dataProtection': return <Database className="w-4 h-4" />;
      case 'network': return <Network className="w-4 h-4" />;
      case 'compliance': return <Award className="w-4 h-4" />;
      case 'audit': return <Activity className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const handlePolicyToggle = (policyId: string) => {
    setPolicies(policies.map(policy => 
      policy.id === policyId 
        ? { ...policy, enforced: !policy.enforced }
        : policy
    ));
  };

  const handleRuleToggle = (policyId: string, ruleId: string) => {
    setPolicies(policies.map(policy => 
      policy.id === policyId 
        ? {
            ...policy,
            rules: policy.rules.map(rule => 
              rule.id === ruleId 
                ? { ...rule, enabled: !rule.enabled }
                : rule
            )
          }
        : policy
    ));
  };

  const handleSavePolicy = (policy: SecurityPolicy) => {
    if (editingPolicy) {
      setPolicies(policies.map(p => p.id === policy.id ? policy : p));
    } else {
      setPolicies([...policies, { ...policy, id: `POL-${Date.now()}` }]);
    }
    setEditingPolicy(null);
    setShowPolicyDialog(false);
  };

  const handleDeletePolicy = (policyId: string) => {
    setPolicies(policies.filter(policy => policy.id !== policyId));
  };

  const handleAddRule = (policyId: string) => {
    setPolicies(policies.map(policy => 
      policy.id === policyId 
        ? {
            ...policy,
            rules: [...policy.rules, {
              id: `RULE-${Date.now()}`,
              ...newRule,
              triggerCount: 0
            }]
          }
        : policy
    ));
    setNewRule({
      name: '',
      condition: '',
      action: 'deny',
      enabled: true,
      priority: 1
    });
    setShowRuleDialog(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Policy Management</h2>
          <p className="text-gray-600">Configure and monitor security policies and compliance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Policy
          </Button>
          <Button size="sm" onClick={() => {
            setEditingPolicy(null);
            setShowPolicyDialog(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="authentication">Authentication</SelectItem>
              <SelectItem value="authorization">Authorization</SelectItem>
              <SelectItem value="dataProtection">Data Protection</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="audit">Audit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Policy List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Security Policies</CardTitle>
                  <CardDescription>
                    Manage and configure security policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPolicies.map((policy) => (
                      <div key={policy.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="mt-1">
                              {getTypeIcon(policy.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{policy.name}</h3>
                                <Badge className={getStatusColor(policy.status)}>
                                  {policy.status}
                                </Badge>
                                <Badge className={getSeverityColor(policy.severity)}>
                                  {policy.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Version {policy.version}</span>
                                <span>Updated {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                                <span>{policy.affectedUsers} users</span>
                                <span>{policy.violations} violations</span>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Compliance</span>
                                  <span>{policy.compliance}%</span>
                                </div>
                                <Progress value={policy.compliance} className="h-2 mt-1" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={policy.enforced}
                              onCheckedChange={() => handlePolicyToggle(policy.id)}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedPolicy(policy)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingPolicy(policy);
                                setShowPolicyDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeletePolicy(policy.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policy Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Policy Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPolicy ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Rules ({selectedPolicy.rules.length})</h4>
                        <div className="space-y-2">
                          {selectedPolicy.rules.map((rule) => (
                            <div key={rule.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{rule.name}</div>
                                <div className="text-xs text-gray-500">{rule.action}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {rule.triggerCount}
                                </Badge>
                                <Switch
                                  checked={rule.enabled}
                                  onCheckedChange={() => handleRuleToggle(selectedPolicy.id, rule.id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowRuleDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Rule
                        </Button>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedPolicy.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Configuration</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Auto Remediation</span>
                            <Badge variant={selectedPolicy.autoRemediation ? 'default' : 'secondary'}>
                              {selectedPolicy.autoRemediation ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Enforced</span>
                            <Badge variant={selectedPolicy.enforced ? 'default' : 'secondary'}>
                              {selectedPolicy.enforced ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Created By</span>
                            <span className="text-gray-600">{selectedPolicy.createdBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Select a policy to view details
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Violations</CardTitle>
              <CardDescription>
                Monitor and manage security policy violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{violation.policyName}</div>
                          <div className="text-sm text-gray-500">{violation.ruleName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{violation.userName}</div>
                          <div className="text-sm text-gray-500">{violation.source}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(violation.severity)}>
                          {violation.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {violation.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(violation.status)}>
                          {violation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(violation.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Templates</CardTitle>
              <CardDescription>
                Pre-configured policy templates for common security requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockPolicyTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getTypeIcon(template.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{policies.length}</div>
                <p className="text-xs text-blue-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +2 this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {policies.filter(p => p.status === 'active').length}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +1 this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {violations.filter(v => v.status === 'open').length}
                </div>
                <p className="text-xs text-red-600 mt-1">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  -3 from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(policies.reduce((sum, p) => sum + p.compliance, 0) / policies.length)}%
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +2% this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    policies.reduce((acc, policy) => {
                      acc[policy.type] = (acc[policy.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(type)}
                        <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / policies.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{policy.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${policy.compliance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{policy.compliance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Policy Dialog */}
      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
            </DialogTitle>
            <DialogDescription>
              Configure security policy settings and rules
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-name">Policy Name</Label>
                <Input
                  id="policy-name"
                  placeholder="Enter policy name"
                  defaultValue={editingPolicy?.name}
                />
              </div>
              <div>
                <Label htmlFor="policy-type">Policy Type</Label>
                <Select defaultValue={editingPolicy?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="authentication">Authentication</SelectItem>
                    <SelectItem value="authorization">Authorization</SelectItem>
                    <SelectItem value="dataProtection">Data Protection</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="policy-description">Description</Label>
              <Textarea
                id="policy-description"
                placeholder="Enter policy description"
                defaultValue={editingPolicy?.description}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-severity">Severity</Label>
                <Select defaultValue={editingPolicy?.severity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="policy-tags">Tags</Label>
                <Input
                  id="policy-tags"
                  placeholder="Enter tags (comma-separated)"
                  defaultValue={editingPolicy?.tags?.join(', ')}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch checked={editingPolicy?.enforced ?? true} />
                <Label>Enforced</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={editingPolicy?.autoRemediation ?? false} />
                <Label>Auto Remediation</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPolicyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSavePolicy(editingPolicy || {} as SecurityPolicy)}>
                Save Policy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Rule</DialogTitle>
            <DialogDescription>
              Define a new security rule for this policy
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                placeholder="Enter rule name"
                value={newRule.name}
                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="rule-condition">Condition</Label>
              <Textarea
                id="rule-condition"
                placeholder="Enter rule condition (e.g., password.length >= 8)"
                value={newRule.condition}
                onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-action">Action</Label>
                <Select value={newRule.action} onValueChange={(value: any) => setNewRule({...newRule, action: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">Allow</SelectItem>
                    <SelectItem value="deny">Deny</SelectItem>
                    <SelectItem value="warn">Warn</SelectItem>
                    <SelectItem value="log">Log</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rule-priority">Priority</Label>
                <Input
                  id="rule-priority"
                  type="number"
                  min="1"
                  max="10"
                  value={newRule.priority}
                  onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={newRule.enabled} onCheckedChange={(checked) => setNewRule({...newRule, enabled: checked})} />
              <Label>Enabled</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => selectedPolicy && handleAddRule(selectedPolicy.id)}>
                Add Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 