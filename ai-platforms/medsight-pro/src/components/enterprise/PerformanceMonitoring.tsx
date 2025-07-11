'use client';

import React from 'react';
import { Activity, Server, Gauge, Clock } from 'lucide-react';

const PerformanceMonitoring: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Monitoring</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center p-4 bg-blue-50 rounded-lg">
          <Server className="w-8 h-8 text-blue-600 mr-3" />
          <div>
            <div className="text-sm text-gray-600">System Uptime</div>
            <div className="text-lg font-bold text-blue-600">99.9%</div>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-green-50 rounded-lg">
          <Clock className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <div className="text-sm text-gray-600">Response Time</div>
            <div className="text-lg font-bold text-green-600">124ms</div>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-purple-50 rounded-lg">
          <Activity className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <div className="text-sm text-gray-600">Throughput</div>
            <div className="text-lg font-bold text-purple-600">1.2K/min</div>
          </div>
        </div>
        
        <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
          <Gauge className="w-8 h-8 text-yellow-600 mr-3" />
          <div>
            <div className="text-sm text-gray-600">CPU Usage</div>
            <div className="text-lg font-bold text-yellow-600">68%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoring; 