'use client';

import { RotateCcw } from 'lucide-react';
import { useDashboardNav } from '@/context/DashboardNavContext';
import { useDashboardUI } from '@/context/DashboardUIContext';
import type { DateRangeFilter, SourceFilter } from '@/types/filters';

export function FilterBar() {
  const { searchQuery, setSearchQuery } = useDashboardNav();
  const { filters, updateFilter, resetFilters } = useDashboardUI();

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-surface-border px-3 py-2">
      <FilterChip
        label="Bullish"
        active={filters.bullishOnly}
        onClick={() => {
          updateFilter('bullishOnly', !filters.bullishOnly);
          if (!filters.bullishOnly) updateFilter('bearishOnly', false);
        }}
      />
      <FilterChip
        label="Bearish"
        active={filters.bearishOnly}
        onClick={() => {
          updateFilter('bearishOnly', !filters.bearishOnly);
          if (!filters.bearishOnly) updateFilter('bullishOnly', false);
        }}
      />
      <FilterChip
        label="NSE"
        active={filters.source === 'NSE'}
        onClick={() =>
          updateFilter('source', filters.source === 'NSE' ? 'all' : ('NSE' as SourceFilter))
        }
      />
      <FilterChip
        label="BSE"
        active={filters.source === 'BSE'}
        onClick={() =>
          updateFilter('source', filters.source === 'BSE' ? 'all' : ('BSE' as SourceFilter))
        }
      />
      <FilterChip
        label="Today"
        active={filters.dateRange === 'today'}
        onClick={() =>
          updateFilter(
            'dateRange',
            filters.dateRange === 'today' ? 'all' : ('today' as DateRangeFilter),
          )
        }
      />
      <FilterChip
        label="Yesterday"
        active={filters.dateRange === 'yesterday'}
        onClick={() =>
          updateFilter(
            'dateRange',
            filters.dateRange === 'yesterday' ? 'all' : ('yesterday' as DateRangeFilter),
          )
        }
      />

      <select
        value={filters.confidenceMin ?? ''}
        onChange={(e) =>
          updateFilter(
            'confidenceMin',
            e.target.value ? Number(e.target.value) : null,
          )
        }
        className="h-7 rounded-md border border-surface-border bg-surface-raised px-2 text-[11px] text-zinc-400"
        aria-label="Minimum confidence"
      >
        <option value="">Confidence</option>
        <option value="50">≥ 50%</option>
        <option value="70">≥ 70%</option>
        <option value="80">≥ 80%</option>
      </select>

      <select
        value={filters.scoreMin ?? ''}
        onChange={(e) =>
          updateFilter('scoreMin', e.target.value ? Number(e.target.value) : null)
        }
        className="h-7 rounded-md border border-surface-border bg-surface-raised px-2 text-[11px] text-zinc-400"
        aria-label="Minimum AI score"
      >
        <option value="">AI Score</option>
        <option value="50">≥ 50</option>
        <option value="70">≥ 70</option>
      </select>

      <input
        type="text"
        value={filters.expectedMoveQuery}
        onChange={(e) => updateFilter('expectedMoveQuery', e.target.value)}
        placeholder="Expected move"
        className="h-7 w-28 rounded-md border border-surface-border bg-surface-raised px-2 text-[11px] text-zinc-300 placeholder:text-zinc-600"
      />

      <input
        type="text"
        value={filters.eventTypeQuery}
        onChange={(e) => updateFilter('eventTypeQuery', e.target.value)}
        placeholder="Event type"
        className="h-7 w-24 rounded-md border border-surface-border bg-surface-raised px-2 text-[11px] text-zinc-300 placeholder:text-zinc-600"
      />

      {/* Sync mobile search from header on small screens */}
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Company search"
        className="h-7 min-w-[120px] flex-1 rounded-md border border-surface-border bg-surface-raised px-2 text-[11px] text-zinc-300 placeholder:text-zinc-600 md:hidden"
      />

      <button
        type="button"
        onClick={resetFilters}
        className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:bg-surface-hover hover:text-zinc-300"
      >
        <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
        Reset
      </button>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
        active
          ? 'border-zinc-500 bg-surface-hover text-zinc-200'
          : 'border-surface-border text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
      }`}
    >
      {label}
    </button>
  );
}
