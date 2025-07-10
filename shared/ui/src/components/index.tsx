/**
 * G3D Shared UI Components
 * Glassmorphism design system for all AI services
 */

import * as React from 'react';

// Base Glassmorphism Theme
const duplicateBaseGlassmorphismTheme = {
    colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#10b981',
        background: 'rgba(15, 15, 35, 0.95)',
        surface: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            muted: 'rgba(255, 255, 255, 0.5)'
        }
    },
    glass: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px'
    },
    shadows: {
        small: '0 4px 6px rgba(0, 0, 0, 0.1)',
        medium: '0 10px 25px rgba(0, 0, 0, 0.15)',
        large: '0 20px 40px rgba(0, 0, 0, 0.2)'
    }
};

// Service-specific theme overrides
const duplicateServiceThemeOverrides = {
    'vision-pro': {
        colors: {
            primary: '#2563eb',
            secondary: '#0891b2',
            accent: '#22c55e'
        },
        glass: {
            background: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)'
        }
    },
    'codeforge': {
        colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#10b981'
        },
        glass: {
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
        }
    },
    'creative-studio': {
        colors: {
            primary: '#ec4899',
            secondary: '#f97316',
            accent: '#8b5cf6'
        },
        glass: {
            background: 'rgba(236, 72, 153, 0.08)',
            border: '1px solid rgba(236, 72, 153, 0.25)'
        }
    }
};

// Glass Card Component
interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const glassCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.3s ease'
};

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, onClick }) => (
    <div style={glassCardStyle} className={className} onClick={onClick}>
        {children}
    </div>
);

// Glass Button Component
interface GlassButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'accent';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}

const glassButtonStyle: React.CSSProperties = {
    background: '#6366f1',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem'
};

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    onClick,
    className
}) => (
    <button 
        style={glassButtonStyle}
        disabled={disabled}
        onClick={onClick}
        className={className}
    >
        {children}
    </button>
);

// Glass Input Component
interface GlassInputProps {
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    className?: string;
}

const glassInputStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'white',
    fontSize: '1rem',
    width: '100%',
    transition: 'all 0.3s ease'
};

export const GlassInput: React.FC<GlassInputProps> = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled = false,
    className
}) => (
    <input
        style={glassInputStyle}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
    />
);

// Glass Modal Component
interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
};

export const GlassModal: React.FC<GlassModalProps> = ({
    isOpen,
    onClose,
    children,
    title
}) => {
    if (!isOpen) return null;
    
    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                {title && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 600 }}>{title}</h2>
                        <button 
                            onClick={onClose}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'white', 
                                fontSize: '1.5rem', 
                                cursor: 'pointer', 
                                padding: '0.5rem' 
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

// Export all components
export {
    duplicateBaseGlassmorphismTheme,
    duplicateServiceThemeOverrides
};