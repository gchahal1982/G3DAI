import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';

const progressVariants = cva(
  'relative h-4 w-full overflow-hidden rounded-full bg-medsight-primary-100',
  {
    variants: {
      variant: {
        default: 'bg-medsight-primary-100',
        normal: 'bg-medsight-normal-100',
        abnormal: 'bg-medsight-abnormal-100',
        critical: 'bg-medsight-critical-100',
        pending: 'bg-medsight-pending-100',
        aiHigh: 'bg-medsight-ai-high-100',
        aiMedium: 'bg-medsight-ai-medium-100',
        aiLow: 'bg-medsight-ai-low-100'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-medsight-primary-600',
        normal: 'bg-medsight-normal-600',
        abnormal: 'bg-medsight-abnormal-600',
        critical: 'bg-medsight-critical-600 animate-pulse-medical',
        pending: 'bg-medsight-pending-600',
        aiHigh: 'bg-medsight-ai-high-600',
        aiMedium: 'bg-medsight-ai-medium-600',
        aiLow: 'bg-medsight-ai-low-600'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, variant, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={progressVariants({ variant, className })}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={progressIndicatorVariants({ variant })}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress }; 