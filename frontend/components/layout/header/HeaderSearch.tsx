'use client';

import { Search } from 'lucide-react';
import { useDashboardNav } from '@/context/DashboardNavContext';

export function HeaderSearch() {
  const { searchQuery, setSearchQuery } = useDashboardNav();

  return (
    <div className="relative hidden min-w-0 flex-1 md:block md:max-w-xs lg:max-w-sm">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
        strokeWidth={1.75}
      />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search company, symbol…"
        className="h-8 w-full rounded-md border border-surface-border bg-surface-raised pl-8 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
      />
    </div>
  );
}
