/**
 * Type-Safe Event Bus for MOLD V2
 * 
 * Features:
 * - Type-safe event emission and subscription
 * - Support for both sync and async handlers
 * - Automatic unsubscribe with cleanup tokens
 * - Debug logging in development
 * - Wildcard event listening for debugging
 */

import type { EventMap, EventHandler, EventKey } from './EventTypes';

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private debugMode: boolean = false;

  private constructor() {
    // Enable debug mode in development
    if (import.meta.env.DEV) {
      this.debugMode = true;
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  public on<K extends EventKey>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler);

    if (this.debugMode) {
      console.log(`[EventBus] Subscribed to: ${event}`);
    }

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Subscribe to an event (runs only once)
   */
  public once<K extends EventKey>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): () => void {
    const wrappedHandler = (payload: EventMap[K]) => {
      handler(payload);
      this.off(event, wrappedHandler as any);
    };

    return this.on(event, wrappedHandler as any);
  }

  /**
   * Unsubscribe from an event
   */
  public off<K extends EventKey>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }

      if (this.debugMode) {
        console.log(`[EventBus] Unsubscribed from: ${event}`);
      }
    }
  }

  /**
   * Emit an event
   */
  public async emit<K extends EventKey>(
    event: K,
    payload: EventMap[K]
  ): Promise<void> {
    const handlers = this.handlers.get(event);

    if (this.debugMode) {
      console.log(`[EventBus] Emitting: ${event}`, payload);
    }

    if (!handlers || handlers.size === 0) {
      if (this.debugMode) {
        console.warn(`[EventBus] No handlers for: ${event}`);
      }
      return;
    }

    // Execute all handlers (support both sync and async)
    const promises: Promise<void>[] = [];
    for (const handler of handlers) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }
    }

    // Wait for all async handlers
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Emit an event synchronously (for urgent updates)
   */
  public emitSync<K extends EventKey>(event: K, payload: EventMap[K]): void {
    const handlers = this.handlers.get(event);

    if (this.debugMode) {
      console.log(`[EventBus] Emitting (sync): ${event}`, payload);
    }

    if (!handlers || handlers.size === 0) {
      return;
    }

    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] Error in sync handler for ${event}:`, error);
      }
    }
  }

  /**
   * Clear all handlers for an event
   */
  public clear(event?: EventKey): void {
    if (event) {
      this.handlers.delete(event);
      if (this.debugMode) {
        console.log(`[EventBus] Cleared all handlers for: ${event}`);
      }
    } else {
      this.handlers.clear();
      if (this.debugMode) {
        console.log('[EventBus] Cleared all handlers');
      }
    }
  }

  /**
   * Get active event subscriptions (for debugging)
   */
  public getSubscriptions(): Record<string, number> {
    const subscriptions: Record<string, number> = {};
    for (const [event, handlers] of this.handlers.entries()) {
      subscriptions[event] = handlers.size;
    }
    return subscriptions;
  }

  /**
   * Enable/disable debug mode
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

// Export convenience methods
export const on = eventBus.on.bind(eventBus);
export const once = eventBus.once.bind(eventBus);
export const off = eventBus.off.bind(eventBus);
export const emit = eventBus.emit.bind(eventBus);
export const emitSync = eventBus.emitSync.bind(eventBus);
