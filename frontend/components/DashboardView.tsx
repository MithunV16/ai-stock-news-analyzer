'use client';

import { AnnouncementCard } from '@/components/AnnouncementCard';
import { EventCard } from '@/components/EventCard';
import { DashboardStatsBar } from '@/components/DashboardStats';
import { Header } from '@/components/Header';
import { useDashboard } from '@/hooks/useDashboard';
import { useSocketAnnouncements } from '@/hooks/useSocketAnnouncements';
import { useSocketEvents } from '@/hooks/useSocketEvents';

export function DashboardView() {
  const { data, isLoading, isError, error } = useDashboard(30);
  const { events, status, latestId } = useSocketEvents(data?.recentEvents ?? []);
  const { announcements, latestId: latestAnnouncementId } = useSocketAnnouncements();

  return (
    <div className="min-h-screen bg-surface">
      <Header connectionStatus={status} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {data?.stats && (
          <section className="mb-8">
            <DashboardStatsBar stats={data.stats} />
          </section>
        )}

        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Live Corporate Announcements</h2>
            <span className="text-sm text-slate-500">{announcements.length} live</span>
          </div>

          {announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-raised/50 p-8 text-center">
              <p className="text-sm text-slate-400">
                Waiting for NSE/BSE announcements from the ingestion engine…
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.fingerprint}
                  announcement={announcement}
                  isNew={announcement.id === latestAnnouncementId}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">AI-Classified Events</h2>
            <span className="text-sm text-slate-500">{events.length} events</span>
          </div>

          {isLoading && (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl border border-surface-border bg-surface-raised"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
              Failed to load dashboard: {error instanceof Error ? error.message : 'Unknown error'}
              <p className="mt-2 text-sm text-red-400/80">
                Ensure the backend is running on port 4000.
              </p>
            </div>
          )}

          {!isLoading && !isError && events.length === 0 && (
            <div className="rounded-xl border border-surface-border bg-surface-raised p-12 text-center">
              <p className="text-slate-300">No classified events yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                The news collector runs every 30 seconds — new cards will appear here live.
              </p>
            </div>
          )}

          <div className="grid gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} isNew={event.id === latestId} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
