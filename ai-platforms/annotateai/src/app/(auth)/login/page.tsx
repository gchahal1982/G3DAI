'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page where smart routing handles login
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3">
          <div className="loading-spinner" />
          <span className="text-white text-sm">Redirecting to login...</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 