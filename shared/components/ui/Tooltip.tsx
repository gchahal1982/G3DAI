import React from 'react';

export interface TooltipProps {
  children: React.ReactNode;
  content?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

interface TooltipProviderProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position = 'top', 
  className = '' 
}) => {
  return (
    <div className={`tooltip-wrapper ${className}`}>
      {children}
      {content && (
        <div className={`tooltip tooltip-${position}`}>
          {content}
        </div>
      )}
    </div>
  );
};

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <div className="tooltip-provider">{children}</div>;
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, className = '', asChild = false }) => {
  if (asChild) {
    return <>{children}</>;
  }
  return <div className={`tooltip-trigger ${className}`}>{children}</div>;
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ children, className = '' }) => {
  return <div className={`tooltip-content ${className}`}>{children}</div>;
};

export default Tooltip; 