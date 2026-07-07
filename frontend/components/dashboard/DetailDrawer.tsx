'use client';

import type { ReactNode } from 'react';
import { Star, X } from 'lucide-react';
import { cn, formatDateTime, impactStyles } from '@/lib/utils';
import type { OpportunityRow } from '@/types/opportunity';

interface DetailDrawerProps {
  row: OpportunityRow;
  onClose: () => void;
}

export function DetailDrawer({ row, onClose }: DetailDrawerProps) {
  const styles = row.impact !== 'Pending' ? impactStyles(row.impact) : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-surface-border pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold text-zinc-100">{row.symbol}</span>
            {row.sector && (
              <span className="rounded border border-surface-border px-1.5 py-0.5 text-[10px] text-zinc-500">
                {row.sector}
              </span>
            )}
            {styles && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                  styles.badge,
                )}
              >
                {row.impact}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-zinc-400">{row.companyName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-zinc-500 hover:bg-surface-hover hover:text-zinc-300"
          aria-label="Close detail drawer"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 gap-4 overflow-y-auto md:grid-cols-2">
        <section className="space-y-3">
          <Block title="Announcement">
            <p className="text-sm font-medium text-zinc-200">{row.headline}</p>
            {row.url && (
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-blue-400 hover:underline"
              >
                View original filing →
              </a>
            )}
          </Block>

          <Block title="Summary">
            <p className="text-sm leading-relaxed text-zinc-400">{row.summary || '—'}</p>
          </Block>

          {row.reason && (
            <Block title="AI Reasoning">
              <p className="text-sm leading-relaxed text-zinc-500">{row.reason}</p>
            </Block>
          )}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="AI Score" value={row.aiScore?.toFixed(1) ?? '—'} />
            <Metric label="Confidence" value={row.confidence !== null ? `${row.confidence}%` : '—'} />
            <Metric label="Expected Move" value={row.expectedMove} highlight />
            <Metric label="Holding Period" value={row.holdingPeriod} />
          </div>
        </section>

        <section className="space-y-3">
          <PlaceholderBlock title="Historical Analysis" text="Coming soon — past event performance for this symbol." />
          <PlaceholderBlock title="Price Chart" text="Coming soon — TradingView-style chart integration." />
          <PlaceholderBlock title="Technical Analysis" text="Coming soon — RSI, MACD, support/resistance levels." />
          <PlaceholderBlock title="AI Explanation" text="Coming soon — deep-dive narrative from the AI engine." />
        </section>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        {title}
      </h3>
      {children}
    </div>
  );
}

function PlaceholderBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-dashed border-surface-border p-3">
      <h3 className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">{title}</h3>
      <p className="mt-1 text-xs text-zinc-600">{text}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-md border border-surface-border bg-surface px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wide text-zinc-600">{label}</p>
      <p
        className={cn(
          'mt-0.5 text-sm font-semibold tabular-nums',
          highlight ? 'text-emerald-400' : 'text-zinc-200',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function PriorityStars({ priority }: { priority: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400/80">
      {Array.from({ length: 4 - priority }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-current" strokeWidth={0} />
      ))}
    </span>
  );
}

export function formatPublishedShort(iso: string): string {
  return formatDateTime(iso).replace(',', '');
}
