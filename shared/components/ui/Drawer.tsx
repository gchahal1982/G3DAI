import React from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ 
  open, 
  onClose, 
  position = 'right',
  children, 
  className = ''
}) => {
  if (!open) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className={`drawer drawer-${position} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="drawer-content">{children}</div>
      </div>
    </div>
  );
};

export default Drawer; 