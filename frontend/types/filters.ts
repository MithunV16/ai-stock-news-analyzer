import type { Impact } from '@/types/domain';

export type SourceFilter = 'all' | 'NSE' | 'BSE';
export type DateRangeFilter = 'all' | 'today' | 'yesterday';
export type ImpactFilter = Impact | 'all' | 'Pending';

export interface OpportunityFilters {
  confidenceMin: number | null;
  scoreMin: number | null;
  expectedMoveQuery: string;
  impact: ImpactFilter;
  source: SourceFilter;
  eventTypeQuery: string;
  dateRange: DateRangeFilter;
  bullishOnly: boolean;
  bearishOnly: boolean;
}

export const DEFAULT_FILTERS: OpportunityFilters = {
  confidenceMin: null,
  scoreMin: null,
  expectedMoveQuery: '',
  impact: 'all',
  source: 'all',
  eventTypeQuery: '',
  dateRange: 'all',
  bullishOnly: false,
  bearishOnly: false,
};
