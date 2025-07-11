import React from 'react';
export const Breadcrumb = ({ items, separator = '/', className = '' }) => {
    return (<nav className={`breadcrumb ${className}`}>
      <ol className="breadcrumb-list">
        {items.map((item, index) => (<li key={index} className="breadcrumb-item">
            {item.href ? (<a href={item.href} className="breadcrumb-link">
                {item.label}
              </a>) : item.onClick ? (<button className="breadcrumb-button" onClick={item.onClick}>
                {item.label}
              </button>) : (<span className="breadcrumb-text">{item.label}</span>)}
            {index < items.length - 1 && (<span className="breadcrumb-separator">{separator}</span>)}
          </li>))}
      </ol>
    </nav>);
};
export default Breadcrumb;
