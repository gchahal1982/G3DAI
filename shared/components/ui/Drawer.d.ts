import React from 'react';
interface DrawerProps {
    open: boolean;
    onClose: () => void;
    position?: 'left' | 'right' | 'top' | 'bottom';
    children: React.ReactNode;
    className?: string;
}
export declare const Drawer: React.FC<DrawerProps>;
export default Drawer;
//# sourceMappingURL=Drawer.d.ts.map