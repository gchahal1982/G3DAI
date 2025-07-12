import React from 'react';
import { 
  User, Mail, Phone, Building, 
  Briefcase, Star, Award, Shield,
  MoreVertical, Edit, MessageSquare
} from 'lucide-react';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const user = {
    name: 'Dr. Sarah Chen',
    role: 'Radiologist',
    avatar: 'SC',
    email: 'sarah.chen@hospital.com',
    phone: '+1 (555) 123-4567',
    organization: 'Metro General Hospital',
    department: 'Radiology',
    specialization: 'Diagnostic Radiology',
    status: 'online',
    memberSince: '2022-08-15',
    lastLogin: '2 min ago',
    verified: true,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-medsight-secondary';
      case 'away': return 'bg-medsight-pending';
      case 'offline': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <User className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">User Profile</h3>
            <p className="text-sm text-slate-600">Detailed user information</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-slate-100 rounded">
            <Edit className="w-4 h-4 text-slate-500" />
          </button>
          <button className="p-1 hover:bg-slate-100 rounded">
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-3">
          <div className="w-20 h-20 bg-medsight-primary/10 rounded-full flex items-center justify-center">
            <span className="text-3xl font-medium text-medsight-primary">
              {user.avatar}
            </span>
          </div>
          <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white ${getStatusColor(user.status)}`}></div>
        </div>
        <h4 className="text-xl font-bold text-slate-800">{user.name}</h4>
        <p className="text-sm text-medsight-primary font-medium">{user.role}</p>
        <div className="flex items-center space-x-2 mt-2">
          <button className="btn-medsight text-xs px-3 py-1">
            <MessageSquare className="w-3 h-3 mr-1" />
            Message
          </button>
          <button className="btn-medsight text-xs px-3 py-1">
            View Schedule
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h5 className="text-sm font-medium text-slate-700 mb-3">Contact Information</h5>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Mail className="w-4 h-4 mr-3 text-slate-500" />
            <span className="text-slate-600">{user.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-3 text-slate-500" />
            <span className="text-slate-600">{user.phone}</span>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="mb-6">
        <h5 className="text-sm font-medium text-slate-700 mb-3">Professional Information</h5>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Building className="w-4 h-4 mr-3 text-slate-500" />
            <span className="text-slate-600">{user.organization}</span>
          </div>
          <div className="flex items-center text-sm">
            <Briefcase className="w-4 h-4 mr-3 text-slate-500" />
            <span className="text-slate-600">{user.department}</span>
          </div>
          <div className="flex items-center text-sm">
            <Star className="w-4 h-4 mr-3 text-slate-500" />
            <span className="text-slate-600">{user.specialization}</span>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div>
        <h5 className="text-sm font-medium text-slate-700 mb-3">Account Status</h5>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Award className="w-4 h-4 mr-3 text-slate-500" />
            <span className="text-slate-600">Member Since: {user.memberSince}</span>
          </div>
          <div className="flex items-center text-sm">
            <Shield className="w-4 h-4 mr-3 text-slate-500" />
            <span className={`flex items-center space-x-1 ${user.verified ? 'text-medsight-secondary' : 'text-medsight-abnormal'}`}>
              <span>Credentials:</span>
              <span className="font-medium">{user.verified ? 'Verified' : 'Not Verified'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 