import { logger } from "@/lib/os/logger";
import type { OSEventHandler, OSEventMap, OSEventName } from "@/lib/os/events/types";

type HandlerEntry<K extends OSEventName> = {
  id: string;
  handler: OSEventHandler<K>;
};

class EventBus {
  private handlers = new Map<OSEventName, HandlerEntry<OSEventName>[]>();
  private seq = 0;

  on<K extends OSEventName>(event: K, handler: OSEventHandler<K>): () => void {
    const entry: HandlerEntry<K> = {
      id: `${event}:${++this.seq}`,
      handler,
    };

    const list = this.handlers.get(event) ?? [];
    list.push(entry as HandlerEntry<OSEventName>);
    this.handlers.set(event, list);

    return () => {
      const current = this.handlers.get(event) ?? [];
      this.handlers.set(
        event,
        current.filter((item) => item.id !== entry.id)
      );
    };
  }

  async emit<K extends OSEventName>(
    event: K,
    payload: OSEventMap[K]
  ): Promise<void> {
    const listeners = [...(this.handlers.get(event) ?? [])];

    if (listeners.length === 0) {
      logger.debug("os.events", "No listeners", { event });
      return;
    }

    logger.debug("os.events", "Emitting event", {
      event,
      listenerCount: listeners.length,
    });

    const results = await Promise.allSettled(
      listeners.map(async (entry) => entry.handler(payload))
    );

    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("os.events", "Handler failed", {
          event,
          error:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        });
      }
    }
  }

  listenerCount(event?: OSEventName): number {
    if (event) {
      return this.handlers.get(event)?.length ?? 0;
    }

    let total = 0;
    for (const list of this.handlers.values()) {
      total += list.length;
    }
    return total;
  }
}

export const eventBus = new EventBus();
