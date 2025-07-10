import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`textarea-wrapper ${className}`}>
      {label && <label className="textarea-label">{label}</label>}
      <textarea 
        className={`textarea ${error ? 'textarea-error' : ''}`}
        {...props}
      />
      {error && <span className="textarea-error-text">{error}</span>}
      {helperText && !error && <span className="textarea-helper-text">{helperText}</span>}
    </div>
  );
};

export default Textarea; 