import type { DashboardStats } from '@/types/domain';

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStatsBar({ stats }: DashboardStatsProps) {
  const items = [
    { label: 'Companies', value: stats.totalCompanies },
    { label: 'Announcements', value: stats.totalNews },
    { label: 'AI Events', value: stats.totalEvents },
    { label: 'Bullish', value: stats.byImpact.Bullish, color: 'text-emerald-400' },
    { label: 'Bearish', value: stats.byImpact.Bearish, color: 'text-red-400' },
    { label: 'Neutral', value: stats.byImpact.Neutral, color: 'text-slate-300' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-surface-border bg-surface-raised p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {item.label}
          </p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${item.color ?? 'text-white'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
