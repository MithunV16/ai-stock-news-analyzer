import { describe, expect, it } from 'vitest';
import { NSENormalizer } from '@/providers/nse/NSENormalizer';

describe('NSENormalizer', () => {
  const normalizer = new NSENormalizer();

  it('maps a typical NSE row to AnnouncementDraft', () => {
    const draft = normalizer.normalize({
      symbol: 'RELIANCE',
      sm_name: 'Reliance Industries Limited',
      desc: 'Board Meeting Intimation',
      an_dt: '08-Jul-2025',
      attchmntFile: 'https://nseindia.com/file.pdf',
      seq_id: '12345',
    });

    expect(draft).toMatchObject({
      source: 'NSE',
      symbol: 'RELIANCE',
      companyName: 'Reliance Industries Limited',
      headline: 'Board Meeting Intimation',
      url: 'https://nseindia.com/file.pdf',
    });
    expect(draft?.rawData).toEqual(
      expect.objectContaining({ symbol: 'RELIANCE', seq_id: '12345' }),
    );
  });

  it('returns null when required fields are absent', () => {
    expect(normalizer.normalize({ sm_name: 'No symbol row' })).toBeNull();
  });
});
