/**
 * Supported date formats from Indian exchange APIs.
 * Providers hint which parser to try first.
 */
export type DateParseHint = 'nse-dmy' | 'bse-iso' | 'bse-compact' | 'auto';

/**
 * Parses date strings from NSE/BSE announcement payloads.
 * Returns current date as fallback when parsing fails (logged by caller).
 */
export function parseAnnouncementDate(value: string | undefined, hint: DateParseHint = 'auto'): Date {
  if (!value?.trim()) {
    return new Date();
  }

  const trimmed = value.trim();

  if (hint === 'nse-dmy' || hint === 'auto') {
    const nse = parseNseDmyDate(trimmed);
    if (nse) return nse;
  }

  if (hint === 'bse-compact' || hint === 'auto') {
    const compact = parseYyyyMmDdCompact(trimmed);
    if (compact) return compact;
  }

  if (hint === 'bse-iso' || hint === 'auto') {
    const iso = new Date(trimmed);
    if (!Number.isNaN(iso.getTime())) return iso;
  }

  return new Date();
}

/** NSE: dd-mm-yyyy or dd-mm-yyyy hh:mm */
function parseNseDmyDate(value: string): Date | null {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!match) return null;

  const [, dd, mm, yyyy, hh = '00', min = '00'] = match;
  const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** BSE: yyyymmdd */
function parseYyyyMmDdCompact(value: string): Date | null {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;

  const [, yyyy, mm, dd] = match;
  const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
