'use client';

import { DashboardLayout } from '@/components/layout';
import { ClientOnly } from '@/components/ClientOnly';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { DetailDrawer } from '@/components/dashboard/DetailDrawer';
import { OpportunityDashboard } from '@/components/dashboard/OpportunityDashboard';
import { DashboardUIProvider, useDashboardUI } from '@/context/DashboardUIContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useSocketAnnouncements } from '@/hooks/useSocketAnnouncements';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import type { EventWithRelations, TopScore } from '@/types/domain';

const EMPTY_EVENTS: EventWithRelations[] = [];
const EMPTY_SCORES: TopScore[] = [];

function DashboardContent() {
  const { data, isLoading, isError, error } = useDashboard(50);
  const { events, status, latestId } = useSocketEvents(data?.recentEvents ?? EMPTY_EVENTS);
  const { announcements, latestId: latestAnnouncementId } = useSocketAnnouncements(50);
  const { selectedRow, closeDrawer, drawerOpen } = useDashboardUI();

  return (
    <DashboardLayout
      drawerOpen={drawerOpen}
      onDrawerClose={closeDrawer}
      drawer={selectedRow ? <DetailDrawer row={selectedRow} onClose={closeDrawer} /> : null}
    >
      <OpportunityDashboard
        events={events}
        announcements={announcements}
        scores={data?.topScores ?? EMPTY_SCORES}
        latestEventId={latestId}
        latestAnnouncementId={latestAnnouncementId}
        connectionStatus={status}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
    </DashboardLayout>
  );
}

export function DashboardView() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <DashboardUIProvider>
        <DashboardContent />
      </DashboardUIProvider>
    </ClientOnly>
  );
}
