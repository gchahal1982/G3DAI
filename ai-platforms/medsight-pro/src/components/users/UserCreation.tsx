import React from 'react';
import { UserPlus, Mail, Shield, Briefcase, Building, Key } from 'lucide-react';

interface UserCreationProps {
  className?: string;
  onClose?: () => void;
}

export default function UserCreation({ className = '', onClose }: UserCreationProps) {
  return (
    <div className={`medsight-glass rounded-xl p-6 border border-medsight-primary/20 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="medsight-ai-glass p-2 rounded-lg">
            <UserPlus className="w-5 h-5 text-medsight-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-medsight-primary">Create New User</h3>
            <p className="text-sm text-slate-600">Onboard a new medical professional</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            &times;
          </button>
        )}
      </div>

      <form className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Full Name</label>
          <input type="text" placeholder="Dr. John Doe" className="input-medsight w-full mt-1" />
        </div>
        
        <div>
          <label className="text-sm font-medium text-slate-700">Email Address</label>
          <input type="email" placeholder="john.doe@hospital.com" className="input-medsight w-full mt-1" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select className="input-medsight w-full mt-1">
              <option>Select a role</option>
              <option>Radiologist</option>
              <option>Cardiologist</option>
              <option>Resident Physician</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Department</label>
            <input type="text" placeholder="Radiology" className="input-medsight w-full mt-1" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Organization</label>
          <input type="text" placeholder="Metro General Hospital" className="input-medsight w-full mt-1" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Medical License Number</label>
          <input type="text" placeholder="MD-12345678" className="input-medsight w-full mt-1" />
        </div>

        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center">
            <input type="checkbox" id="send-invite" className="h-4 w-4 rounded border-slate-300 text-medsight-primary focus:ring-medsight-primary" />
            <label htmlFor="send-invite" className="ml-2 block text-sm text-slate-700">
              Send invitation email immediately
            </label>
          </div>
          <button type="submit" className="btn-medsight flex items-center space-x-2 px-4 py-2">
            <UserPlus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </form>
    </div>
  );
} 