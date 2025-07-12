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
  Activity, 
  Lock, 
  Key, 
  Database,
  Network,
  Server,
  Globe,
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
  Bug,
  Flame,
  BarChart3,
  PieChart,
  Zap,
  Layers,
  Monitor,
  ShieldCheck,
  Plus,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import React from 'react';

interface StreamSession {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'data' | 'hybrid';
  status: 'active' | 'paused' | 'stopped' | 'error';
  encryption: 'aes256' | 'aes128' | 'none';
  protocol: 'rtmp' | 'rtsp' | 'hls' | 'webrtc' | 'websocket';
  source: string;
  destination: string;
  viewers: number;
  maxViewers: number;
  bandwidth: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  startTime: string;
  duration: number;
  dataTransferred: number;
  security: StreamSecurity;
  analytics: StreamAnalytics;
  alerts: StreamAlert[];
}

interface StreamSecurity {
  encryptionEnabled: boolean;
  encryptionType: string;
  keyRotation: boolean;
  keyRotationInterval: number;
  accessControl: boolean;
  allowedIPs: string[];
  blockedIPs: string[];
  tokenAuthentication: boolean;
  certificateValidation: boolean;
  integrityCheck: boolean;
  antiTampering: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'maximum';
  lastSecurityCheck: string;
  vulnerabilities: SecurityVulnerability[];
}

interface StreamAnalytics {
  totalViewers: number;
  peakViewers: number;
  avgViewDuration: number;
  totalBandwidth: number;
  errorRate: number;
  latency: number;
  jitter: number;
  packetLoss: number;
  qualityScore: number;
  securityScore: number;
  incidents: number;
  lastAnalysis: string;
}

interface StreamAlert {
  id: string;
  type: 'security' | 'performance' | 'quality' | 'access' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  source: string;
  details: string;
}

interface SecurityVulnerability {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  mitigation: string;
  status: 'open' | 'patching' | 'resolved';
  discoveredAt: string;
}

