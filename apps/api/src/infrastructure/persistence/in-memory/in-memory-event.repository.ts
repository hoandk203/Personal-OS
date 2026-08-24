import { EventEntity } from '../../../core/domain/entities/event.entity.js';
import { EventRepositoryPort } from '../../../core/application/ports/out/event-repository.port.js';

export class InMemoryEventRepository implements EventRepositoryPort {
  private readonly events = new Map<string, EventEntity>();

  async save(event: EventEntity): Promise<EventEntity> {
    this.events.set(event.id, event);
    return event;
  }

  async findById(id: string, userId: string): Promise<EventEntity | null> {
    const event = this.events.get(id);
    if (event && event.userId === userId) {
      return event;
    }
    return null;
  }

  async findUnprocessed(limit = 50): Promise<EventEntity[]> {
    return Array.from(this.events.values())
      .filter(e => e.processedAt === null)
      .slice(0, limit);
  }

  async findRecentByUser(userId: string, limit = 50): Promise<EventEntity[]> {
    return Array.from(this.events.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, limit);
  }

  clear(): void {
    this.events.clear();
  }
}
