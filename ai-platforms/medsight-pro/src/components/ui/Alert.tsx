import React from 'react';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'error' | 'success' | 'warning' | 'info';
  className?: string;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'info', 
  className = '',
  style
}) => {
  const variantClasses = {
    error: 'bg-red-500/10 border-red-500/20 text-red-200',
    success: 'bg-green-500/10 border-green-500/20 text-green-200',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-200'
  };

  return (
    <div 
      className={`p-4 rounded-lg border ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
    {children}
  </div>
);

export default Alert; 