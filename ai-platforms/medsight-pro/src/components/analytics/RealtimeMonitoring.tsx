'use client';

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Zap, RefreshCw, Play, Pause } from 'lucide-react';

interface RealtimeMonitoringProps {
  metrics: any;
  alerts: any[];
}

const RealtimeMonitoring: React.FC<RealtimeMonitoringProps> = ({ metrics, alerts }) => {
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveMetrics, setLiveMetrics] = useState({
    activeUsers: 1623,
    systemLoad: 68.4,
    responseTime: 124,
    errorRate: 0.03,
    throughput: 1247,
    memoryUsage: 72.8
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (isLive) {
        setLiveMetrics(prev => ({
          activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
          systemLoad: Math.max(0, Math.min(100, prev.systemLoad + Math.random() * 4 - 2)),
          responseTime: Math.max(50, prev.responseTime + Math.random() * 20 - 10),
          errorRate: Math.max(0, prev.errorRate + Math.random() * 0.01 - 0.005),
          throughput: Math.max(0, prev.throughput + Math.random() * 100 - 50),
          memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + Math.random() * 2 - 1))
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatNumber = (num: number) => num >= 1000 ? `${(num / 1000).toFixed(1)}K` : Math.floor(num).toString();
  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (value <= thresholds.warning) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-time Monitoring</h2>
          <p className="text-sm text-gray-600">Live system performance and alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {isLive ? 'Live' : 'Paused'} - {currentTime.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {isLive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Active Users</span>
            </div>
            {getStatusIcon(liveMetrics.activeUsers, { good: 2000, warning: 1500 })}
          </div>
          <div className="text-2xl font-bold text-blue-600">{formatNumber(liveMetrics.activeUsers)}</div>
          <div className="text-xs text-gray-500">Concurrent sessions</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">System Load</span>
            </div>
            {getStatusIcon(liveMetrics.systemLoad, { good: 70, warning: 85 })}
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(liveMetrics.systemLoad, { good: 70, warning: 85 })}`}>
            {formatPercentage(liveMetrics.systemLoad)}
          </div>
          <div className="text-xs text-gray-500">CPU utilization</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Response Time</span>
            </div>
            {getStatusIcon(liveMetrics.responseTime, { good: 100, warning: 200 })}
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(liveMetrics.responseTime, { good: 100, warning: 200 })}`}>
            {Math.floor(liveMetrics.responseTime)}ms
          </div>
          <div className="text-xs text-gray-500">Average latency</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Error Rate</span>
            </div>
            {getStatusIcon(liveMetrics.errorRate * 100, { good: 0.1, warning: 0.5 })}
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(liveMetrics.errorRate * 100, { good: 0.1, warning: 0.5 })}`}>
            {formatPercentage(liveMetrics.errorRate)}
          </div>
          <div className="text-xs text-gray-500">Request failures</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Throughput</span>
            </div>
            {getStatusIcon(liveMetrics.throughput, { good: 1000, warning: 800 })}
          </div>
          <div className="text-2xl font-bold text-purple-600">{formatNumber(liveMetrics.throughput)}</div>
          <div className="text-xs text-gray-500">Requests per minute</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Memory Usage</span>
            </div>
            {getStatusIcon(liveMetrics.memoryUsage, { good: 70, warning: 85 })}
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(liveMetrics.memoryUsage, { good: 70, warning: 85 })}`}>
            {formatPercentage(liveMetrics.memoryUsage)}
          </div>
          <div className="text-xs text-gray-500">RAM utilization</div>
        </div>
      </div>

      {/* Live Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Live Alerts</h3>
        </div>
        <div className="p-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-500">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                    <div className="text-xs text-gray-500">{alert.description}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Medical Imaging Service</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Processing Engine</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Patient Data Service</span>
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-1" />
                  <span className="text-sm font-medium text-yellow-600">Degraded</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Authentication Service</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reporting Service</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup Systems</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMonitoring; 