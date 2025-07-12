'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../shared/components/ui/Card';
import { Button } from '../../../../../shared/components/ui/Button';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../shared/components/ui/Tabs';
import { Progress } from '../../../../../shared/components/ui/Progress';
import { Input } from '../../../../../shared/components/ui/Input';
import { Label } from '../../../../../shared/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shared/components/ui/Select';
import { Switch } from '../../../../../shared/components/ui/Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../shared/components/ui/Table';
import { ScrollArea } from '../../../../../shared/components/ui/ScrollArea';
import { 
  Activity, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertTriangle,
  Users, Database, Network, Server, Globe, Shield, Lock, Key, 
  Eye, Settings, Search, Filter, Download, Upload, RefreshCw,
  Play, Pause, Square, BarChart3, Video, Volume2,
  Calendar, Clock, Zap, Target, Crosshair, PieChart, Plus, Edit,
  MonitorSpeaker
} from 'lucide-react';
import React from 'react';

interface StreamConfig {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'data';
  source: string;
  destination: string;
  protocol: string;
  quality: string;
  bitrate: number;
  resolution: string;
  frameRate: number;
  codec: string;
  status: 'active' | 'paused' | 'stopped';
  viewers: number;
  bandwidth: number;
  uptime: number;
  createdAt: string;
  lastModified: string;
  analytics: {
    avgLatency: number;
    jitter: number;
    packetLoss: number;
    qualityScore: number;
    totalViewers: number;
    peakViewers: number;
    dataTransferred: number;
  };
}

const mockStreams: StreamConfig[] = [
  {
    id: 'STR-001',
    name: 'AI Training Stream',
    type: 'video',
    source: 'annotation-server',
    destination: 'clients',
    protocol: 'WebRTC',
    quality: 'HD',
    bitrate: 2500,
    resolution: '1920x1080',
    frameRate: 30,
    codec: 'H.264',
    status: 'active',
    viewers: 15,
    bandwidth: 3.2,
    uptime: 7200,
    createdAt: '2024-01-15T08:00:00Z',
    lastModified: '2024-01-15T10:30:00Z',
    analytics: {
      avgLatency: 150,
      jitter: 5,
      packetLoss: 0.02,
      qualityScore: 95,
      totalViewers: 45,
      peakViewers: 18,
      dataTransferred: 1250
    }
  },
  {
    id: 'STR-002',
    name: 'Medical Data Stream',
    type: 'data',
    source: 'medical-server',
    destination: 'workstations',
    protocol: 'WebSocket',
    quality: 'Ultra',
    bitrate: 5000,
    resolution: 'N/A',
    frameRate: 0,
    codec: 'Binary',
    status: 'active',
    viewers: 8,
    bandwidth: 6.5,
    uptime: 14400,
    createdAt: '2024-01-15T06:00:00Z',
    lastModified: '2024-01-15T09:15:00Z',
    analytics: {
      avgLatency: 50,
      jitter: 2,
      packetLoss: 0.001,
      qualityScore: 99,
      totalViewers: 12,
      peakViewers: 8,
      dataTransferred: 3750
    }
  },
  {
    id: 'STR-003',
    name: 'Collaboration Audio',
    type: 'audio',
    source: 'conference-room',
    destination: 'remote-users',
    protocol: 'RTSP',
    quality: 'Medium',
    bitrate: 128,
    resolution: 'N/A',
    frameRate: 0,
    codec: 'AAC',
    status: 'paused',
    viewers: 0,
    bandwidth: 0,
    uptime: 3600,
    createdAt: '2024-01-15T09:00:00Z',
    lastModified: '2024-01-15T10:00:00Z',
    analytics: {
      avgLatency: 200,
      jitter: 8,
      packetLoss: 0.05,
      qualityScore: 78,
      totalViewers: 22,
      peakViewers: 6,
      dataTransferred: 460
    }
  }
];

export default function StreamManagementPanel() {
  const [streams, setStreams] = useState<StreamConfig[]>(mockStreams);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedStream, setSelectedStream] = useState<StreamConfig | null>(null);
  const [autoOptimization, setAutoOptimization] = useState(true);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStreams(prev => prev.map(stream => {
        if (stream.status === 'active') {
          return {
            ...stream,
            viewers: Math.max(0, stream.viewers + Math.floor(Math.random() * 3) - 1),
            bandwidth: Math.max(0.1, stream.bandwidth + (Math.random() - 0.5) * 0.5),
            analytics: {
              ...stream.analytics,
              avgLatency: Math.max(10, stream.analytics.avgLatency + Math.floor(Math.random() * 20) - 10),
              jitter: Math.max(1, stream.analytics.jitter + Math.floor(Math.random() * 2) - 1)
            }
          };
        }
        return stream;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || stream.status === statusFilter;
    const matchesType = typeFilter === 'all' || stream.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const streamMetrics = {
    totalStreams: streams.length,
    activeStreams: streams.filter(s => s.status === 'active').length,
    totalViewers: streams.reduce((sum, s) => sum + s.viewers, 0),
    totalBandwidth: streams.reduce((sum, s) => sum + s.bandwidth, 0),
    avgQuality: Math.round(streams.reduce((sum, s) => sum + s.analytics.qualityScore, 0) / streams.length)
  };

  const handleStreamAction = (streamId: string, action: 'active' | 'paused' | 'stopped') => {
    setStreams(prev => prev.map(stream => 
      stream.id === streamId ? { ...stream, status: action } : stream
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      case 'data': return <Database className="w-4 h-4" />;
      default: return <MonitorSpeaker className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Stream Management</h2>
          <p className="text-gray-600">Configure and monitor streaming sessions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch checked={autoOptimization} onCheckedChange={setAutoOptimization} />
            <Label>Auto Optimization</Label>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Stream
          </Button>
          <Button size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="stopped">Stopped</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="data">Data</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.totalStreams}</div>
                <p className="text-xs text-gray-600">All configured streams</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.activeStreams}</div>
                <p className="text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Currently streaming
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.totalViewers}</div>
                <p className="text-xs text-blue-600">Active connections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bandwidth Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.totalBandwidth.toFixed(1)} Mbps</div>
                <p className="text-xs text-purple-600">Total consumption</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{streamMetrics.avgQuality}%</div>
                <p className="text-xs text-green-600">Overall quality score</p>
              </CardContent>
            </Card>
          </div>

          {/* Stream Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Stream Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredStreams.map((stream) => (
                  <div key={stream.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(stream.type)}
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
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStreamAction(stream.id, 'active')}
                          disabled={stream.status === 'active'}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStreamAction(stream.id, 'paused')}
                          disabled={stream.status === 'paused'}
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStreamAction(stream.id, 'stopped')}
                          disabled={stream.status === 'stopped'}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      </div>
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
              <CardTitle>Stream Configuration</CardTitle>
              <CardDescription>Manage stream settings and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stream Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Viewers</TableHead>
                    <TableHead>Bandwidth</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStreams.map((stream) => (
                    <TableRow key={stream.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(stream.type)}
                          <div>
                            <div className="font-medium">{stream.name}</div>
                            <div className="text-sm text-gray-500">{stream.protocol}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stream.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(stream.status)}>
                          {stream.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={stream.analytics.qualityScore} className="w-16 h-2" />
                          <span className="text-sm">{stream.analytics.qualityScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{stream.viewers}</TableCell>
                      <TableCell>{stream.bandwidth.toFixed(1)} Mbps</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStream(stream)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStreams.map((stream) => (
                    <div key={stream.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{stream.name}</h4>
                        <Badge className={getStatusColor(stream.status)}>
                          {stream.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Latency:</span>
                          <span className="ml-2 font-medium">{stream.analytics.avgLatency}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Jitter:</span>
                          <span className="ml-2 font-medium">{stream.analytics.jitter}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Packet Loss:</span>
                          <span className="ml-2 font-medium">{(stream.analytics.packetLoss * 100).toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quality Score:</span>
                          <span className="ml-2 font-medium">{stream.analytics.qualityScore}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStreams.map((stream) => (
                    <div key={stream.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{stream.name}</h4>
                        <Badge variant="outline">{stream.type}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total Viewers:</span>
                          <span className="ml-2 font-medium">{stream.analytics.totalViewers}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Peak Viewers:</span>
                          <span className="ml-2 font-medium">{stream.analytics.peakViewers}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Data Transferred:</span>
                          <span className="ml-2 font-medium">{stream.analytics.dataTransferred} MB</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Uptime:</span>
                          <span className="ml-2 font-medium">{Math.round(stream.uptime / 3600)}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <CardTitle>Stream Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Quality</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ultra">Ultra (4K)</SelectItem>
                      <SelectItem value="hd">HD (1080p)</SelectItem>
                      <SelectItem value="medium">Medium (720p)</SelectItem>
                      <SelectItem value="low">Low (480p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Protocol</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webrtc">WebRTC</SelectItem>
                      <SelectItem value="rtsp">RTSP</SelectItem>
                      <SelectItem value="hls">HLS</SelectItem>
                      <SelectItem value="websocket">WebSocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Viewers per Stream</Label>
                  <Input type="number" placeholder="50" min="1" max="1000" />
                </div>
                <div className="space-y-2">
                  <Label>Bandwidth Limit (Mbps)</Label>
                  <Input type="number" placeholder="10" min="1" max="100" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto Quality Adjustment</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Adaptive Bitrate</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Load Balancing</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Buffer Optimization</Label>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Quality Threshold (%)</Label>
                  <Input type="number" placeholder="85" min="50" max="100" />
                </div>
                <div className="space-y-2">
                  <Label>Latency Threshold (ms)</Label>
                  <Input type="number" placeholder="200" min="50" max="1000" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stream Details Modal */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Stream Details</h2>
                <Button variant="outline" onClick={() => setSelectedStream(null)}>
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">{selectedStream.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <Badge variant="outline">{selectedStream.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Protocol:</span>
                      <span>{selectedStream.protocol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality:</span>
                      <span>{selectedStream.quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bitrate:</span>
                      <span>{selectedStream.bitrate} kbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Codec:</span>
                      <span>{selectedStream.codec}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Performance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedStream.status)}>
                        {selectedStream.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Viewers:</span>
                      <span>{selectedStream.viewers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bandwidth:</span>
                      <span>{selectedStream.bandwidth.toFixed(1)} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency:</span>
                      <span>{selectedStream.analytics.avgLatency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality Score:</span>
                      <span>{selectedStream.analytics.qualityScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{Math.round(selectedStream.uptime / 3600)}h</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 