import { IngestEventDto, NormalizedEvent } from '@personal-os/types';
import { EventEntity } from '../../../domain/entities/event.entity.js';
import { IIngestEventUseCase } from '../../ports/in/event.use-cases.port.js';
import { EventRepositoryPort } from '../../ports/out/event-repository.port.js';
import { randomUUID } from 'node:crypto';

export class IngestEventUseCase implements IIngestEventUseCase {
  constructor(private readonly eventRepo: EventRepositoryPort) {}

  async execute(userId: string, dto: IngestEventDto): Promise<NormalizedEvent> {
    const event = new EventEntity(
      randomUUID(),
      userId,
      dto.type,
      dto.source,
      dto.sourceId,
      dto.payload,
      dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      new Date(),
      null
    );

    return this.eventRepo.save(event);
  }
}
