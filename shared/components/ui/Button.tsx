'use client';

import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
        const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
        
        const variantClasses = {
            default: 'bg-indigo-600 text-white hover:bg-indigo-700',
            destructive: 'bg-red-600 text-white hover:bg-red-700',
            outline: 'border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white',
            secondary: 'bg-gray-700 text-white hover:bg-gray-600',
            ghost: 'text-gray-300 hover:bg-gray-700 hover:text-white',
            link: 'underline-offset-4 hover:underline text-indigo-400',
            success: 'bg-green-600 text-white hover:bg-green-700',
        };
        
        const sizeClasses = {
            default: 'h-10 py-2 px-4',
            sm: 'h-9 px-3 rounded-md',
            lg: 'h-11 px-8 rounded-md',
            icon: 'h-10 w-10',
        };
        
        const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
        
        return (
            <button
                className={classes}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };