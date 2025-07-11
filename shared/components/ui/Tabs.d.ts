import React from 'react';
export interface TabsProps {
    children: React.ReactNode;
    defaultValue: string;
    className?: string;
}
export declare const Tabs: React.FC<TabsProps>;
export interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}
export declare const TabsList: React.FC<TabsListProps>;
export interface TabsTriggerProps {
    children: React.ReactNode;
    value: string;
    className?: string;
}
export declare const TabsTrigger: React.FC<TabsTriggerProps>;
export interface TabsContentProps {
    children: React.ReactNode;
    value: string;
    className?: string;
}
export declare const TabsContent: React.FC<TabsContentProps>;
export default Tabs;
//# sourceMappingURL=Tabs.d.ts.map