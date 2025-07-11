'use client';

/**
 * G3D Glassmorphism UI Components
 * Shared across all 24 AI services
 */

import React from 'react';
import styled, { css, keyframes } from 'styled-components';

// Glassmorphism Theme Types
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

// Base glassmorphism theme  
export const baseGlassmorphismTheme: GlassmorphismTheme = {
    colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#10b981',
        background: '#0f0f23',
        surface: '#1a1a2e',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.7)',
        border: 'rgba(255, 255, 255, 0.1)',
        shadow: 'rgba(0, 0, 0, 0.3)',
        glass: {
            primary: 'rgba(99, 102, 241, 0.08)',
            secondary: 'rgba(139, 92, 246, 0.06)',
            accent: 'rgba(16, 185, 129, 0.08)',
            surface: 'rgba(255, 255, 255, 0.02)',
        },
    },
    gradients: {
        primary: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
        secondary: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)',
        accent: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(45, 212, 191, 0.1) 100%)',
        glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
    },
    blur: {
        light: 'blur(8px)',
        medium: 'blur(16px)',
        heavy: 'blur(24px)',
    },
    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
    },
    borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
    },
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    },
};

// Service-specific theme overrides
export const serviceThemeOverrides: Record<string, Partial<GlassmorphismTheme>> = {
    'vision-pro': {
        colors: {
            ...baseGlassmorphismTheme.colors,
            primary: '#2563eb',
            secondary: '#0891b2',
            accent: '#22c55e',
            glass: {
                primary: 'rgba(37, 99, 235, 0.08)',
                secondary: 'rgba(8, 145, 178, 0.06)',
                accent: 'rgba(34, 197, 94, 0.08)',
                surface: 'rgba(41, 98, 255, 0.04)',
            },
        },
    },
    'codeforge': {
        colors: {
            ...baseGlassmorphismTheme.colors,
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#10b981',
            glass: {
                primary: 'rgba(99, 102, 241, 0.08)',
                secondary: 'rgba(139, 92, 246, 0.06)',
                accent: 'rgba(16, 185, 129, 0.08)',
                surface: 'rgba(99, 102, 241, 0.04)',
            },
        },
    },
    'creative-studio': {
        colors: {
            ...baseGlassmorphismTheme.colors,
            primary: '#ec4899',
            secondary: '#f59e0b',
            accent: '#8b5cf6',
            glass: {
                primary: 'rgba(236, 72, 153, 0.08)',
                secondary: 'rgba(245, 158, 11, 0.06)',
                accent: 'rgba(139, 92, 246, 0.08)',
                surface: 'rgba(236, 72, 153, 0.04)',
            },
        },
    },
    'quantum-ai': {
        colors: {
            ...baseGlassmorphismTheme.colors,
            primary: '#7c3aed',
            secondary: '#2dd4bf',
            accent: '#f59e0b',
            glass: {
                primary: 'rgba(124, 58, 237, 0.08)',
                secondary: 'rgba(45, 212, 191, 0.06)',
                accent: 'rgba(245, 158, 11, 0.08)',
                surface: 'rgba(124, 58, 237, 0.04)',
            },
        },
    },
    // Add more service themes as needed
};



// Animations
const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Glass Card Component
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

interface StyledGlassCardProps {
    $variant?: 'primary' | 'secondary' | 'accent' | 'surface';
    $size?: 'sm' | 'md' | 'lg' | 'xl';
    $blur?: 'light' | 'medium' | 'heavy';
    $hover?: boolean;
    $interactive?: boolean;
    $loading?: boolean;
    theme: GlassmorphismTheme;
}

