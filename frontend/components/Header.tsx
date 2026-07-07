import { LiveIndicator } from '@/components/LiveIndicator';
import type { ConnectionStatus } from '@/hooks/useSocketEvents';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
}

export function Header({ connectionStatus }: HeaderProps) {
  return (
    <header className="border-b border-surface-border bg-surface-raised/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
            Indian Stock Market
          </p>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            AI Stock News Analyzer
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">
            Real-time corporate event intelligence — decision support, not trading advice
          </p>
        </div>
        <LiveIndicator status={connectionStatus} />
      </div>
    </header>
  );
}
