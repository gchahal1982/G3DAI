/**
 * G3DAI Unified UI Components
 * 
 * Best-of-breed design system combining:
 * - Modern components (from AnnotateAI) 
 * - Advanced glassmorphism components
 * - Consistent theming and accessibility
 * 
 * Used across all 25+ AI platforms for complete design consistency
 */

// ====== MODERN UI COMPONENTS (from AnnotateAI) ======

// Core UI Components
export { Button } from './Button';
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Select } from './Select';
export { Checkbox } from './Checkbox';
export { Radio } from './Radio';
export { Switch } from './Switch';

// Layout Components
export { Card } from './Card';
export { Modal } from './Modal';
export { Dialog } from './Dialog';
export { Drawer } from './Drawer';
export { Accordion } from './Accordion';

// Navigation Components
export { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
export { Breadcrumb } from './Breadcrumb';
export { Pagination } from './Pagination';

// Feedback Components
export { Progress } from './Progress';
export { Tooltip } from './Tooltip';
export { Badge } from './Badge';

// Input Components
export { Slider } from './Slider';

// ====== GLASSMORPHISM COMPONENTS ======

// Advanced Glassmorphism Components
export {
  GlassCard,
  GlassButton,
  GlassInput,
  GlassModal,
  baseGlassmorphismTheme,
  serviceThemeOverrides
} from './GlassCard';

// ====== COMPONENT TYPES ======

// Modern Component Types
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';
export type { ModalProps } from './Modal';
export type { SliderProps } from './Slider';
export type { TooltipProps } from './Tooltip';
export type { BadgeProps } from './Badge';
export type { TabsProps, TabsContentProps, TabsListProps, TabsTriggerProps } from './Tabs';

// Glassmorphism Component Types
export type {
  GlassCardProps,
  GlassButtonProps,
  GlassInputProps,
  GlassModalProps,
  GlassmorphismTheme
} from './GlassCard';

// ====== DESIGN SYSTEM UTILITIES ======

/**
 * Unified Theme Configuration
 * Combines modern component styling with glassmorphism effects
 */
export const UNIFIED_THEME = {
  // Component variants that work with both modern and glass components
  variants: {
    primary: 'primary',
    secondary: 'secondary', 
    accent: 'accent',
    success: 'success',
    warning: 'warning',
    error: 'error',
    ghost: 'ghost'
  },
  
  // Consistent sizing across all components
  sizes: {
    sm: 'sm',
    md: 'md', 
    lg: 'lg',
    xl: 'xl'
  },
  
  // Glass effects integration
  glass: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy'
  }
} as const;

/**
 * Component Recommendation Guide
 * 
 * For standard UI: Use modern components (Button, Input, Modal, etc.)
 * For enhanced visual effects: Use glass components (GlassCard, GlassButton, etc.)
 * For service-specific theming: Apply serviceThemeOverrides with glass components
 */
export const COMPONENT_GUIDE = {
  // Standard interactions
  standard: ['Button', 'Input', 'Select', 'Modal', 'Tabs'],
  
  // Enhanced visual appeal
  enhanced: ['GlassCard', 'GlassButton', 'GlassInput', 'GlassModal'],
  
  // Navigation and layout
  layout: ['Card', 'Drawer', 'Accordion', 'Breadcrumb', 'Pagination'],
  
  // Feedback and status
  feedback: ['Progress', 'Tooltip', 'Badge', 'Dialog']
} as const;