/**
 * G3D Shared UI Components
 * Glassmorphism design system for all AI services
 */

import React from 'react';
import styled from 'styled-components';

// Base Glassmorphism Theme
export const baseGlassmorphismTheme = {
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
export const serviceThemeOverrides = {
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

const StyledGlassCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, onClick }) => (
    <StyledGlassCard className= { className } onClick = { onClick } >
        { children }
        </StyledGlassCard>
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

const StyledGlassButton = styled.button<{ variant: string; size: string }>`
  background: #6366f1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    onClick,
    className
}) => (
    <StyledGlassButton 
    variant= { variant }
size = { size }
disabled = { disabled }
onClick = { onClick }
className = { className }
    >
    { children }
    </StyledGlassButton>
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

const StyledGlassInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const GlassInput: React.FC<GlassInputProps> = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    disabled = false,
    className
}) => (
    <StyledGlassInput
    type= { type }
placeholder = { placeholder }
value = { value }
onChange = { onChange }
disabled = { disabled }
className = { className }
    />
);

// Glass Modal Component
interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const GlassModal: React.FC<GlassModalProps> = ({
    isOpen,
    onClose,
    children,
    title
}) => (
    <ModalOverlay isOpen= { isOpen } onClick = { onClose } >
        <ModalContent onClick={(e) => e.stopPropagation()}>
            { title && (
                <ModalHeader>
                <h2>{ title } </h2>
                < CloseButton onClick = { onClose } >×</CloseButton>
                    </ModalHeader>
      )}
{ children }
</ModalContent>
    </ModalOverlay>
);

// Export all components
export {
    baseGlassmorphismTheme,
    serviceThemeOverrides,
    GlassCard,
    GlassButton,
    GlassInput,
    GlassModal
};