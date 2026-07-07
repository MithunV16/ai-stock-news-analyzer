import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { config } from '@/config/env';
import { newsIngestionConfig } from '@/config/newsProviders';
import { logger } from '@/utils/logger';
import type { AnnouncementBroadcastPayload, EventBroadcastPayload } from '@/types/domain';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@/types/socket';
import { DASHBOARD_ROOM, SOCKET_EVENTS } from '@/socket/events';

/**
 * Manages the Socket.io server and real-time broadcasts.
 *
 * Injected into services (news pipeline, AI analysis) so they can push
 * new events to the dashboard without knowing Socket.io internals.
 */
export class SocketService {
  private io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  > | null = null;

  initialize(httpServer: HttpServer): void {
    if (this.io) {
      logger.warn('Socket.io already initialized');
      return;
    }

    const allowedOrigins = config.CORS_ORIGIN.split(',').map((o) => o.trim());

    this.io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
      // Prefer WebSocket; fall back to long-polling for restrictive networks
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket) => {
      socket.data.connectedAt = new Date().toISOString();
      void socket.join(DASHBOARD_ROOM);

      logger.info('Socket client connected', {
        socketId: socket.id,
        room: DASHBOARD_ROOM,
      });

      socket.emit(SOCKET_EVENTS.CONNECTED, {
        message: 'Connected to AI Stock News Analyzer',
        serverTime: new Date().toISOString(),
      });

      socket.on(SOCKET_EVENTS.PING, () => {
        socket.emit(SOCKET_EVENTS.PONG, { serverTime: new Date().toISOString() });
      });

      socket.on('disconnect', (reason) => {
        logger.info('Socket client disconnected', {
          socketId: socket.id,
          reason,
        });
      });
    });

    logger.info('Socket.io initialized', { transports: ['websocket', 'polling'] });
  }

  /** Broadcast a newly classified event to all dashboard clients */
  broadcastNewEvent(event: EventBroadcastPayload): void {
    if (!this.io) {
      logger.warn('Socket.io not initialized — skipping broadcast', { eventId: event.id });
      return;
    }

    this.io.to(DASHBOARD_ROOM).emit(SOCKET_EVENTS.NEW_EVENT, event);
    logger.info('Broadcast new event', {
      eventId: event.id,
      symbol: event.company.symbol,
      clients: this.getDashboardClientCount(),
    });
  }

  /** Broadcast a newly ingested announcement — only called for successful inserts */
  broadcastNewAnnouncement(announcement: AnnouncementBroadcastPayload): void {
    if (!this.io) {
      logger.warn('Socket.io not initialized — skipping announcement broadcast', {
        announcementId: announcement.id,
      });
      return;
    }

    const eventName = newsIngestionConfig.socket.newAnnouncementEvent;
    this.io.to(DASHBOARD_ROOM).emit(eventName, announcement);

    logger.info('Broadcast new announcement', {
      announcementId: announcement.id,
      symbol: announcement.symbol,
      source: announcement.source,
      clients: this.getDashboardClientCount(),
    });
  }

  getDashboardClientCount(): number {
    if (!this.io) return 0;
    return this.io.sockets.adapter.rooms.get(DASHBOARD_ROOM)?.size ?? 0;
  }

  isInitialized(): boolean {
    return this.io !== null;
  }

  async shutdown(): Promise<void> {
    if (!this.io) return;

    logger.info('Closing Socket.io connections...');
    await new Promise<void>((resolve, reject) => {
      this.io!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    this.io = null;
    logger.info('Socket.io closed');
  }
}

/** Singleton instance — import this in services and jobs */
export const socketService = new SocketService();
