'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_VIEW,
  NAV_ITEMS_BY_ID,
  type DashboardViewId,
} from '@/types/navigation';

interface DashboardNavContextValue {
  activeView: DashboardViewId;
  setActiveView: (view: DashboardViewId) => void;
  activeLabel: string;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  notificationCount: number;
}

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export function DashboardNavProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<DashboardViewId>(DEFAULT_VIEW);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const notificationCount = 0;

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const value = useMemo(
    () => ({
      activeView,
      setActiveView,
      activeLabel: NAV_ITEMS_BY_ID[activeView]?.label ?? 'Dashboard',
      sidebarCollapsed,
      toggleSidebar,
      setSidebarCollapsed,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      searchQuery,
      setSearchQuery,
      theme,
      toggleTheme,
      notificationCount,
    }),
    [
      activeView,
      sidebarCollapsed,
      mobileSidebarOpen,
      toggleSidebar,
      searchQuery,
      theme,
      toggleTheme,
    ],
  );

  return (
    <DashboardNavContext.Provider value={value}>{children}</DashboardNavContext.Provider>
  );
}

export function useDashboardNav(): DashboardNavContextValue {
  const ctx = useContext(DashboardNavContext);
  if (!ctx) {
    throw new Error('useDashboardNav must be used within DashboardNavProvider');
  }
  return ctx;
}
