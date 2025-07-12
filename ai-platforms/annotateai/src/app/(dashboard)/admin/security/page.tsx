'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../../shared/components/ui/Card';
import { Button } from '../../../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../../../shared/components/ui/Badge';
import { Alert, AlertDescription } from '../../../../../../../shared/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../../../shared/components/ui/Tabs';
import { Progress } from '../../../../../../../shared/components/ui/Progress';
import { Input } from '../../../../../../../shared/components/ui/Input';
import { Label } from '../../../../../../../shared/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../../../shared/components/ui/Select';
import { Textarea } from '../../../../../../../shared/components/ui/Textarea';
import { Switch } from '../../../../../../../shared/components/ui/Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../../../shared/components/ui/Table';
import { ScrollArea } from '../../../../../../../shared/components/ui/ScrollArea';
import React from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Users, 
  Settings,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Zap,
  Globe,
  Server,
  Database,
  Network,
  Key,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  UserCheck,
  Ban,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Share2,
  Target,
  Crosshair,
  Radar,
  Skull,
  Bug,
  Flame
} from 'lucide-react';

// Mock data for security dashboard
const mockSecurityMetrics = {
  totalThreats: 147,
  activeThreats: 12,
  resolvedThreats: 135,
  securityScore: 87,
  vulnerabilities: {
    critical: 2,
    high: 8,
    medium: 15,
    low: 23
  },
  policies: {
    total: 45,
    active: 42,
    violated: 3
  }
};

const mockThreatData = [
  {
    id: 'THR-001',
    type: 'Malware',
    severity: 'critical',
    status: 'active',
    source: '192.168.1.45',
    target: 'annotation-server-01',
    timestamp: '2024-01-15T10:30:00Z',
    description: 'Suspicious file execution detected',
    riskScore: 95
  },
  {
    id: 'THR-002',
    type: 'Unauthorized Access',
    severity: 'high',
    status: 'investigating',
    source: '10.0.0.23',
    target: 'user-database',
    timestamp: '2024-01-15T09:15:00Z',
    description: 'Multiple failed login attempts',
    riskScore: 78
  },
  {
    id: 'THR-003',
    type: 'Data Exfiltration',
    severity: 'medium',
    status: 'resolved',
    source: 'external',
    target: 'api-gateway',
    timestamp: '2024-01-15T08:45:00Z',
    description: 'Unusual data transfer patterns',
    riskScore: 45
  }
];

const mockSecurityPolicies = [
  {
    id: 'POL-001',
    name: 'Password Policy',
    type: 'Authentication',
    status: 'active',
    compliance: 98,
    lastUpdated: '2024-01-10T14:30:00Z',
    violations: 2
  },
  {
    id: 'POL-002',
    name: 'Data Encryption',
    type: 'Data Protection',
    status: 'active',
    compliance: 100,
    lastUpdated: '2024-01-08T11:20:00Z',
    violations: 0
  },
  {
    id: 'POL-003',
    name: 'Access Control',
    type: 'Authorization',
    status: 'warning',
    compliance: 85,
    lastUpdated: '2024-01-12T16:45:00Z',
    violations: 7
  }
];

const mockSecurityEvents = [
  {
    id: 'EVT-001',
    type: 'Login Success',
    user: 'admin@annotateai.com',
    timestamp: '2024-01-15T11:15:00Z',
    ip: '192.168.1.100',
    location: 'San Francisco, CA',
    riskLevel: 'low'
  },
  {
    id: 'EVT-002',
    type: 'Policy Violation',
    user: 'user@annotateai.com',
    timestamp: '2024-01-15T10:45:00Z',
    ip: '10.0.0.15',
    location: 'New York, NY',
    riskLevel: 'medium'
  },
  {
    id: 'EVT-003',
    type: 'Failed Login',
    user: 'unknown',
    timestamp: '2024-01-15T10:30:00Z',
    ip: '203.0.113.1',
    location: 'Unknown',
    riskLevel: 'high'
  }
];

