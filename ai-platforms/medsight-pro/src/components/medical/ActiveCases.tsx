'use client';

import { useState } from 'react';
import { FolderIcon, UserIcon, ClockIcon, ExclamationTriangleIcon, ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface Case {
  id: string;
  patientName: string;
  patientId: string;
  description: string;
  modality: string;
  status: 'critical' | 'urgent' | 'routine' | 'pending';
  assignedTo: string;
  timeElapsed: string;
}

const mockCases: Case[] = [
  { id: 'case1', patientName: 'John Doe', patientId: 'P001', description: 'Suspected Pneumonia', modality: 'CT', status: 'critical', assignedTo: 'Dr. Smith', timeElapsed: '15m' },
  { id: 'case2', patientName: 'Jane Smith', patientId: 'P002', description: 'Routine Brain MRI', modality: 'MR', status: 'routine', assignedTo: 'Dr. Emily', timeElapsed: '2h' },
  { id: 'case3', patientName: 'Robert Brown', patientId: 'P003', description: 'Abdominal Ultrasound', modality: 'US', status: 'urgent', assignedTo: 'Dr. Wilson', timeElapsed: '45m' },
  { id: 'case4', patientName: 'Emily White', patientId: 'P004', description: 'Follow-up X-Ray', modality: 'XR', status: 'routine', assignedTo: 'Dr. Smith', timeElapsed: '1d' },
  { id: 'case5', patientName: 'Michael Green', patientId: 'P005', description: 'Pending PET Scan Results', modality: 'PET', status: 'pending', assignedTo: 'Unassigned', timeElapsed: '3d' },
];

export function ActiveCases() {
  const [cases, setCases] = useState(mockCases);
  const [filter, setFilter] = useState('all');

  const getStatusStyles = (status: Case['status']) => {
    switch (status) {
      case 'critical': return { bg: 'bg-red-100', text: 'text-red-800', icon: <ExclamationTriangleIcon className="w-4 h-4 text-red-500" /> };
      case 'urgent': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <ClockIcon className="w-4 h-4 text-yellow-500" /> };
      case 'routine': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: <UserIcon className="w-4 h-4 text-blue-500" /> };
      case 'pending': return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FolderIcon className="w-4 h-4 text-gray-500" /> };
    }
  };

  const filteredCases = cases.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="medsight-glass p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-medsight-primary">Active Cases</h3>
        <div className="relative">
          <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            onChange={(e) => setFilter(e.target.value)}
            className="input-medsight pl-9"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="routine">Routine</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCases.map(c => (
          <div key={c.id} className="glass-card-secondary p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`p-1.5 rounded-full ${getStatusStyles(c.status).bg}`}>
                  {getStatusStyles(c.status).icon}
                </span>
                <div>
                  <p className="font-semibold">{c.patientName} <span className="font-normal text-gray-500">({c.patientId})</span></p>
                  <p className="text-sm text-gray-600">{c.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(c.status).bg} ${getStatusStyles(c.status).text}`}>
                  {c.status}
                </span>
                <span className="text-sm text-gray-500">{c.modality}</span>
                <div className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {c.timeElapsed}
                </div>
              </div>
            </div>
            <div className="mt-2 pl-10 text-sm text-gray-500">
              Assigned to: <span className="font-medium text-gray-700">{c.assignedTo}</span>
            </div>
          </div>
        ))}
        {filteredCases.length === 0 && (
          <div className="text-center py-8 text-gray-400">No cases match the filter.</div>
        )}
      </div>
    </div>
  );
}
