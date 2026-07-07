'use client';

import { Bell } from 'lucide-react';
import { useDashboardNav } from '@/context/DashboardNavContext';

export function HeaderNotifications() {
  const { notificationCount } = useDashboardNav();

  return (
    <button
      type="button"
      className="relative rounded-md p-1.5 text-zinc-500 hover:bg-surface-hover hover:text-zinc-300"
      aria-label="Notifications"
      title="Alerts (coming soon)"
    >
      <Bell className="h-4 w-4" strokeWidth={1.75} />
      {notificationCount > 0 && (
        <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  );
}
