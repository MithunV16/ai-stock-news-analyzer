/**
 * Exponential backoff with jitter for transient provider failures.
 */
export function computeBackoffMs(
  attempt: number,
  baseMs: number,
  maxMs: number,
): number {
  const exponential = baseMs * 2 ** attempt;
  const capped = Math.min(exponential, maxMs);
  const jitter = capped * 0.2 * Math.random();
  return Math.floor(capped + jitter);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
