import { cn, formatDateTime } from '@/lib/utils';
import type { AnnouncementBroadcastPayload } from '@/types/domain';

interface AnnouncementCardProps {
  announcement: AnnouncementBroadcastPayload;
  isNew?: boolean;
}

const sourceStyles: Record<AnnouncementBroadcastPayload['source'], string> = {
  NSE: 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
  BSE: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
};

export function AnnouncementCard({ announcement, isNew }: AnnouncementCardProps) {
  return (
    <article
      className={cn(
        'rounded-xl border border-surface-border bg-surface-raised p-4 transition-all duration-500',
        isNew && 'ring-1 ring-emerald-400/30',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base font-bold text-white">{announcement.symbol}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-inset',
                sourceStyles[announcement.source],
              )}
            >
              {announcement.source}
            </span>
            {isNew && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Live
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-400">{announcement.companyName}</p>
        </div>
        <time className="text-xs text-slate-500" dateTime={announcement.publishedAt}>
          {formatDateTime(announcement.publishedAt)}
        </time>
      </div>

      <h3 className="mt-3 text-sm font-medium leading-snug text-slate-100">
        {announcement.headline}
      </h3>

      {announcement.url && (
        <a
          href={announcement.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-blue-400 hover:text-blue-300"
        >
          View filing →
        </a>
      )}
    </article>
  );
}
