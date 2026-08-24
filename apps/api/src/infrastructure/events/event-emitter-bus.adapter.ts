import { EventEmitter } from 'node:events';
import { IDomainEvent } from '../../core/domain/events/domain-events.js';
import { EventBusPort, DomainEventHandler } from '../../core/application/ports/out/event-bus.port.js';

export class EventEmitterBusAdapter implements EventBusPort {
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  async publish(event: IDomainEvent): Promise<void> {
    this.emitter.emit(event.eventName, event);
    this.emitter.emit('*', event);
  }

  subscribe<T extends IDomainEvent>(eventName: string, handler: DomainEventHandler<T>): void {
    this.emitter.on(eventName, async (event: T) => {
      try {
        await handler(event);
      } catch (err) {
        console.error(`[EventBus] Error handling event ${eventName}:`, err);
      }
    });
  }

  removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }
}
