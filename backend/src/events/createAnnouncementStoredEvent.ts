import type { PersistedAnnouncement } from '@/interfaces/Announcement';
import type { AnnouncementStoredEvent } from '@/events/announcement.events';
import { ANNOUNCEMENT_STORED } from '@/events/announcement.events';

/** Builds a typed AnnouncementStoredEvent for the event bus */
export function createAnnouncementStoredEvent(
  announcement: PersistedAnnouncement,
  storedAt: Date = new Date(),
): AnnouncementStoredEvent {
  return {
    type: ANNOUNCEMENT_STORED,
    payload: {
      announcement,
      storedAt,
    },
  };
}
