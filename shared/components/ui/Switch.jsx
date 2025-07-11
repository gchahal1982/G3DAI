import React from 'react';
export const Switch = ({ label, checked = false, onChange, disabled = false, className = '' }) => {
    const handleChange = (e) => {
        onChange?.(e.target.checked);
    };
    return (<div className={`switch-wrapper ${className}`}>
      <label className="switch-label">
        <input type="checkbox" checked={checked} onChange={handleChange} disabled={disabled} className="switch-input"/>
        <span className="switch-slider"></span>
        {label && <span className="switch-text">{label}</span>}
      </label>
    </div>);
};
export default Switch;
