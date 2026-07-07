'use client';

import { Moon, Sun } from 'lucide-react';
import { useDashboardNav } from '@/context/DashboardNavContext';

export function HeaderThemeToggle() {
  const { theme, toggleTheme } = useDashboardNav();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-md p-1.5 text-zinc-500 hover:bg-surface-hover hover:text-zinc-300"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
