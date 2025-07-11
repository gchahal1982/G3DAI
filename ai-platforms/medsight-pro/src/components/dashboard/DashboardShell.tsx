'use client';

import React, { ReactNode } from 'react';

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

export function DashboardShell({ children, className = '' }: DashboardShellProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-medsight-primary-50 via-white to-medsight-secondary-50 ${className}`}>
      {/* Medical Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${process.env.NODE_ENV === 'development' ? '0ea5e9' : '0ea5e9'}' fill-opacity='0.1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>

      {/* Medical Compliance Badge */}
      <div className="fixed bottom-4 right-4 z-20">
        <div className="medsight-glass rounded-lg p-3 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="flex items-center space-x-2 text-xs text-medsight-primary-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-medical" />
            <span className="font-medium">HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
} 