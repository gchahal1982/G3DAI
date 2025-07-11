import React from 'react';
export interface SliderProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
}
export declare const Slider: React.FC<SliderProps>;
export default Slider;
//# sourceMappingURL=Slider.d.ts.map