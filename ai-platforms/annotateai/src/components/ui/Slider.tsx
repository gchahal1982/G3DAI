import React from 'react';

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ 
  value, 
  min = 0, 
  max = 100, 
  step = 1, 
  onChange, 
  className = '' 
}) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`slider ${className}`}
    />
  );
};

export default Slider; 