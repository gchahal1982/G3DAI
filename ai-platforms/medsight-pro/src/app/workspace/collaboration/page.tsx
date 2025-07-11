'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  ShareIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  PlusIcon,
  EyeIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function CollaborationWorkspacePage() {
  const router = useRouter();
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const activeCollaborations = [
    {
      id: 'COL001',
      type: 'consultation',
      title: 'Chest CT Review - Complex Case',
      patient: 'John Smith (P001234)',
      priority: 'urgent',
      participants: [
        { name: 'Dr. Sarah Wilson', role: 'Radiologist', status: 'online' },
        { name: 'Dr. Michael Chen', role: 'Pulmonologist', status: 'online' },
        { name: 'Dr. Lisa Anderson', role: 'Oncologist', status: 'away' }
      ],
      startedAt: '2:30 PM',
      lastActivity: '2 min ago',
      unreadMessages: 3
    },
    {
      id: 'COL002',
      type: 'second-opinion',
      title: 'Brain MRI Second Opinion',
      patient: 'Sarah Johnson (P001235)',
      priority: 'routine',
      participants: [
        { name: 'Dr. Robert Kim', role: 'Neuroradiologist', status: 'online' },
        { name: 'Dr. Emily Davis', role: 'Neurologist', status: 'offline' }
      ],
      startedAt: '1:15 PM',
      lastActivity: '15 min ago',
      unreadMessages: 0
    }
  ];

  const recentConsultations = [
    {
      id: 'COL100',
      title: 'Emergency Trauma Case',
      patient: 'Robert Wilson (P001236)',
      status: 'completed',
      participants: 3,
      duration: '45 min',
      completedAt: '11:30 AM',
      outcome: 'Immediate surgery recommended'
    },
    {
      id: 'COL101',
      title: 'Pediatric X-Ray Review',
      patient: 'Emma Thompson (P001237)',
      status: 'completed',
      participants: 2,
      duration: '20 min',
      completedAt: '10:45 AM',
      outcome: 'Normal findings confirmed'
    }
  ];

  const onlineSpecialists = [
    {
      id: 'DOC001',
      name: 'Dr. Sarah Wilson',
      specialty: 'Radiology',
      status: 'available',
      currentCases: 3,
      expertise: ['Chest Imaging', 'Cardiac CT', 'Emergency Radiology']
    },
    {
      id: 'DOC002',
      name: 'Dr. Michael Chen',
      specialty: 'Pulmonology',
      status: 'busy',
      currentCases: 5,
      expertise: ['Lung Disease', 'Critical Care', 'Interventional Pulmonology']
    },
    {
      id: 'DOC003',
      name: 'Dr. Lisa Anderson',
      specialty: 'Oncology',
      status: 'available',
      currentCases: 2,
      expertise: ['Breast Cancer', 'Lung Cancer', 'Radiation Oncology']
    },
    {
      id: 'DOC004',
      name: 'Dr. Robert Kim',
      specialty: 'Neuroradiology',
      status: 'available',
      currentCases: 1,
      expertise: ['Brain Imaging', 'Spine Imaging', 'Pediatric Neuro']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'available': 
        return 'bg-green-500/20 text-green-700 border-green-200/50';
      case 'busy': 
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-200/50';
      case 'away':
      case 'offline': 
        return 'bg-gray-500/20 text-gray-700 border-gray-200/50';
      default: 
        return 'bg-gray-500/20 text-gray-700 border-gray-200/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 font-bold';
      case 'high': return 'text-orange-600 font-semibold';
      case 'routine': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const startConsultation = () => {
    // Logic to start a new consultation
    console.log('Starting new consultation...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-8 h-8 text-green-600 mr-3" />
              Medical Collaboration Workspace
            </h1>
            <p className="text-gray-700 mt-1">Multi-disciplinary Team Consultation Platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={startConsultation}
              className="px-4 py-2 bg-green-500/20 text-green-700 rounded-xl border border-green-200/50 hover:bg-green-500/30 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Consultation</span>
            </button>
            <button className="px-4 py-2 bg-blue-500/20 text-blue-700 rounded-xl border border-blue-200/50 hover:bg-blue-500/30 transition-colors flex items-center space-x-2">
              <VideoCameraIcon className="w-5 h-5" />
              <span>Video Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Collaborations */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Active Collaborations</h2>
        <div className="space-y-4">
          {activeCollaborations.map((collab) => (
            <div
              key={collab.id}
              className="p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 transition-all duration-200 cursor-pointer"
              onClick={() => setActiveConsultation(collab)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{collab.title}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(collab.priority)}`}>
                      {collab.priority.toUpperCase()}
                    </span>
                    {collab.unreadMessages > 0 && (
                      <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                        {collab.unreadMessages}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{collab.patient}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Started: {collab.startedAt}</span>
                    <span>Last activity: {collab.lastActivity}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-green-500/20 text-green-700 rounded-lg hover:bg-green-500/30 transition-colors">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors">
                    <VideoCameraIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-purple-500/20 text-purple-700 rounded-lg hover:bg-purple-500/30 transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500">Participants:</span>
                <div className="flex items-center space-x-2">
                  {collab.participants.map((participant, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        participant.status === 'online' ? 'bg-green-500' :
                        participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-xs text-gray-700">{participant.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Online Specialists */}
        <div className="lg:col-span-2">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Available Specialists</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {onlineSpecialists.map((specialist) => (
                <div
                  key={specialist.id}
                  className="p-4 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/70 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{specialist.name}</h4>
                        <p className="text-sm text-gray-600">{specialist.specialty}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(specialist.status)}`}>
                      {specialist.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Current cases:</span>
                      <span className="text-gray-900 font-medium">{specialist.currentCases}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="font-medium mb-1">Expertise:</div>
                      <div className="flex flex-wrap gap-1">
                        {specialist.expertise.map((exp, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-700 rounded-md">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-green-500/20 text-green-700 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-medium">
                      Consult
                    </button>
                    <button className="p-2 bg-blue-500/20 text-blue-700 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-purple-500/20 text-purple-700 rounded-lg hover:bg-purple-500/30 transition-colors">
                      <PhoneIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Consultations</h3>
            <div className="space-y-3">
              {recentConsultations.map((consultation) => (
                <div key={consultation.id} className="p-3 bg-white/50 rounded-xl border border-white/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{consultation.patient}</span>
                    <span className="text-xs text-green-700 font-medium">{consultation.status}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{consultation.title}</div>
                    <div>Duration: {consultation.duration}</div>
                    <div>Completed: {consultation.completedAt}</div>
                    <div className="text-blue-700 font-medium">{consultation.outcome}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { title: 'Emergency Consultation', icon: ExclamationTriangleIcon, color: 'red' },
                { title: 'Second Opinion Request', icon: UserGroupIcon, color: 'blue' },
                { title: 'Multidisciplinary Review', icon: StarIcon, color: 'purple' },
                { title: 'Teaching Session', icon: DocumentTextIcon, color: 'green' },
                { title: 'Case Presentation', icon: ShareIcon, color: 'orange' }
              ].map((action, index) => (
                <button
                  key={index}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 hover:border-white/50 transition-all duration-200 text-left group"
                >
                  <action.icon className={`w-5 h-5 ${
                    action.color === 'red' ? 'text-red-600' :
                    action.color === 'blue' ? 'text-blue-600' :
                    action.color === 'purple' ? 'text-purple-600' :
                    action.color === 'green' ? 'text-green-600' :
                    'text-orange-600'
                  }`} />
                  <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">{action.title}</span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 