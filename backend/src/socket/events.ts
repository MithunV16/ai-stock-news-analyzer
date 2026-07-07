/** Socket.io event names — shared contract between server and frontend */
export const SOCKET_EVENTS = {
  /** Sent to client immediately after connection */
  CONNECTED: 'connected',
  /** New AI-classified corporate event (legacy pipeline) */
  NEW_EVENT: 'event:new',
  /** New normalized corporate announcement (ingestion engine) */
  NEW_ANNOUNCEMENT: 'announcement:new',
  /** Client heartbeat (optional) */
  PING: 'ping',
  PONG: 'pong',
} as const;

/** Room all dashboard clients join to receive live updates */
export const DASHBOARD_ROOM = 'dashboard';

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
