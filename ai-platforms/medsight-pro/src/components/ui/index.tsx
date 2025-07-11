import * as React from 'react';
import {
  GlassCard,
  GlassButton,
  Modal,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Input,
  Select,
  Checkbox,
  Switch,
  Textarea,
  Accordion,
  Dialog,
  Drawer,
  Tooltip,
  Pagination,
  Radio,
  Slider,
  Card,
  Button
} from '../../../../../shared/components/ui';

// Import Alert component
import { Alert } from './Alert';

// Re-export all components for external use
export {
  GlassCard as Card,
  GlassButton as Button,
  Modal,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Input,
  Select,
  Checkbox,
  Switch,
  Textarea,
  Accordion,
  Dialog,
  Drawer,
  Tooltip,
  Pagination,
  Radio,
  Slider,
  Alert
};

// Create basic Label component if not available
export const Label: React.FC<any> = ({ children, className = '', ...props }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);

// Create basic Separator component if not available  
export const Separator: React.FC<any> = ({ className = '', orientation = 'horizontal', ...props }) => (
  <div 
    className={`shrink-0 bg-border ${orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'} ${className}`} 
    {...props} 
  />
);

// Medical-specific component wrappers
export const CardHeader: React.FC<any> = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<any> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<any> = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<any> = ({ children, className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<any> = ({ children, className = '', ...props }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// Medical-specific styling utilities
export const medicalCardClasses = {
  base: 'medsight-glass border-medsight-primary-200 shadow-lg',
  critical: 'medsight-glass border-medsight-critical-500 shadow-lg',
  normal: 'medsight-glass border-medsight-normal-500 shadow-lg',
  pending: 'medsight-glass border-medsight-pending-500 shadow-lg',
  ai: 'medsight-ai-glass border-medsight-ai-high-500 shadow-lg'
};

export const medicalButtonClasses = {
  primary: 'btn-medsight bg-medsight-primary-600 hover:bg-medsight-primary-700 text-white',
  secondary: 'btn-medsight bg-medsight-secondary-600 hover:bg-medsight-secondary-700 text-white',
  accent: 'btn-medsight bg-medsight-accent-600 hover:bg-medsight-accent-700 text-white',
  critical: 'btn-medsight bg-medsight-critical-600 hover:bg-medsight-critical-700 text-white',
  normal: 'btn-medsight bg-medsight-normal-600 hover:bg-medsight-normal-700 text-white',
  pending: 'btn-medsight bg-medsight-pending-600 hover:bg-medsight-pending-700 text-white'
};

export const medicalBadgeClasses = {
  normal: 'bg-medsight-normal-100 text-medsight-normal-800 border-medsight-normal-300',
  abnormal: 'bg-medsight-abnormal-100 text-medsight-abnormal-800 border-medsight-abnormal-300',
  critical: 'bg-medsight-critical-100 text-medsight-critical-800 border-medsight-critical-300',
  pending: 'bg-medsight-pending-100 text-medsight-pending-800 border-medsight-pending-300',
  reviewed: 'bg-medsight-reviewed-100 text-medsight-reviewed-800 border-medsight-reviewed-300',
  aiHigh: 'bg-medsight-ai-high-100 text-medsight-ai-high-800 border-medsight-ai-high-300',
  aiMedium: 'bg-medsight-ai-medium-100 text-medsight-ai-medium-800 border-medsight-ai-medium-300',
  aiLow: 'bg-medsight-ai-low-100 text-medsight-ai-low-800 border-medsight-ai-low-300'
};

// Medical-specific component variants
export const MedicalCard: React.FC<any> = ({ variant = 'base', children, className = '', ...props }) => (
  <GlassCard className={`${medicalCardClasses[variant]} ${className}`} {...props}>
    {children}
  </GlassCard>
);

export const MedicalButton: React.FC<any> = ({ variant = 'primary', children, className = '', ...props }) => (
  <GlassButton className={`${medicalButtonClasses[variant]} ${className}`} {...props}>
    {children}
  </GlassButton>
);

export const MedicalBadge: React.FC<any> = ({ variant = 'normal', children, className = '', ...props }) => (
  <Badge className={`${medicalBadgeClasses[variant]} ${className}`} {...props}>
    {children}
  </Badge>
);

export const MedicalProgress: React.FC<any> = ({ value, variant = 'normal', className = '', ...props }) => {
  const progressClasses = {
    normal: 'bg-medsight-normal-600',
    abnormal: 'bg-medsight-abnormal-600',
    critical: 'bg-medsight-critical-600',
    pending: 'bg-medsight-pending-600',
    aiHigh: 'bg-medsight-ai-high-600',
    aiMedium: 'bg-medsight-ai-medium-600',
    aiLow: 'bg-medsight-ai-low-600'
  };

  return (
    <Progress 
      value={value} 
      className={`${progressClasses[variant]} ${className}`} 
      {...props} 
    />
  );
};

// Medical form components
export const MedicalInput: React.FC<any> = ({ className = '', ...props }) => (
  <Input className={`input-medsight ${className}`} {...props} />
);

export const MedicalSelect: React.FC<any> = ({ children, className = '', ...props }) => (
  <Select className={`select-medsight ${className}`} {...props}>
    {children}
  </Select>
);

export const MedicalTextarea: React.FC<any> = ({ className = '', ...props }) => (
  <Textarea className={`textarea-medsight ${className}`} {...props} />
);

export const MedicalCheckbox: React.FC<any> = ({ className = '', ...props }) => (
  <Checkbox className={`checkbox-medsight ${className}`} {...props} />
);

export const MedicalLabel: React.FC<any> = ({ className = '', ...props }) => (
  <Label className={`label-medsight ${className}`} {...props} />
); 

// Create AlertDescription component
export const AlertDescription: React.FC<any> = ({ children, className = '', ...props }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
    {children}
  </div>
); 