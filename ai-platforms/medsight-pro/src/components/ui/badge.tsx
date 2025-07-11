import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-medsight-primary-100 text-medsight-primary-800 hover:bg-medsight-primary-200',
        secondary: 'border-transparent bg-medsight-secondary-100 text-medsight-secondary-800 hover:bg-medsight-secondary-200',
        destructive: 'border-transparent bg-medsight-critical-100 text-medsight-critical-800 hover:bg-medsight-critical-200',
        outline: 'border-medsight-primary-300 text-medsight-primary-700',
        normal: 'border-transparent bg-medsight-normal-100 text-medsight-normal-800 hover:bg-medsight-normal-200',
        abnormal: 'border-transparent bg-medsight-abnormal-100 text-medsight-abnormal-800 hover:bg-medsight-abnormal-200',
        critical: 'border-transparent bg-medsight-critical-100 text-medsight-critical-800 hover:bg-medsight-critical-200 animate-pulse-medical',
        pending: 'border-transparent bg-medsight-pending-100 text-medsight-pending-800 hover:bg-medsight-pending-200',
        reviewed: 'border-transparent bg-medsight-reviewed-100 text-medsight-reviewed-800 hover:bg-medsight-reviewed-200',
        aiHigh: 'border-transparent bg-medsight-ai-high-100 text-medsight-ai-high-800 hover:bg-medsight-ai-high-200',
        aiMedium: 'border-transparent bg-medsight-ai-medium-100 text-medsight-ai-medium-800 hover:bg-medsight-ai-medium-200',
        aiLow: 'border-transparent bg-medsight-ai-low-100 text-medsight-ai-low-800 hover:bg-medsight-ai-low-200'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, className })} {...props} />
  );
}

export { Badge, badgeVariants }; 