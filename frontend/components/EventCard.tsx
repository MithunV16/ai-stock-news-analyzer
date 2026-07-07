import { cn, formatDateTime, impactStyles } from '@/lib/utils';
import type { EventWithRelations } from '@/types/domain';

interface EventCardProps {
  event: EventWithRelations;
  isNew?: boolean;
}

export function EventCard({ event, isNew }: EventCardProps) {
  const styles = impactStyles(event.impact);

  return (
    <article
      className={cn(
        'rounded-xl border bg-surface-raised p-5 transition-all duration-500',
        styles.border,
        isNew && styles.glow,
        isNew && 'ring-1 ring-white/10',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-bold text-white">{event.company.symbol}</span>
            {event.company.sector && (
              <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-slate-400">
                {event.company.sector}
              </span>
            )}
            {isNew && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                New
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-400">{event.company.companyName}</p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
            styles.badge,
          )}
        >
          {event.impact}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold leading-snug text-slate-100">
        {event.news.headline}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-300">{event.summary}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Event Type" value={event.eventType} />
        <Metric label="Confidence" value={`${event.confidence}%`} />
        <Metric label="Expected Move" value={event.expectedMove} highlight />
        <Metric label="Holding Period" value={event.holdingPeriod} />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">{event.reason}</p>

      <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-surface-border pt-3 text-xs text-slate-500">
        <span>Source: {event.news.source.toUpperCase()}</span>
        <span>Published: {formatDateTime(event.news.publishedAt)}</span>
      </footer>
    </article>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={cn(
          'mt-0.5 text-sm font-semibold tabular-nums',
          highlight ? 'text-emerald-400' : 'text-slate-200',
        )}
      >
        {value}
      </p>
    </div>
  );
}
