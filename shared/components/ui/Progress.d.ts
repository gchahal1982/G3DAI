import React from 'react';
export interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'error';
    showLabel?: boolean;
    label?: string;
}
export declare const Progress: React.FC<ProgressProps>;
//# sourceMappingURL=Progress.d.ts.map