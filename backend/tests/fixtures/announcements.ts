import type { Announcement, AnnouncementDraft, PersistedAnnouncement } from '@/interfaces/Announcement';

const PUBLISHED = new Date('2025-07-08T10:30:00.000Z');

export function createDraft(overrides: Partial<AnnouncementDraft> = {}): AnnouncementDraft {
  return {
    source: 'NSE',
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd',
    headline: 'Board Meeting Intimation',
    description: 'Board meeting scheduled.',
    publishedAt: PUBLISHED,
    url: 'https://www.nseindia.com/example',
    rawData: { sample: true },
    ...overrides,
  };
}

export function createAnnouncement(overrides: Partial<Announcement> = {}): Announcement {
  return {
    ...createDraft(),
    fingerprint: 'abc123fingerprint',
    createdAt: new Date('2025-07-08T10:31:00.000Z'),
    ...overrides,
  };
}

export function createPersisted(overrides: Partial<PersistedAnnouncement> = {}): PersistedAnnouncement {
  return {
    ...createAnnouncement(),
    id: 'ann_test_001',
    eventType: null,
    impact: null,
    confidence: null,
    score: null,
    processingStatus: 'pending',
    aiVersion: null,
    ...overrides,
  };
}

export { PUBLISHED };
