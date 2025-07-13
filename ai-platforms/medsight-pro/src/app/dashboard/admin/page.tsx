'use client';

import { useState } from 'react';
import { 
  CogIcon,
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="medsight-glass p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medsight-primary/10 rounded-full flex items-center justify-center">
              <CogIcon className="w-4 h-4 text-medsight-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-medsight-primary">
                Admin Dashboard
              </h1>
              <p className="text-sm text-medsight-primary/70">
                System administration and monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-medsight-normal rounded-full animate-pulse"></div>
              <span className="text-sm text-medsight-primary/70">System Online</span>
            </div>
            <div className="text-sm text-medsight-primary/70">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-6 h-6 text-medsight-primary" />
            <div>
              <div className="text-2xl font-bold text-medsight-primary">147</div>
              <div className="text-sm text-medsight-primary/70">Active Users</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <ServerIcon className="w-6 h-6 text-medsight-normal" />
            <div>
              <div className="text-2xl font-bold text-medsight-normal">99.9%</div>
              <div className="text-sm text-medsight-primary/70">Uptime</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="w-6 h-6 text-medsight-ai-high" />
            <div>
              <div className="text-2xl font-bold text-medsight-ai-high">2,345</div>
              <div className="text-sm text-medsight-primary/70">Cases Today</div>
            </div>
          </div>
        </div>
        
        <div className="medsight-glass p-4 rounded-xl">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-6 h-6 text-medsight-secondary" />
            <div>
              <div className="text-2xl font-bold text-medsight-secondary">100%</div>
              <div className="text-sm text-medsight-primary/70">Compliance</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* System Health */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4 flex items-center space-x-2">
          <ServerIcon className="w-5 h-5" />
          <span>System Health</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-medsight-primary">DICOM Server</div>
                <div className="text-sm text-medsight-primary/60">Processing medical images</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medsight-normal rounded-full"></div>
                <span className="text-sm text-medsight-normal">Online</span>
              </div>
            </div>
          </div>
          
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-medsight-primary">AI Engine</div>
                <div className="text-sm text-medsight-primary/60">Medical analysis active</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medsight-ai-high rounded-full animate-pulse"></div>
                <span className="text-sm text-medsight-ai-high">Processing</span>
              </div>
            </div>
          </div>
          
          <div className="medsight-control-glass p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-medsight-primary">Database</div>
                <div className="text-sm text-medsight-primary/60">Medical records secure</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-medsight-normal rounded-full"></div>
                <span className="text-sm text-medsight-normal">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* System Alerts */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4 flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>System Alerts</span>
        </h3>
        
        <div className="space-y-3">
          <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-l-medsight-normal">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-medsight-normal" />
                <div>
                  <div className="font-medium text-medsight-primary">System Update Complete</div>
                  <div className="text-sm text-medsight-primary/60">Medical AI engine updated to v3.2.1</div>
                </div>
              </div>
              <div className="text-sm text-medsight-primary/60">2 hours ago</div>
            </div>
          </div>
          
          <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-l-medsight-pending">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-5 h-5 text-medsight-pending" />
                <div>
                  <div className="font-medium text-medsight-primary">Scheduled Maintenance</div>
                  <div className="text-sm text-medsight-primary/60">DICOM server maintenance scheduled for tonight at 2:00 AM</div>
                </div>
              </div>
              <div className="text-sm text-medsight-primary/60">12 hours</div>
            </div>
          </div>
          
          <div className="medsight-control-glass p-4 rounded-lg border-l-4 border-l-medsight-ai-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CpuChipIcon className="w-5 h-5 text-medsight-ai-high" />
                <div>
                  <div className="font-medium text-medsight-primary">AI Performance Optimization</div>
                  <div className="text-sm text-medsight-primary/60">Neural network optimization completed - 15% performance increase</div>
                </div>
              </div>
              <div className="text-sm text-medsight-primary/60">6 hours ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="medsight-glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-medsight-primary mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 medsight-control-glass rounded-lg">
            <div className="w-2 h-2 bg-medsight-normal rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-medsight-primary">Dr. Sarah Johnson logged in</div>
              <div className="text-xs text-medsight-primary/60">Radiology Department • 5 minutes ago</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 medsight-control-glass rounded-lg">
            <div className="w-2 h-2 bg-medsight-ai-high rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-medsight-primary">AI analysis completed</div>
              <div className="text-xs text-medsight-primary/60">Chest CT study analyzed • 8 minutes ago</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 medsight-control-glass rounded-lg">
            <div className="w-2 h-2 bg-medsight-pending rounded-full"></div>
            <div>
              <div className="text-sm font-medium text-medsight-primary">User role updated</div>
              <div className="text-xs text-medsight-primary/60">Dr. Michael Chen promoted to Senior Radiologist • 15 minutes ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
