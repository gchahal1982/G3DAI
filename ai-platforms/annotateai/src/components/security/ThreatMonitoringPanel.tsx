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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../../../shared/components/ui/Dialog';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Crosshair,
  Radar,
  Skull,
  Bug,
  Flame,
  Zap,
  Globe,
  Server,
  Database,
  Network,
  Users,
  UserX,
  Ban,
  AlertOctagon,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  StopCircle,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Map,
  MapPin,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Key,
  FileX,
  File,
  Mail,
  MessageSquare,
  Phone,
  Share2,
  ExternalLink,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Save,
  Upload,
  Hash,
  Calendar,
  Info,
  HelpCircle,
  Layers,
  Cpu,
  HardDrive,
  MonitorSpeaker,
  Smartphone,
  Laptop,
  Router,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  ShieldX
} from 'lucide-react';
import React from 'react';

interface ThreatEvent {
  id: string;
  type: 'malware' | 'intrusion' | 'phishing' | 'ddos' | 'dataExfiltration' | 'bruteForce' | 'suspicious' | 'vulnerability';
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'dismissed' | 'blocked';
  source: string;
  target: string;
  timestamp: string;
  description: string;
  riskScore: number;
  mitre: string[];
  indicators: ThreatIndicator[];
  responseActions: ResponseAction[];
  assignedTo?: string;
  location?: string;
  country?: string;
  network?: string;
  affectedAssets: string[];
  confidenceLevel: number;
  lastUpdated: string;
}

interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'process' | 'file';
  value: string;
  confidence: number;
  context: string;
  firstSeen: string;
  lastSeen: string;
  tlp: 'white' | 'green' | 'amber' | 'red';
}

interface ResponseAction {
  id: string;
  type: 'block' | 'quarantine' | 'alert' | 'investigate' | 'remediate' | 'monitor';
  description: string;
  automated: boolean;
  executed: boolean;
  timestamp?: string;
  success?: boolean;
  details?: string;
}

interface ThreatIntelligence {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  indicators: ThreatIndicator[];
  mitreAttack: string[];
  lastUpdated: string;
  source: string;
  confidence: number;
  active: boolean;
}

interface AttackPattern {
  id: string;
  name: string;
  description: string;
  technique: string;
  tactic: string;
  detection: string;
  mitigation: string;
  references: string[];
  lastSeen: string;
  frequency: number;
}

