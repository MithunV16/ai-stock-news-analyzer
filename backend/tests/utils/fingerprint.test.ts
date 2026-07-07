import { describe, expect, it } from 'vitest';
import { buildFingerprintPayload, generateSha256Fingerprint } from '@/utils/fingerprint';
import { PUBLISHED } from '../fixtures/announcements';

describe('fingerprint', () => {
  it('builds a normalized canonical payload', () => {
    const payload = buildFingerprintPayload({
      source: ' nse ',
      symbol: 'reliance',
      headline: 'Board   Meeting',
      publishedAt: PUBLISHED,
    });

    expect(payload).toBe(
      'NSE|RELIANCE|Board Meeting|2025-07-08T10:30:00.000Z',
    );
  });

  it('produces a stable SHA-256 hex digest', () => {
    const input = {
      source: 'NSE',
      symbol: 'RELIANCE',
      headline: 'Board Meeting Intimation',
      publishedAt: PUBLISHED,
    };

    const first = generateSha256Fingerprint(input);
    const second = generateSha256Fingerprint(input);

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).toBe(second);
  });

  it('changes fingerprint when headline differs', () => {
    const base = {
      source: 'BSE',
      symbol: '500325',
      publishedAt: PUBLISHED,
    };

    const a = generateSha256Fingerprint({ ...base, headline: 'Dividend' });
    const b = generateSha256Fingerprint({ ...base, headline: 'Results' });

    expect(a).not.toBe(b);
  });
});
