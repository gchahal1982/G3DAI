'use client';

import React from 'react';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({ orientation = 'horizontal', className = '' }) => {
  return (
    <div 
      className={`separator separator-${orientation} ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

export default Separator; 