import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '@/events/EventBus';
import { ANNOUNCEMENT_STORED } from '@/events/announcement.events';
import { createPersisted } from '../fixtures/announcements';

describe('EventBus', () => {
  it('delivers events to subscribers', async () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const announcement = createPersisted();

    bus.subscribe(ANNOUNCEMENT_STORED, handler);
    bus.publish(ANNOUNCEMENT_STORED, {
      type: ANNOUNCEMENT_STORED,
      payload: { announcement, storedAt: new Date() },
    });

    await vi.waitFor(() => expect(handler).toHaveBeenCalledOnce());
    expect(handler.mock.calls[0]?.[0].payload.announcement.id).toBe(announcement.id);
  });

  it('unsubscribe stops delivery', async () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const announcement = createPersisted();

    const unsubscribe = bus.subscribe(ANNOUNCEMENT_STORED, handler);
    unsubscribe();

    bus.publish(ANNOUNCEMENT_STORED, {
      type: ANNOUNCEMENT_STORED,
      payload: { announcement, storedAt: new Date() },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(handler).not.toHaveBeenCalled();
  });

  it('isolates handler failures', async () => {
    const bus = new EventBus();
    const failing = vi.fn().mockRejectedValue(new Error('boom'));
    const succeeding = vi.fn();
    const announcement = createPersisted();

    bus.subscribe(ANNOUNCEMENT_STORED, failing);
    bus.subscribe(ANNOUNCEMENT_STORED, succeeding);

    bus.publish(ANNOUNCEMENT_STORED, {
      type: ANNOUNCEMENT_STORED,
      payload: { announcement, storedAt: new Date() },
    });

    await vi.waitFor(() => expect(succeeding).toHaveBeenCalledOnce());
  });
});
