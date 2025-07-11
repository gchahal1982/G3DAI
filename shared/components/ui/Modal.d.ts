import React from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    className?: string;
}
export declare const Modal: React.FC<ModalProps>;
//# sourceMappingURL=Modal.d.ts.map