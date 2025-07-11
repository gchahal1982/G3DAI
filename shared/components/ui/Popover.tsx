'use client';

import React from 'react';

interface PopoverProps {
  children: React.ReactNode;
  className?: string;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ children, className = '' }) => {
  return (
    <div className={`popover ${className}`}>
      {children}
    </div>
  );
};

export const PopoverContent: React.FC<PopoverContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`popover-content ${className}`}>
      {children}
    </div>
  );
};

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, className = '' }) => {
  return (
    <div className={`popover-trigger ${className}`}>
      {children}
    </div>
  );
};

export default Popover; 