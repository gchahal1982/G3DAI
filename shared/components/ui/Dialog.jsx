import React from 'react';
export const Dialog = ({ open, onClose, title, children, className = '' }) => {
    if (!open)
        return null;
    return (<div className="dialog-overlay" onClick={onClose}>
      <div className={`dialog ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          {title && <h2 className="dialog-title">{title}</h2>}
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <div className="dialog-content">{children}</div>
      </div>
    </div>);
};
export default Dialog;
