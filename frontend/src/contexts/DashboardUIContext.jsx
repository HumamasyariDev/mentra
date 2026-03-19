import React, { createContext, useContext, useState } from 'react';

const DashboardUIContext = createContext();

const STORAGE_KEY = 'dashboard-mode';

export const DashboardUIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardMode, setDashboardModeState] = useState(() => {
    if (typeof window === 'undefined') return 'map';
    return localStorage.getItem(STORAGE_KEY) || 'map';
  });

  const setDashboardMode = (newMode) => {
    if (['map', 'simplified'].includes(newMode)) {
      setDashboardModeState(newMode);
      localStorage.setItem(STORAGE_KEY, newMode);
    }
  };

  return (
    <DashboardUIContext.Provider value={{ 
      sidebarOpen, 
      setSidebarOpen,
      dashboardMode,
      setDashboardMode
    }}>
      {children}
    </DashboardUIContext.Provider>
  );
};

export const useDashboardUI = () => {
  const context = useContext(DashboardUIContext);
  if (!context) {
    throw new Error('useDashboardUI must be used within DashboardUIProvider');
  }
  return context;
};