// Mock data for threat monitoring
const mockThreats: ThreatEvent[] = [
  {
    id: 'THR-2024-001',
    type: 'malware',
    name: 'Suspicious PowerShell Activity',
    severity: 'critical',
    status: 'active',
    source: '192.168.1.45',
    target: 'annotation-server-01',
    timestamp: '2024-01-15T10:30:00Z',
    description: 'Detected obfuscated PowerShell execution with suspicious network connections',
    riskScore: 95,
    mitre: ['T1059.001', 'T1055', 'T1071.001'],
    location: 'San Francisco, CA',
    country: 'United States',
    network: 'Internal Network',
    affectedAssets: ['annotation-server-01', 'workstation-23'],
    confidenceLevel: 92,
    lastUpdated: '2024-01-15T10:35:00Z',
    indicators: [
      {
        id: 'IOC-001',
        type: 'process',
        value: 'powershell.exe -enc <obfuscated>',
        confidence: 95,
        context: 'Suspicious command execution',
        firstSeen: '2024-01-15T10:30:00Z',
        lastSeen: '2024-01-15T10:35:00Z',
        tlp: 'amber'
      },
      {
        id: 'IOC-002',
        type: 'ip',
        value: '203.0.113.45',
        confidence: 88,
        context: 'Command and control server',
        firstSeen: '2024-01-15T10:31:00Z',
        lastSeen: '2024-01-15T10:35:00Z',
        tlp: 'red'
      }
    ],
    responseActions: [
      {
        id: 'ACT-001',
        type: 'block',
        description: 'Block IP 203.0.113.45',
        automated: true,
        executed: true,
        timestamp: '2024-01-15T10:32:00Z',
        success: true
      },
      {
        id: 'ACT-002',
        type: 'quarantine',
        description: 'Isolate affected workstation',
        automated: false,
        executed: false
      }
    ]
  },
  {
    id: 'THR-2024-002',
    type: 'intrusion',
    name: 'Unauthorized Access Attempt',
    severity: 'high',
    status: 'investigating',
    source: '10.0.0.23',
    target: 'database-cluster',
    timestamp: '2024-01-15T09:15:00Z',
    description: 'Multiple failed authentication attempts followed by successful login',
    riskScore: 78,
    mitre: ['T1110', 'T1078'],
    location: 'New York, NY',
    country: 'United States',
    network: 'DMZ',
    affectedAssets: ['database-cluster', 'web-server-02'],
    confidenceLevel: 85,
    lastUpdated: '2024-01-15T09:45:00Z',
    assignedTo: 'security-team@annotateai.com',
    indicators: [
      {
        id: 'IOC-003',
        type: 'ip',
        value: '10.0.0.23',
        confidence: 90,
        context: 'Brute force attack source',
        firstSeen: '2024-01-15T09:00:00Z',
        lastSeen: '2024-01-15T09:15:00Z',
        tlp: 'amber'
      }
    ],
    responseActions: [
      {
        id: 'ACT-003',
        type: 'alert',
        description: 'Alert security team',
        automated: true,
        executed: true,
        timestamp: '2024-01-15T09:16:00Z',
        success: true
      },
      {
        id: 'ACT-004',
        type: 'monitor',
        description: 'Enhanced monitoring on database access',
        automated: true,
        executed: true,
        timestamp: '2024-01-15T09:17:00Z',
        success: true
      }
    ]
  },
  {
    id: 'THR-2024-003',
    type: 'dataExfiltration',
    name: 'Unusual Data Transfer',
    severity: 'medium',
    status: 'resolved',
    source: 'internal-user',
    target: 'file-server-01',
    timestamp: '2024-01-15T08:45:00Z',
    description: 'Large volume of data transferred outside normal business hours',
    riskScore: 65,
    mitre: ['T1041', 'T1567'],
    location: 'Chicago, IL',
    country: 'United States',
    network: 'Internal Network',
    affectedAssets: ['file-server-01'],
    confidenceLevel: 75,
    lastUpdated: '2024-01-15T11:00:00Z',
    indicators: [
      {
        id: 'IOC-004',
        type: 'file',
        value: 'sensitive_data_backup.zip',
        confidence: 80,
        context: 'Large data archive',
        firstSeen: '2024-01-15T08:45:00Z',
        lastSeen: '2024-01-15T08:50:00Z',
        tlp: 'green'
      }
    ],
    responseActions: [
      {
        id: 'ACT-005',
        type: 'investigate',
        description: 'Review data transfer logs',
        automated: false,
        executed: true,
        timestamp: '2024-01-15T09:00:00Z',
        success: true,
        details: 'Legitimate backup operation confirmed'
      }
    ]
  }
];

const mockThreatIntelligence: ThreatIntelligence[] = [
  {
    id: 'TI-001',
    name: 'APT29 - Cozy Bear',
    description: 'Advanced persistent threat group associated with Russian intelligence',
    severity: 'critical',
    category: 'APT Group',
    lastUpdated: '2024-01-15T12:00:00Z',
    source: 'MITRE ATT&CK',
    confidence: 95,
    active: true,
    mitreAttack: ['T1566.001', 'T1059.001', 'T1055'],
    indicators: [
      {
        id: 'IOC-TI-001',
        type: 'domain',
        value: 'cozybearcorp.com',
        confidence: 92,
        context: 'C2 domain',
        firstSeen: '2024-01-10T00:00:00Z',
        lastSeen: '2024-01-15T12:00:00Z',
        tlp: 'red'
      }
    ]
  },
  {
    id: 'TI-002',
    name: 'Emotet Banking Trojan',
    description: 'Banking trojan used for credential theft and malware distribution',
    severity: 'high',
    category: 'Malware Family',
    lastUpdated: '2024-01-14T18:00:00Z',
    source: 'Threat Intelligence Feed',
    confidence: 88,
    active: true,
    mitreAttack: ['T1566.001', 'T1055', 'T1071.001'],
    indicators: [
      {
        id: 'IOC-TI-002',
        type: 'hash',
        value: 'a1b2c3d4e5f6789012345678901234567890abcd',
        confidence: 95,
        context: 'Emotet payload hash',
        firstSeen: '2024-01-14T00:00:00Z',
        lastSeen: '2024-01-14T18:00:00Z',
        tlp: 'amber'
      }
    ]
  }
];

