'use client';

import React from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className = '' }) => {
  return (
    <div className={`dropdown-menu ${className}`}>
      {children}
    </div>
  );
};

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`dropdown-menu-content ${className}`}>
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, className = '', onClick }) => {
  return (
    <div className={`dropdown-menu-item ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, className = '' }) => {
  return (
    <div className={`dropdown-menu-trigger ${className}`}>
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({ className = '' }) => {
  return (
    <div className={`dropdown-menu-separator ${className}`} />
  );
};

export default DropdownMenu; 