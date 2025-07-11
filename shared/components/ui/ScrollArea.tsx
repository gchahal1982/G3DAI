'use client';

import React from 'react';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className = '', style }) => {
  return (
    <div 
      className={`scroll-area ${className}`}
      style={{ 
        overflow: 'auto',
        ...style 
      }}
    >
      {children}
    </div>
  );
};

export default ScrollArea; 