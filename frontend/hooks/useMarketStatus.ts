'use client';

import { useEffect, useState } from 'react';

export type MarketStatus = 'open' | 'closed' | 'pre-open' | 'post-close';

/** NSE/BSE regular session — Mon–Fri 09:15–15:30 IST */
export function useMarketStatus(): MarketStatus {
  const [status, setStatus] = useState<MarketStatus>('closed');

  useEffect(() => {
    const compute = (): MarketStatus => {
      const now = new Date();
      const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const day = ist.getDay();
      if (day === 0 || day === 6) return 'closed';

      const minutes = ist.getHours() * 60 + ist.getMinutes();
      const open = 9 * 60 + 15;
      const close = 15 * 60 + 30;
      const preOpen = 9 * 60;

      if (minutes >= open && minutes < close) return 'open';
      if (minutes >= preOpen && minutes < open) return 'pre-open';
      if (minutes >= close) return 'post-close';
      return 'closed';
    };

    setStatus(compute());
    const id = setInterval(() => setStatus(compute()), 30_000);
    return () => clearInterval(id);
  }, []);

  return status;
}

export function marketStatusLabel(status: MarketStatus): string {
  switch (status) {
    case 'open':
      return 'Market Open';
    case 'pre-open':
      return 'Pre-Open';
    case 'post-close':
      return 'Closed';
    default:
      return 'Market Closed';
  }
}

export function marketStatusColor(status: MarketStatus): string {
  switch (status) {
    case 'open':
      return 'text-emerald-400';
    case 'pre-open':
      return 'text-amber-400';
    default:
      return 'text-zinc-500';
  }
}
