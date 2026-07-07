import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso));
}

export function impactStyles(impact: string): {
  badge: string;
  border: string;
  glow: string;
} {
  switch (impact) {
    case 'Bullish':
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_24px_-6px_rgba(34,197,94,0.35)]',
      };
    case 'Bearish':
      return {
        badge: 'bg-red-500/15 text-red-400 ring-red-500/30',
        border: 'border-red-500/30',
        glow: 'shadow-[0_0_24px_-6px_rgba(239,68,68,0.35)]',
      };
    default:
      return {
        badge: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
        border: 'border-slate-500/30',
        glow: '',
      };
  }
}
