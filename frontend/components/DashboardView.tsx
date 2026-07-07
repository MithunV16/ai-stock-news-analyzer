'use client';

import { DashboardLayout } from '@/components/layout';
import { DetailDrawer } from '@/components/dashboard/DetailDrawer';
import { OpportunityDashboard } from '@/components/dashboard/OpportunityDashboard';
import { DashboardUIProvider, useDashboardUI } from '@/context/DashboardUIContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useSocketAnnouncements } from '@/hooks/useSocketAnnouncements';
import { useSocketEvents } from '@/hooks/useSocketEvents';

function DashboardContent() {
  const { data, isLoading, isError, error } = useDashboard(50);
  const { events, status, latestId } = useSocketEvents(data?.recentEvents ?? []);
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
        scores={data?.topScores ?? []}
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
    <DashboardUIProvider>
      <DashboardContent />
    </DashboardUIProvider>
  );
}
