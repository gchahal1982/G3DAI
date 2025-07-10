import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`card ${className} ${onClick ? 'card-clickable' : ''}`}
      onClick={onClick}
    >
      {title && <div className="card-header">{title}</div>}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card; 