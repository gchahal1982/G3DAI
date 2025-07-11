import React from 'react';
interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}
export declare const Dialog: React.FC<DialogProps>;
export default Dialog;
//# sourceMappingURL=Dialog.d.ts.map