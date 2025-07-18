'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  PhoneIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  MapPinIcon,
  BellIcon,
  ComputerDesktopIcon,
  EyeIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowLeftIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid';

export default function EmergencyAccessPage() {
  const [emergencyLevel, setEmergencyLevel] = useState('high');
  const [activeProtocol, setActiveProtocol] = useState('trauma');

  const emergencyContacts = [
    { name: 'Emergency Room', number: '911', type: 'emergency' },
    { name: 'Cardiology On-Call', number: '555-0123', type: 'specialist' },
    { name: 'Neurology On-Call', number: '555-0124', type: 'specialist' },
    { name: 'ICU Coordinator', number: '555-0125', type: 'critical' },
    { name: 'Blood Bank', number: '555-0126', type: 'support' },
    { name: 'Pharmacy Emergency', number: '555-0127', type: 'support' }
  ];

  const emergencyProtocols = [
    { id: 'trauma', name: 'Trauma Protocol', priority: 'critical', time: '< 5 min' },
    { id: 'cardiac', name: 'Cardiac Emergency', priority: 'critical', time: '< 3 min' },
    { id: 'stroke', name: 'Stroke Protocol', priority: 'critical', time: '< 10 min' },
    { id: 'respiratory', name: 'Respiratory Distress', priority: 'high', time: '< 5 min' },
    { id: 'sepsis', name: 'Sepsis Protocol', priority: 'high', time: '< 15 min' },
    { id: 'overdose', name: 'Drug Overdose', priority: 'high', time: '< 5 min' }
  ];

  const quickActions = [
    { name: 'Patient Lookup', icon: MagnifyingGlassIcon, color: 'bg-primary' },
    { name: 'Medical Imaging', icon: EyeIcon, color: 'bg-success' },
    { name: 'Lab Results', icon: BeakerIcon, color: 'bg-warning' },
    { name: 'Consultation', icon: ChatBubbleLeftRightIcon, color: 'bg-danger' },
    { name: 'Video Call', icon: VideoCameraIcon, color: 'bg-purple-500' },
    { name: 'Print Records', icon: PrinterIcon, color: 'bg-gray-600' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-danger bg-danger/10 border-danger/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-danger text-white';
      case 'specialist': return 'bg-primary text-white';
      case 'critical': return 'bg-warning text-white';
      case 'support': return 'bg-success text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-danger/5">
      {/* Emergency Header */}
      <div className="bg-danger text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()} 
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIconSolid className="w-8 h-8 animate-pulse" />
                <div>
                  <h1 className="text-2xl font-bold">Emergency Access Portal</h1>
                  <p className="text-danger-light">Critical medical resources and protocols</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm opacity-90">Current Time</div>
                <div className="text-lg font-mono">{new Date().toLocaleTimeString()}</div>
              </div>
              <div className="bg-white/20 px-3 py-2 rounded-lg">
                <div className="text-sm opacity-90">Alert Level</div>
                <div className="text-lg font-bold uppercase">HIGH</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BoltIcon className="w-6 h-6 mr-2 text-danger" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center p-4 rounded-lg bg-white border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className={`p-3 rounded-full ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-primary">
                  {action.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Contacts */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <PhoneIcon className="w-6 h-6 mr-2 text-danger" />
              Emergency Contacts
            </h2>
            <div className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/50 border border-white/20 hover:bg-white/70 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getContactTypeColor(contact.type)}`}>
                      {contact.type.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{contact.name}</span>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="flex items-center space-x-2 bg-success text-white px-4 py-2 rounded-lg hover:bg-success/90 transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    <span className="font-mono">{contact.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Protocols */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-warning" />
              Emergency Protocols
            </h2>
            <div className="space-y-3">
              {emergencyProtocols.map((protocol) => (
                <div
                  key={protocol.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    activeProtocol === protocol.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveProtocol(protocol.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{protocol.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(protocol.priority)}`}>
                        {protocol.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {protocol.time}
                      </span>
                    </div>
                  </div>
                  <button className="text-sm text-primary hover:text-primary/80 font-medium">
                    View Protocol Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hospital Status */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <HeartIconSolid className="w-6 h-6 mr-2 text-danger" />
            Hospital Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ER Capacity</p>
                  <p className="text-2xl font-bold text-success">78%</p>
                </div>
                <TruckIcon className="w-8 h-8 text-success" />
              </div>
            </div>
            <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ICU Beds</p>
                  <p className="text-2xl font-bold text-warning">12 Available</p>
                </div>
                <HeartIcon className="w-8 h-8 text-warning" />
              </div>
            </div>
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">OR Status</p>
                  <p className="text-2xl font-bold text-primary">3 Active</p>
                </div>
                <UserGroupIcon className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="bg-danger/10 border border-danger/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Blood Bank</p>
                  <p className="text-2xl font-bold text-danger">O- Low</p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-danger" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-6 h-6 text-success" />
              <div>
                <p className="font-semibold">HIPAA Compliant Emergency Access</p>
                <p className="text-sm text-gray-300">All actions are logged and audited</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Last Updated</p>
              <p className="font-mono">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 