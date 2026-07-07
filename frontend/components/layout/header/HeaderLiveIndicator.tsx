'use client';

import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/hooks/useSocketEvents';

interface HeaderLiveIndicatorProps {
  status: ConnectionStatus;
}

export function HeaderLiveIndicator({ status }: HeaderLiveIndicatorProps) {
  const label =
    status === 'connected' ? 'Live' : status === 'connecting' ? '…' : 'Off';

  return (
    <div
      className="flex items-center gap-1.5 rounded-md border border-surface-border px-2 py-1"
      title={`WebSocket ${status}`}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'connected' && 'animate-pulse bg-emerald-500',
          status === 'connecting' && 'animate-pulse bg-amber-500',
          status === 'disconnected' && 'bg-red-500',
        )}
      />
      <span className="text-[11px] font-medium text-zinc-400">{label}</span>
    </div>
  );
}
