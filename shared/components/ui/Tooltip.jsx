import React from 'react';
export const Tooltip = ({ children, content, position = 'top', className = '' }) => {
    return (<div className={`tooltip-wrapper ${className}`}>
      {children}
      <div className={`tooltip tooltip-${position}`}>
        {content}
      </div>
    </div>);
};
export default Tooltip;
