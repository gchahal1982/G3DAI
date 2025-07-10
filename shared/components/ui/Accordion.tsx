import React, { useState } from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  children, 
  isOpen = false,
  onToggle
}) => {
  return (
    <div className="accordion-item">
      <button 
        className={`accordion-trigger ${isOpen ? 'accordion-trigger-open' : ''}`}
        onClick={onToggle}
      >
        {title}
        <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};

interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ 
  children, 
  allowMultiple = false,
  className = ''
}) => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenItems(prev => prev.includes(index) ? [] : [index]);
    }
  };

  return (
    <div className={`accordion ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === AccordionItem) {
          return React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
            isOpen: openItems.includes(index),
            onToggle: () => toggleItem(index)
          });
        }
        return child;
      })}
    </div>
  );
};

export default Accordion; 