interface AccessRule {
  id: string;
  name: string;
  type: 'allow' | 'deny' | 'limit';
  criteria: string;
  value: string;
  action: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface EncryptionProfile {
  id: string;
  name: string;
  algorithm: string;
  keySize: number;
  mode: string;
  keyRotation: boolean;
  rotationInterval: number;
  certificateRequired: boolean;
  integrityCheck: boolean;
  description: string;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
}

// Mock data for streaming security
const mockStreamSessions: StreamSession[] = [
  {
    id: 'STREAM-001',
    name: 'AI Training Session - Computer Vision',
    type: 'video',
    status: 'active',
    encryption: 'aes256',
    protocol: 'webrtc',
    source: 'annotation-server-01',
    destination: 'client-dashboard',
    viewers: 12,
    maxViewers: 50,
    bandwidth: 2.5,
    quality: 'high',
    startTime: '2024-01-15T10:00:00Z',
    duration: 3600,
    dataTransferred: 1250,
    security: {
      encryptionEnabled: true,
      encryptionType: 'AES-256-GCM',
      keyRotation: true,
      keyRotationInterval: 3600,
      accessControl: true,
      allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
      blockedIPs: ['203.0.113.0/24'],
      tokenAuthentication: true,
      certificateValidation: true,
      integrityCheck: true,
      antiTampering: true,
      securityLevel: 'high',
      lastSecurityCheck: '2024-01-15T11:00:00Z',
      vulnerabilities: []
    },
    analytics: {
      totalViewers: 45,
      peakViewers: 12,
      avgViewDuration: 1800,
      totalBandwidth: 2.5,
      errorRate: 0.02,
      latency: 150,
      jitter: 5,
      packetLoss: 0.01,
      qualityScore: 95,
      securityScore: 98,
      incidents: 0,
      lastAnalysis: '2024-01-15T11:00:00Z'
    },
    alerts: []
  },
  {
    id: 'STREAM-002',
    name: 'Medical Imaging Stream',
    type: 'data',
    status: 'active',
    encryption: 'aes256',
    protocol: 'websocket',
    source: 'medical-server',
    destination: 'annotation-workbench',
    viewers: 3,
    maxViewers: 10,
    bandwidth: 5.2,
    quality: 'ultra',
    startTime: '2024-01-15T09:30:00Z',
    duration: 5400,
    dataTransferred: 2800,
    security: {
      encryptionEnabled: true,
      encryptionType: 'AES-256-GCM',
      keyRotation: true,
      keyRotationInterval: 1800,
      accessControl: true,
      allowedIPs: ['192.168.1.0/24'],
      blockedIPs: [],
      tokenAuthentication: true,
      certificateValidation: true,
      integrityCheck: true,
      antiTampering: true,
      securityLevel: 'maximum',
      lastSecurityCheck: '2024-01-15T10:30:00Z',
      vulnerabilities: []
    },
    analytics: {
      totalViewers: 8,
      peakViewers: 3,
      avgViewDuration: 3600,
      totalBandwidth: 5.2,
      errorRate: 0.001,
      latency: 50,
      jitter: 2,
      packetLoss: 0.005,
      qualityScore: 99,
      securityScore: 100,
      incidents: 0,
      lastAnalysis: '2024-01-15T10:30:00Z'
    },
    alerts: []
  },
  {
    id: 'STREAM-003',
    name: 'Collaboration Audio Stream',
    type: 'audio',
    status: 'paused',
    encryption: 'aes128',
    protocol: 'rtsp',
    source: 'conference-room',
    destination: 'remote-team',
    viewers: 0,
    maxViewers: 25,
    bandwidth: 0.8,
    quality: 'medium',
    startTime: '2024-01-15T08:00:00Z',
    duration: 7200,
    dataTransferred: 576,
    security: {
      encryptionEnabled: true,
      encryptionType: 'AES-128-CBC',
      keyRotation: false,
      keyRotationInterval: 7200,
      accessControl: true,
      allowedIPs: ['192.168.1.0/24', '172.16.0.0/16'],
      blockedIPs: [],
      tokenAuthentication: false,
      certificateValidation: true,
      integrityCheck: false,
      antiTampering: false,
      securityLevel: 'medium',
      lastSecurityCheck: '2024-01-15T09:00:00Z',
      vulnerabilities: [
        {
          id: 'VULN-001',
          type: 'Weak Encryption',
          severity: 'medium',
          description: 'Using AES-128 instead of AES-256',
          impact: 'Reduced encryption strength',
          mitigation: 'Upgrade to AES-256',
          status: 'open',
          discoveredAt: '2024-01-15T09:00:00Z'
        }
      ]
    },
    analytics: {
      totalViewers: 18,
      peakViewers: 8,
      avgViewDuration: 2400,
      totalBandwidth: 0.8,
      errorRate: 0.05,
      latency: 200,
      jitter: 8,
      packetLoss: 0.02,
      qualityScore: 78,
      securityScore: 85,
      incidents: 1,
      lastAnalysis: '2024-01-15T09:00:00Z'
    },
    alerts: [
      {
        id: 'ALERT-001',
        type: 'security',
        severity: 'medium',
        message: 'Weak encryption detected',
        timestamp: '2024-01-15T09:00:00Z',
        resolved: false,
        source: 'Security Scanner',
        details: 'Stream using AES-128 instead of recommended AES-256'
      }
    ]
  }
];

const mockAccessRules: AccessRule[] = [
  {
    id: 'RULE-001',
    name: 'Internal Network Access',
    type: 'allow',
    criteria: 'ip_range',
    value: '192.168.1.0/24',
    action: 'allow_stream_access',
    priority: 1,
    enabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    lastTriggered: '2024-01-15T11:00:00Z',
    triggerCount: 156
  },
  {
    id: 'RULE-002',
    name: 'Block Suspicious IPs',
    type: 'deny',
    criteria: 'ip_range',
    value: '203.0.113.0/24',
    action: 'block_access',
    priority: 2,
    enabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    lastTriggered: '2024-01-15T08:30:00Z',
    triggerCount: 23
  },
  {
    id: 'RULE-003',
    name: 'Rate Limit External Users',
    type: 'limit',
    criteria: 'user_type',
    value: 'external',
    action: 'limit_bandwidth',
    priority: 3,
    enabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    lastTriggered: '2024-01-15T10:45:00Z',
    triggerCount: 45
  }
];

const mockEncryptionProfiles: EncryptionProfile[] = [
  {
    id: 'PROF-001',
    name: 'High Security Profile',
    algorithm: 'AES-256-GCM',
    keySize: 256,
    mode: 'GCM',
    keyRotation: true,
    rotationInterval: 3600,
    certificateRequired: true,
    integrityCheck: true,
    description: 'Maximum security for sensitive streams',
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-15T11:00:00Z',
    usageCount: 234
  },
  {
    id: 'PROF-002',
    name: 'Standard Profile',
    algorithm: 'AES-128-CBC',
    keySize: 128,
    mode: 'CBC',
    keyRotation: false,
    rotationInterval: 7200,
    certificateRequired: false,
    integrityCheck: false,
    description: 'Standard encryption for general use',
    createdAt: '2024-01-01T00:00:00Z',
    lastUsed: '2024-01-15T09:00:00Z',
    usageCount: 89
  }
];

export default function StreamingSecurityPanel() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [streamSessions, setStreamSessions] = useState<StreamSession[]>(mockStreamSessions);
  const [accessRules, setAccessRules] = useState<AccessRule[]>(mockAccessRules);
  const [encryptionProfiles, setEncryptionProfiles] = useState<EncryptionProfile[]>(mockEncryptionProfiles);
  const [selectedStream, setSelectedStream] = useState<StreamSession | null>(null);
  const [showStreamDetail, setShowStreamDetail] = useState(false);
  const [showNewRuleDialog, setShowNewRuleDialog] = useState(false);
  const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [autoEncryption, setAutoEncryption] = useState(true);
  const [intrusionDetection, setIntrusionDetection] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [securityFilter, setSecurityFilter] = useState<string>('all');

