import React from 'react';
interface BreadcrumbItem {
    label: string;
    href?: string;
    onClick?: () => void;
}
interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: string;
    className?: string;
}
export declare const Breadcrumb: React.FC<BreadcrumbProps>;
export default Breadcrumb;
//# sourceMappingURL=Breadcrumb.d.ts.map