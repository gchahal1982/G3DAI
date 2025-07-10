import React from 'react';
import { cn } from './utils';

export interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'error';
    showLabel?: boolean;
    label?: string;
}

const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
};

const variantClasses = {
    default: 'bg-indigo-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
};

export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    className,
    size = 'md',
    variant = 'default',
    showLabel = false,
    label,
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={cn('w-full', className)}>
            {(showLabel || label) && (
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{label || 'Progress'}</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={cn('w-full bg-gray-700 rounded-full overflow-hidden', sizeClasses[size])}>
                <div
                    className={cn('h-full transition-all duration-300 ease-out', variantClasses[variant])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};