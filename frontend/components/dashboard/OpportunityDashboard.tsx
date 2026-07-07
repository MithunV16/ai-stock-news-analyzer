'use client';

import { useMemo } from 'react';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { OpportunityTable } from '@/components/dashboard/OpportunityTable';
import { useDashboardNav } from '@/context/DashboardNavContext';
import {
  applyFilters,
  applyViewPreset,
  buildOpportunityRows,
  computeKpis,
  sortOpportunities,
} from '@/lib/opportunities';
import { useDashboardUI } from '@/context/DashboardUIContext';
import { PLACEHOLDER_VIEWS } from '@/types/navigation';
import type { AnnouncementBroadcastPayload, EventWithRelations, TopScore } from '@/types/domain';
import type { ConnectionStatus } from '@/hooks/useSocketEvents';

interface OpportunityDashboardProps {
  events: EventWithRelations[];
  announcements: AnnouncementBroadcastPayload[];
  scores: TopScore[];
  latestEventId: string | null;
  latestAnnouncementId: string | null;
  connectionStatus: ConnectionStatus;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
}

export function OpportunityDashboard({
  events,
  announcements,
  scores,
  latestEventId,
  latestAnnouncementId,
  connectionStatus,
  isLoading,
  isError,
  error,
}: OpportunityDashboardProps) {
  const { activeView, activeLabel, searchQuery } = useDashboardNav();
  const { filters, sortField, sortDirection } = useDashboardUI();

  const allRows = useMemo(
    () =>
      buildOpportunityRows(
        events,
        announcements,
        scores,
        latestEventId,
        latestAnnouncementId,
      ),
    [events, announcements, scores, latestEventId, latestAnnouncementId],
  );

  const filteredRows = useMemo(() => {
    let rows = applyViewPreset(allRows, activeView);
    rows = applyFilters(rows, filters, searchQuery);
    return sortOpportunities(rows, sortField, sortDirection);
  }, [allRows, activeView, filters, searchQuery, sortField, sortDirection]);

  const kpis = useMemo(
    () => computeKpis(allRows, connectionStatus),
    [allRows, connectionStatus],
  );

  const isPlaceholderView = PLACEHOLDER_VIEWS.includes(activeView);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-surface-border bg-surface-raised">
      <div className="flex shrink-0 items-center justify-between border-b border-surface-border px-4 py-2">
        <h1 className="text-sm font-semibold text-zinc-100">{activeLabel}</h1>
        <span className="text-xs tabular-nums text-zinc-500">
          {filteredRows.length} opportunities
        </span>
      </div>

      <div className="shrink-0 border-b border-surface-border p-3">
        <KpiCards {...kpis} />
      </div>

      <FilterBar />

      {isError && (
        <div className="shrink-0 border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
          Failed to load dashboard: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {isPlaceholderView ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm font-medium text-zinc-300">{activeLabel}</p>
          <p className="max-w-sm text-xs text-zinc-500">
            This section is coming soon. Live opportunities remain available under Live
            Opportunities and High Impact.
          </p>
        </div>
      ) : (
        <OpportunityTable rows={filteredRows} isLoading={isLoading} />
      )}
    </div>
  );
}
