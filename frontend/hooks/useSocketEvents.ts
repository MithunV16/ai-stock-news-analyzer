'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { SOCKET_EVENTS, type EventWithRelations } from '@/types/domain';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

/**
 * Subscribes to Socket.io live events and prepends new items without page refresh.
 */
export function useSocketEvents(initialEvents: EventWithRelations[] = []) {
  const [events, setEvents] = useState<EventWithRelations[]>(initialEvents);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [latestId, setLatestId] = useState<string | null>(null);

  // Sync when React Query refetches initial data
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onNewEvent = (event: EventWithRelations) => {
      setEvents((prev) => {
        if (prev.some((e) => e.id === event.id)) return prev;
        return [event, ...prev];
      });
      setLatestId(event.id);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.NEW_EVENT, onNewEvent);

    if (socket.connected) {
      setStatus('connected');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.NEW_EVENT, onNewEvent);
    };
  }, []);

  return { events, status, latestId };
}
