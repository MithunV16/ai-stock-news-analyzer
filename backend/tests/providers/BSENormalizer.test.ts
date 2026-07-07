import { describe, expect, it } from 'vitest';
import { BSENormalizer } from '@/providers/bse/BSENormalizer';

describe('BSENormalizer', () => {
  const normalizer = new BSENormalizer();

  it('maps a typical BSE row to AnnouncementDraft', () => {
    const draft = normalizer.normalize({
      SCRIP_CD: '500325',
      SLONGNAME: 'Reliance Industries Ltd',
      NEWSSUB: 'Outcome of Board Meeting',
      DissemDT: '2025-07-08T15:30:00',
      NSURL: 'https://www.bseindia.com/filing.pdf',
      NEWSID: '999',
    });

    expect(draft).toMatchObject({
      source: 'BSE',
      symbol: '500325',
      companyName: 'Reliance Industries Ltd',
      headline: 'Outcome of Board Meeting',
      url: 'https://www.bseindia.com/filing.pdf',
    });
  });

  it('maps browser API row shape (Subject, Newsid)', () => {
    const draft = normalizer.normalize({
      Subject: 'Board Meeting Outcome',
      Newsid: '789012',
      SCRIP_CD: '500325',
      SLONGNAME: 'Reliance Industries Ltd',
    });

    expect(draft).toMatchObject({
      headline: 'Board Meeting Outcome',
      symbol: '500325',
      url: 'https://www.bseindia.com/stock-share-price/announcements/789012',
    });
  });

  it('builds fallback URL from NEWSID when no http link exists', () => {
    const draft = normalizer.normalize({
      SCRIP_CD: '532540',
      NEWSSUB: 'Press Release',
      NEWSID: '123456',
    });

    expect(draft?.url).toBe(
      'https://www.bseindia.com/stock-share-price/announcements/123456',
    );
  });
});
