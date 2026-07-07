import { createHash } from 'node:crypto';
import type { FingerprintInput } from '@/interfaces/IngestionResult';

/**
 * Canonical string used as SHA-256 input.
 * Fields are normalized so the same announcement always yields the same fingerprint.
 */
export function buildFingerprintPayload(input: FingerprintInput): string {
  const source = input.source.trim().toUpperCase();
  const symbol = input.symbol.trim().toUpperCase();
  const headline = input.headline.trim().replace(/\s+/g, ' ');
  const publishedAt = input.publishedAt.toISOString();

  return `${source}|${symbol}|${headline}|${publishedAt}`;
}

/** SHA-256 hex digest for announcement deduplication */
export function generateSha256Fingerprint(input: FingerprintInput): string {
  const payload = buildFingerprintPayload(input);
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}
