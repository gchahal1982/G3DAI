'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to medical dashboard by default
    router.replace('/dashboard/medical');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="medsight-glass p-8 rounded-2xl text-center">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 
          className="text-xl font-semibold text-blue-300 mb-2"
          style={{ 
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.01em',
            lineHeight: '1.6'
          }}
        >
          Loading Dashboard
        </h2>
        <p 
          className="text-white/70"
          style={{ 
            fontFamily: 'var(--font-primary)',
            letterSpacing: '0.01em'
          }}
        >
          Redirecting to medical dashboard...
        </p>
      </div>
    </div>
  );
} 