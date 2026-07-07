'use client';

import { PriorityStars } from '@/components/dashboard/DetailDrawer';
import { cn, formatDateTime, impactStyles } from '@/lib/utils';
import type { OpportunityRow } from '@/types/opportunity';

interface OpportunityMobileCardProps {
  row: OpportunityRow;
  selected: boolean;
  onSelect: () => void;
  onFocus: () => void;
}

export function OpportunityMobileCard({
  row,
  selected,
  onSelect,
  onFocus,
}: OpportunityMobileCardProps) {
  const impactStyle = row.impact !== 'Pending' ? impactStyles(row.impact) : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      onFocus={onFocus}
      className={cn(
        'w-full rounded-md border border-surface-border bg-surface p-3 text-left transition-colors',
        selected && 'border-zinc-500 bg-surface-hover',
        row.isNew && 'animate-row-enter border-emerald-500/30',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <PriorityStars priority={row.priority} />
            <span className="font-mono text-sm font-bold text-zinc-100">{row.symbol}</span>
            <span className="text-[10px] text-zinc-600">{row.source}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">{row.headline}</p>
        </div>
        {impactStyle && (
          <span
            className={cn(
              'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset',
              impactStyle.badge,
            )}
          >
            {row.impact}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-zinc-500">
        <span>Conf. {row.confidence !== null ? `${row.confidence}%` : '—'}</span>
        <span>Score {row.aiScore?.toFixed(1) ?? '—'}</span>
        <span>{formatDateTime(row.publishedAt)}</span>
      </div>
    </button>
  );
}
