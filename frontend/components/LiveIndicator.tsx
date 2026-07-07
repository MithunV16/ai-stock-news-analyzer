import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/hooks/useSocketEvents';

interface LiveIndicatorProps {
  status: ConnectionStatus;
}

export function LiveIndicator({ status }: LiveIndicatorProps) {
  const label =
    status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Offline';

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-surface-border bg-surface-raised px-3 py-1.5 text-xs font-medium"
      title={`WebSocket ${status}`}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'connected' && 'animate-pulse bg-emerald-400',
          status === 'connecting' && 'animate-pulse bg-amber-400',
          status === 'disconnected' && 'bg-red-400',
        )}
      />
      <span className="text-slate-300">{label}</span>
    </div>
  );
}
