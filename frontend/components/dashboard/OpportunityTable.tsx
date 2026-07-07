'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboardUI } from '@/context/DashboardUIContext';
import { OpportunityMobileCard } from '@/components/dashboard/OpportunityMobileCard';
import {
  formatPublishedShort,
  PriorityStars,
} from '@/components/dashboard/DetailDrawer';
import { cn, impactStyles } from '@/lib/utils';
import type { OpportunityRow, SortField } from '@/types/opportunity';

const PAGE_SIZE = 25;

const COLUMNS: { field: SortField | null; label: string; className?: string }[] = [
  { field: 'priority', label: '⭐', className: 'w-10' },
  { field: 'symbol', label: 'Company', className: 'min-w-[120px]' },
  { field: null, label: 'Sector', className: 'hidden lg:table-cell min-w-[100px]' },
  { field: 'aiScore', label: 'AI Score', className: 'w-20' },
  { field: null, label: 'Event Type', className: 'hidden xl:table-cell min-w-[120px]' },
  { field: 'impact', label: 'Impact', className: 'w-24' },
  { field: 'confidence', label: 'Conf.', className: 'w-16' },
  { field: null, label: 'Exp. Move', className: 'hidden md:table-cell w-24' },
  { field: null, label: 'Hold', className: 'hidden xl:table-cell w-20' },
  { field: 'publishedAt', label: 'Published', className: 'w-32' },
  { field: null, label: 'Source', className: 'w-14' },
  { field: null, label: 'Status', className: 'w-20' },
];

interface OpportunityTableProps {
  rows: OpportunityRow[];
  isLoading?: boolean;
}

export function OpportunityTable({ rows, isLoading }: OpportunityTableProps) {
  const {
    selectedRow,
    selectRow,
    sortField,
    sortDirection,
    toggleSort,
    focusedIndex,
    setFocusedIndex,
  } = useDashboardUI();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, rows.length));
  }, [rows.length]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setFocusedIndex(0);
  }, [rows.length, setFocusedIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
        loadMore();
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadMore]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (rows.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(Math.min(focusedIndex + 1, rows.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(Math.max(focusedIndex - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const row = rows[focusedIndex];
        if (row) selectRow(row);
      } else if (e.key === 'Escape') {
        selectRow(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rows, focusedIndex, setFocusedIndex, selectRow]);

  useEffect(() => {
    const ref = rowRefs.current.get(focusedIndex);
    ref?.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        Loading opportunities…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
        <p className="text-sm text-zinc-400">No opportunities match your filters.</p>
        <p className="text-xs text-zinc-600">Adjust filters or wait for new market announcements.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div
        ref={scrollRef}
        className="hidden min-h-0 flex-1 overflow-auto md:block"
        role="grid"
        aria-label="Live opportunities"
      >
        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-surface-raised">
            <tr className="border-b border-surface-border">
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={cn(
                    'px-2 py-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500',
                    col.className,
                  )}
                >
                  {col.field ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.field!)}
                      className="inline-flex items-center gap-0.5 hover:text-zinc-300"
                    >
                      {col.label}
                      {sortField === col.field &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <OpportunityTableRow
                key={row.id}
                row={row}
                index={index}
                selected={selectedRow?.id === row.id}
                focused={focusedIndex === index}
                onSelect={() => selectRow(row)}
                rowRef={(el) => {
                  if (el) rowRefs.current.set(index, el);
                  else rowRefs.current.delete(index);
                }}
              />
            ))}
          </tbody>
        </table>
        {visibleCount < rows.length && (
          <p className="py-2 text-center text-[10px] text-zinc-600">
            Showing {visibleCount} of {rows.length} — scroll for more
          </p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2 md:hidden">
        {visibleRows.map((row, index) => (
          <OpportunityMobileCard
            key={row.id}
            row={row}
            selected={selectedRow?.id === row.id}
            onSelect={() => selectRow(row)}
            onFocus={() => setFocusedIndex(index)}
          />
        ))}
      </div>
    </>
  );
}

function OpportunityTableRow({
  row,
  index,
  selected,
  focused,
  onSelect,
  rowRef,
}: {
  row: OpportunityRow;
  index: number;
  selected: boolean;
  focused: boolean;
  onSelect: () => void;
  rowRef: (el: HTMLTableRowElement | null) => void;
}) {
  const impactStyle = row.impact !== 'Pending' ? impactStyles(row.impact) : null;

  return (
    <tr
      ref={rowRef}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={cn(
        'cursor-pointer border-b border-surface-border/60 transition-colors',
        'hover:bg-surface-hover/50',
        selected && 'bg-surface-hover',
        focused && 'ring-1 ring-inset ring-zinc-600',
        row.isNew && 'animate-row-enter bg-emerald-500/5',
      )}
      aria-rowindex={index + 1}
    >
      <td className="px-2 py-1.5">
        <PriorityStars priority={row.priority} />
      </td>
      <td className="px-2 py-1.5">
        <div className="font-mono font-semibold text-zinc-100">{row.symbol}</div>
        <div className="max-w-[140px] truncate text-[10px] text-zinc-500">{row.companyName}</div>
      </td>
      <td className="hidden px-2 py-1.5 text-zinc-500 lg:table-cell">{row.sector ?? '—'}</td>
      <td className="px-2 py-1.5 tabular-nums text-zinc-300">
        {row.aiScore?.toFixed(1) ?? '—'}
      </td>
      <td className="hidden max-w-[140px] truncate px-2 py-1.5 text-zinc-400 xl:table-cell">
        {row.eventType}
      </td>
      <td className="px-2 py-1.5">
        {impactStyle ? (
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset',
              impactStyle.badge,
            )}
          >
            {row.impact}
          </span>
        ) : (
          <span className="text-zinc-600">Pending</span>
        )}
      </td>
      <td className="px-2 py-1.5 tabular-nums text-zinc-400">
        {row.confidence !== null ? `${row.confidence}%` : '—'}
      </td>
      <td className="hidden px-2 py-1.5 text-emerald-400/90 md:table-cell">{row.expectedMove}</td>
      <td className="hidden px-2 py-1.5 text-zinc-500 xl:table-cell">{row.holdingPeriod}</td>
      <td className="px-2 py-1.5 tabular-nums text-zinc-500">
        {formatPublishedShort(row.publishedAt)}
      </td>
      <td className="px-2 py-1.5 text-zinc-500">{row.source}</td>
      <td className="px-2 py-1.5">
        <StatusBadge status={row.status} />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: OpportunityRow['status'] }) {
  const colors = {
    classified: 'text-emerald-400',
    pending: 'text-amber-400',
    live: 'text-blue-400',
  };
  return (
    <span className={cn('text-[10px] font-medium capitalize', colors[status])}>{status}</span>
  );
}
