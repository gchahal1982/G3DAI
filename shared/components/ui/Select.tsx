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
    <div className={`select-wrapper ${className}`}>
      <select
        value={selectedValue}
        onChange={(e) => handleSelect(e.target.value)}
        disabled={disabled}
        className="select-input"
      >
        {children}
      </select>
    </div>
  );
};

export const SelectContent: React.FC<SelectContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`select-content ${className}`}>
      {children}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ children, value, className = '' }) => {
  return (
    <option value={value} className={`select-item ${className}`}>
      {children}
    </option>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '' }) => {
  return (
    <div className={`select-trigger ${className}`}>
      {children}
    </div>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className = '' }) => {
  return (
    <span className={`select-value ${className}`}>
      {placeholder}
    </span>
  );
};

export default Select; 