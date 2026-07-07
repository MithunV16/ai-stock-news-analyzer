import type {
  IEventBus,
  IngestionEventHandler,
  IngestionEventMap,
  IngestionEventType,
} from '@/events/announcement.events';
import { logger } from '@/utils/logger';

/**
 * In-process event bus for the News Ingestion Engine.
 *
 * Handlers run asynchronously (fire-and-forget) so subscriber failures
 * or slow work never block the scheduler.
 */
export class EventBus implements IEventBus {
  private readonly subscribers = new Map<
    IngestionEventType,
    Set<IngestionEventHandler<IngestionEventType>>
  >();

  publish<T extends IngestionEventType>(type: T, event: IngestionEventMap[T]): void {
    const handlers = this.subscribers.get(type);
    if (!handlers || handlers.size === 0) {
      return;
    }

    for (const handler of handlers) {
      void this.invokeHandler(type, handler as IngestionEventHandler<T>, event);
    }
  }

  subscribe<T extends IngestionEventType>(
    type: T,
    handler: IngestionEventHandler<T>,
  ): () => void {
    let handlers = this.subscribers.get(type);
    if (!handlers) {
      handlers = new Set();
      this.subscribers.set(type, handlers);
    }

    const wrapped = handler as IngestionEventHandler<IngestionEventType>;
    handlers.add(wrapped);

    return () => {
      handlers?.delete(wrapped);
    };
  }

  /** Removes all subscribers — intended for tests */
  clearAll(): void {
    this.subscribers.clear();
  }

  subscriberCount(type: IngestionEventType): number {
    return this.subscribers.get(type)?.size ?? 0;
  }

  private async invokeHandler<T extends IngestionEventType>(
    type: T,
    handler: IngestionEventHandler<T>,
    event: IngestionEventMap[T],
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      logger.error('Ingestion event handler failed', {
        type,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const eventBus: IEventBus = new EventBus();
