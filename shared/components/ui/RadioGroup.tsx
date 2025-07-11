'use client';

import React from 'react';

interface RadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface RadioGroupItemProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ 
  children, 
  value, 
  onValueChange, 
  className = '' 
}) => {
  return (
    <div className={`radio-group ${className}`} role="radiogroup">
      {children}
    </div>
  );
};

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ 
  value, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`radio-group-item ${className}`}>
      <input 
        type="radio" 
        value={value} 
        className="radio-group-item-input"
      />
      {children}
    </div>
  );
};

export default RadioGroup; 