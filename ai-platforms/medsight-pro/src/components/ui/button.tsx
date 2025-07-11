import * as React from 'react';
import { GlassButton } from '@/shared/components/ui';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'btn-medsight inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-medsight-primary-600 text-white hover:bg-medsight-primary-700',
        destructive: 'bg-medsight-critical-600 text-white hover:bg-medsight-critical-700',
        outline: 'border border-medsight-primary-300 bg-transparent hover:bg-medsight-primary-50 text-medsight-primary-700',
        secondary: 'bg-medsight-secondary-600 text-white hover:bg-medsight-secondary-700',
        ghost: 'hover:bg-medsight-primary-50 text-medsight-primary-700',
        link: 'text-medsight-primary-600 underline-offset-4 hover:underline',
        medical: 'bg-medsight-accent-600 text-white hover:bg-medsight-accent-700',
        success: 'bg-medsight-normal-600 text-white hover:bg-medsight-normal-700',
        warning: 'bg-medsight-pending-600 text-white hover:bg-medsight-pending-700',
        critical: 'bg-medsight-critical-600 text-white hover:bg-medsight-critical-700 animate-pulse-medical'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants }; 