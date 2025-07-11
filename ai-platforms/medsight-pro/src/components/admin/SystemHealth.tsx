'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  threshold: number;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  lastCheck: string;
}

export function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'normal', threshold: 80 },
    { name: 'Memory Usage', value: 67, unit: '%', status: 'normal', threshold: 85 },
    { name: 'Disk Usage', value: 34, unit: '%', status: 'normal', threshold: 90 },
    { name: 'DICOM Processing Queue', value: 12, unit: 'studies', status: 'normal', threshold: 50 },
    { name: 'AI Inference Load', value: 78, unit: '%', status: 'warning', threshold: 85 },
    { name: 'Database Connections', value: 23, unit: 'connections', status: 'normal', threshold: 100 }
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'DICOM Processor', status: 'online', uptime: '99.9%', lastCheck: '2 min ago' },
    { name: 'AI Inference Engine', status: 'online', uptime: '99.7%', lastCheck: '1 min ago' },
    { name: 'Medical Database', status: 'online', uptime: '99.99%', lastCheck: '30 sec ago' },
    { name: 'Authentication Service', status: 'online', uptime: '99.8%', lastCheck: '1 min ago' },
    { name: 'File Storage', status: 'degraded', uptime: '97.2%', lastCheck: '5 min ago' },
    { name: 'Audit Logger', status: 'online', uptime: '99.9%', lastCheck: '2 min ago' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
      case 'online':
        return 'normal';
      case 'warning':
      case 'degraded':
        return 'pending';
      case 'critical':
      case 'offline':
        return 'critical';
      default:
        return 'pending';
    }
  };

  const getMetricStatus = (value: number, threshold: number) => {
    if (value >= threshold) return 'critical';
    if (value >= threshold * 0.8) return 'warning';
    return 'normal';
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
        status: getMetricStatus(metric.value, metric.threshold)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-medsight-primary-800 mb-2">System Health</h2>
        <p className="text-medsight-primary-600">Real-time monitoring of medical system components</p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} variant={getStatusColor(metric.status)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <Badge variant={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric.value.toFixed(1)}{metric.unit}
                  </span>
                  <span className="text-sm text-gray-500">
                    /{metric.threshold}{metric.unit}
                  </span>
                </div>
                <Progress 
                  value={metric.unit === '%' ? metric.value : (metric.value / metric.threshold) * 100}
                  variant={getStatusColor(metric.status)}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'online' ? 'bg-green-500' :
                    service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-500">Last check: {service.lastCheck}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">Uptime: {service.uptime}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <div>
                <p className="font-medium text-yellow-800">File Storage Performance</p>
                <p className="text-sm text-yellow-600">Storage response time increased by 15% in the last hour</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div>
                <p className="font-medium text-blue-800">Scheduled Maintenance</p>
                <p className="text-sm text-blue-600">Database backup scheduled for tonight at 2:00 AM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 