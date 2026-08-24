import { DomainError } from '@personal-os/shared';
import { SourceType, NormalizedEvent as INormalizedEvent } from '@personal-os/types';

export class EventEntity implements INormalizedEvent {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly type: string,
    readonly source: SourceType,
    readonly sourceId: string,
    readonly payload: Record<string, unknown> = {},
    readonly occurredAt: Date = new Date(),
    readonly receivedAt: Date = new Date(),
    public processedAt: Date | null = null
  ) {
    if (!type || type.trim().length === 0) {
      throw new DomainError('Event type cannot be empty', 'INVALID_EVENT_TYPE');
    }
  }

  markProcessed(): void {
    this.processedAt = new Date();
  }
}