const StyledGlassCard = styled.div<StyledGlassCardProps>`
  position: relative;
  border-radius: ${props => props.theme.borderRadius.md};
  backdrop-filter: ${props => props.theme.blur[props.$blur || 'medium']};
  -webkit-backdrop-filter: ${props => props.theme.blur[props.$blur || 'medium']};
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => {
        const variant = props.$variant || 'surface';
        return css`
      background: ${props.theme.colors.glass[variant]};
      box-shadow: ${props.theme.shadows.glass};
    `;
    }}
  
  ${props => props.$size === 'sm' && css`
    padding: ${props.theme.spacing.sm};
  `}
  
  ${props => props.$size === 'md' && css`
    padding: ${props.theme.spacing.md};
  `}
  
  ${props => props.$size === 'lg' && css`
    padding: ${props.theme.spacing.lg};
  `}
  
  ${props => props.$size === 'xl' && css`
    padding: ${props.theme.spacing.xl};
  `}
  
  ${props => props.$interactive && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
      border-color: ${props.theme.colors.primary};
    }
  `}
  
  ${props => props.$hover && css`
    &:hover {
      background: ${props.theme.gradients[props.$variant || 'primary']};
      transform: scale(1.02);
    }
  `}
  
  ${props => props.$loading && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      background-size: 200% 100%;
      animation: ${shimmer} 2s infinite;
    }
  `}
`;

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    variant = 'surface',
    size = 'md',
    blur = 'medium',
    hover = false,
    interactive = false,
    loading = false,
    className,
    onClick,
    theme,
    style,
    ...props
}) => {
    const mergedTheme = { ...baseGlassmorphismTheme, ...theme };

    return (
        <StyledGlassCard
            $variant={variant}
            $size={size}
            $blur={blur}
            $hover={hover}
            $interactive={interactive}
            $loading={loading}
            className={className}
            onClick={onClick}
            theme={mergedTheme}
            style={style}
            {...props}
        >
            {children}
        </StyledGlassCard>
    );
};

// Glass Button Component
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

interface StyledGlassButtonProps {
    $variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
    $size?: 'sm' | 'md' | 'lg';
    $disabled?: boolean;
    $loading?: boolean;
    $fullWidth?: boolean;
    theme: GlassmorphismTheme;
}

const StyledGlassButton = styled.button<StyledGlassButtonProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  backdrop-filter: ${props => props.theme.blur.medium};
  -webkit-backdrop-filter: ${props => props.theme.blur.medium};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.$size === 'sm' && css`
    padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
    font-size: 0.875rem;
  `}
  
  ${props => props.$size === 'md' && css`
    padding: ${props.theme.spacing.md} ${props.theme.spacing.lg};
    font-size: 1rem;
  `}
  
  ${props => props.$size === 'lg' && css`
    padding: ${props.theme.spacing.lg} ${props.theme.spacing.xl};
    font-size: 1.125rem;
  `}
  
  ${props => {
        const variant = props.$variant || 'primary';

        if (variant === 'ghost') {
            return css`
        background: transparent;
        color: ${props.theme.colors.text};
        border: 1px solid ${props.theme.colors.border};
        
        &:hover:not(:disabled) {
          background: ${props.theme.colors.glass.surface};
          border-color: ${props.theme.colors.primary};
        }
      `;
        }

        return css`
      background: ${props.theme.colors.glass[variant]};
      color: ${props.theme.colors.text};
      border: 1px solid ${props.theme.colors[variant]};
      box-shadow: ${props.theme.shadows.glass};
      
      &:hover:not(:disabled) {
        background: ${props.theme.gradients[variant]};
        transform: translateY(-1px);
        box-shadow: ${props.theme.shadows.lg};
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `;
    }}
  
  ${props => props.$disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  `}
  
  ${props => props.$loading && css`
    cursor: wait;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      background-size: 200% 100%;
      animation: ${shimmer} 1.5s infinite;
    }
  `}
`;

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    onClick,
    className,
    theme,
    style,
    type = 'button',
    ...props
}) => {
    const mergedTheme = { ...baseGlassmorphismTheme, ...theme };
    
    return (
        <StyledGlassButton
            $variant={variant}
            $size={size}
            $disabled={disabled || loading}
            $loading={loading}
            $fullWidth={fullWidth}
            disabled={disabled || loading}
            onClick={onClick}
            className={className}
            theme={mergedTheme}
            style={style}
            type={type}
            {...props}
        >
            {icon && iconPosition === 'left' && icon}
            {children}
            {icon && iconPosition === 'right' && icon}
        </StyledGlassButton>
    );
};

