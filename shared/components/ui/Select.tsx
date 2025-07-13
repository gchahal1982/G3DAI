import React, { useState, useRef, useEffect } from 'react';

export interface SelectProps {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  children,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  
  const handleSelect = (val: string) => {
    setSelectedValue(val);
    onValueChange?.(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedValue}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={disabled}
        className="w-full bg-gray-900/95 border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {children}
      </select>
    </div>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`absolute mt-1 w-full bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-lg backdrop-blur-xl z-50 ${className}`}>
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ children, value, className = '' }) => {
  return (
    <option value={value} className={`text-white bg-gray-900/95 hover:bg-gray-800/95 px-3 py-2 cursor-pointer ${className}`}>
      {children}
    </option>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full bg-gray-900/95 border border-gray-700/50 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-xl cursor-pointer ${className}`}>
      {children}
    </div>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className = '' }) => {
  return (
    <span className={`text-white placeholder-gray-400 ${className}`}>
      {placeholder}
    </span>
  );
};

export default Select; 