'use client';

import {
  marketStatusColor,
  marketStatusLabel,
  useMarketStatus,
} from '@/hooks/useMarketStatus';

export function HeaderMarketStatus() {
  const status = useMarketStatus();

  return (
    <div
      className="hidden items-center gap-1.5 rounded-md border border-surface-border px-2 py-1 lg:flex"
      title="NSE / BSE regular session (IST)"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === 'open'
            ? 'bg-emerald-500'
            : status === 'pre-open'
              ? 'bg-amber-500'
              : 'bg-zinc-600'
        }`}
      />
      <span className={`text-[11px] font-medium ${marketStatusColor(status)}`}>
        {marketStatusLabel(status)}
      </span>
    </div>
  );
}
