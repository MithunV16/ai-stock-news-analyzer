import type { AnnouncementBroadcastPayload, EventBroadcastPayload } from '@/types/domain';

/** Events the server emits to connected clients */
export interface ServerToClientEvents {
  connected: (payload: { message: string; serverTime: string }) => void;
  'event:new': (payload: EventBroadcastPayload) => void;
  'announcement:new': (payload: AnnouncementBroadcastPayload) => void;
  pong: (payload: { serverTime: string }) => void;
}

/** Events clients may emit to the server */
export interface ClientToServerEvents {
  ping: () => void;
}

/** Inter-server events (unused for now — reserved for Redis adapter scaling) */
export interface InterServerEvents {
  ping: () => void;
}

/** Per-socket data stored on connection */
export interface SocketData {
  connectedAt: string;
}
