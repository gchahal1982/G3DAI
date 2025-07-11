'use client';

import React from 'react';

interface DialogProps {
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ 
  open, 
  onClose, 
  onOpenChange,
  title, 
  children, 
  className = ''
}) => {
  if (!open) return null;

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div 
        className={`dialog ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          {title && <h2 className="dialog-title">{title}</h2>}
          <button className="dialog-close" onClick={handleClose}>×</button>
        </div>
        <div className="dialog-content">{children}</div>
      </div>
    </div>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => {
  return <div className={`dialog-content ${className}`}>{children}</div>;
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = '' }) => {
  return <div className={`dialog-header ${className}`}>{children}</div>;
};

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => {
  return <h2 className={`dialog-title ${className}`}>{children}</h2>;
};

export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, className = '' }) => {
  return <div className={`dialog-trigger ${className}`}>{children}</div>;
};

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className = '' }) => {
  return <div className={`dialog-footer ${className}`}>{children}</div>;
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className = '' }) => {
  return <p className={`dialog-description ${className}`}>{children}</p>;
};

export default Dialog; 