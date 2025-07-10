import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`checkbox-wrapper ${className}`}>
      <label className="checkbox-label">
        <input 
          type="checkbox"
          className={`checkbox ${error ? 'checkbox-error' : ''}`}
          {...props}
        />
        {label && <span className="checkbox-text">{label}</span>}
      </label>
      {error && <span className="checkbox-error-text">{error}</span>}
      {helperText && !error && <span className="checkbox-helper-text">{helperText}</span>}
    </div>
  );
};

export default Checkbox; 