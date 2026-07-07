'use client';

import { useIstClock } from '@/hooks/useIstClock';

export function HeaderClock() {
  const time = useIstClock();

  return (
    <div
      className="hidden items-center gap-1 rounded-md border border-surface-border px-2 py-1 font-mono text-[11px] tabular-nums text-zinc-400 sm:flex"
      title="India Standard Time"
    >
      <span className="text-zinc-600">IST</span>
      {time || '--:--:--'}
    </div>
  );
}
