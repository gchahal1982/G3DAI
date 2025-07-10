import React from 'react';

export interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position = 'top', 
  className = '' 
}) => {
  return (
    <div className={`tooltip-wrapper ${className}`}>
      {children}
      <div className={`tooltip tooltip-${position}`}>
        {content}
      </div>
    </div>
  );
};

export default Tooltip; 