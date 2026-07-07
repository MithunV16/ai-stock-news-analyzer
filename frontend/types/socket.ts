import type { AnnouncementBroadcastPayload, EventWithRelations } from '@/types/domain';

export interface ServerToClientEvents {
  connected: (payload: { message: string; serverTime: string }) => void;
  'event:new': (payload: EventWithRelations) => void;
  'announcement:new': (payload: AnnouncementBroadcastPayload) => void;
  pong: (payload: { serverTime: string }) => void;
}

export interface ClientToServerEvents {
  ping: () => void;
}
