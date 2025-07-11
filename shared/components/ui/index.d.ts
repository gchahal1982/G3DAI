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
export { Button } from './Button';
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Select } from './Select';
export { Checkbox } from './Checkbox';
export { Radio } from './Radio';
export { Switch } from './Switch';
export { Card } from './Card';
export { Modal } from './Modal';
export { Dialog } from './Dialog';
export { Drawer } from './Drawer';
export { Accordion } from './Accordion';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
export { Breadcrumb } from './Breadcrumb';
export { Pagination } from './Pagination';
export { Progress } from './Progress';
export { Tooltip } from './Tooltip';
export { Badge } from './Badge';
export { Slider } from './Slider';
export { GlassCard, GlassButton, GlassInput, GlassModal, baseGlassmorphismTheme, serviceThemeOverrides } from './GlassCard';
export type { ButtonProps } from './Button';
export type { InputProps } from './Input';
export type { ModalProps } from './Modal';
export type { SliderProps } from './Slider';
export type { TooltipProps } from './Tooltip';
export type { BadgeProps } from './Badge';
export type { TabsProps, TabsContentProps, TabsListProps, TabsTriggerProps } from './Tabs';
export type { GlassCardProps, GlassButtonProps, GlassInputProps, GlassModalProps, GlassmorphismTheme } from './GlassCard';
/**
 * Unified Theme Configuration
 * Combines modern component styling with glassmorphism effects
 */
export declare const UNIFIED_THEME: {
    readonly variants: {
        readonly primary: "primary";
        readonly secondary: "secondary";
        readonly accent: "accent";
        readonly success: "success";
        readonly warning: "warning";
        readonly error: "error";
        readonly ghost: "ghost";
    };
    readonly sizes: {
        readonly sm: "sm";
        readonly md: "md";
        readonly lg: "lg";
        readonly xl: "xl";
    };
    readonly glass: {
        readonly light: "light";
        readonly medium: "medium";
        readonly heavy: "heavy";
    };
};
/**
 * Component Recommendation Guide
 *
 * For standard UI: Use modern components (Button, Input, Modal, etc.)
 * For enhanced visual effects: Use glass components (GlassCard, GlassButton, etc.)
 * For service-specific theming: Apply serviceThemeOverrides with glass components
 */
export declare const COMPONENT_GUIDE: {
    readonly standard: readonly ["Button", "Input", "Select", "Modal", "Tabs"];
    readonly enhanced: readonly ["GlassCard", "GlassButton", "GlassInput", "GlassModal"];
    readonly layout: readonly ["Card", "Drawer", "Accordion", "Breadcrumb", "Pagination"];
    readonly feedback: readonly ["Progress", "Tooltip", "Badge", "Dialog"];
};
//# sourceMappingURL=index.d.ts.map