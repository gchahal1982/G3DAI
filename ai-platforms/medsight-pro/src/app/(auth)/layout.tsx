'use client';

import React from 'react';
import { HeartIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Glassmorphism Background - Same as Dashboard */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-blue-50/30 to-indigo-100/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.08) 0%, transparent 50%)`
        }}></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* MedSight Pro Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MedSight Pro</h1>
              <p className="text-sm text-gray-600">Medical AI Platform</p>
            </div>
          </div>

          {/* HIPAA Compliance Badge */}
          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/60 backdrop-blur-xl border border-white/20">
            <ShieldCheckIcon className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">HIPAA Compliant</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            {/* Compliance Badges */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/60 backdrop-blur-xl border border-white/20">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-blue-800">DICOM Compliant</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/60 backdrop-blur-xl border border-white/20">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs font-medium text-yellow-800">FDA Class II</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/60 backdrop-blur-xl border border-white/20">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs font-medium text-purple-800">HL7 FHIR</span>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="text-right">
              <p className="text-xs text-gray-600">
                Medical Emergency Support:{' '}
                <span className="text-gray-900 font-medium">1-800-MEDSIGHT</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                24/7 Clinical Technical Support Available
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Status Indicators */}
      <div className="fixed bottom-6 left-6 z-30">
        <div className="bg-white/60 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">Secure Connection</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <div className="bg-white/60 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">Systems Online</span>
          </div>
        </div>
      </div>
    </div>
  );
} 