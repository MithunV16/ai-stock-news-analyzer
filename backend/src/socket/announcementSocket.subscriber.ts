import {
  ANNOUNCEMENT_STORED,
  eventBus,
  type IEventBus,
} from '@/events';
import { socketService, type SocketService } from '@/socket/socket.service';
import { toAnnouncementBroadcastPayload } from '@/utils/announcementBroadcast';
import { logger } from '@/utils/logger';

/**
 * Subscribes to AnnouncementStoredEvent and broadcasts `announcement:new`
 * to dashboard Socket.io clients.
 *
 * Only fires for rows that were successfully persisted — duplicates never reach the event bus.
 */
export function registerAnnouncementSocketSubscriber(
  bus: IEventBus = eventBus,
  socket: SocketService = socketService,
): () => void {
  const unsubscribe = bus.subscribe(ANNOUNCEMENT_STORED, (event) => {
    const payload = toAnnouncementBroadcastPayload(event.payload.announcement);
    socket.broadcastNewAnnouncement(payload);
  });

  logger.info('Announcement Socket.io subscriber registered', {
    event: ANNOUNCEMENT_STORED,
    socketEvent: 'announcement:new',
  });

  return unsubscribe;
}
