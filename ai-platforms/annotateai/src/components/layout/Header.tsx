'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import GlobalSearch from '@/components/search/GlobalSearch';

interface HeaderProps {
  className?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ className = '', showSearch = true }) => {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className={`bg-gradient-to-r from-transparent via-indigo-900/10 to-purple-900/5 backdrop-blur-xl ${className}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Brand (hidden on desktop when sidebar is visible) */}
            <div className="flex items-center space-x-4 lg:hidden">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-semibold text-white hidden sm:block">
                  AnnotateAI
                </span>
              </Link>
            </div>

            {/* Desktop left spacer to align with content */}
            <div className="hidden lg:block"></div>

            {/* Center - Search (optional) */}
            {showSearch && (
              <div className="flex-1 max-w-lg mx-8 hidden lg:block">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2 border border-indigo-500/30 rounded-xl bg-white/5 backdrop-blur-sm text-white/70 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-200 text-left"
                >
                  <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="flex-1">Search projects, files, help...</span>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs border border-white/20">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                    </kbd>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs border border-white/20">K</kbd>
                  </div>
                </button>
              </div>
            )}

            {/* Mobile search button */}
            {showSearch && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-white/70 hover:text-white relative transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a7 7 0 11-9-9 7 7 0 019 9L15 17z" />
                </svg>
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Help */}
              <Link href="/help" className="p-2 text-white/70 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>

              {/* Settings */}
              <Link href="/settings" className="p-2 text-white/70 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>

              {/* User Profile Dropdown */}
              {user && (
                <div className="relative">
                  <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <span className="text-sm font-medium text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-xs text-white/60">{user.role}</div>
                    </div>
                    <svg className="w-4 h-4 text-white/50 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button className="md:hidden p-2 text-white/70 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        placeholder="Search projects, files, help..."
        maxResults={10}
      />
    </>
  );
};

export default Header; 