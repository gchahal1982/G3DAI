'use client';

import React, { useState } from 'react';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  FunnelIcon,
  EyeIcon,
  ShareIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedReportType, setSelectedReportType] = useState('all');

  const reports = [
    {
      id: 'RPT001',
      title: 'Daily Radiology Summary',
      type: 'operational',
      date: '2024-01-15',
      studies: 156,
      findings: 23,
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: 'RPT002',
      title: 'AI Performance Analytics',
      type: 'analytics',
      date: '2024-01-15',
      studies: 2847,
      findings: 451,
      status: 'completed',
      size: '5.1 MB'
    },
    {
      id: 'RPT003',
      title: 'Critical Findings Alert',
      type: 'clinical',
      date: '2024-01-15',
      studies: 8,
      findings: 8,
      status: 'urgent',
      size: '1.2 MB'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-blue-600 mr-3" />
              Medical Reports
            </h1>
            <p className="text-gray-700 mt-1">Generate and manage medical reports and analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 bg-blue-500/20 text-blue-700 rounded-xl border border-blue-200/50 hover:bg-blue-500/30 transition-colors flex items-center space-x-2">
              <DocumentArrowDownIcon className="w-5 h-5" />
              <span>Export All</span>
            </button>
            <button className="px-4 py-2 bg-green-500/20 text-green-700 rounded-xl border border-green-200/50 hover:bg-green-500/30 transition-colors flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>New Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search reports..."
                className="pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-900 placeholder-gray-500"
              />
            </div>
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-900"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <select 
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/50 border border-white/30 text-gray-900"
            >
              <option value="all">All Types</option>
              <option value="operational">Operational</option>
              <option value="analytics">Analytics</option>
              <option value="clinical">Clinical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:bg-white/70 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-700 rounded-lg text-xs font-medium">
                  {report.type}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                report.status === 'urgent' ? 'bg-red-500/20 text-red-700' : 'bg-green-500/20 text-green-700'
              }`}>
                {report.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Generated:</span>
                <span className="font-medium text-gray-900">{report.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Studies:</span>
                <span className="font-medium text-gray-900">{report.studies}</span>
              </div>
              <div className="flex justify-between">
                <span>Findings:</span>
                <span className="font-medium text-gray-900">{report.findings}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-medium text-gray-900">{report.size}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium">
                View
              </button>
              <button className="p-2 bg-green-500/20 text-green-700 rounded-lg hover:bg-green-500/30 transition-colors">
                <DocumentArrowDownIcon className="w-4 h-4" />
              </button>
              <button className="p-2 bg-purple-500/20 text-purple-700 rounded-lg hover:bg-purple-500/30 transition-colors">
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">47</div>
          <div className="text-sm text-gray-600">Reports Generated</div>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">2,847</div>
          <div className="text-sm text-gray-600">Studies Analyzed</div>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">451</div>
          <div className="text-sm text-gray-600">Total Findings</div>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">97.3%</div>
          <div className="text-sm text-gray-600">Accuracy Rate</div>
        </div>
      </div>
    </div>
  );
} 