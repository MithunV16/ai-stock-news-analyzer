import { describe, expect, it } from 'vitest';
import { AnnouncementNormalizerService } from '@/services/announcementNormalizer.service';

describe('AnnouncementNormalizerService', () => {
  const normalizer = new AnnouncementNormalizerService();

  it('returns null when symbol or headline is missing', () => {
    expect(
      normalizer.createDraft({
        source: 'NSE',
        symbol: '',
        companyName: 'Test Co',
        headline: 'Valid headline',
        descriptionParts: [],
        publishedAt: new Date(),
        rawData: {},
      }),
    ).toBeNull();
  });

  it('normalizes symbol to uppercase and trims headline', () => {
    const draft = normalizer.createDraft({
      source: 'NSE',
      symbol: '  tcs  ',
      companyName: 'Tata Consultancy Services',
      headline: '  Q1   Results  ',
      descriptionParts: ['Line one', 'Line one', 'Line two'],
      publishedAt: new Date('2025-07-08T12:00:00.000Z'),
      rawData: { id: 1 },
    });

    expect(draft).toMatchObject({
      source: 'NSE',
      symbol: 'TCS',
      headline: 'Q1 Results',
      description: 'Line one\n\nLine two',
    });
  });

  it('filters invalid rows in normalizeMany', () => {
    const rows = [{ symbol: 'INFY', headline: 'Update' }, { symbol: '', headline: '' }];
    const result = normalizer.normalizeMany(rows, (row) =>
      normalizer.createDraft({
        source: 'NSE',
        symbol: row.symbol,
        companyName: row.symbol,
        headline: row.headline,
        descriptionParts: [row.headline],
        publishedAt: new Date(),
        rawData: row,
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.symbol).toBe('INFY');
  });
});
