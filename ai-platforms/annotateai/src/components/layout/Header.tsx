'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import GlobalSearch from '../search/GlobalSearch';

interface HeaderProps {
  className?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ className = '', showSearch = true }) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Example user data - replace with actual user context
  const user = {
    name: 'Demo User',
    email: 'demo@annotateai.com',
    role: 'Annotator',
    avatar: null
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsSearchOpen(false);
      }
      
      // Cmd+K or Ctrl+K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    console.log('Sign out button clicked'); // Debug log
    
    try {
      // Clear any authentication tokens
      if (typeof window !== 'undefined') {
        console.log('Clearing authentication data...'); // Debug log
        localStorage.removeItem('authToken');
        localStorage.removeItem('userSession');
        localStorage.removeItem('user');
        sessionStorage.clear();
      }
      
      // Close the dropdown immediately
      setIsProfileOpen(false);
      
      // Force immediate page reload to login page (this prevents any state persistence)
      console.log('Navigating to login page...'); // Debug log
      window.location.replace('/login');
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, force redirect to login
      window.location.replace('/login');
    }
  };

  const handleProfileSettings = () => {
    // Close dropdown and navigate to profile settings
    setIsProfileOpen(false);
    
    // Navigate to profile settings page
    router.push('/profile/settings');
  };

  return (
    <header className={`header ${className} relative z-[200]`}>
      <div className="bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-violet-900/95 backdrop-blur-xl border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Center - Search */}
            {showSearch && (
              <div className="hidden md:flex flex-1 max-w-lg">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm">Search projects, files, help...</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="hidden lg:inline-block px-2 py-1 bg-white/10 text-white/60 rounded text-xs">⌘</kbd>
                    <kbd className="hidden lg:inline-block px-2 py-1 bg-white/10 text-white/60 rounded text-xs">K</kbd>
                  </div>
                </button>
              </div>
            )}

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile search button */}
              {showSearch && (
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {/* Notifications */}
              <button className="p-2 text-white/70 hover:text-white transition-colors relative">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v5zM9 12l-4-4m0 0l4-4m-4 4h8.5" />
                </svg>
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Help */}
              <Link href="/help" className="p-2 text-white/70 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>

              {/* Profile dropdown */}
              {user && (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <span className="text-sm font-medium text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-indigo-200/80">{user.role}</p>
                    </div>
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 z-[250]">
                      <div className="p-4 border-b border-gray-700/30">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <span className="text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            <p className="text-xs text-indigo-400 mt-1">{user.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={handleProfileSettings}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Profile Settings</span>
                        </button>
                        
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      {showSearch && (
        <GlobalSearch 
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      )}
    </header>
  );
};

export default Header; 