import React from 'react';
export const Radio = ({ label, error, helperText, className = '', ...props }) => {
    return (<div className={`radio-wrapper ${className}`}>
      <label className="radio-label">
        <input type="radio" className={`radio ${error ? 'radio-error' : ''}`} {...props}/>
        {label && <span className="radio-text">{label}</span>}
      </label>
      {error && <span className="radio-error-text">{error}</span>}
      {helperText && !error && <span className="radio-helper-text">{helperText}</span>}
    </div>);
};
export default Radio;