// Glass Input Component
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

interface StyledGlassInputProps {
    $error?: boolean;
    $disabled?: boolean;
    $fullWidth?: boolean;
    theme: GlassmorphismTheme;
}

const StyledGlassInput = styled.input<StyledGlassInputProps>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.glass.surface};
  backdrop-filter: ${props => props.theme.blur.light};
  -webkit-backdrop-filter: ${props => props.theme.blur.light};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.glass.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  ${props => props.$error && css`
    border-color: #ef4444;
    
    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
  
  ${props => props.$disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

const InputWrapper = styled.div<{ $fullWidth?: boolean }>`
  position: relative;
  display: inline-block;
  ${props => props.$fullWidth && css`width: 100%;`}
`;

const ErrorMessage = styled.span<{ theme: GlassmorphismTheme }>`
  display: block;
  margin-top: ${props => props.theme.spacing.xs};
  color: #ef4444;
  font-size: 0.875rem;
`;

export const GlassInput: React.FC<GlassInputProps> = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled = false,
    error = false,
    errorMessage,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className,
    theme,
    ...props
}) => {
    const mergedTheme = { ...baseGlassmorphismTheme, ...theme };
    
    return (
        <InputWrapper $fullWidth={fullWidth} className={className}>
            <StyledGlassInput
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
                disabled={disabled}
                $error={error}
                $disabled={disabled}
                theme={mergedTheme}
                {...props}
            />
            {error && errorMessage && (
                <ErrorMessage theme={mergedTheme}>{errorMessage}</ErrorMessage>
            )}
        </InputWrapper>
    );
};

// Glass Modal Component
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

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

interface StyledModalContentProps extends GlassModalProps {
    theme: GlassmorphismTheme;
}

const ModalContent = styled.div<StyledModalContentProps>`
  background: ${props => props.theme.colors.glass.surface};
  backdrop-filter: ${props => props.theme.blur.heavy};
  -webkit-backdrop-filter: ${props => props.theme.blur.heavy};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  padding: ${props => props.theme.spacing.xl};
  margin: ${props => props.theme.spacing.lg};
  transform: ${props => props.isOpen ? 'scale(1)' : 'scale(0.95)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.size === 'sm' && css`
    max-width: 400px;
  `}
  
  ${props => props.size === 'md' && css`
    max-width: 600px;
  `}
  
  ${props => props.size === 'lg' && css`
    max-width: 800px;
  `}
  
  ${props => props.size === 'xl' && css`
    max-width: 1200px;
  `}
`;

const ModalHeader = styled.div<{ theme: GlassmorphismTheme }>`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ModalTitle = styled.h2<{ theme: GlassmorphismTheme }>`
  margin: 0;
  color: ${props => props.theme.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
`;

export const GlassModal: React.FC<GlassModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    closeOnOverlayClick = true,
    className,
    theme,
    ...props
}) => {
    const mergedTheme = { ...baseGlassmorphismTheme, ...theme };
    
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) {
            onClose();
        }
    };

    return (
        <ModalOverlay isOpen={isOpen} onClick={handleOverlayClick}>
            <ModalContent
                isOpen={isOpen}
                onClose={onClose}
                size={size}
                className={className}
                theme={mergedTheme}
                {...props}
            >
                {title && (
                    <ModalHeader theme={mergedTheme}>
                        <ModalTitle theme={mergedTheme}>{title}</ModalTitle>
                    </ModalHeader>
                )}
                {children}
            </ModalContent>
        </ModalOverlay>
    );
};

// Export all components
export * from './GlassCard';