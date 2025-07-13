'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';
import Header from '@/components/layout/Header';
import Breadcrumb from '@/components/layout/Breadcrumb';
import MobileNavOverlay from '@/components/layout/MobileNavOverlay';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  const [showAuthenticatedLayout, setShowAuthenticatedLayout] = useState(false);

  // Track if user was ever authenticated in this session
  useEffect(() => {
    if (isAuthenticated) {
      setWasAuthenticated(true);
      setShowAuthenticatedLayout(true);
    }
  }, [isAuthenticated]);

  // Handle auth state changes with a delay to prevent flickering
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setShowAuthenticatedLayout(true);
      } else if (!wasAuthenticated) {
        // Only immediately switch to unauthenticated layout if user was never authenticated
        setShowAuthenticatedLayout(false);
      } else {
        // Add a delay before switching to unauthenticated layout to handle navigation
        const timer = setTimeout(() => {
          setShowAuthenticatedLayout(false);
          setWasAuthenticated(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading, wasAuthenticated]);

  // Show loading state only if we're actually loading and haven't been authenticated before
  if (isLoading && !wasAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="flex items-center space-x-3">
            <div className="loading-spinner" />
            <span className="text-white text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated: Show full dashboard layout
  if (showAuthenticatedLayout) {
    return (
      <div className="h-full flex bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-gray-900/30 backdrop-blur-sm">
        {/* Navigation Sidebar - Hidden on mobile, fixed positioning handled within component */}
        <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">
          <Navigation />
        </div>
        
        {/* Main Content Container - Responsive offset for sidebar */}
        <div className="flex-1 flex flex-col min-h-full max-h-screen overflow-hidden lg:ml-64 ml-0">
          {/* Header */}
          <Header 
            className="flex-shrink-0 lg:pl-0 pl-4" 
            showSearch={true}
          />
          
          {/* Content Area with Breadcrumb */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Breadcrumb Navigation */}
            <div className="flex-shrink-0 lg:px-8 px-6 py-3 bg-gradient-to-r from-indigo-900/5 via-purple-900/3 to-gray-900/10 backdrop-blur-sm">
              <Breadcrumb />
            </div>
            
            {/* Scrollable Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="lg:p-8 p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {/* Mobile Navigation Overlay */}
        <MobileNavOverlay />
      </div>
    );
  }

  // Not authenticated: Show clean standalone layout for login
  return (
    <div className="h-full">
      {children}
    </div>
  );
} 