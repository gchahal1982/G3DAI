'use client';

import React from 'react';

interface CommandProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandEmptyProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandInputProps {
  placeholder?: string;
  className?: string;
}

interface CommandItemProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: () => void;
}

interface CommandListProps {
  children: React.ReactNode;
  className?: string;
}

interface CommandSeparatorProps {
  className?: string;
}

interface CommandShortcutProps {
  children: React.ReactNode;
  className?: string;
}

export const Command: React.FC<CommandProps> = ({ children, className = '' }) => {
  return (
    <div className={`command ${className}`}>
      {children}
    </div>
  );
};

export const CommandEmpty: React.FC<CommandEmptyProps> = ({ children, className = '' }) => {
  return (
    <div className={`command-empty ${className}`}>
      {children}
    </div>
  );
};

export const CommandGroup: React.FC<CommandGroupProps> = ({ children, className = '' }) => {
  return (
    <div className={`command-group ${className}`}>
      {children}
    </div>
  );
};

export const CommandInput: React.FC<CommandInputProps> = ({ placeholder, className = '' }) => {
  return (
    <input 
      type="text" 
      placeholder={placeholder} 
      className={`command-input ${className}`}
    />
  );
};

export const CommandItem: React.FC<CommandItemProps> = ({ children, className = '', onSelect }) => {
  return (
    <div className={`command-item ${className}`} onClick={onSelect}>
      {children}
    </div>
  );
};

export const CommandList: React.FC<CommandListProps> = ({ children, className = '' }) => {
  return (
    <div className={`command-list ${className}`}>
      {children}
    </div>
  );
};

export const CommandSeparator: React.FC<CommandSeparatorProps> = ({ className = '' }) => {
  return (
    <div className={`command-separator ${className}`} />
  );
};

export const CommandShortcut: React.FC<CommandShortcutProps> = ({ children, className = '' }) => {
  return (
    <div className={`command-shortcut ${className}`}>
      {children}
    </div>
  );
};

export default Command; 