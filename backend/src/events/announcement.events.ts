import type { PersistedAnnouncement } from '@/interfaces/Announcement';

/**
 * Internal application event published after a new announcement is persisted.
 *
 * Future subscribers (NOT implemented yet):
 * - AI Event Classification
 * - Alert Service (Telegram / Email)
 * - Opportunity Scoring Engine
 * - Historical Event Analysis
 */
export interface AnnouncementStoredEvent {
  readonly type: 'announcement:stored';
  readonly payload: {
    readonly announcement: PersistedAnnouncement;
    readonly storedAt: Date;
  };
}

/** Map of all ingestion-domain events for type-safe EventBus (Module 11) */
export interface IngestionEventMap {
  'announcement:stored': AnnouncementStoredEvent;
}

export type IngestionEventType = keyof IngestionEventMap;

/** Canonical event type constant */
export const ANNOUNCEMENT_STORED = 'announcement:stored' as const;

/** Handler signature for event subscribers */
export type IngestionEventHandler<T extends IngestionEventType> = (
  event: IngestionEventMap[T],
) => void | Promise<void>;

/**
 * Event bus contract — implemented by EventBus (Module 11).
 * AI, alerts, and scoring modules will subscribe without coupling to the scheduler.
 */
export interface IEventBus {
  publish<T extends IngestionEventType>(type: T, event: IngestionEventMap[T]): void;
  subscribe<T extends IngestionEventType>(
    type: T,
    handler: IngestionEventHandler<T>,
  ): () => void;
}

/** Factory token for dependency injection */
export type EventBusFactory = () => IEventBus;
