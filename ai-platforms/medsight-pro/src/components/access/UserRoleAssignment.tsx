'use client';

import { useState } from 'react';
import { UserGroupIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  currentRole: string;
}

interface Role {
  id: string;
  name: string;
}

interface UserRoleAssignmentProps {
  users: User[];
  roles: Role[];
  onAssignRole: (userId: string, roleId: string) => void;
}

export default function UserRoleAssignment({ users, roles, onAssignRole }: UserRoleAssignmentProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) return;

    setAssigning(true);
    setFeedback(null);
    try {
      await onAssignRole(selectedUser.id, selectedRole);
      setFeedback({ type: 'success', message: `Successfully assigned ${getRoleName(selectedRole)} to ${selectedUser.name}.` });
      setSelectedUser(null);
      setSelectedRole('');
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to assign role.' });
    } finally {
      setAssigning(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'N/A';

  return (
    <div className="medsight-glass p-6 rounded-xl">
      <div className="flex items-center space-x-3 mb-4">
        <UserGroupIcon className="w-6 h-6 text-medsight-primary" />
        <h2 className="text-xl font-semibold">User Role Assignment</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="md:col-span-1">
          <h3 className="font-medium mb-2">Users</h3>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-medsight w-full mb-2"
          />
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedUser?.id === user.id ? 'bg-medsight-primary/10' : ''}`}
              >
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">Current Role: {getRoleName(user.currentRole)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roles List */}
        <div className="md:col-span-1">
          <h3 className="font-medium mb-2">Roles</h3>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedRole === role.id ? 'bg-medsight-primary/10' : ''}`}
              >
                <p className="font-medium">{role.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Action */}
        <div className="md:col-span-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-center mb-4">Confirm Assignment</h3>
          <div className="text-center">
            <p className="font-medium">{selectedUser?.name || 'Select a user'}</p>
            <ArrowRightIcon className="w-6 h-6 my-2 mx-auto text-gray-400" />
            <p className="font-medium">{getRoleName(selectedRole) || 'Select a role'}</p>
          </div>
          <button
            onClick={handleAssign}
            disabled={!selectedUser || !selectedRole || assigning}
            className="btn-medsight w-full mt-6"
          >
            {assigning ? 'Assigning...' : 'Assign Role'}
          </button>
        </div>
      </div>
      
      {feedback && (
        <div className={`mt-4 p-3 rounded-lg flex items-center ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {feedback.message}
        </div>
      )}
    </div>
  );
}
