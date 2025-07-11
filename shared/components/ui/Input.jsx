import React from 'react';
export const Input = React.forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
    return (<div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input ref={ref} className={`input ${error ? 'input-error' : ''}`} {...props}/>
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>);
});
export default Input;
