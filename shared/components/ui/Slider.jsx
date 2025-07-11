import React from 'react';
export const Slider = ({ value, min = 0, max = 100, step = 1, onChange, className = '' }) => {
    return (<input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`slider ${className}`}/>);
};
export default Slider;