const mockVulnerabilities = [
  {
    id: 'VUL-001',
    name: 'CVE-2024-1234',
    severity: 'critical',
    cvss: 9.8,
    component: 'Node.js',
    version: '16.14.0',
    description: 'Remote code execution vulnerability',
    patchAvailable: true,
    exploitAvailable: true
  },
  {
    id: 'VUL-002',
    name: 'CVE-2024-5678',
    severity: 'high',
    cvss: 7.5,
    component: 'Express.js',
    version: '4.18.1',
    description: 'Authentication bypass vulnerability',
    patchAvailable: true,
    exploitAvailable: false
  },
  {
    id: 'VUL-003',
    name: 'CVE-2024-9012',
    severity: 'medium',
    cvss: 5.3,
    component: 'MongoDB',
    version: '5.0.3',
    description: 'Information disclosure vulnerability',
    patchAvailable: false,
    exploitAvailable: false
  }
];

export default function SecurityDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [threatFilter, setThreatFilter] = useState('all');
  const [policyFilter, setPolicyFilter] = useState('all');
  const [securityMetrics, setSecurityMetrics] = useState(mockSecurityMetrics);
  const [threats, setThreats] = useState(mockThreatData);
  const [policies, setPolicies] = useState(mockSecurityPolicies);
  const [events, setEvents] = useState(mockSecurityEvents);
  const [vulnerabilities, setVulnerabilities] = useState(mockVulnerabilities);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoResponse, setAutoResponse] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        // Simulate threat detection
        if (Math.random() < 0.1) {
          const newThreat = {
            id: `THR-${Date.now()}`,
            type: ['Malware', 'Unauthorized Access', 'Data Exfiltration'][Math.floor(Math.random() * 3)],
            severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
            status: 'active',
            source: `192.168.1.${Math.floor(Math.random() * 255)}`,
            target: 'annotation-server',
            timestamp: new Date().toISOString(),
            description: 'Automatically detected threat',
            riskScore: Math.floor(Math.random() * 100)
          };
          setThreats(prev => [newThreat, ...prev.slice(0, 9)]);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'investigating': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredThreats = threats.filter(threat => 
    threatFilter === 'all' || threat.severity === threatFilter
  );

  const filteredPolicies = policies.filter(policy => 
    policyFilter === 'all' || policy.status === policyFilter
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-gray-600">Monitor and manage security threats, policies, and compliance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={realTimeMonitoring}
              onCheckedChange={setRealTimeMonitoring}
            />
            <Label htmlFor="realtime">Real-time Monitoring</Label>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Security Score Alert */}
      {securityMetrics.securityScore < 85 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your security score is {securityMetrics.securityScore}%. Consider reviewing active threats and policy violations.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threat Monitor</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Security Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.securityScore}%</div>
                <div className="mt-2">
                  <Progress value={securityMetrics.securityScore} className="h-2" />
                </div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +2% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.activeThreats}</div>
                <p className="text-xs text-red-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +3 from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Policy Violations</CardTitle>
                <XCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.policies.violated}</div>
                <p className="text-xs text-orange-600 mt-1">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  -1 from last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
                <Bug className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {securityMetrics.vulnerabilities.critical + securityMetrics.vulnerabilities.high}
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Critical + High severity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Threat Overview and Vulnerability Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Radar className="h-5 w-5 mr-2" />
                  Threat Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Threats</span>
                    <Badge variant="outline">{securityMetrics.totalThreats}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active</span>
                    <Badge className="bg-red-100 text-red-800">{securityMetrics.activeThreats}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Resolved</span>
                    <Badge className="bg-green-100 text-green-800">{securityMetrics.resolvedThreats}</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Resolution Rate</div>
                    <Progress value={(securityMetrics.resolvedThreats / securityMetrics.totalThreats) * 100} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.round((securityMetrics.resolvedThreats / securityMetrics.totalThreats) * 100)}% resolved
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bug className="h-5 w-5 mr-2" />
                  Vulnerability Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Critical</span>
                    <Badge className="bg-red-100 text-red-800">{securityMetrics.vulnerabilities.critical}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">High</span>
                    <Badge className="bg-orange-100 text-orange-800">{securityMetrics.vulnerabilities.high}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Medium</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{securityMetrics.vulnerabilities.medium}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Low</span>
                    <Badge className="bg-green-100 text-green-800">{securityMetrics.vulnerabilities.low}</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Risk Distribution</div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-xs">Critical ({securityMetrics.vulnerabilities.critical})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-xs">High ({securityMetrics.vulnerabilities.high})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        event.riskLevel === 'high' ? 'bg-red-500' :
                        event.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{event.type}</div>
                        <div className="text-sm text-gray-600">{event.user} • {event.ip}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{new Date(event.timestamp).toLocaleTimeString()}</div>
                      <Badge className={`${getSeverityColor(event.riskLevel)} text-xs`}>
                        {event.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Monitor Tab */}
        <TabsContent value="threats" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Threat Monitor</h2>
            <div className="flex items-center space-x-4">
              <Select value={threatFilter} onValueChange={setThreatFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Threats</CardTitle>
              <CardDescription>
                Real-time threat detection and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredThreats.map((threat) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        threat.severity === 'critical' ? 'bg-red-500' :
                        threat.severity === 'high' ? 'bg-orange-500' :
                        threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{threat.type}</div>
                        <div className="text-sm text-gray-600">{threat.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {threat.source} → {threat.target}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={`${getSeverityColor(threat.severity)} mb-1`}>
                          {threat.severity}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          Risk: {threat.riskScore}%
                        </div>
                      </div>
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Security Policies</h2>
            <div className="flex items-center space-x-4">
              <Select value={policyFilter} onValueChange={setPolicyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Policies</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm">
                <FileText className="w-4 h-4 mr-2" />
                New Policy
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Policy Management</CardTitle>
              <CardDescription>
                Configure and monitor security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.name}</TableCell>
                      <TableCell>{policy.type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${policy.compliance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{policy.compliance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.violations > 0 ? "destructive" : "default"}>
                          {policy.violations}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(policy.lastUpdated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
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

        {/* Vulnerabilities Tab */}
        <TabsContent value="vulnerabilities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Vulnerability Management</h2>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Now
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Assessment</CardTitle>
              <CardDescription>
                Identified vulnerabilities and patch management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vulnerability ID</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>CVSS Score</TableHead>
                    <TableHead>Patch Available</TableHead>
                    <TableHead>Exploit Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vulnerabilities.map((vuln) => (
                    <TableRow key={vuln.id}>
                      <TableCell className="font-medium">{vuln.name}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vuln.component}</div>
                          <div className="text-sm text-gray-600">{vuln.version}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(vuln.severity)}>
                          {vuln.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{vuln.cvss}</span>
                          <div className={`w-16 h-2 rounded-full ${
                            vuln.cvss >= 9 ? 'bg-red-500' :
                            vuln.cvss >= 7 ? 'bg-orange-500' :
                            vuln.cvss >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vuln.patchAvailable ? "default" : "destructive"}>
                          {vuln.patchAvailable ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vuln.exploitAvailable ? "destructive" : "default"}>
                          {vuln.exploitAvailable ? "Available" : "None"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {vuln.patchAvailable && (
                            <Button size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Security Events</h2>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search events..."
                className="w-64"
              />
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Log</CardTitle>
              <CardDescription>
                Real-time security event monitoring and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          event.riskLevel === 'high' ? 'bg-red-500' :
                          event.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{event.type}</div>
                          <div className="text-sm text-gray-600">
                            User: {event.user} • IP: {event.ip}
                          </div>
                          <div className="text-xs text-gray-500">{event.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        <Badge className={`${getSeverityColor(event.riskLevel)} text-xs`}>
                          {event.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Settings</CardTitle>
                <CardDescription>
                  Configure security monitoring preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="realtime-monitoring">Real-time Monitoring</Label>
                  <Switch
                    checked={realTimeMonitoring}
                    onCheckedChange={setRealTimeMonitoring}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="security-alerts">Security Alerts</Label>
                  <Switch
                    checked={alertsEnabled}
                    onCheckedChange={setAlertsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-response">Automatic Response</Label>
                  <Switch
                    checked={autoResponse}
                    onCheckedChange={setAutoResponse}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Alert Threshold</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (All events)</SelectItem>
                      <SelectItem value="medium">Medium (High risk+)</SelectItem>
                      <SelectItem value="high">High (Critical only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive security notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Input
                    id="email-notifications"
                    type="email"
                    placeholder="admin@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-webhook-endpoint.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-frequency">Notification Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Policies Configuration</CardTitle>
              <CardDescription>
                Configure global security policies and rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-policy">Password Policy</Label>
                <Textarea
                  id="password-policy"
                  placeholder="Define password requirements..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-control">Access Control Rules</Label>
                <Textarea
                  id="access-control"
                  placeholder="Define access control rules..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 