const mockAttackPatterns: AttackPattern[] = [
  {
    id: 'AP-001',
    name: 'Spearphishing Attachment',
    description: 'Adversaries may send spearphishing emails with malicious attachments',
    technique: 'T1566.001',
    tactic: 'Initial Access',
    detection: 'Monitor for suspicious email attachments and execution',
    mitigation: 'User training and email security controls',
    references: ['https://attack.mitre.org/techniques/T1566/001/'],
    lastSeen: '2024-01-15T10:30:00Z',
    frequency: 15
  },
  {
    id: 'AP-002',
    name: 'PowerShell Execution',
    description: 'Adversaries may abuse PowerShell commands and scripts',
    technique: 'T1059.001',
    tactic: 'Execution',
    detection: 'Monitor PowerShell execution and command line arguments',
    mitigation: 'Restrict PowerShell execution and logging',
    references: ['https://attack.mitre.org/techniques/T1059/001/'],
    lastSeen: '2024-01-15T10:30:00Z',
    frequency: 23
  }
];

export default function ThreatMonitoringPanel() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [threats, setThreats] = useState<ThreatEvent[]>(mockThreats);
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence[]>(mockThreatIntelligence);
  const [attackPatterns, setAttackPatterns] = useState<AttackPattern[]>(mockAttackPatterns);
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);
  const [showThreatDetail, setShowThreatDetail] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [autoResponse, setAutoResponse] = useState(true);

  // Simulate real-time threat updates
  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        // Simulate new threat detection
        if (Math.random() < 0.05) {
          const newThreat: ThreatEvent = {
            id: `THR-${Date.now()}`,
            type: ['malware', 'intrusion', 'phishing', 'ddos', 'dataExfiltration', 'bruteForce', 'suspicious', 'vulnerability'][Math.floor(Math.random() * 8)] as any,
            name: `Threat Alert ${Date.now()}`,
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
            status: 'active',
            source: `192.168.1.${Math.floor(Math.random() * 255)}`,
            target: `server-${Math.floor(Math.random() * 10) + 1}`,
            timestamp: new Date().toISOString(),
            description: 'Automatically detected threat event',
            riskScore: Math.floor(Math.random() * 100),
            mitre: ['T1055', 'T1071.001'],
            location: 'Unknown',
            country: 'Unknown',
            network: 'Internal Network',
            affectedAssets: [`asset-${Math.floor(Math.random() * 10) + 1}`],
            confidenceLevel: Math.floor(Math.random() * 100),
            lastUpdated: new Date().toISOString(),
            indicators: [],
            responseActions: []
          };
          setThreats(prev => [newThreat, ...prev.slice(0, 99)]);
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || threat.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || threat.status === statusFilter;
    const matchesType = typeFilter === 'all' || threat.type === typeFilter;
    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'blocked': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'malware': return <Bug className="w-4 h-4" />;
      case 'intrusion': return <Skull className="w-4 h-4" />;
      case 'phishing': return <Mail className="w-4 h-4" />;
      case 'ddos': return <Zap className="w-4 h-4" />;
      case 'dataExfiltration': return <Database className="w-4 h-4" />;
      case 'bruteForce': return <Key className="w-4 h-4" />;
      case 'suspicious': return <AlertTriangle className="w-4 h-4" />;
      case 'vulnerability': return <ShieldAlert className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTlpColor = (tlp: string) => {
    switch (tlp) {
      case 'red': return 'bg-red-500';
      case 'amber': return 'bg-amber-500';
      case 'green': return 'bg-green-500';
      case 'white': return 'bg-white border';
      default: return 'bg-gray-500';
    }
  };

  const handleThreatAction = (threatId: string, action: string) => {
    setThreats(threats.map(threat => 
      threat.id === threatId 
        ? { ...threat, status: action as any, lastUpdated: new Date().toISOString() }
        : threat
    ));
  };

  const handleExecuteResponse = (threatId: string, actionId: string) => {
    setThreats(threats.map(threat => 
      threat.id === threatId 
        ? {
            ...threat,
            responseActions: threat.responseActions.map(action => 
              action.id === actionId 
                ? { ...action, executed: true, timestamp: new Date().toISOString(), success: true }
                : action
            )
          }
        : threat
    ));
  };

  const threatMetrics = {
    total: threats.length,
    active: threats.filter(t => t.status === 'active').length,
    critical: threats.filter(t => t.severity === 'critical').length,
    resolved: threats.filter(t => t.status === 'resolved').length,
    avgRiskScore: Math.round(threats.reduce((sum, t) => sum + t.riskScore, 0) / threats.length)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Threat Monitoring</h2>
          <p className="text-gray-600">Real-time threat detection and response</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={realTimeMonitoring}
              onCheckedChange={setRealTimeMonitoring}
            />
            <Label>Real-time Monitoring</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoResponse}
              onCheckedChange={setAutoResponse}
            />
            <Label>Auto Response</Label>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Threats Alert */}
      {threatMetrics.critical > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {threatMetrics.critical} critical threats require immediate attention. Review and take action.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          <TabsTrigger value="patterns">Attack Patterns</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{threatMetrics.total}</div>
                <p className="text-xs text-blue-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +5 today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{threatMetrics.active}</div>
                <p className="text-xs text-red-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +2 last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical</CardTitle>
                <Flame className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{threatMetrics.critical}</div>
                <p className="text-xs text-red-600 mt-1">
                  Immediate action required
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{threatMetrics.resolved}</div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  +8 today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{threatMetrics.avgRiskScore}</div>
                <p className="text-xs text-purple-600 mt-1">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  -5 from yesterday
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Threat Overview and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Threat Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    threats.reduce((acc, threat) => {
                      acc[threat.type] = (acc[threat.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(type)}
                        <span className="capitalize">{type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(count / threats.length) * 100}%` }}
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
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {threats.slice(0, 10).map((threat) => (
                      <div key={threat.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            threat.severity === 'critical' ? 'bg-red-500' :
                            threat.severity === 'high' ? 'bg-orange-500' :
                            threat.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-sm">{threat.name}</div>
                            <div className="text-xs text-gray-500">
                              {threat.source} → {threat.target}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {new Date(threat.timestamp).toLocaleTimeString()}
                          </div>
                          <Badge className={`${getStatusColor(threat.status)} text-xs`}>
                            {threat.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="malware">Malware</SelectItem>
                  <SelectItem value="intrusion">Intrusion</SelectItem>
                  <SelectItem value="phishing">Phishing</SelectItem>
                  <SelectItem value="ddos">DDoS</SelectItem>
                  <SelectItem value="dataExfiltration">Data Exfiltration</SelectItem>
                  <SelectItem value="bruteForce">Brute Force</SelectItem>
                  <SelectItem value="suspicious">Suspicious</SelectItem>
                  <SelectItem value="vulnerability">Vulnerability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Threats List */}
          <Card>
            <CardHeader>
              <CardTitle>Threat Events</CardTitle>
              <CardDescription>
                Active threat monitoring and management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredThreats.map((threat) => (
                  <div key={threat.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getTypeIcon(threat.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{threat.name}</h3>
                            <Badge className={getSeverityColor(threat.severity)}>
                              {threat.severity}
                            </Badge>
                            <Badge className={getStatusColor(threat.status)}>
                              {threat.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{threat.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{threat.source} → {threat.target}</span>
                            <span>Risk: {threat.riskScore}%</span>
                            <span>Confidence: {threat.confidenceLevel}%</span>
                            <span>{new Date(threat.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {threat.mitre.slice(0, 3).map((technique) => (
                              <Badge key={technique} variant="outline" className="text-xs">
                                {technique}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedThreat(threat);
                            setShowThreatDetail(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={(value) => handleThreatAction(threat.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="investigating">Investigate</SelectItem>
                            <SelectItem value="resolved">Resolve</SelectItem>
                            <SelectItem value="dismissed">Dismiss</SelectItem>
                            <SelectItem value="blocked">Block</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intelligence Tab */}
        <TabsContent value="intelligence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Intelligence</CardTitle>
              <CardDescription>
                External threat intelligence and indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatIntelligence.map((intel) => (
                  <div key={intel.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{intel.name}</h3>
                          <Badge className={getSeverityColor(intel.severity)}>
                            {intel.severity}
                          </Badge>
                          <Badge variant="outline">{intel.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{intel.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Source: {intel.source}</span>
                          <span>Confidence: {intel.confidence}%</span>
                          <span>Updated: {new Date(intel.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {intel.mitreAttack.map((technique) => (
                            <Badge key={technique} variant="outline" className="text-xs">
                              {technique}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={intel.active} />
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attack Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attack Patterns</CardTitle>
              <CardDescription>
                MITRE ATT&CK techniques and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attackPatterns.map((pattern) => (
                  <div key={pattern.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{pattern.name}</h3>
                          <Badge variant="outline">{pattern.technique}</Badge>
                          <Badge variant="secondary">{pattern.tactic}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Detection:</span>
                            <p className="text-gray-600">{pattern.detection}</p>
                          </div>
                          <div>
                            <span className="font-medium">Mitigation:</span>
                            <p className="text-gray-600">{pattern.mitigation}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>Frequency: {pattern.frequency}</span>
                          <span>Last Seen: {new Date(pattern.lastSeen).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Tab */}
        <TabsContent value="response" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Response</CardTitle>
              <CardDescription>
                Automated and manual response actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.filter(t => t.responseActions.length > 0).map((threat) => (
                  <div key={threat.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{threat.name}</h3>
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {threat.responseActions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              action.executed ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <div className="font-medium text-sm">{action.description}</div>
                              <div className="text-xs text-gray-500">
                                {action.automated ? 'Automated' : 'Manual'} • {action.type}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {action.executed ? (
                              <Badge variant="default" className="text-xs">
                                {action.success ? 'Success' : 'Failed'}
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExecuteResponse(threat.id, action.id)}
                              >
                                Execute
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Threat Detail Dialog */}
      <Dialog open={showThreatDetail} onOpenChange={setShowThreatDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedThreat?.name}
            </DialogTitle>
            <DialogDescription>
              Threat ID: {selectedThreat?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedThreat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Threat Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="outline">{selectedThreat.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Severity:</span>
                      <Badge className={getSeverityColor(selectedThreat.severity)}>
                        {selectedThreat.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Score:</span>
                      <span>{selectedThreat.riskScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span>{selectedThreat.confidenceLevel}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span>{selectedThreat.location}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Network Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <code className="text-xs bg-gray-100 px-1 rounded">{selectedThreat.source}</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <code className="text-xs bg-gray-100 px-1 rounded">{selectedThreat.target}</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span>{selectedThreat.network}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Indicators of Compromise</h4>
                <div className="space-y-2">
                  {selectedThreat.indicators.map((indicator) => (
                    <div key={indicator.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getTlpColor(indicator.tlp)}`}></div>
                        <div>
                          <div className="font-medium text-sm">{indicator.type.toUpperCase()}</div>
                          <code className="text-xs bg-gray-100 px-1 rounded">{indicator.value}</code>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          Confidence: {indicator.confidence}%
                        </div>
                        <Badge variant="outline" className="text-xs">
                          TLP:{indicator.tlp.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Response Actions</h4>
                <div className="space-y-2">
                  {selectedThreat.responseActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          action.executed ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <div className="font-medium text-sm">{action.description}</div>
                          <div className="text-xs text-gray-500">
                            {action.automated ? 'Automated' : 'Manual'} • {action.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {action.executed ? (
                          <Badge variant="default" className="text-xs">
                            {action.success ? 'Success' : 'Failed'}
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExecuteResponse(selectedThreat.id, action.id)}
                          >
                            Execute
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 