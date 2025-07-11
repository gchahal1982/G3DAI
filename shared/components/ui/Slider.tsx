import React from 'react';

export interface SliderProps {
  value: number | number[];
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ 
  value, 
  min = 0, 
  max = 100, 
  step = 1, 
  onChange, 
  onValueChange,
  className = '' 
}) => {
  const numericValue = Array.isArray(value) ? value[0] : value;
  
  const handleChange = (newValue: number) => {
    onChange?.(newValue);
    onValueChange?.([newValue]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={numericValue}
      onChange={(e) => handleChange(Number(e.target.value))}
      className={`slider ${className}`}
    />
  );
};

export default Slider; 