import React from 'react';
export interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'small' | 'medium' | 'large';
    className?: string;
}
export declare const Badge: React.FC<BadgeProps>;
export default Badge;
//# sourceMappingURL=Badge.d.ts.map