import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DetailDrawerShellProps {
  children?: ReactNode;
  open?: boolean;
  onClose?: () => void;
}

export function DetailDrawerShell({ children, open = false, onClose }: DetailDrawerShellProps) {
  if (!open) {
    return (
      <div className="flex h-8 shrink-0 items-center border-t border-surface-border bg-surface px-4 text-[10px] text-zinc-600">
        Select a row to view opportunity details ↑
      </div>
    );
  }

  return (
    <div className="flex max-h-[42vh] min-h-[220px] shrink-0 flex-col border-t border-surface-border bg-surface-raised shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <span className="text-xs font-medium text-zinc-400">Opportunity Detail</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-zinc-500 hover:text-zinc-300 md:hidden"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
