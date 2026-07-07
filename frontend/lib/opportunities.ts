import type { OpportunityFilters } from '@/types/filters';
import type { OpportunityRow, SortDirection, SortField } from '@/types/opportunity';
import type {
  AnnouncementBroadcastPayload,
  EventWithRelations,
  Impact,
  TopScore,
} from '@/types/domain';
import type { DashboardViewId } from '@/types/navigation';
import { VIEW_FILTER_HINTS } from '@/types/navigation';

function computePriority(confidence: number | null, impact: Impact | 'Pending'): 1 | 2 | 3 {
  if (impact === 'Pending' || confidence === null) return 3;
  if (confidence >= 80 && (impact === 'Bullish' || impact === 'Bearish')) return 1;
  if (confidence >= 60) return 2;
  return 3;
}

function scoreForCompany(companyId: string, scores: TopScore[]): number | null {
  return scores.find((s) => s.companyId === companyId)?.score ?? null;
}

export function eventToOpportunity(
  event: EventWithRelations,
  scores: TopScore[],
  isNew = false,
): OpportunityRow {
  const aiScore = scoreForCompany(event.companyId, scores);
  return {
    id: event.id,
    priority: computePriority(event.confidence, event.impact),
    symbol: event.company.symbol,
    companyName: event.company.companyName,
    sector: event.company.sector,
    aiScore,
    eventType: event.eventType,
    impact: event.impact,
    confidence: event.confidence,
    expectedMove: event.expectedMove,
    holdingPeriod: event.holdingPeriod,
    publishedAt: event.news.publishedAt,
    source: event.news.source.toUpperCase(),
    status: 'classified',
    headline: event.news.headline,
    summary: event.summary,
    reason: event.reason,
    url: event.news.url,
    event,
    isNew,
  };
}

export function announcementToOpportunity(
  announcement: AnnouncementBroadcastPayload,
  isNew = false,
): OpportunityRow {
  return {
    id: `ann-${announcement.id}`,
    priority: 3,
    symbol: announcement.symbol,
    companyName: announcement.companyName,
    sector: null,
    aiScore: announcement.score,
    eventType: announcement.eventType ?? '—',
    impact: (announcement.impact as Impact) ?? 'Pending',
    confidence: announcement.confidence,
    expectedMove: '—',
    holdingPeriod: '—',
    publishedAt: announcement.publishedAt,
    source: announcement.source,
    status: announcement.processingStatus === 'pending' ? 'pending' : 'live',
    headline: announcement.headline,
    summary: announcement.description,
    reason: '',
    url: announcement.url,
    announcement,
    isNew,
  };
}

export function buildOpportunityRows(
  events: EventWithRelations[],
  announcements: AnnouncementBroadcastPayload[],
  scores: TopScore[],
  latestEventId: string | null,
  latestAnnouncementId: string | null,
): OpportunityRow[] {
  const eventUrls = new Set(events.map((e) => e.news.url));
  const eventRows = events.map((e) =>
    eventToOpportunity(e, scores, e.id === latestEventId),
  );

  const announcementRows = announcements
    .filter((a) => !a.url || !eventUrls.has(a.url))
    .map((a) => announcementToOpportunity(a, a.id === latestAnnouncementId));

  return [...eventRows, ...announcementRows];
}

function istCalendarParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return { year: get('year'), month: get('month'), day: get('day') };
}

function isToday(iso: string): boolean {
  const published = istCalendarParts(new Date(iso));
  const today = istCalendarParts();
  return (
    published.year === today.year &&
    published.month === today.month &&
    published.day === today.day
  );
}

function isYesterday(iso: string): boolean {
  const published = istCalendarParts(new Date(iso));
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = istCalendarParts(yesterdayDate);
  return (
    published.year === yesterday.year &&
    published.month === yesterday.month &&
    published.day === yesterday.day
  );
}

export function applyViewPreset(
  rows: OpportunityRow[],
  activeView: DashboardViewId,
): OpportunityRow[] {
  const hint = VIEW_FILTER_HINTS[activeView];
  if (!hint) return rows;

  return rows.filter((row) => {
    if (hint.announcementsOnly) {
      return row.announcement !== undefined || row.status === 'pending' || row.status === 'live';
    }
    if (hint.impact === 'high') {
      return row.confidence !== null && row.confidence >= 70;
    }
    if (hint.impact && hint.impact !== 'high') {
      return row.impact === hint.impact;
    }
    if (hint.eventType) {
      return row.eventType.toLowerCase().includes(hint.eventType.toLowerCase());
    }
    return true;
  });
}

export function applyFilters(
  rows: OpportunityRow[],
  filters: OpportunityFilters,
  searchQuery: string,
): OpportunityRow[] {
  const q = searchQuery.trim().toLowerCase();

  return rows.filter((row) => {
    if (q) {
      const haystack = `${row.symbol} ${row.companyName} ${row.headline}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.confidenceMin !== null) {
      if (row.confidence === null || row.confidence < filters.confidenceMin) return false;
    }

    if (filters.scoreMin !== null) {
      if (row.aiScore === null || row.aiScore < filters.scoreMin) return false;
    }

    if (filters.expectedMoveQuery) {
      if (!row.expectedMove.toLowerCase().includes(filters.expectedMoveQuery.toLowerCase())) {
        return false;
      }
    }

    if (filters.impact !== 'all' && row.impact !== filters.impact) return false;

    if (filters.bullishOnly && row.impact !== 'Bullish') return false;
    if (filters.bearishOnly && row.impact !== 'Bearish') return false;

    if (filters.source !== 'all' && row.source !== filters.source) return false;

    if (filters.eventTypeQuery) {
      if (!row.eventType.toLowerCase().includes(filters.eventTypeQuery.toLowerCase())) {
        return false;
      }
    }

    if (filters.dateRange === 'today' && !isToday(row.publishedAt)) return false;
    if (filters.dateRange === 'yesterday' && !isYesterday(row.publishedAt)) return false;

    return true;
  });
}

export function sortOpportunities(
  rows: OpportunityRow[],
  field: SortField,
  direction: SortDirection,
): OpportunityRow[] {
  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'priority':
        cmp = a.priority - b.priority;
        break;
      case 'symbol':
        cmp = a.symbol.localeCompare(b.symbol);
        break;
      case 'aiScore':
        cmp = (a.aiScore ?? -1) - (b.aiScore ?? -1);
        break;
      case 'confidence':
        cmp = (a.confidence ?? -1) - (b.confidence ?? -1);
        break;
      case 'publishedAt':
        cmp = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        break;
      case 'impact':
        cmp = a.impact.localeCompare(b.impact);
        break;
      default:
        cmp = 0;
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export function computeKpis(rows: OpportunityRow[], connectionStatus: string) {
  const today = rows.filter((r) => isToday(r.publishedAt));
  const highImpact = rows.filter((r) => r.confidence !== null && r.confidence >= 70);
  const withConfidence = rows.filter((r) => r.confidence !== null);
  const avgConfidence =
    withConfidence.length > 0
      ? Math.round(
          withConfidence.reduce((s, r) => s + (r.confidence ?? 0), 0) / withConfidence.length,
        )
      : 0;

  return {
    todaysOpportunities: today.length,
    highImpactEvents: highImpact.length,
    averageConfidence: avgConfidence,
    announcementsToday: today.length,
    liveFeed: connectionStatus === 'connected' ? 'Active' : connectionStatus,
    providersConnected: connectionStatus === 'connected' ? 2 : 0,
  };
}
