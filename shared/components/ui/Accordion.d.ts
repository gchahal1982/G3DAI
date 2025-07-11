import React from 'react';
interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onToggle?: () => void;
}
export declare const AccordionItem: React.FC<AccordionItemProps>;
interface AccordionProps {
    children: React.ReactNode;
    allowMultiple?: boolean;
    className?: string;
}
export declare const Accordion: React.FC<AccordionProps>;
export default Accordion;
//# sourceMappingURL=Accordion.d.ts.map