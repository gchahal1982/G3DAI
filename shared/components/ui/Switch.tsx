import React from 'react';

interface SwitchProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ 
  label, 
  checked = false,
  onChange,
  onCheckedChange,
  disabled = false,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
    onCheckedChange?.(e.target.checked);
  };

  return (
    <div className={`switch-wrapper ${className}`}>
      <label className="switch-label">
        <input 
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="switch-input"
        />
        <span className="switch-slider"></span>
        {label && <span className="switch-text">{label}</span>}
      </label>
    </div>
  );
};

export default Switch; 