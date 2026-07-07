import type {
  AnnouncementBroadcastPayload,
  EventWithRelations,
  Impact,
} from '@/types/domain';

export type OpportunityStatus = 'classified' | 'pending' | 'live';

export interface OpportunityRow {
  id: string;
  priority: 1 | 2 | 3;
  symbol: string;
  companyName: string;
  sector: string | null;
  aiScore: number | null;
  eventType: string;
  impact: Impact | 'Pending';
  confidence: number | null;
  expectedMove: string;
  holdingPeriod: string;
  publishedAt: string;
  source: string;
  status: OpportunityStatus;
  headline: string;
  summary: string;
  reason: string;
  url?: string;
  event?: EventWithRelations;
  announcement?: AnnouncementBroadcastPayload;
  isNew?: boolean;
}

export type SortField =
  | 'priority'
  | 'symbol'
  | 'aiScore'
  | 'confidence'
  | 'publishedAt'
  | 'impact';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}
