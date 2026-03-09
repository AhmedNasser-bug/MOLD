import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { EventBus } from '../infrastructure/events/EventBus';
import type { EventMap } from '../infrastructure/events/EventTypes';

describe('EventBus', () => {
  it('should be a singleton', () => {
    const instance1 = EventBus.getInstance();
    const instance2 = EventBus.getInstance();
    assert.strictEqual(instance1, instance2);
  });

  it('should subscribe and emit an event synchronously', () => {
    const bus = EventBus.getInstance();
    bus.clear();
    let handled = false;
    bus.on('game:pause', (payload) => {
      handled = true;
      assert.strictEqual(payload.paused, true);
    });
    bus.emitSync('game:pause', { paused: true });
    assert.strictEqual(handled, true);
  });

  it('should subscribe and emit an event asynchronously', async () => {
    const bus = EventBus.getInstance();
    bus.clear();
    let handled = false;
    bus.on('game:pause', (payload) => {
      handled = true;
      assert.strictEqual(payload.paused, true);
    });
    await bus.emit('game:pause', { paused: true });
    assert.strictEqual(handled, true);
  });

  it('should support async handlers in emit', async () => {
    const bus = EventBus.getInstance();
    bus.clear();
    let asyncHandled = false;
    bus.on('game:pause', async (payload) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      asyncHandled = true;
      assert.strictEqual(payload.paused, true);
    });
    await bus.emit('game:pause', { paused: true });
    assert.strictEqual(asyncHandled, true);
  });

  it('should support once subscription', async () => {
    const bus = EventBus.getInstance();
    bus.clear();
    let callCount = 0;
    bus.once('game:pause', (payload) => {
      callCount++;
    });

    await bus.emit('game:pause', { paused: true });
    await bus.emit('game:pause', { paused: true });

    assert.strictEqual(callCount, 1);
  });

  it('should unsubscribe from events using off', () => {
    const bus = EventBus.getInstance();
    bus.clear();
    let handled = false;
    const handler = (payload: EventMap['game:pause']) => {
      handled = true;
    };

    bus.on('game:pause', handler);
    bus.off('game:pause', handler);

    bus.emitSync('game:pause', { paused: true });
    assert.strictEqual(handled, false);
  });

  it('should unsubscribe from events using returned function', () => {
    const bus = EventBus.getInstance();
    bus.clear();
    let handled = false;

    const unsubscribe = bus.on('game:pause', (payload) => {
      handled = true;
    });

    unsubscribe();

    bus.emitSync('game:pause', { paused: true });
    assert.strictEqual(handled, false);
  });

  it('should clear all handlers for a specific event', () => {
    const bus = EventBus.getInstance();
    bus.clear();
    let handled = false;
    bus.on('game:pause', () => { handled = true; });
    bus.on('game:pause', () => { handled = true; });

    bus.clear('game:pause');
    bus.emitSync('game:pause', { paused: true });

    assert.strictEqual(handled, false);
  });

  it('should clear all handlers for all events', () => {
    const bus = EventBus.getInstance();
    bus.clear();
    let pauseHandled = false;
    let completeHandled = false;

    bus.on('game:pause', () => { pauseHandled = true; });
    bus.on('game:complete', () => { completeHandled = true; });

    bus.clear();
    bus.emitSync('game:pause', { paused: true });
    bus.emitSync('game:complete', {
      finalScore: 100,
      correct: 10,
      incorrect: 0,
      timeTaken: 60,
      mode: 'normal',
      subject: 'math'
    });

    assert.strictEqual(pauseHandled, false);
    assert.strictEqual(completeHandled, false);
  });

  it('should return subscription counts correctly', () => {
    const bus = EventBus.getInstance();
    bus.clear();

    bus.on('game:pause', () => {});
    bus.on('game:pause', () => {});
    bus.on('game:complete', () => {});

    const subs = bus.getSubscriptions();
    assert.strictEqual(subs['game:pause'], 2);
    assert.strictEqual(subs['game:complete'], 1);
  });

  it('should ignore emit if no handlers exist', async () => {
    const bus = EventBus.getInstance();
    bus.clear();
    // This should just return and not throw any errors
    await bus.emit('game:pause', { paused: true });
    bus.emitSync('game:pause', { paused: true });
    assert.ok(true);
  });
});
