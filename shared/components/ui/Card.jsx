import React from 'react';
export const Card = ({ title, children, className = '', onClick }) => {
    return (<div className={`card ${className} ${onClick ? 'card-clickable' : ''}`} onClick={onClick}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-content">{children}</div>
    </div>);
};
export default Card;
