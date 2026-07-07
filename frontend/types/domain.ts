export type Impact = 'Bullish' | 'Bearish' | 'Neutral';

export interface EventWithRelations {
  id: string;
  newsId: string;
  companyId: string;
  eventType: string;
  impact: Impact;
  confidence: number;
  summary: string;
  expectedMove: string;
  holdingPeriod: string;
  reason: string;
  createdAt: string;
  company: {
    id: string;
    symbol: string;
    companyName: string;
    sector: string | null;
  };
  news: {
    id: string;
    headline: string;
    source: string;
    url: string;
    publishedAt: string;
  };
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export interface AnnouncementBroadcastPayload {
  id: string;
  source: 'NSE' | 'BSE';
  symbol: string;
  companyName: string;
  headline: string;
  description: string;
  publishedAt: string;
  url?: string;
  fingerprint: string;
  createdAt: string;
  eventType: string | null;
  impact: string | null;
  confidence: number | null;
  score: number | null;
  processingStatus: ProcessingStatus;
  aiVersion: string | null;
}

export interface DashboardStats {
  totalCompanies: number;
  totalNews: number;
  totalEvents: number;
  byImpact: Record<Impact, number>;
}

export interface TopScore {
  id: string;
  companyId: string;
  score: number;
  updatedAt: string;
  company: {
    symbol: string;
    companyName: string;
    sector: string | null;
  };
}

export interface DashboardData {
  recentEvents: EventWithRelations[];
  stats: DashboardStats;
  topScores: TopScore[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export const SOCKET_EVENTS = {
  CONNECTED: 'connected',
  NEW_EVENT: 'event:new',
  NEW_ANNOUNCEMENT: 'announcement:new',
  PING: 'ping',
  PONG: 'pong',
} as const;
