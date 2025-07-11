'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page - forgot password can be handled there or in a modal
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8">
        <div className="flex items-center space-x-3">
          <div className="loading-spinner" />
          <span className="text-white text-sm">Redirecting...</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 