  // New rule form state
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'allow' as const,
    criteria: 'ip_range',
    value: '',
    action: 'allow_stream_access',
    priority: 1,
    enabled: true
  });

  // New profile form state
  const [newProfile, setNewProfile] = useState({
    name: '',
    algorithm: 'AES-256-GCM',
    keySize: 256,
    mode: 'GCM',
    keyRotation: true,
    rotationInterval: 3600,
    certificateRequired: true,
    integrityCheck: true,
    description: ''
  });

  // Simulate real-time stream updates
  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(() => {
        setStreamSessions(prev => prev.map(stream => ({
          ...stream,
          viewers: stream.status === 'active' ? 
            Math.max(0, stream.viewers + Math.floor(Math.random() * 3) - 1) : 
            stream.viewers,
          bandwidth: stream.status === 'active' ? 
            Math.max(0.1, stream.bandwidth + (Math.random() - 0.5) * 0.5) : 
            stream.bandwidth,
          analytics: {
            ...stream.analytics,
            latency: Math.max(10, stream.analytics.latency + Math.floor(Math.random() * 20) - 10),
            jitter: Math.max(1, stream.analytics.jitter + Math.floor(Math.random() * 2) - 1),
            packetLoss: Math.max(0, stream.analytics.packetLoss + (Math.random() - 0.5) * 0.01),
            lastAnalysis: new Date().toISOString()
          }
        })));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  // Filter streams
  const filteredStreams = streamSessions.filter(stream => {
    const matchesSearch = stream.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stream.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stream.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || stream.status === statusFilter;
    const matchesType = typeFilter === 'all' || stream.type === typeFilter;
    const matchesSecurity = securityFilter === 'all' || stream.security.securityLevel === securityFilter;
    return matchesSearch && matchesStatus && matchesType && matchesSecurity;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSecurityColor = (level: string) => {
    switch (level) {
      case 'maximum': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
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
      case 'video': return <Square className="w-4 h-4" />;
      case 'audio': return <Zap className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      case 'hybrid': return <Layers className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const handleStreamAction = (streamId: string, action: string) => {
    setStreamSessions(streams => streams.map(stream => 
      stream.id === streamId 
        ? { ...stream, status: action as any }
        : stream
    ));
  };

  const handleRuleToggle = (ruleId: string) => {
    setAccessRules(rules => rules.map(rule => 
      rule.id === ruleId 
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ));
  };

  const handleAddRule = () => {
    const rule: AccessRule = {
      id: `RULE-${Date.now()}`,
      ...newRule,
      createdAt: new Date().toISOString(),
      triggerCount: 0
    };
    setAccessRules([...accessRules, rule]);
    setNewRule({
      name: '',
      type: 'allow',
      criteria: 'ip_range',
      value: '',
      action: 'allow_stream_access',
      priority: 1,
      enabled: true
    });
    setShowNewRuleDialog(false);
  };

  const handleAddProfile = () => {
    const profile: EncryptionProfile = {
      id: `PROF-${Date.now()}`,
      ...newProfile,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 0
    };
    setEncryptionProfiles([...encryptionProfiles, profile]);
    setNewProfile({
      name: '',
      algorithm: 'AES-256-GCM',
      keySize: 256,
      mode: 'GCM',
      keyRotation: true,
      rotationInterval: 3600,
      certificateRequired: true,
      integrityCheck: true,
      description: ''
    });
    setShowNewProfileDialog(false);
  };

  const streamMetrics = {
    totalStreams: streamSessions.length,
    activeStreams: streamSessions.filter(s => s.status === 'active').length,
    encryptedStreams: streamSessions.filter(s => s.security.encryptionEnabled).length,
    totalViewers: streamSessions.reduce((sum, s) => sum + s.viewers, 0),
    totalBandwidth: streamSessions.reduce((sum, s) => sum + s.bandwidth, 0),
    avgSecurityScore: Math.round(streamSessions.reduce((sum, s) => sum + s.analytics.securityScore, 0) / streamSessions.length),
    totalAlerts: streamSessions.reduce((sum, s) => sum + s.alerts.length, 0),
    vulnerabilities: streamSessions.reduce((sum, s) => sum + s.security.vulnerabilities.length, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Streaming Security</h2>
          <p className="text-gray-600">Secure stream management and monitoring</p>
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
              checked={autoEncryption}
              onCheckedChange={setAutoEncryption}
            />
            <Label>Auto Encryption</Label>
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

      {/* Security Alerts */}
      {streamMetrics.vulnerabilities > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {streamMetrics.vulnerabilities} security vulnerabilities found across {streamMetrics.totalStreams} streams. Review and remediate.
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search streams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={securityFilter} onValueChange={setSecurityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Security" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="maximum">Maximum</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
                <Play className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.activeStreams}</div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {streamMetrics.activeStreams} of {streamMetrics.totalStreams} streams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Encrypted Streams</CardTitle>
                <Lock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.encryptedStreams}</div>
                <p className="text-xs text-blue-600 mt-1">
                  <Shield className="h-3 w-3 inline mr-1" />
                  {Math.round((streamMetrics.encryptedStreams / streamMetrics.totalStreams) * 100)}% encrypted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.totalViewers}</div>
                <p className="text-xs text-purple-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Active connections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.avgSecurityScore}%</div>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Average across all streams
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stream Overview and Security Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Stream Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Bandwidth</span>
                    <span className="text-lg font-bold">{streamMetrics.totalBandwidth.toFixed(1)} Mbps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Latency</span>
                    <span className="text-sm">
                      {Math.round(streamSessions.reduce((sum, s) => sum + s.analytics.latency, 0) / streamSessions.length)} ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Packet Loss</span>
                    <span className="text-sm">
                      {((streamSessions.reduce((sum, s) => sum + s.analytics.packetLoss, 0) / streamSessions.length) * 100).toFixed(3)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Quality Score</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={streamSessions.reduce((sum, s) => sum + s.analytics.qualityScore, 0) / streamSessions.length} 
                        className="w-16 h-2" 
                      />
                      <span className="text-sm">
                        {Math.round(streamSessions.reduce((sum, s) => sum + s.analytics.qualityScore, 0) / streamSessions.length)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Encryption Coverage</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={(streamMetrics.encryptedStreams / streamMetrics.totalStreams) * 100} 
                        className="w-16 h-2" 
                      />
                      <span className="text-sm">
                        {Math.round((streamMetrics.encryptedStreams / streamMetrics.totalStreams) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Access Control</span>
                    <Badge variant="default">
                      {accessRules.filter(r => r.enabled).length} Active Rules
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Vulnerabilities</span>
                    <Badge variant={streamMetrics.vulnerabilities > 0 ? "destructive" : "default"}>
                      {streamMetrics.vulnerabilities}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Security Alerts</span>
                    <Badge variant={streamMetrics.totalAlerts > 0 ? "destructive" : "default"}>
                      {streamMetrics.totalAlerts}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Stream Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {streamSessions.slice(0, 5).map((stream) => (
                  <div key={stream.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="mt-1">
                        {getTypeIcon(stream.type)}
                      </div>
                      <div>
                        <div className="font-medium">{stream.name}</div>
                        <div className="text-sm text-gray-600">
                          {stream.viewers} viewers • {stream.bandwidth.toFixed(1)} Mbps
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(stream.status)}>
                        {stream.status}
                      </Badge>
                      <Badge className={getSecurityColor(stream.security.securityLevel)}>
                        {stream.security.securityLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streams Tab */}
        <TabsContent value="streams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stream Management</CardTitle>
              <CardDescription>
                Monitor and manage streaming sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStreams.map((stream) => (
                  <div key={stream.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getTypeIcon(stream.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{stream.name}</h3>
                            <Badge className={getStatusColor(stream.status)}>
                              {stream.status}
                            </Badge>
                            <Badge className={getSecurityColor(stream.security.securityLevel)}>
                              {stream.security.securityLevel}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {stream.source} → {stream.destination}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Viewers:</span>
                              <span className="ml-1">{stream.viewers}/{stream.maxViewers}</span>
                            </div>
                            <div>
                              <span className="font-medium">Bandwidth:</span>
                              <span className="ml-1">{stream.bandwidth.toFixed(1)} Mbps</span>
                            </div>
                            <div>
                              <span className="font-medium">Encryption:</span>
                              <span className="ml-1">{stream.encryption.toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="font-medium">Protocol:</span>
                              <span className="ml-1">{stream.protocol.toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Security:</span>
                              <Progress value={stream.analytics.securityScore} className="w-16 h-2" />
                              <span className="text-xs">{stream.analytics.securityScore}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Quality:</span>
                              <Progress value={stream.analytics.qualityScore} className="w-16 h-2" />
                              <span className="text-xs">{stream.analytics.qualityScore}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStream(stream);
                            setShowStreamDetail(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select onValueChange={(value) => handleStreamAction(stream.id, value)}>
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Start</SelectItem>
                            <SelectItem value="paused">Pause</SelectItem>
                            <SelectItem value="stopped">Stop</SelectItem>
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

        {/* Encryption Tab */}
        <TabsContent value="encryption" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Encryption Profiles</h3>
            <Button onClick={() => setShowNewProfileDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Profile
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Encryption Management</CardTitle>
              <CardDescription>
                Configure encryption profiles for secure streaming
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {encryptionProfiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{profile.name}</h3>
                          <Badge variant="outline">{profile.algorithm}</Badge>
                          <Badge variant="secondary">{profile.keySize}-bit</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{profile.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Mode:</span>
                            <span className="ml-1">{profile.mode}</span>
                          </div>
                          <div>
                            <span className="font-medium">Key Rotation:</span>
                            <span className="ml-1">{profile.keyRotation ? 'Enabled' : 'Disabled'}</span>
                          </div>
                          <div>
                            <span className="font-medium">Usage:</span>
                            <span className="ml-1">{profile.usageCount} times</span>
                          </div>
                          <div>
                            <span className="font-medium">Last Used:</span>
                            <span className="ml-1">{new Date(profile.lastUsed).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Access Control Rules</h3>
            <Button onClick={() => setShowNewRuleDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Rule
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Access Rules</CardTitle>
              <CardDescription>
                Configure access control rules for streaming security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Triggers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant={rule.type === 'allow' ? 'default' : rule.type === 'deny' ? 'destructive' : 'secondary'}>
                          {rule.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{rule.criteria}</div>
                          <div className="text-xs text-gray-500">{rule.value}</div>
                        </div>
                      </TableCell>
                      <TableCell>{rule.action}</TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.triggerCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => handleRuleToggle(rule.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
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

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {streamSessions.flatMap(s => s.alerts).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-500' :
                          alert.severity === 'high' ? 'bg-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <div className="font-medium text-sm">{alert.message}</div>
                          <div className="text-xs text-gray-500">{alert.source}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {streamSessions.flatMap(s => s.alerts).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No security alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {streamSessions.flatMap(s => s.security.vulnerabilities).map((vuln) => (
                    <div key={vuln.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{vuln.type}</h4>
                            <Badge className={getSeverityColor(vuln.severity)}>
                              {vuln.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{vuln.description}</p>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Impact:</span> {vuln.impact}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Mitigation:</span> {vuln.mitigation}
                          </div>
                        </div>
                        <Badge variant={vuln.status === 'resolved' ? 'default' : 'destructive'}>
                          {vuln.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {streamSessions.flatMap(s => s.security.vulnerabilities).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No vulnerabilities detected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-encryption">Auto Encryption</Label>
                  <Switch
                    checked={autoEncryption}
                    onCheckedChange={setAutoEncryption}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="intrusion-detection">Intrusion Detection</Label>
                  <Switch
                    checked={intrusionDetection}
                    onCheckedChange={setIntrusionDetection}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-encryption">Default Encryption</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select encryption" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes256">AES-256</SelectItem>
                      <SelectItem value="aes128">AES-128</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-rotation">Key Rotation Interval (seconds)</Label>
                  <Input
                    id="key-rotation"
                    type="number"
                    placeholder="3600"
                    min="60"
                    max="86400"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoring Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-threshold">Alert Threshold</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (All events)</SelectItem>
                      <SelectItem value="medium">Medium (High priority)</SelectItem>
                      <SelectItem value="high">High (Critical only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention-period">Log Retention (days)</Label>
                  <Input
                    id="retention-period"
                    type="number"
                    placeholder="30"
                    min="1"
                    max="365"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="admin@company.com"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stream Detail Dialog */}
      <Dialog open={showStreamDetail} onOpenChange={setShowStreamDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Stream Details</DialogTitle>
            <DialogDescription>
              {selectedStream?.name} ({selectedStream?.id})
            </DialogDescription>
          </DialogHeader>
          {selectedStream && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Stream Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="outline">{selectedStream.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedStream.status)}>
                        {selectedStream.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Protocol:</span>
                      <span>{selectedStream.protocol.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality:</span>
                      <span>{selectedStream.quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Viewers:</span>
                      <span>{selectedStream.viewers}/{selectedStream.maxViewers}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Security Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Encryption:</span>
                      <Badge variant={selectedStream.security.encryptionEnabled ? 'default' : 'destructive'}>
                        {selectedStream.security.encryptionEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span>{selectedStream.security.encryptionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key Rotation:</span>
                      <Badge variant={selectedStream.security.keyRotation ? 'default' : 'secondary'}>
                        {selectedStream.security.keyRotation ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Level:</span>
                      <Badge className={getSecurityColor(selectedStream.security.securityLevel)}>
                        {selectedStream.security.securityLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Bandwidth:</span>
                    <span className="ml-1">{selectedStream.bandwidth.toFixed(1)} Mbps</span>
                  </div>
                  <div>
                    <span className="font-medium">Latency:</span>
                    <span className="ml-1">{selectedStream.analytics.latency} ms</span>
                  </div>
                  <div>
                    <span className="font-medium">Jitter:</span>
                    <span className="ml-1">{selectedStream.analytics.jitter} ms</span>
                  </div>
                  <div>
                    <span className="font-medium">Packet Loss:</span>
                    <span className="ml-1">{(selectedStream.analytics.packetLoss * 100).toFixed(3)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Rule Dialog */}
      <Dialog open={showNewRuleDialog} onOpenChange={setShowNewRuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Access Rule</DialogTitle>
            <DialogDescription>
              Create a new access control rule for streaming security
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-type">Type</Label>
                <Select value={newRule.type} onValueChange={(value: any) => setNewRule({...newRule, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">Allow</SelectItem>
                    <SelectItem value="deny">Deny</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rule-criteria">Criteria</Label>
                <Select value={newRule.criteria} onValueChange={(value) => setNewRule({...newRule, criteria: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ip_range">IP Range</SelectItem>
                    <SelectItem value="user_type">User Type</SelectItem>
                    <SelectItem value="bandwidth">Bandwidth</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="rule-value">Value</Label>
              <Input
                id="rule-value"
                placeholder="Enter value (e.g., 192.168.1.0/24)"
                value={newRule.value}
                onChange={(e) => setNewRule({...newRule, value: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="rule-action">Action</Label>
              <Input
                id="rule-action"
                placeholder="Enter action"
                value={newRule.action}
                onChange={(e) => setNewRule({...newRule, action: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-priority">Priority</Label>
                <Input
                  id="rule-priority"
                  type="number"
                  min="1"
                  max="100"
                  value={newRule.priority}
                  onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={newRule.enabled}
                  onCheckedChange={(checked) => setNewRule({...newRule, enabled: checked})}
                />
                <Label>Enabled</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewRuleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRule}>
                Add Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Profile Dialog */}
      <Dialog open={showNewProfileDialog} onOpenChange={setShowNewProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Encryption Profile</DialogTitle>
            <DialogDescription>
              Create a new encryption profile for secure streaming
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                placeholder="Enter profile name"
                value={newProfile.name}
                onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="profile-description">Description</Label>
              <Textarea
                id="profile-description"
                placeholder="Enter description"
                value={newProfile.description}
                onChange={(e) => setNewProfile({...newProfile, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile-algorithm">Algorithm</Label>
                <Select value={newProfile.algorithm} onValueChange={(value) => setNewProfile({...newProfile, algorithm: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AES-256-GCM">AES-256-GCM</SelectItem>
                    <SelectItem value="AES-128-GCM">AES-128-GCM</SelectItem>
                    <SelectItem value="AES-256-CBC">AES-256-CBC</SelectItem>
                    <SelectItem value="AES-128-CBC">AES-128-CBC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="profile-keysize">Key Size</Label>
                <Select value={newProfile.keySize.toString()} onValueChange={(value) => setNewProfile({...newProfile, keySize: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256-bit</SelectItem>
                    <SelectItem value="128">128-bit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile-rotation">Rotation Interval (seconds)</Label>
                <Input
                  id="profile-rotation"
                  type="number"
                  min="60"
                  max="86400"
                  value={newProfile.rotationInterval}
                  onChange={(e) => setNewProfile({...newProfile, rotationInterval: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2 pt-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newProfile.keyRotation}
                    onCheckedChange={(checked) => setNewProfile({...newProfile, keyRotation: checked})}
                  />
                  <Label>Key Rotation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newProfile.certificateRequired}
                    onCheckedChange={(checked) => setNewProfile({...newProfile, certificateRequired: checked})}
                  />
                  <Label>Certificate Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newProfile.integrityCheck}
                    onCheckedChange={(checked) => setNewProfile({...newProfile, integrityCheck: checked})}
                  />
                  <Label>Integrity Check</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewProfileDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProfile}>
                Add Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 