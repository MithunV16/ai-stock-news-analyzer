'use client';

import { Menu } from 'lucide-react';
import { useDashboardNav } from '@/context/DashboardNavContext';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { HeaderClock } from '@/components/layout/header/HeaderClock';
import { HeaderLiveIndicator } from '@/components/layout/header/HeaderLiveIndicator';
import { HeaderMarketStatus } from '@/components/layout/header/HeaderMarketStatus';
import { HeaderNotifications } from '@/components/layout/header/HeaderNotifications';
import { HeaderRefresh } from '@/components/layout/header/HeaderRefresh';
import { HeaderSearch } from '@/components/layout/header/HeaderSearch';
import { HeaderThemeToggle } from '@/components/layout/header/HeaderThemeToggle';

export function DashboardHeader() {
  const { setMobileSidebarOpen } = useDashboardNav();
  const connectionStatus = useSocketConnection();

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-surface-border bg-surface px-3 md:px-4">
      <button
        type="button"
        className="shrink-0 rounded-md p-1.5 text-zinc-500 hover:bg-surface-hover hover:text-zinc-300 md:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {/* Logo */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-border bg-surface-raised text-xs font-bold text-zinc-300">
          AI
        </div>
        <span className="hidden text-sm font-semibold tracking-tight text-zinc-100 sm:inline">
          Stock Intelligence
        </span>
      </div>

      {/* Search — grows on desktop */}
      <HeaderSearch />

      {/* Right controls */}
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
        <HeaderMarketStatus />
        <HeaderLiveIndicator status={connectionStatus} />
        <HeaderRefresh />
        <HeaderNotifications />
        <HeaderThemeToggle />
        <HeaderClock />
      </div>
    </header>
  );
}
