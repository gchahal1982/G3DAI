'use client';

import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, Activity,
  Star, Award, Briefcase, Calendar
} from 'lucide-react';
import UserList from '@/components/users/UserList';
import UserProfile from '@/components/users/UserProfile';
import MedicalCredentials from '@/components/users/MedicalCredentials';
import UserCreation from '@/components/users/UserCreation';

export default function UserManagementPage() {
    const [users, setUsers] = useState([
        { id: '1', name: 'Dr. Emily Carter', email: 'emily.carter@medsight.com', role: 'Radiologist', status: 'active' as const, lastLogin: '2 hours ago', avatarUrl: '/avatars/dremily.png' },
        { id: '2', name: 'Dr. Ben Hanson', email: 'ben.hanson@medsight.com', role: 'Cardiologist', status: 'active' as const, lastLogin: '5 hours ago', avatarUrl: '/avatars/drben.png' },
        { id: '3', name: 'Technician Tom', email: 'tom.tech@medsight.com', role: 'Technician', status: 'invited' as const, lastLogin: 'N/A', avatarUrl: '/avatars/tom.png' },
        { id: '4', name: 'Admin Alice', email: 'alice.admin@medsight.com', role: 'Administrator', status: 'inactive' as const, lastLogin: '3 days ago', avatarUrl: '/avatars/alice.png' },
    ]);

    const handleDeleteUser = (userId: string) => {
        setUsers(users.filter(u => u.id !== userId));
    };

    const handleInviteUser = () => {
        // In a real app, this would open a modal to invite a new user
        console.log("Invite new user");
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">User Management</h1>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <UserList users={users} onDeleteUser={handleDeleteUser} onInviteUser={handleInviteUser} />
                </div>
                <div>
                    <UserCreation />
                </div>
            </div>
        </div>
    );
} 
 