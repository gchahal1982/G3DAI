/**
 * G3D Glassmorphism UI Components
 * Shared across all 24 AI services
 */
import React from 'react';
export interface GlassmorphismTheme {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        shadow: string;
        glass: {
            primary: string;
            secondary: string;
            accent: string;
            surface: string;
        };
    };
    gradients: {
        primary: string;
        secondary: string;
        accent: string;
        glass: string;
    };
    blur: {
        light: string;
        medium: string;
        heavy: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
        glass: string;
    };
}
export declare const baseGlassmorphismTheme: GlassmorphismTheme;
export declare const serviceThemeOverrides: Record<string, Partial<GlassmorphismTheme>>;
export interface GlassCardProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'surface';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    blur?: 'light' | 'medium' | 'heavy';
    hover?: boolean;
    interactive?: boolean;
    loading?: boolean;
    className?: string;
    onClick?: () => void;
    theme?: Partial<GlassmorphismTheme>;
    style?: React.CSSProperties;
}
export declare const GlassCard: React.FC<GlassCardProps>;
export interface GlassButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    onClick?: () => void;
    className?: string;
    theme?: Partial<GlassmorphismTheme>;
    style?: React.CSSProperties;
    type?: 'button' | 'submit' | 'reset';
}
export declare const GlassButton: React.FC<GlassButtonProps>;
export interface GlassInputProps {
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    error?: boolean;
    errorMessage?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    className?: string;
    theme?: Partial<GlassmorphismTheme>;
}
export declare const GlassInput: React.FC<GlassInputProps>;
export interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOverlayClick?: boolean;
    className?: string;
    theme?: Partial<GlassmorphismTheme>;
}
export declare const GlassModal: React.FC<GlassModalProps>;
export * from './GlassCard';
//# sourceMappingURL=GlassCard.d.ts.map