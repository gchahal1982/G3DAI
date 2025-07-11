'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  HeartIcon,
  EyeIcon,
  BeakerIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import type { MedicalUser } from '@/types/medical-user';

interface DashboardShellProps {
  children: ReactNode;
  user: MedicalUser;
  className?: string;
}

export function DashboardShell({ children, user, className = '' }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Navigation items based on user role
  const navigationItems = [
    {
      name: 'Medical Dashboard',
      href: '/dashboard/medical',
      icon: HomeIcon,
      current: pathname === '/dashboard/medical'
    },
    {
      name: 'Imaging Workspace',
      href: '/workspace/imaging',
      icon: EyeIcon,
      current: pathname.startsWith('/workspace/imaging')
    },
    {
      name: 'AI Analysis',
      href: '/workspace/ai-analysis',
      icon: BeakerIcon,
      current: pathname.startsWith('/workspace/ai-analysis')
    },
    {
      name: 'Collaboration',
      href: '/workspace/collaboration',
      icon: UserGroupIcon,
      current: pathname.startsWith('/workspace/collaboration')
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: DocumentTextIcon,
      current: pathname.startsWith('/reports')
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: ChartBarIcon,
      current: pathname.startsWith('/dashboard/analytics')
    }
  ];

  // Add admin items for admin users
  if (user.role === 'administrator' || user.role === 'super-admin') {
    navigationItems.push(
      {
        name: 'System Admin',
        href: '/dashboard/admin',
        icon: ShieldCheckIcon,
        current: pathname.startsWith('/dashboard/admin')
      },
      {
        name: 'Enterprise',
        href: '/dashboard/enterprise',
        icon: BuildingOfficeIcon,
        current: pathname.startsWith('/dashboard/enterprise')
      }
    );
  }

  const handleLogout = () => {
    router.push('/login');
  };

  const handleNavigation = (href: string, itemName: string) => {
    console.log('Navigation clicked:', itemName, 'to:', href);
    router.push(href);
  };

  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Glassmorphism Background - Behind everything */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-blue-50/30 to-indigo-100/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.08) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl z-50">
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">MedSight Pro</h1>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <nav className="mt-8 px-4 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavigation(item.href, item.name);
                  setSidebarOpen(false);
                }}
                className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 backdrop-blur-sm border border-blue-200/50 shadow-sm'
                    : 'text-gray-700 hover:bg-white/50 hover:backdrop-blur-sm hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block z-40">
        <div className="flex h-full flex-col bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-xl">
          <div className="flex h-16 items-center px-4 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">MedSight Pro</h1>
                <p className="text-xs text-gray-600">Medical AI Platform</p>
              </div>
            </div>
          </div>
          <nav className="mt-8 px-4 space-y-2 flex-1">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href, item.name)}
                className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 backdrop-blur-sm border border-blue-200/50 shadow-sm'
                    : 'text-gray-700 hover:bg-white/50 hover:backdrop-blur-sm hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.name}
              </button>
            ))}
          </nav>
          
          {/* User profile section */}
          <div className="border-t border-white/20 p-4">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/30">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.role} • {user.credentials?.medicalLicense}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 relative z-10">
        {/* Top navigation */}
        <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/50 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              {/* Search */}
              <div className="ml-4 flex-1 max-w-xs">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search patients, studies..."
                    className="block w-full rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 pl-10 pr-3 py-2 text-sm placeholder-gray-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 focus:bg-white/70 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50 transition-colors">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white shadow-sm" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center space-x-3 text-sm rounded-xl p-2 hover:bg-white/50 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Dr. {user.lastName}
                    </p>
                    <p className="text-xs text-gray-600">{user.role}</p>
                  </div>
                  <ChevronDownIcon className="hidden lg:block h-4 w-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/80 backdrop-blur-xl py-2 shadow-xl ring-1 ring-black/5 border border-white/20 z-50">
                    <button
                      onClick={() => {
                        handleNavigation('/profile', 'Profile');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg mx-2 transition-colors"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={() => {
                        handleNavigation('/settings', 'Settings');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg mx-2 transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg mx-2 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Status indicators */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-20">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 px-4 py-3 text-xs text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm animate-pulse"></div>
            <span className="font-medium">HIPAA Compliant</span>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 px-4 py-3 text-xs text-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm animate-pulse"></div>
            <span className="font-medium">Systems Online</span>
          </div>
        </div>
      </div>
    </div>
  );
} 