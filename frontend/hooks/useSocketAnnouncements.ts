'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { SOCKET_EVENTS, type AnnouncementBroadcastPayload } from '@/types/domain';

/**
 * Subscribes to live corporate announcements from the ingestion engine.
 * Dedupes by fingerprint so reconnects never duplicate cards.
 */
export function useSocketAnnouncements(maxItems = 50) {
  const [announcements, setAnnouncements] = useState<AnnouncementBroadcastPayload[]>([]);
  const [latestId, setLatestId] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const onNewAnnouncement = (announcement: AnnouncementBroadcastPayload) => {
      setAnnouncements((prev) => {
        if (prev.some((a) => a.fingerprint === announcement.fingerprint)) {
          return prev;
        }
        return [announcement, ...prev].slice(0, maxItems);
      });
      setLatestId(announcement.id);
    };

    socket.on(SOCKET_EVENTS.NEW_ANNOUNCEMENT, onNewAnnouncement);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_ANNOUNCEMENT, onNewAnnouncement);
    };
  }, [maxItems]);

  return { announcements, latestId };
}
