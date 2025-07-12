'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings, isLoaded } = useSettings();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Use settings value for collapsed state, but only after settings are loaded
  const [isCollapsed, setIsCollapsedState] = useState(false);

  // Update local collapsed state when settings are loaded
  useEffect(() => {
    if (isLoaded) {
      setIsCollapsedState(settings.sidebarCollapsed);
    }
  }, [settings.sidebarCollapsed, isLoaded]);

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    // Update settings to persist the change
    updateSettings({ sidebarCollapsed: collapsed });
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Handle mobile responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isMobileOpen,
      setIsCollapsed,
      setIsMobileOpen,
      toggleSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
