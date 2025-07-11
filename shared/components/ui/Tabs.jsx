import React, { createContext, useContext, useState } from 'react';
const TabsContext = createContext(undefined);
export const Tabs = ({ children, defaultValue, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    return (<TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`tabs ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>);
};
export const TabsList = ({ children, className = '' }) => {
    return (<div className={`tabs-list ${className}`}>
      {children}
    </div>);
};
export const TabsTrigger = ({ children, value, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context)
        throw new Error('TabsTrigger must be used within Tabs');
    const { activeTab, setActiveTab } = context;
    const isActive = activeTab === value;
    return (<button className={`tabs-trigger ${isActive ? 'active' : ''} ${className}`} onClick={() => setActiveTab(value)}>
      {children}
    </button>);
};
export const TabsContent = ({ children, value, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context)
        throw new Error('TabsContent must be used within Tabs');
    const { activeTab } = context;
    if (activeTab !== value)
        return null;
    return (<div className={`tabs-content ${className}`}>
      {children}
    </div>);
};
export default Tabs;
