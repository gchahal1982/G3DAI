import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  helperText, 
  options,
  children,
  className = '', 
  ...props 
}) => {
  return (
    <div className={`select-wrapper ${className}`}>
      {label && <label className="select-label">{label}</label>}
      <select 
        className={`select ${error ? 'select-error' : ''}`}
        {...props}
      >
        {options ? (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && <span className="select-error-text">{error}</span>}
      {helperText && !error && <span className="select-helper-text">{helperText}</span>}
    </div>
  );
};

export default Select; 