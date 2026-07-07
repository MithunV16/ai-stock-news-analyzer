interface KpiCardsProps {
  todaysOpportunities: number;
  highImpactEvents: number;
  averageConfidence: number;
  announcementsToday: number;
  liveFeed: string;
  providersConnected: number;
}

const KPI_CONFIG = [
  { key: 'todaysOpportunities' as const, label: "Today's Opportunities" },
  { key: 'highImpactEvents' as const, label: 'High Impact Events' },
  { key: 'averageConfidence' as const, label: 'Avg Confidence', suffix: '%' },
  { key: 'announcementsToday' as const, label: 'Announcements Today' },
  { key: 'liveFeed' as const, label: 'Live Feed', isText: true },
  { key: 'providersConnected' as const, label: 'Providers Connected' },
];

export function KpiCards(props: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {KPI_CONFIG.map(({ key, label, suffix, isText }) => {
        const raw = props[key];
        const display = isText ? String(raw) : `${raw}${suffix ?? ''}`;
        const isLive = key === 'liveFeed' && raw === 'Active';

        return (
          <div
            key={key}
            className="flex max-h-20 flex-col justify-center rounded-md border border-surface-border bg-surface px-3 py-2"
          >
            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              {label}
            </p>
            <p
              className={`mt-0.5 truncate text-lg font-semibold tabular-nums leading-tight ${
                isLive ? 'text-emerald-400' : 'text-zinc-100'
              }`}
            >
              {display}
            </p>
          </div>
        );
      })}
    </div>
  );
}
